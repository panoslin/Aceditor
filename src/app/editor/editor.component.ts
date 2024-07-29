import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {EditorModule} from 'primeng/editor';
import {FormsModule} from '@angular/forms';
import Quill, {Bounds} from 'quill';
import {LayoutService} from "@src/app/layout/service/app.layout.service";
import {OverlayPanel, OverlayPanelModule} from "primeng/overlaypanel";
import {MenubarModule} from "primeng/menubar";
import {MenuItem} from "primeng/api";
import {Button} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {NgClass, NgIf} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {SplitButtonModule} from "primeng/splitbutton";

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [FormsModule, EditorModule, OverlayPanelModule, MenubarModule, Button, Ripple, NgClass, NgIf, InputTextModule, SplitButtonModule],
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {
    @ViewChild('editor', {static: true}) editor!: ElementRef;
    @ViewChild('op') overlayPanel!: OverlayPanel;

    toolbar!: ElementRef;
    quill!: Quill;

    placeholder: string = `<h1 class="ql-align-center">Quill Rich Text Editor</h1><p></p><p>Quill is a feature-rich WYSIWYG editor that offers a wide range of functionalities. Here are some samples of what the Quill editor can do: </p><p> 1. <strong>Text Formatting:</strong> Quill allows users to easily format text by providing options for <em>bold, italic, underline, strikethrough,</em> and more. ✍️ </p><p> 2. <strong>Lists:</strong> It supports both <em>ordered and unordered lists,</em> making it easy to create structured content. 📝 </p><p> 3. <strong>Embedding Images:</strong> Users can insert images directly into the editor and adjust their size and alignment. 🖼️ </p><p> 4. <strong>Links:</strong> Quill enables users to create hyperlinks within the text for easy navigation to external resources. 🔗 </p><p> 5. <strong>Custom Styles:</strong> Developers can create custom styles to provide users with predefined formatting options. 🎨</p>`;

    // toolbarOptions = [
    //   // [{'bold': ['bold', 'italic', 'underline', 'strike']}],
    //   [
    //     'bold',
    //     'italic',
    //     'underline',
    //     'strike'
    //   ],        // toggled buttons
    //   [
    //     // 'blockquote',
    //     'code-block'
    //   ],
    //   [
    //     'link',
    //     'image',
    //     'video',
    //     'formula'
    //   ],
    //   // [
    //   //   { 'header': 1 },
    //   //   { 'header': 2 }
    //   // ],               // custom button values
    //   [
    //     {'list': 'ordered'},
    //     {'list': 'bullet'},
    //     {'list': 'check'}
    //   ],
    //   // [
    //   //   { 'script': 'sub'},
    //   //   { 'script': 'super' }
    //   // ],      // superscript/subscript
    //   // [
    //   //   { 'indent': '-1'},
    //   //   { 'indent': '+1' }
    //   // ],          // outdent/indent
    //   // [
    //   //   { 'direction': 'rtl' }
    //   // ],                         // text direction
    //   // [
    //   //   {
    //   //     'size': ['small', false, 'large', 'huge']
    //   //   }
    //   // ],  // custom dropdown
    //   [
    //     {
    //       'header':
    //         [1, 2, 3, 4, 5, 6, false]
    //     }
    //   ],
    //   [
    //     {'color': []},
    //     {
    //       'background': []
    //     }
    //   ],          // dropdown with defaults from theme
    //   [
    //     {
    //       'font': []
    //     }
    //   ],
    //   [
    //     {
    //       'align': []
    //     }
    //   ],
    //   [
    //     'clean'
    //   ]                                         // remove formatting button
    // ];

    toolbarItems!: MenuItem[];
    private savedRange!: any;
    private editorHasFocus: boolean = true;

    constructor(
        protected layoutService: LayoutService,
        private renderer: Renderer2
    ) {
        this.toolbarItems = this.layoutService.toolbarItems;
        this.layoutService.generatedTextObservable$.subscribe(text => {
            if (!this.savedRange) return;
            if (this.savedRange.length > 0) {
                // replace selection
                this.quill.deleteText(this.savedRange.index, this.savedRange.length);
            }
            this.quill.clipboard.dangerouslyPasteHTML(this.savedRange.index, text)
        });
    }

    ngOnInit(): void {
        this.toolbar = this.layoutService.getToolbarElementRef();
    }

    ngAfterViewInit() {
        this.quill = new Quill(this.editor.nativeElement, {
            modules: {
                // syntax: true,
                toolbar: this.toolbar.nativeElement,
            },
            theme: 'snow',
        });

        // Add fonts to whitelist
        const Font = Quill.import('formats/font');
        // @ts-ignore
        Font.whitelist = ['arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida', 'times-new-roman'];
        // @ts-ignore
        Quill.register(Font, true);

        var Size = Quill.import('attributors/style/size');
        // @ts-ignore
        Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '24px', '36px'];
        // @ts-ignore
        Quill.register(Size, true);

        this.editor.nativeElement.querySelector('.ql-editor').style.borderRadius = '12px';
        this.editor.nativeElement.querySelector('.ql-editor').style.background = '#f1f1f1';
        this.editor.nativeElement.querySelector('.ql-editor').style.padding = '5% 8% 25px';
        this.editor.nativeElement.querySelector('.ql-editor').style.boxShadow = '0px 3px 5px rgba(0, 0, 0, 0.02),\n' +
            '    0px 0px 2px rgba(0, 0, 0, 0.05),\n' +
            '    0px 1px 4px rgba(0, 0, 0, 0.08)';

        // load editor content
        if (localStorage.getItem('editorHTML') !== null) {
            this.editor.nativeElement.querySelector('.ql-editor').innerHTML = localStorage.getItem('editorHTML');
        } else {
            this.editor.nativeElement.querySelector('.ql-editor').innerHTML = `${this.placeholder}`;

        }


        this.quill.focus();

        this.quill.on('selection-change', (range, oldRange, source) => {
            if (range) {
                if (range.length == 0) {
                    // console.log('User cursor is on', range.index);
                    if (!this.editorHasFocus) {
                        this.quill.setSelection(this.savedRange);
                        this.editorHasFocus = true;
                        return;
                    }
                    this.overlayPanel.hide();
                    this.savedRange = this.quill.getSelection(false);
                    this.layoutService.updateEditorSelectedText('');
                } else {
                    if (!this.editorHasFocus) {
                        this.quill.setSelection(this.savedRange);
                        this.editorHasFocus = true;
                        return;
                    }
                    this.savedRange = this.quill.getSelection(false);
                    this.layoutService.updateEditorSelectedText(this.quill.getText(range.index, range.length));

                    const bounds: Bounds = <Bounds>this.quill.getBounds(range.index, range.length);
                    const editorRect = this.editor.nativeElement.getBoundingClientRect();

                    const top = editorRect.top + window.scrollY + bounds.top;
                    const left = editorRect.left + window.scrollX + bounds.left;

                    // Create a fake event to pass the position to the OverlayPanel
                    const event = {
                        target: {
                            getBoundingClientRect: () => ({
                                top: top,
                                left: left,
                                bottom: top + bounds.height,
                                right: left + bounds.width,
                                height: bounds.height,
                                width: bounds.width
                            })
                        }
                    };
                    this.overlayPanel.show(event as unknown as MouseEvent);
                }
            } else {
                // console.log('Cursor not in the editor');
                this.editorHasFocus = false;
                this.overlayPanel.hide();
            }
        });

        this.quill.on('text-change', (delta, oldDelta, source) => {
            this.applyEditorStyle()
        });

        this.quill.on('text-change', (delta, oldDelta, source) => {
            localStorage.setItem('editorHTML', this.editor.nativeElement.querySelector('.ql-editor').innerHTML);
        });
    }

    applyEditorStyle() {
        const pElements = this.editor.nativeElement.querySelectorAll('p');
        pElements.forEach((p: HTMLElement) => {
            this.renderer.setStyle(p, 'line-height', '1.5');
            this.renderer.setStyle(p, 'margin', '0 0 1rem 0');
        });
    }
}

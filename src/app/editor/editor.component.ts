import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {EditorModule} from 'primeng/editor';
import {FormsModule} from '@angular/forms';
import Quill, {Bounds} from 'quill';
import {LayoutService} from "@src/app/layout/service/app.layout.service";
import {OverlayPanel, OverlayPanelModule} from "primeng/overlaypanel";
import {MenubarModule} from "primeng/menubar";
import {MenuItem} from "primeng/api";
import {Button} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {SplitButtonModule} from "primeng/splitbutton";
import {TabViewChangeEvent, TabViewCloseEvent, TabViewModule} from "primeng/tabview";

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [FormsModule, EditorModule, OverlayPanelModule, MenubarModule, Button, Ripple, NgClass, NgIf, InputTextModule, SplitButtonModule, TabViewModule, NgForOf],
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class EditorComponent implements AfterViewInit, OnInit {
    @ViewChild('editor', {static: true}) editor!: ElementRef;
    @ViewChild('op') overlayPanel!: OverlayPanel;

    toolbar!: ElementRef;
    quill!: Quill;

    placeholder: string = `<h1 class="ql-align-center">Quill Rich Text Editor</h1><p></p><p>Quill is a feature-rich WYSIWYG editor that offers a wide range of functionalities. Here are some samples of what the Quill editor can do: </p><p> 1. <strong>Text Formatting:</strong> Quill allows users to easily format text by providing options for <em>bold, italic, underline, strikethrough,</em> and more. ✍️ </p><p> 2. <strong>Lists:</strong> It supports both <em>ordered and unordered lists,</em> making it easy to create structured content. 📝 </p><p> 3. <strong>Embedding Images:</strong> Users can insert images directly into the editor and adjust their size and alignment. 🖼️ </p><p> 4. <strong>Links:</strong> Quill enables users to create hyperlinks within the text for easy navigation to external resources. 🔗 </p><p> 5. <strong>Custom Styles:</strong> Developers can create custom styles to provide users with predefined formatting options. 🎨</p>`;

    toolbarItems!: MenuItem[];
    private savedRange!: any;
    private editorHasFocus: boolean = true;
    tabs: any = [];
    activeIndex: number = 0;

    constructor(
        protected layoutService: LayoutService,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
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
        this.layoutService.updateEditorHTML$.subscribe((args: any) => {
            // args != {}
            if (!(args && Object.keys(args).length === 0 && args.constructor === Object)) {
                const newHTML = args.content;
                const fileId = args.id;
                const fileName = args.name;
                const index = this.tabs.findIndex((tab: any) => tab.fileId === fileId);
                // fileId not in tabs
                if (index === -1) {
                    const localStorageHTML = localStorage.getItem(`editorHTML-${fileId}`);
                    this.editor.nativeElement.querySelector('.ql-editor').innerHTML = localStorageHTML || newHTML;
                    this.tabs.push({title: fileName, content: localStorageHTML || newHTML, fileId: fileId});
                    this.cdr.detectChanges();
                    this.activeIndex = this.tabs.length - 1;
                } else {
                    this.activeIndex = index;
                    this.editor.nativeElement.querySelector('.ql-editor').innerHTML = this.tabs[this.activeIndex].content;
                }
            }
        })
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

        const localStorageHTML = localStorage.getItem('editorHTML--1');
        this.editor.nativeElement.querySelector('.ql-editor').innerHTML = localStorageHTML || this.placeholder;
        this.tabs.push({
            title: 'LocalDraft',
            content: this.editor.nativeElement.querySelector('.ql-editor').innerHTML,
            fileId: -1
        });

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
            // TODO: OPTIMIZE
            this.applyEditorStyle();
            localStorage.setItem(`editorHTML-${this.tabs[this.activeIndex].fileId}`, this.editor.nativeElement.querySelector('.ql-editor').innerHTML);
        });
    }

    applyEditorStyle() {
        const pElements = this.editor.nativeElement.querySelectorAll('p');
        pElements.forEach((p: HTMLElement) => {
            this.renderer.setStyle(p, 'line-height', '1.5');
            this.renderer.setStyle(p, 'margin', '0 0 1rem 0');
        });
    }

    onTabClose($event: TabViewCloseEvent) {
        // todo: save close tab
        // remove tab
        this.tabs.splice($event.index, 1);
        if (this.tabs.length > 0) {
            this.activeIndex = Math.max(0, $event.index - 1);
            this.editor.nativeElement.querySelector('.ql-editor').innerHTML = this.tabs[this.activeIndex].content;
        } else {
            this.activeIndex = -1;
            this.editor.nativeElement.querySelector('.ql-editor').innerHTML = '';
        }
    }

    onTabChange($event: TabViewChangeEvent) {
        this.activeIndex = $event.index;
        const localStorageHTML = localStorage.getItem(`editorHTML-${this.tabs[this.activeIndex].fileId}`);
        this.editor.nativeElement.querySelector('.ql-editor').innerHTML = localStorageHTML || this.tabs[this.activeIndex].content;
    }
}

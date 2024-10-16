import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef, OnDestroy,
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
import {DataService} from "@src/app/layout/service/data.service";
import {AuthGoogleService} from "@src/app/layout/service/auth-google.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [FormsModule, EditorModule, OverlayPanelModule, MenubarModule, Button, Ripple, NgClass, NgIf, InputTextModule, SplitButtonModule, TabViewModule, NgForOf],
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class EditorComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('editor', {static: true}) editor!: ElementRef;
    @ViewChild('op') overlayPanel!: OverlayPanel;

    toolbar!: ElementRef;
    quill!: Quill;

    placeholder: string = `<h1><span style="color: rgb(74, 144, 226);">Welcome to Your New Text Editor! ✨</span></h1><p><span style="color: rgb(0, 0, 0);">Get ready to elevate your writing experience like never before! </span></p><p><span style="color: rgb(0, 0, 0);">Our innovative text editor is designed specifically to enhance your writing journey. </span></p><p><span style="color: rgb(0, 0, 0);">With amazing features and a user-friendly interface, you'll be able to create, organize, and refine your documents seamlessly. 🌟</span></p><h2><span style="color: rgb(0, 0, 0);">🚀 Key Features:</span></h2><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong style="color: rgb(0, 0, 0);">File and Directory Management:</strong><span style="color: rgb(0, 0, 0);">&nbsp;Create and organize your documents with ease, keeping all your writings structured and accessible. 📁</span></li><li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Add new text/directory by clicking the ➕ icon on the top menu bar</li><li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Click the 📂 icon to show all the created files and folders</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong style="color: rgb(0, 0, 0);">AI Powered Assistance:</strong><span style="color: rgb(0, 0, 0);">&nbsp;Harness the power of&nbsp;</span><strong style="color: rgb(0, 0, 0);">ChatGPT</strong><span style="color: rgb(0, 0, 0);">&nbsp;to enhance your writing with intelligent suggestions and insights. 🤖✍️</span></li><li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Click the ⚙️ icon to the top-right corner of the page and enter your <a href="https://platform.openai.com/api-keys" rel="noopener noreferrer" target="_blank">ChatGPT API token</a>. Don't worry, your token is only stored locally on your browser 🔐</li><li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Try to <strong style="color: rgb(0, 0, 0);">highlight a sentence and:</strong></li><li data-list="ordered" class="ql-indent-2"><span class="ql-ui" contenteditable="false"></span><strong style="color: rgb(0, 0, 0);">Click the purple sparkling menu OR </strong></li><li data-list="ordered" class="ql-indent-2"><span class="ql-ui" contenteditable="false"></span><strong style="color: rgb(0, 0, 0);">Select quick prompts from the dropdown menu </strong></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong style="color: rgb(0, 0, 0);">Secure Login:</strong><span style="color: rgb(0, 0, 0);">&nbsp;Utilize Single Sign-On (SSO) with your Google account for a secure and synchronized experience across all your devices. 🔒</span></li><li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Login by clicking the 👤 icon</li></ol><p><br></p><p><span style="color: rgb(0, 0, 0);">Start your writing adventure with us and unlock new possibilities! Happy writing! 📝</span></p><p><span style="color: rgb(0, 0, 0);">Any Issues? Raise them in </span><a href="https://github.com/panoslin/Aceditor/issues" rel="noopener noreferrer" target="_blank" style="color: rgb(0, 0, 0);">Github</a></p><p><br></p><p><br></p>`;
    toolbarItems!: MenuItem[];
    private savedRange!: any;
    private editorHasFocus: boolean = true;
    tabs: any = [];
    activeIndex: number = 0;

    constructor(
        protected layoutService: LayoutService,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
        private dataService: DataService,
        private authGoogleService: AuthGoogleService
    ) {
        this.toolbarItems = this.layoutService.toolbarItems;
        this.layoutService.AiGeneratedText$.subscribe(text => {
            if (!this.savedRange) return;
            if (this.savedRange.length > 0) {
                // replace selection
                this.quill.deleteText(this.savedRange.index, this.savedRange.length);
            }
            this.quill.clipboard.dangerouslyPasteHTML(this.savedRange.index, text)
        });
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    private intervalId: any;

    saveFilesOnTabs() {
        // for each tab call saveFileContent
        this.tabs.forEach((tab: any) => {
            // excluding fileId === -1
            if (tab.fileId === -1) return;
            this.dataService.saveFileContent(
                tab.fileId,
                (localStorage.getItem(`editorHTML-${tab.fileId}`)) as string,
                tab.title,
                this.authGoogleService.getIdToken(),
                tab.parent
            ).subscribe();
        })
    }

    ngOnInit(): void {
        this.intervalId = setInterval(() => {
            this.saveFilesOnTabs();
        }, 5000);
        this.toolbar = this.layoutService.getToolbarElementRef();
        this.layoutService.editorContent$.subscribe((args: any) => {
            // args != {}
            if (!(args && Object.keys(args).length === 0 && args.constructor === Object)) {
                const newHTML = args.content;
                const fileId = args.id;
                const fileName = args.name;
                const parent = args.parent;
                const index = this.tabs.findIndex((tab: any) => tab.fileId === fileId);
                // fileId not in tabs
                if (index === -1) {
                    const localStorageHTML = localStorage.getItem(`editorHTML-${fileId}`);
                    this.editor.nativeElement.querySelector('.ql-editor').innerHTML = localStorageHTML || newHTML;
                    this.tabs.push({
                        title: fileName,
                        content: localStorageHTML || newHTML,
                        fileId: fileId,
                        parent: parent
                    });
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
            fileId: -1,
            parent: -1
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
            localStorage.setItem(`editorHTML-${this.tabs[this.activeIndex].fileId}`, this.editor.nativeElement.querySelector('.ql-editor').innerHTML);
        });
    }

    onTabClose($event: TabViewCloseEvent) {
        // save close tab if not local draft
        if (this.tabs[$event.index].fileId !== -1) {
            const localStorageHTML = (localStorage.getItem(`editorHTML-${this.tabs[$event.index].fileId}`)) as string;
            this.dataService.saveFileContent(
                this.tabs[$event.index].fileId,
                localStorageHTML,
                this.tabs[$event.index].title,
                this.authGoogleService.getIdToken(),
                this.tabs[$event.index].parent
            ).subscribe({
                next: (response) => {
                    this.layoutService.sendMessage({
                        severity: 'success',
                        summary: 'Success',
                        detail: `File saved: "${response.name}"`
                    })
                },
                error: (err) => {
                    this.layoutService.sendMessage({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Error on API requests: \n${err.message}`
                    })
                }
            });
        }
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

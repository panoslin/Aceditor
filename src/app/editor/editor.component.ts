import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

  text: string = `
  <h1 class="ql-align-center">Quill Rich Text Editor</h1>
  <p>Quill is a free, <a href="https://github.com/slab/quill/">open source</a> WYSIWYG editor built for the modern web. With its <a href="https://quilljs.com/docs/modules/">modular architecture</a> and expressive <a href="https://quilljs.com/docs/api">API</a>, it is completely customizable to fit any need.</p>
<!--  <h2 class="ql-align-center">Getting Started is Easy</h2>-->
<!--  <pre data-language="javascript" class="ql-syntax" spellcheck="false"><span class="hljs-comment">// &lt;link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet"&gt;</span>-->
<!--    <span class="hljs-comment">// &lt;script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"&gt;&lt;/script&gt;</span>-->

<!--    <span class="hljs-keyword">const</span> quill = <span class="hljs-keyword">new</span> Quill(<span class="hljs-string">'#editor'</span>,-->
<!--    {-->
<!--      modules: {-->
<!--        toolbar: <span class="hljs-string">'#toolbar'</span>-->
<!--      },-->
<!--      theme: <span class="hljs-string">'snow'</span>-->
<!--    });-->

<!--    <span class="hljs-comment">// Open your browser's developer console to try out the API!</span>-->
<!--  </pre>-->
<!--  <p class="ql-align-center"><strong>Built with</strong></p>-->
<!--  <p class="ql-align-center"><span class="ql-formula" data-value="x^2 + (y - \\\\sqrt[3]{x^2})^2 = 1"></span></p>-->
<!--  <p><br></p>-->
  `;

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

  toolbarItems: MenuItem[] = [
    {label: '📝 Summarize'},
    {label: '✨ Improve'},
    {label: '🔍 Simplify'},
    {label: '🔧 Expand'},
    {
      label: '🎨 Change Tone',
      items: [
        {label: '🏢 Professional'},
        {label: '🏠 Casual'},
      ]
    },
    {
      label: '🖋️ Change Style',
      items: [
        {label: '💼 Business'},
        {label: '🎓 Academic'},
      ]
    }
  ];
  private displayChatGPTDialog: boolean = false;

  constructor(private layoutService: LayoutService) {
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
    this.editor.nativeElement.querySelector('.ql-editor').innerHTML = `${this.text}`;

    this.quill.on('selection-change', (range, oldRange, source) => {
      if (range) {
        if (range.length == 0) {
          // console.log('User cursor is on', range.index);
          this.overlayPanel.hide();
        } else {
          // const text = this.quill.getText(range.index, range.length);
          // console.log('User has highlighted', text);

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
        // this.overlayPanel.hide();
      }
    });
  }

  showChatGPTDialog() {
    this.displayChatGPTDialog = true;
  }
}

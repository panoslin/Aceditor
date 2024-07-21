import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EditorModule} from 'primeng/editor';
import {FormsModule} from '@angular/forms';
import Quill from 'quill';
import {LayoutService} from "@src/app/layout/service/app.layout.service";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, EditorModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements AfterViewInit, OnInit {
  @ViewChild('editor', {static: true}) editor!: ElementRef;
  toolbar!: ElementRef;
  quill!: Quill;

//   text: string = `
//                 <h1 class="ql-align-center">Quill Rich Text Editor</h1>
//                 <p><br></p>
//                 <p>Quill is a free, <a href="https://github.com/slab/quill/">open source</a> WYSIWYG editor built for the modern web. With its <a href="https://quilljs.com/docs/modules/">modular architecture</a> and expressive <a href="https://quilljs.com/docs/api">API</a>, it is completely customizable to fit any need.</p>
//                 <p><br></p>
//                 <iframe class="ql-video ql-align-center" src="https://player.vimeo.com/video/253905163" width="500" height="280" allowfullscreen></iframe>
//                 <p><br></p>
//                 <h2 class="ql-align-center">Getting Started is Easy</h2>
//                 <p><br></p>
//                 <pre data-language="javascript" class="ql-syntax" spellcheck="false"><span class="hljs-comment">// &lt;link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet"&gt;</span>
// <span class="hljs-comment">// &lt;script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"&gt;&lt;/script&gt;</span>
//
// <span class="hljs-keyword">const</span> quill = <span class="hljs-keyword">new</span> Quill(<span class="hljs-string">'#editor'</span>, {
//   modules: {
//     toolbar: <span class="hljs-string">'#toolbar'</span>
//   },
//   theme: <span class="hljs-string">'snow'</span>
// });
//
// <span class="hljs-comment">// Open your browser's developer console to try out the API!</span>
// </pre>
//                 <p><br></p>
//                 <p><br></p>
//                 <p class="ql-align-center"><strong>Built with</strong></p>
//                 <p class="ql-align-center"><span class="ql-formula" data-value="x^2 + (y - \\sqrt[3]{x^2})^2 = 1"></span></p>
//                 <p><br></p>
// `;
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
      // placeholder: this.text,
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
  }

}

import { Component } from '@angular/core';
import { EditorModule } from 'primeng/editor';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, EditorModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  text: string | undefined;

}

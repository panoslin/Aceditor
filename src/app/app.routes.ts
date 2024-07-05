import {Routes} from '@angular/router';
import {AppLayoutComponent} from "./app.layout.component";
import {EditorComponent} from "@src/app/editor/editor.component";

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: EditorComponent
      }
    ]
  },
  {path: '**', redirectTo: '/notfound'},
];

import {Routes} from '@angular/router';
import {AppLayoutComponent} from "./app.layout.component";

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,

  },
  {path: '**', redirectTo: '/notfound'},
];

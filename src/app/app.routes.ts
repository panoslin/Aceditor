import {Routes} from '@angular/router';
import {AppLayoutComponent} from "./app.layout.component";
import {EditorComponent} from "@src/app/editor/editor.component";
import {LoginCallBackComponent} from "@src/app/login-call-back/login-call-back.component";

export const routes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                component: EditorComponent
            },
            // login callback uri after OAuth
            {
                path: 'login/callback',
                component: LoginCallBackComponent
            },
        ]
    },
    {path: '**', redirectTo: '/notfound'},
];

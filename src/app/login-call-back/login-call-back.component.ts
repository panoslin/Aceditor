import {Component, inject, OnInit} from '@angular/core';
import {AuthGoogleService} from "@src/app/layout/service/auth-google.service";
import {Router} from "@angular/router";
import {DataService} from "@src/app/layout/service/data.service";
import {SkeletonModule} from "primeng/skeleton";
import {HttpClient} from "@angular/common/http";
import {LayoutService} from "@src/app/layout/service/app.layout.service";

@Component({
    selector: 'app-login-call-back',
    standalone: true,
    imports: [
        SkeletonModule
    ],
    templateUrl: './login-call-back.component.html',
})
export class LoginCallBackComponent implements OnInit {
    private authGoogleService = inject(AuthGoogleService);

    constructor(
        private router: Router,
        private authBackendService: DataService,
        private http: HttpClient,
        private layoutService: LayoutService
    ) {
    }

    ngOnInit(): void {
        this.authGoogleService.userProfile$.subscribe((profile) => {
            if (profile) {
                this.router.navigate(['/']);
            }
        })
        // const accessToken = this.authGoogleService.getAccessToken();
        // if (accessToken) {
        //     // this.authGoogleService.getProfile();
        //     // todo: validate auth code
        //     // todo: validate user
        //     // this.authBackendService.login(authCode);
        //     // this.exchangeAuthorizationCode(this.authGoogleService.getToken()).subscribe(res => {
        //     //     console.log(res);
        //     //     this.authBackendService.login(this.authGoogleService.getToken());
        //     //     // redirect to home
        //     //     this.router.navigate(['/']);
        //     // });
        //
        //     this.authBackendService.login(authCode, this.authGoogleService.getTokenVerifier()).subscribe({
        //         next: (results) => {
        //             console.log(results);
        //             // this.authBackendService.login(authCode);
        //             // redirect to home
        //             // this.router.navigate(['/']);
        //         },
        //         error: (err) => {
        //             this.layoutService.sendMessage({
        //                 severity: 'error',
        //                 summary: 'Error',
        //                 detail: 'Error on API requests: \n' + err.message
        //             })
        //             // this.layoutService.updatePageStatus(false);
        //         },
        //         complete: () => {
        //             // this.layoutService.updatePageStatus(false);
        //         }
        //     });
        // }

    }

    // exchangeAuthorizationCode(authorizationCode: string): Observable<any> {
    //     const headers = new HttpHeaders({
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //     });
    //
    //     const body = new URLSearchParams();
    //     body.set('code', authorizationCode);
    //
    //     return this.http.post(
    //         `${environment.apiEndpoint}/auth/oauth2/code/google`,
    //         body.toString(),
    //         {headers}
    //     );
    // }

}

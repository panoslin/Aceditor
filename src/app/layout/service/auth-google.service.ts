import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AuthConfig, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

export interface UserProfile {
    name: string;
    email: string;
    imageUrl: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthGoogleService {
    private oAuthService = inject(OAuthService);
    private router = inject(Router);

    private userProfileSubject: BehaviorSubject<UserProfile | null> = new BehaviorSubject<UserProfile | null>(null);
    public userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();

    constructor(private http: HttpClient) {
        this.initConfiguration();
        this.oAuthService.events.subscribe((event: OAuthEvent) => {
            if (event.type === 'token_received') {
                const profile = this.oAuthService.getIdentityClaims();
                if (profile) {
                    const userProfile: UserProfile = {
                        name: profile['name'],
                        email: profile['email'],
                        imageUrl: profile['picture'],
                    }
                    this.userProfileSubject.next(userProfile);
                    return userProfile;
                }
            }
            return;
        });
    }

    initConfiguration() {
        const authConfig: AuthConfig = {
            issuer: 'https://accounts.google.com',
            strictDiscoveryDocumentValidation: false,
            clientId: '536318037598-gjdot75lm7badsm06jdve06fpoivalth.apps.googleusercontent.com',
            redirectUri: window.location.origin + '/login/callback',
            scope: 'profile email openid',
            // responseType: 'code token',
            // dummyClientSecret: 'secret',
            // showDebugInformation: true,
            // URL of the client's logout redirect URI (where the OAuth2 provider will redirect after logout)
            postLogoutRedirectUri: window.location.origin,
            // Enable OIDC (OpenID Connect)
            oidc: true,
            useSilentRefresh: true,
            requireHttps: true,
            sessionChecksEnabled: true,
        };

        this.oAuthService.configure(authConfig);
        this.oAuthService.setupAutomaticSilentRefresh();
        this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    }

    login() {
        this.oAuthService.initImplicitFlow();
    }

    logout() {
        this.oAuthService.revokeTokenAndLogout();
        this.oAuthService.logOut();
    }

    getProfile() {
        const profile = this.oAuthService.getIdentityClaims();
        if (profile) {
            const userProfile: UserProfile = {
                name: profile['name'],
                email: profile['email'],
                imageUrl: profile['picture'],
            }
            this.userProfileSubject.next(userProfile);
            return userProfile;
        }
        return null;
    }

    getIdToken() {
        return this.oAuthService.getIdToken();
    }

    isAuthenticated() {
        return this.oAuthService.hasValidAccessToken();
    }
}

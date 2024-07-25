import {enableProdMode, importProvidersFrom} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app/app.component';
import {routes} from './app/app.routes';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from './environments/environment';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(
            routes,
            withEnabledBlockingInitialNavigation(),
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                // onSameUrlNavigation: 'reload'
            })
        ),
        importProvidersFrom(BrowserAnimationsModule), // Add BrowserAnimationsModule if you use animations
        importProvidersFrom(HttpClientModule) // Add HttpClientModule here
    ],
}).catch((err) => console.error(err));

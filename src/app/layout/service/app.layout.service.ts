import {effect, ElementRef, Injectable, signal} from '@angular/core';
import {catchError, map, Observable, of, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "@src/environments/environment";

export interface AppConfig {
  inputStyle: string;
  colorScheme: string;
  theme: string;
  ripple: boolean;
  menuMode: string;
  scale: number;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private toolbarElementRef!: ElementRef;

  setToolbarElementRef(elementRef: ElementRef) {
    this.toolbarElementRef = elementRef;
  }

  getToolbarElementRef(): ElementRef {
    return this.toolbarElementRef;
  }

  _config: AppConfig = {
    ripple: false,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'light',
    theme: 'lara-light-indigo',
    scale: 14,
  };

  config = signal<AppConfig>(this._config);

  state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  };

  private configUpdate = new Subject<AppConfig>();
  configUpdate$ = this.configUpdate.asObservable();
  private overlayOpen = new Subject<any>();
  overlayOpen$ = this.overlayOpen.asObservable();

  constructor(
    private http: HttpClient,
  ) {
    effect(() => {
      const config = this.config();
      if (this.updateStyle(config)) {
        this.changeTheme();
      }
      this.changeScale(config.scale);
      this.onConfigUpdate();
    });
  }

  updateStyle(config: AppConfig) {
    return (
      config.theme !== this._config.theme ||
      config.colorScheme !== this._config.colorScheme
    );
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.state.overlayMenuActive = !this.state.overlayMenuActive;
      if (this.state.overlayMenuActive) {
        this.overlayOpen.next(null);
      }
    }

    if (this.isDesktop()) {
      this.state.staticMenuDesktopInactive =
        !this.state.staticMenuDesktopInactive;
    } else {
      this.state.staticMenuMobileActive =
        !this.state.staticMenuMobileActive;

      if (this.state.staticMenuMobileActive) {
        this.overlayOpen.next(null);
      }
    }
  }

  showProfileSidebar() {
    this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
    if (this.state.profileSidebarVisible) {
      this.overlayOpen.next(null);
    }
  }

  showConfigSidebar() {
    this.state.configSidebarVisible = true;
  }

  isOverlay() {
    return this.config().menuMode === 'overlay';
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this._config = {...this.config()};
    this.configUpdate.next(this.config());
  }

  changeTheme() {
    const config = this.config();
    const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    const themeLinkHref = themeLink.getAttribute('href')!;
    const newHref = themeLinkHref
      .split('/')
      .map((el) =>
        el == this._config.theme
          ? (el = config.theme)
          : el == `theme-${this._config.colorScheme}`
            ? (el = `theme-${config.colorScheme}`)
            : el
      )
      .join('/');

    this.replaceThemeLink(newHref);
  }

  replaceThemeLink(href: string) {
    const id = 'theme-css';
    let themeLink = <HTMLLinkElement>document.getElementById(id);
    const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');

    themeLink.parentNode!.insertBefore(
      cloneLinkElement,
      themeLink.nextSibling
    );
    cloneLinkElement.addEventListener('load', () => {
      themeLink.remove();
      cloneLinkElement.setAttribute('id', id);
    });
  }

  changeScale(value: number) {
    document.documentElement.style.fontSize = `${value}px`;
  }

  fetchSuggestion(apiToken: string, userPrompt: string, systemPrompt: string, model: string): Observable<any> {
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: model,
      messages: messages,
      n: 1,
      frequency_penalty: 1.0
    };

    return this.http.post<any>(environment.chatGptApiEndpoint, body, {headers: headers}).pipe(
      map(response => {
        const completion = response;
        if (completion.choices[0].finish_reason === 'length') {
          // TODO: TOAST ERROR MSG
          console.log('Completion finished with incomplete output, please try again with more context');
          console.log(completion.choices[0].message.content);
          return [];
        }

        return JSON.parse(completion.choices[0].message.content).suggestions || [];
      }),
      catchError(error => {
        // TODO: TOAST ERROR MSG
        console.error(`An error occurred: ${error}`);
        console.trace(error);
        return of([]);
      })
    );
  }
}

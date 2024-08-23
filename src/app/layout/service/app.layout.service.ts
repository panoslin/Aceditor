import {effect, ElementRef, Injectable, signal} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "@src/environments/environment";
import {MenuItem, MenuItemCommandEvent} from "primeng/api";
import OpenAI from 'openai';

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

export interface SendMessageParams {
    severity: string;
    summary: string;
    detail: any
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    private openai!: OpenAI;
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
        staticMenuDesktopInactive: true,
        overlayMenuActive: true,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: true,
        menuHoverActive: false,
    };
    private toolbarElementRef!: ElementRef;
    private configUpdate = new Subject<AppConfig>();
    configUpdate$ = this.configUpdate.asObservable();
    private overlayOpen = new Subject<any>();
    overlayOpen$ = this.overlayOpen.asObservable();

    private callSendChatMsgDialogSubject = new Subject<void>();
    callSendChatMsgDialogObservable$ = this.callSendChatMsgDialogSubject.asObservable();

    callSendChatMsgDialog() {
        this.callSendChatMsgDialogSubject.next();
    }

    private callToggleAuthDialogSub = new Subject<void>();
    callToggleAuthDialogObservable$ = this.callToggleAuthDialogSub.asObservable();

    callToggleAuthDialog() {
        this.callToggleAuthDialogSub.next();
    }

    private sendMessageSubject = new Subject<SendMessageParams>();
    sendMessageObservable$ = this.sendMessageSubject.asObservable();

    sendMessage(params: SendMessageParams) {
        this.sendMessageSubject.next(params);
    }

    private chatMsgDialogVisible = new BehaviorSubject<boolean>(false);
    chatMsgDialogVisibleObservable$ = this.chatMsgDialogVisible.asObservable();

    updateChatMsgDialogVisible(newStatus: boolean) {
        this.chatMsgDialogVisible.next(newStatus);
    }

    private editorSelectedText = new BehaviorSubject<string>('');
    editorSelectedTextObservable$ = this.editorSelectedText.asObservable();

    updateEditorSelectedText(text: string) {
        this.editorSelectedText.next(text);
    }

    private prompt = new BehaviorSubject<string>('');
    promptObservable$ = this.prompt.asObservable();

    updateprompt(text: string) {
        this.prompt.next(text);
    }

    toolbarItems: MenuItem[] = [
        {
            label: '📝 Summarize',
            command: (event: MenuItemCommandEvent) => {
                // show chat msg dialog
                this.updateChatMsgDialogVisible(true);
                // update questions
                this.updateprompt(
                    'You are a text summarization assistant. ' +
                    'Your task is to summarize the provided sentences and return the summaries formatted as HTML.'
                );
                // call sendChatMsgDialog in layout ts
                this.callSendChatMsgDialog();
            }
        },
        {
            label: '✨ Improve',
            command: (event: MenuItemCommandEvent) => {
                // show chat msg dialog
                this.updateChatMsgDialogVisible(true);
                // update questions
                this.updateprompt(
                    'You are an expert writing assistant. ' +
                    'Your task is to improve and polish the provided text. ' +
                    'Enhance the clarity, coherence, and style while ensuring grammatical correctness. '
                );
                // call sendChatMsgDialog in layout ts
                this.callSendChatMsgDialog();
            }
        },
        {
            label: '🔍 Simplify',
            command: (event: MenuItemCommandEvent) => {
                // show chat msg dialog
                this.updateChatMsgDialogVisible(true);
                // update questions
                this.updateprompt(
                    'You are a writing assistant specialized in simplifying complex texts. ' +
                    'Your task is to simplify the provided text, ' +
                    'making it easier to understand while retaining the original meaning.'
                );
                // call sendChatMsgDialog in layout ts
                this.callSendChatMsgDialog();
            }
        },
        {
            label: '🔧 Expand',
            command: (event: MenuItemCommandEvent) => {
                // show chat msg dialog
                this.updateChatMsgDialogVisible(true);
                // update questions
                this.updateprompt(
                    'You are a writing assistant specialized in expanding texts. ' +
                    'Your task is to expand the provided text by adding relevant details, explanations, and examples. ' +
                    'Ensure the expanded text is coherent and maintains the original meaning.'
                );
                // call sendChatMsgDialog in layout ts
                this.callSendChatMsgDialog();
            }
        },
        {
            label: '🎨 Change Tone',
            items: [
                {
                    label: '🏢 Professional',
                    command: (event: MenuItemCommandEvent) => {
                        // show chat msg dialog
                        this.updateChatMsgDialogVisible(true);
                        // update questions
                        this.updateprompt(
                            'You are a writing assistant specialized in adjusting the tone of texts. ' +
                            'Your task is to change the tone of the provided text to be more professional and formal. ' +
                            'Ensure the revised text is clear, concise, and retains the original meaning.'
                        );
                        // call sendChatMsgDialog in layout ts
                        this.callSendChatMsgDialog();
                    }
                },
                {
                    label: '🏠 Casual',
                    command: (event: MenuItemCommandEvent) => {
                        // show chat msg dialog
                        this.updateChatMsgDialogVisible(true);
                        // update questions
                        this.updateprompt(
                            'You are a writing assistant specialized in adjusting the tone of texts. ' +
                            'Your task is to change the tone of the provided text to be more casual and conversational. ' +
                            'Ensure the revised text is easy to read, engaging, and retains the original meaning.'
                        );
                        // call sendChatMsgDialog in layout ts
                        this.callSendChatMsgDialog();
                    }
                },
            ]
        },
        {
            label: '🖋️ Change Style',
            items: [
                {
                    label: '💼 Business',
                    command: (event: MenuItemCommandEvent) => {
                        // show chat msg dialog
                        this.updateChatMsgDialogVisible(true);
                        // update questions
                        this.updateprompt(
                            'You are a writing assistant specialized in adjusting the style of texts. ' +
                            'Your task is to change the style of the provided text to be more business-facing. ' +
                            'Ensure the revised text is professional, concise, and retains the original meaning.'
                        );
                        // call sendChatMsgDialog in layout ts
                        this.callSendChatMsgDialog();
                    }
                },
                {
                    label: '🎓 Academic',
                    command: (event: MenuItemCommandEvent) => {
                        // show chat msg dialog
                        this.updateChatMsgDialogVisible(true);
                        // update questions
                        this.updateprompt(
                            'You are a writing assistant specialized in adjusting the style of texts. ' +
                            'Your task is to change the style of the provided text to be more academic. ' +
                            'Ensure the revised text is formal, detailed, and retains the original meaning.'
                        );
                        // call sendChatMsgDialog in layout ts
                        this.callSendChatMsgDialog();
                    }
                },
            ]
        }
    ];

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

    setToolbarElementRef(elementRef: ElementRef) {
        this.toolbarElementRef = elementRef;
    }

    getToolbarElementRef(): ElementRef {
        return this.toolbarElementRef;
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

    // async ngOnInit(): Promise<void> {
    //     for await (const content of this.LayoutService.getChatCompletionGenerator()) {
    //         console.log(content);
    //         // You can also update the component's state or do other processing with the yielded content here
    //     }
    // }
    async* getChatCompletionGenerator(
        apiToken: string,
        messages: any,
        model: string
    ): AsyncIterableIterator<string> {
        try {
            this.openai = new OpenAI({
                apiKey: apiToken,
                dangerouslyAllowBrowser: true,
            });
            const stream = await this.openai.chat.completions.create({
                model: model,
                messages: messages,
                stream: true,
            });

            for await (const chunk of stream) {
                yield chunk.choices[0]?.delta?.content || '';
            }
        } catch (error) {
            this.sendMessage({
                severity: 'error',
                summary: 'chatGPT API Error',
                detail: error
            })
            console.error('Error fetching chat completion:', error);
        }
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
                    this.sendMessage({
                        severity: 'error',
                        summary: 'chatGPT API Error',
                        detail: `Completion finished with incomplete output, please try again with more context ${completion.choices[0].message.content}`
                    })
                    return [];
                }

                return JSON.parse(completion.choices[0].message.content).suggestions || [];
            }),
            catchError(error => {
                this.sendMessage({
                    severity: 'error',
                    summary: 'chatGPT API Error',
                    detail: error
                })
                return of([]);
            })
        );
    }

    private generatedTextSubject = new BehaviorSubject<string>('');
    generatedTextObservable$ = this.generatedTextSubject.asObservable();

    updateSelectionText(text: string) {
        this.generatedTextSubject.next(text);
    }

    private pageStatus = new BehaviorSubject<boolean>(true);
    pageStatusObservable = this.pageStatus.asObservable();

    updatePageStatus(newStatus: boolean) {
        this.pageStatus.next(newStatus);
    }
}

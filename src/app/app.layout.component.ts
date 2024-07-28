import {ChangeDetectorRef, Component, ElementRef, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';

import {filter, Subscription} from 'rxjs';

import {LayoutService} from "./layout/service/app.layout.service";
import {AppConfigComponent} from './layout/config/app.config.component';
import {MenuComponent} from "./menu/menu.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {StatusComponent} from "./status/status.component";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {FormsModule} from "@angular/forms";
import {InputTextareaModule} from "primeng/inputtextarea";

// import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-layout',
    templateUrl: './app.layout.component.html',
    standalone: true,
    imports: [
        NgClass,
        MenuComponent,
        SidebarComponent,
        RouterOutlet,
        StatusComponent,
        AppConfigComponent,
        ToastModule,
        DialogModule,
        Button,
        InputTextModule,
        FormsModule,
        InputTextareaModule,
        NgIf,
    ],
    providers: [MessageService],
    styleUrls: ['./app.layout.component.scss']
})
export class AppLayoutComponent implements OnDestroy {

    overlayMenuOpenSubscription: Subscription;

    menuOutsideClickListener: any;

    profileMenuOutsideClickListener: any;

    @ViewChild(SidebarComponent) appSidebar!: SidebarComponent;

    @ViewChild(MenuComponent) appTopbar!: MenuComponent;

    @ViewChild('chatDialog', {static: true}) chatDialog?: ElementRef;

    chatMsgDialogVisible: boolean = false;
    chatDialogVisible: boolean = false;
    editorSelectedText: string = '';
    question: string = '';

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        // private sanitizer: DomSanitizer
    ) {

        this.layoutService.editorSelectedTextSubject$.subscribe(text => {
            this.editorSelectedText = text;
        });

        this.layoutService.chatMsgDialogVisibleObservable$.subscribe(status => {
            this.chatMsgDialogVisible = status;
            if (status) {
                this.chatDialogVisible = false;
            }
        });

        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.appSidebar.el.nativeElement.isSameNode(event.target) || this.appSidebar.el.nativeElement.contains(event.target)
                        || this.appTopbar.menuButton.nativeElement.isSameNode(event.target) || this.appTopbar.menuButton.nativeElement.contains(event.target));

                    if (isOutsideClicked) {
                        this.hideMenu();
                    }
                });
            }

            if (!this.profileMenuOutsideClickListener) {
                this.profileMenuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.appTopbar.menu.nativeElement.isSameNode(event.target) || this.appTopbar.menu.nativeElement.contains(event.target)
                        || this.appTopbar.topbarMenuButton.nativeElement.isSameNode(event.target) || this.appTopbar.topbarMenuButton.nativeElement.contains(event.target));

                    if (isOutsideClicked) {
                        this.hideProfileMenu();
                    }
                });
            }

            if (this.layoutService.state.staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.hideMenu();
                this.hideProfileMenu();
            });

        this.layoutService.sendMessageParams$.subscribe(params => {
            this.showMessage(params.severity, params.summary, params.detail);
        });
    }

    get containerClass() {
        return {
            'layout-theme-light': this.layoutService.config().colorScheme === 'light',
            'layout-theme-dark': this.layoutService.config().colorScheme === 'dark',
            'layout-overlay': this.layoutService.config().menuMode === 'overlay',
            'layout-static': this.layoutService.config().menuMode === 'static',
            'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config().menuMode === 'static',
            'layout-overlay-active': this.layoutService.state.overlayMenuActive,
            'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
            'p-input-filled': this.layoutService.config().inputStyle === 'filled',
            'p-ripple-disabled': !this.layoutService.config().ripple
        }
    }

    hideMenu() {
        this.layoutService.state.overlayMenuActive = false;
        this.layoutService.state.staticMenuMobileActive = false;
        this.layoutService.state.menuHoverActive = false;
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    hideProfileMenu() {
        this.layoutService.state.profileSidebarVisible = false;
        if (this.profileMenuOutsideClickListener) {
            this.profileMenuOutsideClickListener();
            this.profileMenuOutsideClickListener = null;
        }
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }

    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add(
            {
                severity: severity,
                summary: summary,
                detail: detail,
            }
        );
    }

    message = [
        {
            role: 'system',
            content: 'Answer the question based on the context below. ' +
                'The response should be in HTML format. ' +
                'The response should preserve any HTML formatting, links, and styles in the context.'
        },
    ];
    sendChatMsgButtonIcon: string = 'pi pi-send';
    sendChatMsgButtonSeverity: any = null;

    async sendChatMsgDialog() {
        this.sendChatMsgButtonIcon = 'pi pi-spinner-dotted pi-spin';
        this.sendChatMsgButtonSeverity = "danger"
        this.chatDialogVisible = true;
        this.cdr.detectChanges();
        // get highlighted text from editor
        const userSettings = localStorage.getItem('userSettings');
        if (userSettings) {
            const settings = JSON.parse(userSettings);
            const token = settings.token;
            const selectedModel = settings.model.code;

            if (!this.chatDialog) {
                this.chatDialog = new ElementRef(this.renderer.selectRootElement('#chatDialog', true));
            }

            // create a new div under this.chatDialog: ElementRef with class .chat-dialog
            let questionDiv = this.renderer.createElement('div');
            this.renderer.addClass(questionDiv, 'chat-dialog');
            this.renderer.addClass(questionDiv, 'mb-4');
            this.renderer.setProperty(questionDiv, 'style', 'float: right;background-color: yellowgreen');
            this.renderer.appendChild(this.chatDialog.nativeElement, questionDiv);
            questionDiv.innerHTML = this.question;

            // construct message
            if (this.message.length === 1 && this.editorSelectedText) {
                this.message.push(
                    {
                        role: 'user',
                        content: `Question: ${this.question}\n\n\nContext: ${this.editorSelectedText}`
                    }
                );
            } else {
                this.message.push(
                    {
                        role: 'user',
                        content: `Question: ${this.question}`
                    }
                );

            }
            this.question = '';

            // send query to chatgpt
            let contents = '';
            let answerDiv;
            for await (const content of this.layoutService.getChatCompletionGenerator(token, this.message, selectedModel)) {
                if (!answerDiv) {
                    answerDiv = this.renderer.createElement('div');
                    this.renderer.addClass(answerDiv, 'chat-dialog');
                    this.renderer.addClass(answerDiv, 'mb-4');
                    this.renderer.setProperty(answerDiv, 'style', 'float: left; width: 100%; ');
                    this.renderer.appendChild(this.chatDialog.nativeElement, answerDiv);
                    this.sendChatMsgButtonIcon = 'pi pi-send';
                    this.sendChatMsgButtonSeverity = null;
                }
                contents += content
                // const safeContents = this.sanitizer.bypassSecurityTrustHtml(contents);
                this.renderer.setProperty(answerDiv, 'innerHTML', contents);
                this.chatDialog.nativeElement.scrollTop = this.chatDialog.nativeElement.scrollHeight;
            }
            this.message.push(
                {
                    role: 'assistant',
                    content: answerDiv.innerHTML
                }
            )
        } else {
            this.layoutService.sendMessage({
                severity: 'error',
                summary: 'No user settings',
                detail: 'Please configure user settings from the upper right gear icon'
            })
            return;
        }

    }

    hidechatMsgDialog() {
        this.message = [
            {
                role: 'system',
                content: 'Answer the question based on the context below. ' +
                    'The response should be in HTML format. ' +
                    'The response should preserve any HTML formatting, links, and styles in the context.'
            },
        ]
        this.chatDialog = undefined;
    }
}

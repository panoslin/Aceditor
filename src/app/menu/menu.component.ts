import {Component, ElementRef, inject, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {LayoutService} from "../layout/service/app.layout.service";
import {AsyncPipe, NgClass, NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MenubarModule} from 'primeng/menubar';
import {MenuItem} from 'primeng/api';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {SplitButtonModule} from "primeng/splitbutton";
import {CheckboxModule} from "primeng/checkbox";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {Ripple} from "primeng/ripple";
import {AuthGoogleService, UserProfile} from "@src/app/layout/service/auth-google.service";
import {MenuModule} from "primeng/menu";
import {DataService} from "@src/app/layout/service/data.service";
import {AvatarModule} from "primeng/avatar";


@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    standalone: true,
    imports: [RouterLink, NgClass, MenubarModule, DialogModule, ButtonModule, InputTextModule, SplitButtonModule, CheckboxModule, DropdownModule, FormsModule, Ripple, AsyncPipe, NgIf, NgOptimizedImage, MenuModule, AvatarModule,],
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    private authService = inject(AuthGoogleService);
    user$ = this.authService.userProfile$;

    userProfile!: UserProfile;

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    @ViewChild('toolbar', {static: true}) toolbar!: ElementRef;

    settingDialogVisible: boolean = false;
    token: string = '';
    selectedModel: { name: string, code: string } = {name: '📱 GPT-4o Mini', code: 'gpt-4o-mini'};
    selectedPrompt: string = '';
    prompts!: MenuItem[];
    protected authDialogVisible: boolean = false;
    protected AISidebarVisible: boolean = false;
    password?: string;
    items: MenuItem[] = [
        {
            label: 'New',
            items: [
                {
                    label: 'File',
                    icon: 'pi pi-file',
                    command: () => {
                        this.newFileDialogVisible = true;
                    }
                },
                {
                    label: 'Folder',
                    icon: 'pi pi-folder',
                    command: () => {
                        this.newFolderDialogVisible = true;
                    }
                }
            ],
        },
        {
            label: 'Manage',
            items: [
                {label: 'Custom Prompts (TODO)', icon: 'pi pi-face-smile'},
            ]
        }

    ];

    newFileDialogVisible: boolean = false;
    newFolderDialogVisible: boolean = false;
    newFileName: string = '';
    newFolderName: string = '';


    constructor(
        public layoutService: LayoutService,
        private dataService: DataService,
    ) {
        const userSettings = localStorage.getItem('userSettings');
        if (userSettings !== null) {
            const settings = JSON.parse(userSettings);
            this.token = settings.token || this.token;
            this.selectedModel = settings.model || this.selectedModel;
        }
        this.prompts = this.layoutService.toolbarItems;
        this.authService.getProfile();
    }

    toggleSettingDialog() {
        this.settingDialogVisible = !this.settingDialogVisible;
        this.hideAuthDialog();
    }

    hideSettingDialog() {
        this.settingDialogVisible = false;
        // save userSettings to local storage
        localStorage.setItem('userSettings', JSON.stringify({
            token: this.token,
            model: this.selectedModel
        }));

    }

    ngOnInit(): void {
        this.layoutService.authDialogDisplay$.subscribe(() => {
            this.toggleAuthDialog();
        })
        this.user$.subscribe(user => {
            if (user) {
                this.userProfile = {
                    name: user.name || '',
                    email: user.email || '',
                    imageUrl: user.imageUrl || ''
                };
            }
        })
        this.layoutService.setToolbarElementRef(this.toolbar);
        // this.authService.getProfile();
    }

    toggleAuthDialog() {
        this.authDialogVisible = !this.authDialogVisible;
        this.hideSettingDialog()
    }

    toggleAISidebar() {
        this.AISidebarVisible = !this.AISidebarVisible;
    }

    login() {
        this.authService.login();
        this.hideAuthDialog();
    }

    logout() {
        this.authService.logout();
        this.hideAuthDialog();
        // refresh the page
        window.location.reload();
    }

    protected hideAuthDialog() {
        this.authDialogVisible = false;
    }

    createNewFile() {
        if (!this.newFileName) {
            this.layoutService.sendMessage({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter a file name'
            })
        } else {
            this.dataService.createFile(this.newFileName, this.authService.getIdToken()).subscribe({
                next: (result) => {
                    this.layoutService.sendMessage({
                        severity: 'success',
                        summary: 'Success',
                        detail: `File  "${result.name}" created successfully`
                    })
                    this.layoutService.insertSidebarDirectoryItems({
                        label: this.newFileName,
                        icon: 'pi pi-file',
                        name: result.name,
                        id: result.id,
                        content: result.content,
                        command: () => {
                            this.layoutService.updateEditorContent({
                                content: result.content,
                                id: result.id,
                                name: result.name,
                                parent: null
                            });
                        }
                    })
                    this.newFileName = '';
                },
                error: (err) => {
                    this.layoutService.sendMessage({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error on API requests: \n' + err.message
                    })
                }
            });

        }
        this.newFileDialogVisible = false
    }

    createNewFolder() {
        if (!this.newFolderName) {
            this.layoutService.sendMessage({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter a folder name'
            })
        } else {
            this.dataService.createFolder(this.newFolderName, this.authService.getIdToken()).subscribe({
                next: (result) => {
                    this.layoutService.sendMessage({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Folder "${result.name}" created successfully`
                    })
                    this.layoutService.insertSidebarDirectoryItems({
                        label: this.newFolderName,
                        icon: 'pi pi-folder-open',
                        name: result.name,
                        id: result.id,
                    })
                    this.newFolderName = '';
                },
                error: (err) => {
                    this.layoutService.sendMessage({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error on API requests: \n' + err.message
                    })
                }
            });

        }
        this.newFolderDialogVisible = false
    }
}

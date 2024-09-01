import {NgFor, NgIf} from '@angular/common';
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {MenuItem} from 'primeng/api';
import {PanelMenuModule} from 'primeng/panelmenu';

import {LayoutService} from '../layout/service/app.layout.service';
import {BadgeModule} from "primeng/badge";
import {Ripple} from "primeng/ripple";
import {SidebarItem} from "@src/app/sidebar/sidebar.item";
import {HttpClient} from "@angular/common/http";
import {forkJoin, Observable, switchMap} from "rxjs";
import {environment} from "@src/environments/environment";
import {AuthGoogleService, UserProfile} from "@src/app/layout/service/auth-google.service";
import {ContextMenu, ContextMenuModule} from "primeng/contextmenu";
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DataService} from "@src/app/layout/service/data.service";

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}

interface File {
    id: number;
    name: string;
    content: string;
    user: User;
    createdAt: string;
    updatedAt: string;
}

interface Folder {
    id: number;
    name: string;
    user: User;
    files: File[];
    subfolders: Folder[];
    createdAt: string;
    updatedAt: string;
}


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    standalone: true,
    imports: [NgFor, NgIf, PanelMenuModule, BadgeModule, Ripple, SidebarItem, ContextMenuModule, Button, DialogModule, InputTextModule, ReactiveFormsModule, FormsModule]
})
export class SidebarComponent implements OnInit, AfterViewInit {
    apiEndpoint = environment.apiEndpoint;
    @ViewChild('cm') cm!: ContextMenu;

    model: any[] = [];
    items: MenuItem[] = [
        {
            label: 'New File',
            icon: 'pi pi-file',
            command: () => {
                this.newFileDialogVisible = true;
            }
        },
        {
            label: 'New Folder',
            icon: 'pi pi-folder',
            command: () => {
                this.newFolderDialogVisible = true;
            }
        }
    ];
    newFileDialogVisible: boolean = false;
    newFileName: string = '';
    newFolderDialogVisible: boolean = false;
    newFolderName: string = '';

    constructor(
        public layoutService: LayoutService,
        public authService: AuthGoogleService,
        public el: ElementRef,
        private http: HttpClient,
        private dataService: DataService,
    ) {
    }

    fetchData(endpoint: string): Observable<any> {
        return this.http.get<any>(
            `${this.apiEndpoint}/api/${endpoint}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.getIdToken()}`
                }
            }
        );
    }

    fetchRoot(profile: UserProfile) {
        // register user if not exists
        return this.dataService.register(profile.name, profile.email, this.authService.getIdToken()).pipe(
            switchMap(responseA => {
                return forkJoin({
                    files: this.fetchData('files/root'),
                    folders: this.fetchData('folders/root'),
                });
            })
        );
    }


    insertNewItemtoModel(model: any, item: MenuItem): boolean {
        // DFS model and update items
        // insert item to the MenuItem from model with id === itesm.parentId
        // edge case:
        if (model.length === 0) {
            model.push(item);
            return true;
        }

        if (model.id === item['parentId']) {
            if (!model['items']) {
                model['items'] = [];
            }
            model['items'].push(item);
            return true;
        }
        for (let i = 0; model.items && model.items.length && i < model.items.length; i++) {
            if (this.insertNewItemtoModel(model.items[i], item)) {
                return true;
            }
        }
        return false;
    }

    ngOnInit() {
        this.layoutService.sideBarContextMenu = this.cm;
        this.layoutService.sidebarDirectoryItems$.subscribe((items) => {
            // not empty {}
            if (items && Object.keys(items).length === 0 && items.constructor === Object) {
                return;
            }
            this.insertNewItemtoModel(this.model[0], items);
        })
        this.authService.userProfile$.subscribe((profile) => {
            if (profile) {
                this.fetchRoot(profile).subscribe({
                    next: (results) => {
                        if (!results) {
                            return;
                        }
                        const directory = this.processData(results);
                        this.model = [
                            {
                                label: 'Home',
                                icon: 'pi pi-fw pi-home',
                                id: null,
                                items: directory
                            }
                        ]
                    },
                    error: (err) => {
                        // if 401 in error message, then logout
                        if (err.status === 401) {
                            this.authService.logout();
                            this.layoutService.sendMessage({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Authentication expired, please login again'
                            })
                            this.layoutService.toggleAuthDialog();
                        } else {
                            this.layoutService.sendMessage({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error on API requests: \n' + err.message
                            })
                        }
                        this.layoutService.updatePageStatus(false);
                    },
                    complete: () => {
                        this.layoutService.updatePageStatus(false);
                    }
                });
            } else {
                this.model = [{
                    label: 'Home',
                    icon: 'pi pi-fw pi-home',
                    items: [{
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        command: () => {
                            this.layoutService.toggleAuthDialog();
                        }
                    }]
                }];
                this.layoutService.updatePageStatus(false);
            }
        })
    }

    ngAfterViewInit() {
        this.layoutService.sideBarContextMenu = this.cm;
    }

    processData(results: { files: File[]; folders: Folder[]; }, parent: number | null = null): any {
        const {files, folders} = results;

        let directory: {
            label: string;
            icon: string;
            items?: any;
            name: string;
            id: number;
            content?: string,
            parentId?: number | null,
            command?: () => void
        }[] = [];

        folders.forEach((folder: Folder) => {
            directory.push({
                label: folder.name,
                icon: 'pi pi-fw pi-folder',
                name: folder.name,
                id: folder.id,
                parentId: parent,
                items: this.processData(
                    {
                        files: folder.files,
                        folders: folder.subfolders
                    },
                    folder.id
                )
            })
        });

        files.forEach((file: File) => {
            directory.push({
                label: file.name,
                icon: 'pi pi-fw pi-file',
                name: file.name,
                id: file.id,
                parentId: parent,
                content: file.content,
                command: () => {
                    this.layoutService.updateEditorContent({
                        content: file.content,
                        id: file.id,
                        name: file.name,
                        parent: parent
                    });
                }
            })
        });

        return directory;
    }

    onContextMenu($event: MouseEvent, item: MenuItem) {
        this.layoutService.sideBarContextMenuSelectedItem = item;
        this.cm.target = $event.currentTarget as HTMLElement;
        this.cm.show($event);
    }

    onHide() {
        // this.layoutService.sideBarContextMenuSelectedItem = undefined;
    }

    createNewFile() {
        if (!this.newFileName) {
            this.layoutService.sendMessage({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter a file name'
            })
        } else {
            const item = this.layoutService.sideBarContextMenuSelectedItem;
            const FolderId = item?.['icon'] === 'pi pi-fw pi-folder' ? item?.['id'] : item?.['parentId'];
            this.dataService.createFile(this.newFileName, this.authService.getIdToken(), FolderId).subscribe({
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
                        parentId: FolderId,
                        command: () => {
                            this.layoutService.updateEditorContent({
                                content: result.content,
                                id: result.id,
                                name: result.name,
                                parent: FolderId
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
            const item = this.layoutService.sideBarContextMenuSelectedItem;
            const FolderId = item?.['icon'] === 'pi pi-fw pi-folder' ? item?.['id'] : item?.['parentId'];
            this.dataService.createFolder(this.newFolderName, this.authService.getIdToken(), FolderId).subscribe({
                next: (result) => {
                    this.layoutService.sendMessage({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Folder "${result.name}" created successfully`
                    })
                    this.layoutService.insertSidebarDirectoryItems({
                        label: this.newFolderName,
                        icon: 'pi pi-fw pi-folder',
                        name: result.name,
                        id: result.id,
                        parentId: FolderId,
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

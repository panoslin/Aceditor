import {NgFor, NgIf} from '@angular/common';
import {Component, ElementRef, OnInit} from '@angular/core';

import {MenuItem} from 'primeng/api';
import {PanelMenuModule} from 'primeng/panelmenu';

import {LayoutService} from '../layout/service/app.layout.service';
import {BadgeModule} from "primeng/badge";
import {Ripple} from "primeng/ripple";
import {SidebarItem} from "@src/app/sidebar/sidebar.item";
import {HttpClient} from "@angular/common/http";
import {forkJoin, Observable} from "rxjs";
import {environment} from "@src/environments/environment";
import {AuthGoogleService} from "@src/app/layout/service/auth-google.service";

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
    imports: [NgFor, NgIf, PanelMenuModule, BadgeModule, Ripple, SidebarItem]
})
export class SidebarComponent implements OnInit {
    apiEndpoint = environment.apiEndpoint;

    model: MenuItem[] = [];

    constructor(
        public layoutService: LayoutService,
        public authService: AuthGoogleService,
        public el: ElementRef,
        private http: HttpClient
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

    fetchRoot(): Observable<any> {
        return forkJoin({
            files: this.fetchData('files/root'),
            folders: this.fetchData('folders/root'),
        });
    }

    ngOnInit() {
        this.authService.userProfile$.subscribe((profile) => {
            if (profile) {
                this.fetchRoot().subscribe({
                    next: (results) => {
                        const directory = this.processData(results);
                        this.model = [
                            {
                                label: 'Home',
                                icon: 'pi pi-fw pi-home',
                                items: directory
                            }
                        ]
                    },
                    error: (err) => {
                        this.layoutService.sendMessage({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error on API requests: \n' + err.message
                        })
                        this.layoutService.updatePageStatus(false);
                    },
                    complete: () => {
                        this.layoutService.updatePageStatus(false);
                    }
                });
            }
        })
    }


    processData(results: { files: File[]; folders: Folder[]; }): any {
        const {files, folders} = results;

        let directory: { label: string; icon: string; items?: any; }[] = [];

        folders.forEach((folder: Folder) => {
            directory.push({
                label: folder.name,
                icon: 'pi pi-fw pi-folder',
                items: this.processData({
                    files: folder.files,
                    folders: folder.subfolders
                })
            })
        });

        files.forEach((file: File) => {
            directory.push({
                label: file.name,
                icon: 'pi pi-fw pi-file',
            })
        });

        return directory;
    }
}

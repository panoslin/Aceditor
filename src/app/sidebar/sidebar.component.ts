import {NgFor, NgIf} from '@angular/common';
import {Component, ElementRef, OnInit} from '@angular/core';

import {MenuItem} from 'primeng/api';
import {PanelMenuModule} from 'primeng/panelmenu';

import {LayoutService} from '../layout/service/app.layout.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    standalone: true,
    imports: [NgFor, NgIf, PanelMenuModule]
})
export class SidebarComponent implements OnInit {

    model: MenuItem[] = [];

    constructor(public layoutService: LayoutService, public el: ElementRef) {
    }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                expanded: true,
                items: [
                    {label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/']}
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-map',
                expanded: true,
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Logout',
                                icon: 'pi pi-sign-out',
                                routerLink: ['/auth/error']
                            },
                        ]
                    },
                ]
            },
        ];
    }
}

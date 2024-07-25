import {NgFor, NgIf} from '@angular/common';
import {Component, ElementRef, OnInit} from '@angular/core';

import {MenuItem} from 'primeng/api';
import {PanelMenuModule} from 'primeng/panelmenu';

import {LayoutService} from '../layout/service/app.layout.service';
import {BadgeModule} from "primeng/badge";
import {Ripple} from "primeng/ripple";
import {SidebarItem} from "@src/app/sidebar/sidebar.item";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    standalone: true,
    imports: [NgFor, NgIf, PanelMenuModule, BadgeModule, Ripple, SidebarItem]
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
                badge: '2',
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        badge: '2',
                        items: [
                            {
                                label: 'Login',
                                shortcut: '⌘+S',
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

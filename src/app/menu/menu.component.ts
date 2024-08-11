import {Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {LayoutService} from "../layout/service/app.layout.service";
import {NgClass} from '@angular/common';
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
import {PasswordModule} from "primeng/password";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    standalone: true,
    imports: [RouterLink, NgClass, MenubarModule, DialogModule, ButtonModule, InputTextModule, SplitButtonModule, CheckboxModule, DropdownModule, FormsModule, Ripple, PasswordModule,],
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

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

    constructor(public layoutService: LayoutService) {
        const userSettings = localStorage.getItem('userSettings');
        if (userSettings !== null) {
            const settings = JSON.parse(userSettings);
            this.token = settings.token || this.token;
            this.selectedModel = settings.model || this.selectedModel;
        }
        this.prompts = this.layoutService.toolbarItems;
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
        this.layoutService.setToolbarElementRef(this.toolbar);
    }

    toggleAuthDialog() {
        this.authDialogVisible = !this.authDialogVisible;
        this.hideSettingDialog()
    }

    toggleAISidebar() {
        this.AISidebarVisible = !this.AISidebarVisible;
    }

    protected hideAuthDialog() {
        this.authDialogVisible = false;
    }
}

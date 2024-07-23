import {Component, ElementRef, ViewChild} from '@angular/core';
import {LayoutService} from "../layout/service/app.layout.service";
import {NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MenubarModule} from 'primeng/menubar';
import {MenuItem} from 'primeng/api';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  standalone: true,
  imports: [RouterLink, NgClass, MenubarModule, DialogModule, ButtonModule, InputTextModule, DropdownModule, FormsModule]
})
export class MenuComponent {
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  @ViewChild('toolbar', {static: true}) toolbar!: ElementRef;

  settingDialogVisible: boolean = false;
  token: string = '';
  selectedModel: { name: string, code: string } = {
    name: 'GPT-3.5 Turbo',
    code: 'gpt-3.5-turbo'
  };

  showSettingDialog() {
    this.settingDialogVisible = true;
  }

  hideSettingDialog() {
    this.settingDialogVisible = false;
    // save userSettings to local storage
    localStorage.setItem('userSettings', JSON.stringify({
      token: this.token,
      model: this.selectedModel
    }));

  }

  constructor(public layoutService: LayoutService) {
    const userSettings = localStorage.getItem('userSettings');
    if (userSettings !== null) {
      const settings = JSON.parse(userSettings);
      this.token = settings.token || this.token;
      this.selectedModel = settings.model || this.selectedModel;
    }

    this.items = [
      {
        label: 'File',
        icon: 'pi pi-file',
        items: [
          {
            label: 'New',
            icon: 'pi pi-file-plus'
          },
          {
            label: 'Open',
            icon: 'pi pi-folder-open'
          },
          {
            label: 'Save',
            icon: 'pi pi-save'
          },
        ]
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        items: [
          {
            label: 'Copy',
            icon: 'pi pi-copy'
          },
          {
            label: 'Cut',
            icon: 'pi pi-clone'
          },
          {
            label: 'Paste',
            icon: 'pi pi-clipboard'
          },
        ]
      },
    ];
  }

  ngOnInit(): void {
    this.layoutService.setToolbarElementRef(this.toolbar);
  }
}

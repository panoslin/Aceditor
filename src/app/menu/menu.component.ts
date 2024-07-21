import {Component, ElementRef, ViewChild} from '@angular/core';
import {LayoutService} from "../layout/service/app.layout.service";
import {NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MenubarModule} from 'primeng/menubar';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  standalone: true,
  imports: [RouterLink, NgClass, MenubarModule]
})
export class MenuComponent {
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  @ViewChild('toolbar', {static: true}) toolbar!: ElementRef;

  constructor(public layoutService: LayoutService) {
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

import {Component} from '@angular/core';
import {NgIf} from "@angular/common";
import {ProgressBarModule} from 'primeng/progressbar';

import {LayoutService} from "../layout/service/app.layout.service";

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    standalone: true,
    imports: [NgIf, ProgressBarModule],
})
export class StatusComponent {
    loading: boolean = true;

    constructor(public layoutService: LayoutService) {
        this.layoutService.pageStatusObservable.subscribe(status => {
            this.loading = status;
        });
    }

}

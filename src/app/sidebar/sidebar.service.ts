import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {SidebarChangeevent} from './sidebar.changeevent';

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    private menuSource = new Subject<SidebarChangeevent>();
    menuSource$ = this.menuSource.asObservable();
    private resetSource = new Subject();
    resetSource$ = this.resetSource.asObservable();

    onMenuStateChange(event: SidebarChangeevent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}

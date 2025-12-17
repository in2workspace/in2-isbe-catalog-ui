import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuTab } from 'src/app/shared/private-area-menu/private-area-menu.component';

export type MenuScope = 'profile' | 'offerings' | 'admin';

@Injectable({ providedIn: 'root' })
export class MenuStateService {
  private subjects: Record<MenuScope, BehaviorSubject<MenuTab | null>> = {
    profile: new BehaviorSubject<MenuTab | null>(null),
    offerings: new BehaviorSubject<MenuTab | null>(null),
    admin: new BehaviorSubject<MenuTab | null>(null),
  };

  tab$(scope: MenuScope) {
    return this.subjects[scope].asObservable();
  }

  setActiveTab(scope: MenuScope, tab: MenuTab | null) {
    this.subjects[scope].next(tab);
  }

  getActiveTab(scope: MenuScope): MenuTab | null {
    return this.subjects[scope].getValue();
  }

}

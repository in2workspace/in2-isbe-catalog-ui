import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

export type MenuTab =
  | 'account' | 'org' | 'billing' | 'orders' | 'revenue' | 'general'
  | 'offers' | 'productspec' | 'categories';

type Item = { id: MenuTab; labelKey: string; link?: string | any[]; exact?: boolean };

@Component({
  selector: 'private-area-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './private-area-menu.component.html',
  styleUrls: ['./private-area-menu.component.css']
})
export class PrivateAreaMenuComponent {
  @Input() loggedAsUser = true;

  @Input() active: MenuTab;
  
  profileItems: Item[] = this.loggedAsUser ? 
    [
      { id: 'account', labelKey: 'PROFILE._general' },
      { id: 'org',     labelKey: 'PROFILE._organization' },
    ]:[
      { id: 'account', labelKey: 'PROFILE._general' },
    ];

  servicesItems: Item[] = [
    { id: 'offers',      labelKey: 'OFFERINGS._offers' },
    { id: 'productspec', labelKey: 'OFFERINGS._prod_spec' },
  ];
  
  adminItems: Item[] = [
    { id: 'categories', labelKey: 'ADMIN._categories' },
  ];

  @Output() select = new EventEmitter<MenuTab>();
  onSelect(tab: MenuTab) { this.select.emit(tab); }

  private readonly router = inject(Router);
  
  isGroupActive(group: 'profile' | 'services' | 'admin'): boolean {
    const check = (arr: Item[]) => arr.some(i => i.id === this.active);
    
    if (group === 'profile') return check(this.profileItems);
    if (group === 'services') return check(this.servicesItems);
    if (group === 'admin')    return check(this.adminItems);
    
    return false;
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}

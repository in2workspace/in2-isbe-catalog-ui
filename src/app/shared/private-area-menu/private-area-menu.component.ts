import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';

export type MenuTab =
  | 'account' | 'org' | 'billing' | 'orders' | 'revenue' | 'general'
  | 'offers' | 'productspec' | 'categories' | 'catalogs';

type Item = { id: MenuTab; labelKey: string; link?: string | any[]; exact?: boolean };
export type MenuVariant = 'sidebar' | 'header';
@Component({
  selector: 'private-area-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './private-area-menu.component.html',
  styleUrls: ['./private-area-menu.component.css']
})
export class PrivateAreaMenuComponent implements OnInit {
  
  @Input() variant: MenuVariant = 'sidebar';
  @Input() active: MenuTab | null = null;
  @Output() select = new EventEmitter<MenuTab>();
  private readonly auth = inject(AuthService);
  roles: string[] = [];
  isAdmin = false;
  loggedAsUser = true;

  ngOnInit(): void {
    this.auth.loginInfo$.pipe(take(1)).subscribe((li) => {
      if (!li) return;
      this.loggedAsUser = li.logged_as === li.userId;
      this.roles = (li.roles || []).map(r => r.name ?? r.id ?? r);
      this.isAdmin = this.roles.includes('admin');
    });
  }
  
  get profileItems(): Item[] {
    return !this.loggedAsUser
      ? [
          { id: 'account', labelKey: 'PROFILE._general' },
          { id: 'org',     labelKey: 'PROFILE._organization' },
        ]
      : [
          { id: 'account', labelKey: 'PROFILE._general' },
        ];
  }


  servicesItems: Item[] = [
    { id: 'offers',      labelKey: 'OFFERINGS._offers' },
    { id: 'productspec', labelKey: 'OFFERINGS._prod_spec' },
  ];
  
  adminItems: Item[] = [
    { id: 'categories', labelKey: 'ADMIN._categories' },
  ];

  onSelect(tab: MenuTab) {
    this.select.emit(tab);
  }
  
  isGroupActive(group: 'profile' | 'services' | 'admin'): boolean {
    const check = (arr: Item[]) => arr.some(i => i.id === this.active);
    
    if (group === 'profile') return check(this.profileItems);
    if (group === 'services') return check(this.servicesItems);
    if (group === 'admin')    return check(this.adminItems);
    
    return false;
  }

}

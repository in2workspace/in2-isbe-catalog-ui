import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { EventMessageService } from '../../services/event-message.service';
import { OperatorRevenueSharingComponent } from './operator-revenue-sharing/operator-revenue-sharing.component';
import { VerificationComponent } from './verification/verification.component';
import { UpdateCategoryComponent } from './categories/update-category/update-category.component';
import { CreateCategoryComponent } from './categories/create-category/create-category.component';
import { CategoriesComponent } from './categories/categories.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PrivateAreaMenuComponent, MenuTab } from 'src/app/shared/private-area-menu/private-area-menu.component';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  standalone: true,
  imports: [
    OperatorRevenueSharingComponent,
    VerificationComponent,
    UpdateCategoryComponent,
    CreateCategoryComponent,
    CategoriesComponent,
    TranslateModule,
    NgClass,
    PrivateAreaMenuComponent
  ]
})
export class AdminComponent implements OnInit{
  show_categories = true;
  show_create_categories = false;
  show_update_categories = false;
  show_verification = false;
  show_revenue = false;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  loggedAsUser = true; 
  activeTab: MenuTab = 'categories';

  category_to_update: any;

  constructor(
    private readonly auth: AuthService,
    private cdr: ChangeDetectorRef,
    private eventMessage: EventMessageService,
    private router: Router
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if (ev.type === 'AdminCategories' && ev.value === true) {
        this.goToCategories();
      }
      if (ev.type === 'CreateCategory' && ev.value === true) {
        this.goToCreateCategories();
      }
      if (ev.type === 'UpdateCategory') {
        this.category_to_update = ev.value;
        this.goToUpdateCategories();
      }
    });
  }

  ngOnInit() {
    this.auth.loginInfo$.pipe(take(1)).subscribe((li) => {
      if (!li) return;
      this.loggedAsUser = li.logged_as === li.id;
      const tabFromService = this.eventMessage.currentMenuTab;
      if (tabFromService) {
        this.activeTab = tabFromService;
      } else {
        this.activeTab = 'categories';
      }
    });
  }

  onMenuSelect(tab: MenuTab) {
    this.activeTab = tab;
    this.eventMessage.setMenuTab(tab);
    switch (tab) {
      case 'categories':
        this.goToCategories();
        break;
      case 'offers':
      case 'productspec':
        this.router.navigate(['/my-offerings']);
        break;
      case 'general':
      case 'account':
      case 'org':
        this.router.navigate(['/profile']);
        break;
      default:
        break;
    }
  }

  goToCategories() {
    this.show_categories = true;
    this.show_create_categories = false;
    this.show_update_categories = false;
    this.show_verification = false;
    this.show_revenue = false;
    this.cdr.detectChanges();
  }

  goToCreateCategories() {
    this.show_categories = false;
    this.show_create_categories = true;
    this.show_update_categories = false;
    this.show_verification = false;
    this.show_revenue = false;
    this.cdr.detectChanges();
  }

  goToUpdateCategories() {
    this.show_categories = false;
    this.show_create_categories = false;
    this.show_update_categories = true;
    this.show_verification = false;
    this.show_revenue = false;
    this.cdr.detectChanges();
  }

  goToVerification() {
    this.show_categories = false;
    this.show_create_categories = false;
    this.show_update_categories = false;
    this.show_verification = true;
    this.show_revenue = false;
    this.cdr.detectChanges();
  }

  goToRevenue() {
    this.show_categories = false;
    this.show_create_categories = false;
    this.show_update_categories = false;
    this.show_verification = false;
    this.show_revenue = true;
    this.cdr.detectChanges();
  }
}

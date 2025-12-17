import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { MenuStateService } from 'src/app/services/menu-state.service';

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
export class AdminComponent implements OnInit, OnDestroy {
  show_categories = true;
  show_create_categories = false;
  show_update_categories = false;
  show_verification = false;
  show_revenue = false;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  activeTab: MenuTab | null = null;

  category_to_update: any;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router,
    private readonly menuStateService: MenuStateService
  ) {
    this.eventMessage.messages$.pipe(takeUntil(this.destroy$)).subscribe(ev => {
      if (ev.type === 'AdminCategories' && ev.value === true) this.goToCategories();
      if (ev.type === 'CreateCategory' && ev.value === true) this.goToCreateCategories();
      if (ev.type === 'UpdateCategory') {
        this.category_to_update = ev.value;
        this.goToUpdateCategories();
      }
    });
  }

  ngOnInit() {
    this.menuStateService.tab$('admin')
      .pipe(takeUntil(this.destroy$))
      .subscribe(tab => {
        if (!tab) return;
        if (tab === 'categories') {
          this.activeTab = tab;
          this.goToCategories();
          this.cdr.detectChanges();
        }
      });

    const initial = this.menuStateService.getActiveTab('admin') ?? 'categories';
    this.menuStateService.setActiveTab('admin', initial);
    this.activeTab = initial;
    this.goToCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuSelect(tab: MenuTab) {
    if (tab === 'categories') {
      this.menuStateService.setActiveTab('admin', 'categories');
    }

    if (tab === 'offers' || tab === 'productspec' || tab === 'catalogs') {
      const effective = (this.IS_ISBE && tab === 'catalogs') ? 'productspec' : tab;
      this.menuStateService.setActiveTab('offerings', effective);
      this.router.navigate(['/my-offerings']);
      return;
    }

    if (tab === 'general' || tab === 'account' || tab === 'org' || tab === 'billing' || tab === 'orders' || tab === 'revenue') {
      const effective = tab === 'general' ? 'account' : tab;
      this.menuStateService.setActiveTab('profile', effective);
      this.router.navigate(['/profile']);
      return;
    }
  }

  goToCategories() {
    this.show_categories = true;
    this.show_create_categories = false;
    this.show_update_categories = false;
    this.show_verification = false;
    this.show_revenue = false;
  }

  goToCreateCategories() {
    this.show_categories = false;
    this.show_create_categories = true;
    this.show_update_categories = false;
    this.show_verification = false;
    this.show_revenue = false;
  }

  goToUpdateCategories() {
    this.show_categories = false;
    this.show_create_categories = false;
    this.show_update_categories = true;
    this.show_verification = false;
    this.show_revenue = false;
  }

  goToVerification() {
    this.show_categories = false;
    this.show_create_categories = false;
    this.show_update_categories = false;
    this.show_verification = true;
    this.show_revenue = false;
  }

  goToRevenue() {
    this.show_categories = false;
    this.show_create_categories = false;
    this.show_update_categories = false;
    this.show_verification = false;
    this.show_revenue = true;
  }
}

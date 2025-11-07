import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SearchComponent } from './pages/search/search.component';
import { SearchCatalogComponent } from './pages/search-catalog/search-catalog.component';
import { CatalogsComponent } from './pages/catalogs/catalogs.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { SellerOfferingsComponent } from './pages/seller-offerings/seller-offerings.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AboutDomeComponent } from './pages/about-dome/about-dome.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ContactUsFormComponent } from './pages/contact-us/contact-us-form.component';
import { OrganizationDetailsComponent } from './pages/organization-details/organization-details.component';
import { ProductInvDetailComponent } from './pages/product-inventory/inventory-items/product-inv-detail/product-inv-detail.component';
import { ProductInventoryComponent } from './pages/product-inventory/product-inventory.component';
import { ProductOrdersComponent } from './pages/product-orders/product-orders.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { UsageSpecsComponent } from './pages/usage-specs/usage-specs.component';

import { environment } from 'src/environments/environment';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'about', component: AboutDomeComponent ,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },
  { path: 'search', component: SearchComponent },
  { path: 'org-details/:id', component: OrganizationDetailsComponent },

  { path: 'search/catalogue/:id', component: SearchCatalogComponent ,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },
  { path: 'catalogues', 
    component: CatalogsComponent ,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },  
  {
    path: 'shopping-cart',
    component: ShoppingCartComponent,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },

  {
    path: 'product-inventory',
    component: ProductInventoryComponent,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },
  { path: 'product-inventory/:id', component: ProductInvDetailComponent,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE } },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['individual', 'orgAdmin'] }
  },
  {
    path: 'my-offerings',
    component: SellerOfferingsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['seller'] }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'certifier'] }
  },
  { path: 'contact-us', component: ContactUsFormComponent ,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },
  {
    path: 'product-orders',
    component: ProductOrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: [], is_isbe: environment.ISBE_CATALOGUE }
  },
  {
    path: 'usage-spec',
    component: UsageSpecsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['seller'], is_isbe: environment.ISBE_CATALOGUE }
  },
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

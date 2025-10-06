import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, HostListener, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { LoginInfo, billingAccountCart } from 'src/app/models/interfaces';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { AccountServiceService } from 'src/app/services/account-service.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import { InvoicesService } from 'src/app/services/invoices-service';
import { PaginationService } from 'src/app/services/pagination.service';
import { FastAverageColor } from 'fast-average-color';
import {components} from "src/app/models/product-catalog";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
type ProductOffering = components["schemas"]["ProductOffering"];
import { phoneNumbers, countries } from 'src/app/models/country.const'
import { initFlowbite } from 'flowbite';
import {EventMessageService} from "src/app/services/event-message.service";
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import {faIdCard, faSort, faSwatchbook, faEdit, faSave} from "@fortawesome/pro-solid-svg-icons";
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { combineLatest, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { OrgContextService } from 'src/app/services/org-context.service';

@Component({
  selector: 'app-invoices-info',
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule, CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './invoices-info.component.html',
  styleUrl: './invoices-info.component.css'
})
export class InvoicesInfoComponent implements OnInit {
  loading: boolean = false;
  invoices:any[]=[];
  nextInvoices:any[]=[];
  profile:any;
  seller:any='';
  showInvoiceDetails:boolean=false;
  invoiceToShow:any;
  dateRange = new FormControl();
  selectedDate:any;
  preferred:boolean=false;
  loading_more: boolean = false;
  page_check:boolean = true;
  page: number=0;
  INVOICE_LIMIT: number = environment.INVOICE_LIMIT;
  filters: any[]=[];
  check_custom:boolean=false;
  isSeller:boolean=false;
  role:any='Customer'
  name:any=''

  show_orders: boolean = true;
  show_billing: boolean = false;

  editingIndex: number | null = null;
  editableInvoiceName: string = '';

  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;
  protected readonly faEdit = faEdit;
  protected readonly faSave = faSave;

  constructor(
    private readonly auth: AuthService,
    private readonly orgCtx: OrgContextService,
    private readonly cdr: ChangeDetectorRef,
    private readonly invoicesService: InvoicesService,
    private readonly eventMessage: EventMessageService,
    private readonly paginationService: PaginationService,
    private readonly router: Router
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if(this.showInvoiceDetails==true){
      this.showInvoiceDetails=false;
      this.cdr.detectChanges();
    }
    initFlowbite();
  }

  ngOnInit() {
    this.loading=true;
    let today = new Date();
    today.setMonth(today.getMonth()-1);
    this.selectedDate = today.toISOString();
    this.dateRange.setValue('month');
    this.initPartyInfo();
  }

  initPartyInfo(): void {
    combineLatest([this.auth.loginInfo$, this.auth.sellerId$])
      .pipe(take(1))
      .subscribe(([li, sellerId]) => {
        if (!li) { initFlowbite(); return; }

        this.seller = sellerId || '';

        const currentOrgId = this.orgCtx.current ?? li.logged_as ?? null;
        let roles: string[] = (li.roles || []).map(r => r.name ?? r.id ?? r);
        if (currentOrgId && currentOrgId !== li.id) {
          const org = (li.organizations || []).find(o => o.id === currentOrgId);
          if (org?.roles?.length) roles = org.roles.map(r => r.name ?? r.id ?? r);
        }
        this.isSeller = roles.includes('seller');

        this.page = 0;
        this.invoices = [];
        this.getInvoices(false);

        initFlowbite();
      });
  }

  ngAfterViewInit(){
    initFlowbite();
  }

  getProductImage(prod:ProductOffering) {
    let profile = prod?.attachment?.filter(item => item.name === 'Profile Picture') ?? [];
    let images = prod.attachment?.filter(item => item.attachmentType === 'Picture') ?? [];
    if(profile.length!=0){
      images = profile;
    }
    return images.length > 0 ? images?.at(0)?.url : 'https://placehold.co/600x400/svg';
  }

  async getInvoices(next:boolean){
    if(next==false){
      this.loading=true;
    }

    let options = {
      "filters": this.filters,
      "seller": "did:elsi:"+this.seller,
      "selectedDate": this.selectedDate,
      "invoices": this.invoices,
      "role": this.role,
      "name": this.name
    }

    this.paginationService.getItemsPaginated(this.page, this.INVOICE_LIMIT, next, this.invoices, this.nextInvoices, options,
      this.paginationService.getInvoices.bind(this.paginationService)).then(data => {
      this.page_check = data.page_check;
      this.invoices = data.items;
      this.name = data.name;
      this.nextInvoices = data.nextItems;
      this.page = data.page;
      this.loading = false;
      this.loading_more = false;
    })
  }

  async next(){
    console.log("-invoice-info-NEXT--")
    await this.getInvoices(true);
  }

  onStateFilterChange(filter:string){
    const index = this.filters.findIndex(item => item === filter);
    if (index !== -1) {
      this.filters.splice(index, 1);
    } else {
      this.filters.push(filter)
    }
    this.getInvoices(false);
  }

  isFilterSelected(filter:any){
    const index = this.filters.findIndex(item => item === filter);
    if (index !== -1) {
      return true
    } else {
      return false;
    }
  }

  filterOrdersByDate(){
    if(this.dateRange.value == 'month'){
      let today = new Date();
      today.setDate(1);
      today.setMonth(today.getMonth()-1);
      this.selectedDate = today.toISOString();
    } else if (this.dateRange.value == 'months'){
      let today = new Date();
      today.setDate(1);
      today.setMonth(today.getMonth()-3);
      this.selectedDate = today.toISOString();
    } else if(this.dateRange.value == 'year'){
      let today = new Date();
      today.setDate(1);
      today.setMonth(0);
      today.setFullYear(today.getFullYear()-1);
      this.selectedDate = today.toISOString();
    } else {
      this.selectedDate = undefined
    }
    this.getInvoices(false);
  }

  getTotalPrice(items:any[]){
    let totalPrice = [];
    let insertCheck = false;
    this.check_custom=false;
    for(let i=0; i<items.length; i++){
      insertCheck = false;
      if(totalPrice.length == 0 && items[i].productOfferingPrice != undefined){
        if(items[i].productOfferingPrice.priceType != 'custom'){
          totalPrice.push(items[i].productOfferingPrice);
        } else {
          this.check_custom=true;
        }
      } else {
        for(let j=0; j<totalPrice.length; j++){
          if(items[i].productOfferingPrice != undefined){
            if(items[i].productOfferingPrice.priceType != 'custom'){
              if(items[i].productOfferingPrice.priceType == totalPrice[j].priceType && items[i].productOfferingPrice.unit == totalPrice[j].unit && items[i].productOfferingPrice.text == totalPrice[j].text){
                totalPrice[j].price=totalPrice[j].price+items[i].productOfferingPrice.price;
                insertCheck=true;
              }
            } else {
              this.check_custom=true;
            }
          }
        }
        if(insertCheck==false){
          if(items[i].productOfferingPrice != undefined){
            if(items[i].productOfferingPrice.priceType != 'custom'){
              totalPrice.push(items[i].productOfferingPrice);
              insertCheck=true;
            } else {
              this.check_custom=true;
            }
          }
        }
      }
    }
    return totalPrice
  }

  toggleShowDetails(invoice:any){
    this.showInvoiceDetails=true;
    this.invoiceToShow=invoice;
  }

  async onRoleChange(role: any) {
    this.role=role;
    await this.getInvoices(false);
  }

  goToProduct(prodId: any) {
    this.router.navigate(['/product-inventory/', prodId]);
  }

  editInvoice(index: number, invoice: any) {
    this.editingIndex = index;
    this.editableInvoiceName = invoice.name;
  }

  saveInvoice(index: number, invoice: any) {
    let oldName = invoice.name;
    invoice.name = this.editableInvoiceName;
    this.invoicesService.updateInvoice(invoice, invoice.id).subscribe({
      next: data => {
        console.log('actualizado invoice')
      },
      error: error => {
        invoice.name = oldName;
        console.error('There was an error while updating!', error);
      }
    });   
    this.editingIndex = null;
  }


}

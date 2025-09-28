import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceService } from 'src/app/services/product-service.service';
import {components} from "src/app/models/product-catalog";
import { initFlowbite } from 'flowbite';
import {faScaleBalanced, faArrowProgress, faArrowRightArrowLeft, faObjectExclude, faSwap, faGlobe, faBook, faShieldHalved, faAtom, faDownload} from "@fortawesome/pro-solid-svg-icons";
type Product = components["schemas"]["ProductOffering"];
type ProductSpecification = components["schemas"]["ProductSpecification"];
type AttachmentRefOrValue = components["schemas"]["AttachmentRefOrValue"];
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LoginInfo } from 'src/app/models/interfaces';
import { ProductInventoryServiceService } from 'src/app/services/product-inventory-service.service'
import * as moment from 'moment';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'app-product-inv-detail',
    templateUrl: './product-inv-detail.component.html',
    styleUrl: './product-inv-detail.component.css',
    standalone: true,
    imports: [TranslateModule, MarkdownComponent, ErrorMessageComponent]
})
export class ProductInvDetailComponent implements OnInit {
  

  id:any;
  productOff: Product | undefined;
  check_logged:boolean=false;
  images: AttachmentRefOrValue[]  = [];
  attatchments: AttachmentRefOrValue[]  = [];
  prod:any = {};
  prodSpec:ProductSpecification = {};
  checkCustom:boolean=false;
  pricePlan: any;

  protected readonly faScaleBalanced = faScaleBalanced;
  protected readonly faArrowProgress = faArrowProgress;
  protected readonly faArrowRightArrowLeft = faArrowRightArrowLeft;
  protected readonly faObjectExclude = faObjectExclude;
  protected readonly faSwap = faSwap;
  protected readonly faGlobe = faGlobe;
  protected readonly faBook = faBook;
  protected readonly faShieldHalved = faShieldHalved;
  protected readonly faAtom = faAtom;
  protected readonly faDownload = faDownload;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly api: ApiServiceService,
    private readonly auth: AuthService,
    private readonly inventoryServ: ProductInventoryServiceService,
    private readonly location: Location
  ) {
  }

  async ngOnInit() {
    initFlowbite();
    this.handleLoginState();

    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) return;

    try {
      this.prod = await this.inventoryServ.getProduct(this.id);
      this.checkCustom = this.prod?.productPrice?.some((price: any) => price.priceType === 'custom') ?? false;

      const offering = await this.api.getProductById(this.prod.productOffering.id);
      this.prodSpec = await this.api.getProductSpecification(offering.productSpecification.id);

      if (this.prod.productPrice.length > 0) {
        this.pricePlan = await this.loadPricePlan(this.prod.productPrice[0].productOfferingPrice.id);
      }

      this.productOff = {
        id: offering.id,
        name: offering.name,
        category: offering.category,
        description: offering.description,
        lastUpdate: offering.lastUpdate,
        attachment: this.prodSpec?.attachment ?? [],
        productOfferingPrice: this.prod.productPrice,
        productSpecification: offering.productSpecification,
        productOfferingTerm: offering.productOfferingTerm,
        serviceLevelAgreement: offering.serviceLevelAgreement,
        version: offering.version
      };

      this.organizeAttachments();
      this.completeCharacteristics();

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  }

  private completeCharacteristics() {
    this.prod.productCharacteristic = this.prod?.productCharacteristic?.map((spec: any) => {
      this.prodSpec?.productSpecCharacteristic?.forEach((char: any) => {
        if (spec.name === char.name && char.productSpecCharacteristicValue &&
            char.productSpecCharacteristicValue.length > 0 && char.productSpecCharacteristicValue[0].unitOfMeasure) {
          spec.unitOfMeasure = char.productSpecCharacteristicValue[0].unitOfMeasure;
        }
      });
      return spec;
    })
  }

  private handleLoginState(): void {
    this.auth.isAuthenticated$
      .pipe(take(1))
      .subscribe(isAuth => {
        this.check_logged = isAuth;
        this.cdr.detectChanges();
      });
  }

  private organizeAttachments() {
    const profile = this.productOff?.attachment?.filter((item: any) => item.name === 'Profile Picture') ?? [];

    if (profile.length === 0) {
      this.images = this.productOff?.attachment?.filter((item: any) => item.attachmentType === 'Picture') ?? [];
      this.attatchments = this.productOff?.attachment?.filter((item: any) => item.attachmentType !== 'Picture') ?? [];
    } else {
      this.images = profile;
      this.attatchments = this.productOff?.attachment?.filter((item: any) => item.name !== 'Profile Picture') ?? [];
    }
  }

  private async loadPricePlan(priceId: string) {
    const pricePlan = await this.api.getOfferingPrice(priceId);
    return pricePlan;
  }

  back(){
    this.location.back();
  }

  getProductImage() {
    return this.images.length > 0 ? this.images?.at(0)?.url : 'https://placehold.co/600x400/svg';
  }

}

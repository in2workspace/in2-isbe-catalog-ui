import { DatePipe, NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { certifications } from 'src/app/models/certification-standards.const';
import { components } from 'src/app/models/product-catalog';
import { faClose, faEllipsis} from "@fortawesome/pro-solid-svg-icons";
import { ApiServiceService } from 'src/app/services/product-service.service';
import { BadgeComponent } from 'src/app/shared/badge/badge.component';
import { AttachmentServiceService } from 'src/app/services/attachment-service.service';
type Product = components["schemas"]["ProductOffering"];
type ProductSpecification = components["schemas"]["ProductSpecification"];
type AttachmentRefOrValue = components["schemas"]["AttachmentRefOrValue"];

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.css',
    standalone: true,
    imports: [TranslateModule, MarkdownComponent, DatePipe, NgClass, FaIconComponent, BadgeComponent]
})
export class ProductDetailsComponent implements OnInit {
  @Input() productOff: Product | undefined;
  @Output() closeModal = new EventEmitter<void>();

  protected readonly faClose = faClose;
  protected readonly faEllipsis = faEllipsis;

  private readonly api = inject(ApiServiceService);
  private readonly attachmentService= inject(AttachmentServiceService);
 
  prodChars:any[]=[];
  prodSpec:ProductSpecification = {};
  checkCustom:boolean=false;
  images: AttachmentRefOrValue[]  = [];
  closeCats:boolean=false;
  loadMoreCats:boolean=false;
  checkMoreCats:boolean=false;
  categories: any[] | undefined  = [];
  categoriesMore: any[] | undefined  = [];
  category: string = 'none';

  async ngOnInit(): Promise<void> {
    this.initCategories();
    this.initImages();
    await this.loadProductSpecificationAndPrices();
    this.filterCharacteristics();
  }

  private initCategories(): void {
    const categories = this.productOff?.category ?? [];

    this.category = categories[0]?.name ?? 'none';

    if (categories.length > 5) {
      this.categories = categories.slice(0, 4);
      this.categoriesMore = categories.slice(4);
      this.checkMoreCats = true;
    } else {
      this.categories = categories;
      this.categoriesMore = [];
      this.checkMoreCats = false;
    }
  }

  private initImages(): void {
    const attachments = this.productOff?.attachment ?? [];
    const profile = attachments.filter(item => item.name === 'Profile Picture');

    this.images = profile.length > 0
      ? profile
      : attachments.filter(item => item.attachmentType === 'Picture');
  }

  private async loadProductSpecificationAndPrices(): Promise<void> {
    const specId = this.productOff?.productSpecification?.id;
    if (!specId) return;

    try {
      this.prodSpec = await this.api.getProductSpecification(specId);

      const prodPrices = this.productOff?.productOfferingPrice ?? [];
      if (prodPrices.length === 0) return;

      const prices = await Promise.all(
        prodPrices.map(p => this.api.getProductPrice(p.id))
      );

      this.checkCustom = prices.some(price => price.priceType === 'custom');
    } catch (error) {
      console.error('Error loading product specification or prices', error);
    }
  }

  private filterCharacteristics(): void {
    const characteristics = this.prodSpec?.productSpecCharacteristic;
    if (!characteristics) {
      this.prodChars = [];
      return;
    }

    this.prodChars = characteristics.filter((char: any) =>
      char.name !== 'Compliance:VC' && char.name !== 'Compliance:SelfAtt'
    );

    for (const cert of certifications) {
      const index = this.prodChars.findIndex(
        (item: any) => item.name === cert.name
      );
      if (index !== -1) {
        this.prodChars.splice(index, 1);
      }
    }
  }


  closeCategories(){
    this.closeCats=false;
    this.checkMoreCats=true;
    if(this.productOff?.category)
    this.categories = this.productOff?.category.slice(0, 4);
    this.loadMoreCats=!this.loadMoreCats;
  }

  loadMoreCategories(){
    this.loadMoreCats=!this.loadMoreCats;
    this.checkMoreCats=false;
    this.closeCats=true;
  }

  hideModal() {
    this.closeModal.emit();
    this.loadMoreCats=false;
    this.checkMoreCats=true;
  }

  getProductImage() {
    return this.attachmentService.getProductImage(this.images);
  }

}

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

  ngOnInit() {
    this.category = this.productOff?.category?.at(0)?.name ?? 'none';
    if(this.productOff?.category!=undefined&&this.productOff?.category.length>5){
      this.categories = this.productOff?.category.slice(0, 4);
      this.categoriesMore = this.productOff?.category.slice(4);
      this.checkMoreCats=true;
    } else {
      this.categories = this.productOff?.category;
      this.checkMoreCats=false;
    }
    let profile = this.productOff?.attachment?.filter(item => item.name === 'Profile Picture') ?? [];
    if(profile.length==0){
      this.images = this.productOff?.attachment?.filter(item => item.attachmentType === 'Picture') ?? [];
    } else {
      this.images = profile;
    }
    let specId = this.productOff?.productSpecification?.id;
    if(specId != undefined){
      this.api.getProductSpecification(specId).then(spec => {
        this.prodSpec = spec;
        let prodPrices: any[] | undefined= this.productOff?.productOfferingPrice;
        if(prodPrices!== undefined){
          for(const element of prodPrices){
            this.api.getProductPrice(element.id).then(price => {
              if(price.priceType == 'custom'){
                this.checkCustom=true;
              }
            })
          }
        }
      })
    }
    if(this.prodSpec.productSpecCharacteristic != undefined) {
      this.prodChars = this.prodSpec.productSpecCharacteristic.filter((char: any) => {
        return char.name != 'Compliance:VC' && char.name != 'Compliance:SelfAtt'
      })

      for(const element of certifications){
        const index = this.prodChars.findIndex(item => item.name === element.name);
        if(index!==-1){
          this.prodChars.splice(index, 1);
        }
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

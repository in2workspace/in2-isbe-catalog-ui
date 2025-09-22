import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import {faEye} from "@fortawesome/pro-regular-svg-icons";
import { Router } from '@angular/router';
import {components} from "../../models/product-catalog";
type Catalog = components["schemas"]["Catalog"];
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-catalogs',
    templateUrl: './catalogs.component.html',
    styleUrl: './catalogs.component.css',
    standalone: true,
    imports: [TranslateModule, MarkdownComponent, NgClass]
})
export class CatalogsComponent implements OnInit{
  catalogs:Catalog[]=[
    {
        "id": "urn:ngsi-ld:catalog:721d9e67-0a46-4126-a12e-8f91670ceaf7",
        "href": "urn:ngsi-ld:catalog:721d9e67-0a46-4126-a12e-8f91670ceaf7",
        "description": "",
        "lifecycleStatus": "Launched",
        "name": "OBS Catalogue",
        "category": [
            {
                "id": "urn:ngsi-ld:category:814efafb-b2be-4d7e-b83d-0d447d9f68ac",
                "href": "urn:ngsi-ld:category:814efafb-b2be-4d7e-b83d-0d447d9f68ac",
                "name": "OBS Catalogue"
            }
        ],
        "relatedParty": [
            {
                "id": "urn:ngsi-ld:organization:6c53e937-212b-4e8b-997c-4d8695f789d1",
                "role": "Owner",
                "@referredType": ""
            }
        ],
        "validFor": {
            "startDateTime": "2025-08-13T11:55:31.053Z"
        }
    },
    {
        "id": "urn:ngsi-ld:catalog:cd93ad8f-0052-4938-9843-cca9dc17156e",
        "href": "urn:ngsi-ld:catalog:cd93ad8f-0052-4938-9843-cca9dc17156e",
        "catalogType": "product",
        "description": "Dawex dev-test catalog in Sandbox",
        "lifecycleStatus": "Launched",
        "name": "Dawex",
        "version": "1.0",
        "category": [
            {
                "id": "urn:ngsi-ld:category:a14a4067-a5c9-4122-b2a7-28ee2dd85036",
                "href": "urn:ngsi-ld:category:a14a4067-a5c9-4122-b2a7-28ee2dd85036",
                "name": "Data product distribution and exchange"
            }
        ],
        "relatedParty": [
            {
                "id": "urn:ngsi-ld:organization:5ca475ec-52d3-4a0c-a1d5-0071ef09b59d",
                "href": "urn:ngsi-ld:organization:5ca475ec-52d3-4a0c-a1d5-0071ef09b59d",
                "name": "did:elsi:NTRFR-810307207",
                "role": "Owner",
                "@referredType": "Organization"
            }
        ],
        "validFor": {
            "startDateTime": "2025-06-26T00:00:00Z"
        }
    },
    {
        "id": "urn:ngsi-ld:catalog:5b15d259-b2af-4b96-a281-d549f8c82fcb",
        "href": "urn:ngsi-ld:catalog:5b15d259-b2af-4b96-a281-d549f8c82fcb",
        "description": "",
        "lifecycleStatus": "Launched",
        "name": "testy catalg",
        "category": [
            {
                "id": "urn:ngsi-ld:category:39a55d2f-6014-4cab-8f40-cc564e2e253b",
                "href": "urn:ngsi-ld:category:39a55d2f-6014-4cab-8f40-cc564e2e253b",
                "name": "testy catalg"
            }
        ],
        "relatedParty": [
            {
                "id": "urn:ngsi-ld:organization:2bcbe859-e316-42f2-919c-f470cff9e235",
                "role": "Owner",
                "@referredType": ""
            }
        ],
        "validFor": {
            "startDateTime": "2025-09-19T11:14:26.115Z"
        }
    }
];
  nextCatalogs:Catalog[]=[];
  page:number=0;
  CATALOG_LIMIT: number = environment.CATALOG_LIMIT;
  loading: boolean = false;
  loading_more: boolean = false;
  page_check:boolean = true;
  filter:any=undefined;
  searchField = new FormControl();
  protected readonly faEye = faEye;
  showDesc:boolean=false;
  showingCat:any;
  
  constructor(
    private router: Router,
    private api: ApiServiceService,
    private cdr: ChangeDetectorRef,
    private paginationService: PaginationService
  ) {
  }

  @HostListener('document:click')
  onClick() {
    if(this.showDesc==true){
      this.showDesc=false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    //this.loading=true;
    //this.getCatalogs(false);
    let input = document.querySelector('[type=search]')
    if(input!=undefined){
      input.addEventListener('input', e => {
        // Easy way to get the value of the element who trigger the current `e` event
        console.log(`Input updated`)
        if(this.searchField.value==''){
          this.filter=undefined;
          //this.getCatalogs(false);
        }
      });
    }

  }

  async getCatalogs(next:boolean){
    if(next==false){
      this.loading=true;
    }    

    let options = {
      "keywords": this.filter
    }
    this.paginationService.getItemsPaginated(this.page,this.CATALOG_LIMIT,next,this.catalogs,this.nextCatalogs, options,
      this.api.getCatalogs.bind(this.api)).then(data => {
      this.page_check=data.page_check;      
      this.catalogs=data.items.filter((catalog:Catalog) => (catalog.id !== environment.DFT_CATALOG_ID)
      );
      this.nextCatalogs=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }

  filterCatalogs(){
    this.filter=this.searchField.value;
    this.page=0;
    this.getCatalogs(false);
  }

  goToCatalogSearch(id:any) {
    this.router.navigate(['/search/catalogue', id]);
  }

  async next(){
    await this.getCatalogs(true);
  }

  showFullDesc(cat:any){
    this.showDesc=true;
    this.showingCat=cat;
  }

}

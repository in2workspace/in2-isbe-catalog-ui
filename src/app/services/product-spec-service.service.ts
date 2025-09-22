import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import {components} from "../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];

@Injectable({
  providedIn: 'root'
})
export class ProductSpecServiceService {

  public static readonly BASE_URL: string = environment.BASE_URL;
  public static readonly API_PRODUCT_SPEC: string = environment.PRODUCT_SPEC;
  public static readonly PROD_SPEC_LIMIT: number = environment.PROD_SPEC_LIMIT;

  private readonly http = inject(HttpClient);

  getProdSpecByUser(page:any,status:any[],partyId:any,sort?:any,isBundle?:any) {
    let url = `${ProductSpecServiceService.BASE_URL}${ProductSpecServiceService.API_PRODUCT_SPEC}?limit=${ProductSpecServiceService.PROD_SPEC_LIMIT}&offset=${page}&relatedParty.id=${partyId}`;    
    //TO dO: delete
    //let url = `${ProductSpecServiceService.BASE_URL}${ProductSpecServiceService.API_PRODUCT_SPEC}?limit=${ProductSpecServiceService.PROD_SPEC_LIMIT}&offset=${page}`;  
    if(sort!=undefined){
      url=url+'&sort='+sort
    }
    if(isBundle!=undefined){
      url=url+'&isBundle='+isBundle
    }
    let lifeStatus=''
    if(status)
    if(status.length>0){
      for(let i=0; i < status.length; i++){
        if(i==status.length-1){
          lifeStatus=lifeStatus+status[i]
        } else {
          lifeStatus=lifeStatus+status[i]+','
        }    
      }
      url=url+'&lifecycleStatus='+lifeStatus;
    }

    return lastValueFrom(this.http.get<any>(url));
  }

  getResSpecById(id:any){
    let url = `${ProductSpecServiceService.BASE_URL}${ProductSpecServiceService.API_PRODUCT_SPEC}/${id}`;
 
    return lastValueFrom(this.http.get<any>(url));
  }

  postProdSpec(body:any){
    let url = `${ProductSpecServiceService.BASE_URL}${ProductSpecServiceService.API_PRODUCT_SPEC}`;
    return this.http.post<any>(url, body);
  }

  updateProdSpec(body:any,id:any){
    let url = `${ProductSpecServiceService.BASE_URL}${ProductSpecServiceService.API_PRODUCT_SPEC}/${id}`;
    return this.http.patch<any>(url, body);
  }
}

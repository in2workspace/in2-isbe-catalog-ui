import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import {components} from "../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];
import {LocalStorageService} from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class AccountServiceService {
  public static readonly BASE_URL: String = environment.BASE_URL;
  public static readonly PARTY_URL: String = environment.PARTY_URL;
  public static readonly INDIVIDUAL: String = environment.INDIVIDUAL;
  public static readonly ORGANIZATION: String = environment.ORGANIZATION;
  public static readonly API_ACCOUNT: String = environment.ACCOUNT;

  constructor(private http: HttpClient,private localStorage: LocalStorageService) { }

  getBillingAccount(){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.API_ACCOUNT}/billingAccount/`;
    return lastValueFrom(this.http.get<any[]>(url));
  }

  getBillingAccountById(id:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.API_ACCOUNT}/billingAccount/${id}`;
    return lastValueFrom(this.http.get<any>(url));
  }

  postBillingAccount(item:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.API_ACCOUNT}/billingAccount/`;
    return this.http.post<any>(url, item);
  }

  updateBillingAccount(id:any,item:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.API_ACCOUNT}/billingAccount/${id}`;
    return this.http.patch<any>(url, item);
  }

  deleteBillingAccount(id:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.API_ACCOUNT}/billingAccount/${id}`;
    return this.http.delete<any>(url);
  }

  getUserInfo(id:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.PARTY_URL}${AccountServiceService.INDIVIDUAL}/urn:ngsi-ld:individual:${id}`;
    return lastValueFrom(this.http.get<any>(url));
  }

  getOrgInfo(id:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.PARTY_URL}${AccountServiceService.ORGANIZATION}/urn:ngsi-ld:organization:${id}`;
    return lastValueFrom(this.http.get<any>(url));
  }

  updateUserInfo(id:any,profile:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.PARTY_URL}${AccountServiceService.INDIVIDUAL}/urn:ngsi-ld:individual:${id}`;   
    return this.http.patch<any>(url, profile);
  }

  updateOrgInfo(id:any,profile:any){
    let url = `${AccountServiceService.BASE_URL}${AccountServiceService.PARTY_URL}${AccountServiceService.ORGANIZATION}/urn:ngsi-ld:organization:${id}`;   
    return this.http.patch<any>(url, profile);
  }
}

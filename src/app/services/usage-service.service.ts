import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, lastValueFrom, map, of} from 'rxjs';
import { Category, LoginInfo } from '../models/interfaces';
import { environment } from 'src/environments/environment';
import {components} from "../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];
import {LocalStorageService} from "./local-storage.service";
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UsageServiceService {

  public static BASE_URL: String = environment.BASE_URL;
  public static USAGE_SPEC_LIMIT: number = environment.USAGE_SPEC_LIMIT;

  constructor(private http: HttpClient,private localStorage: LocalStorageService) { }

  getUsageSpec(id:any) {

    let url = `${UsageServiceService.BASE_URL}/usage/usageSpecification/${id}`;

    return lastValueFrom(this.http.get<any>(url));
  }

  getUsageSpecs(page:any,seller:any) {

    let url = `${UsageServiceService.BASE_URL}/usage/usageSpecification?limit=${UsageServiceService.USAGE_SPEC_LIMIT}&offset=${page}&seller=${seller}`;

    return lastValueFrom(this.http.get<any[]>(url));
  }

  getAllUsageSpecs(seller:any) {

    let url = `${UsageServiceService.BASE_URL}/usage/usageSpecification?seller=${seller}`;

    return lastValueFrom(this.http.get<any[]>(url));
  }


  postUsageSpec(usageSpec:any){
    let url = `${UsageServiceService.BASE_URL}/usage/usageSpecification`;

    return this.http.post<any>(url, usageSpec);
  }

  updateUsageSpec(usageSpec:any,id:any){
    let url = `${UsageServiceService.BASE_URL}/usage/usageSpecification/${id}`;

    return this.http.patch<any>(url, usageSpec);
  }
}

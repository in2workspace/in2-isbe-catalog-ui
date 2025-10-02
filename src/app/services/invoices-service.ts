import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { Category, LoginInfo } from '../models/interfaces';
import { environment } from 'src/environments/environment';
import {LocalStorageService} from "./local-storage.service";
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {

  public static BASE_URL: String = environment.BASE_URL;
  public static BASE_PATCH: String = environment.BILLING;
  public static API_ORDERING: String = environment.CUSTOMER_BILLING;

  public static ORDER_LIMIT: Number = environment.ORDER_LIMIT;

  constructor(private http: HttpClient,private localStorage: LocalStorageService) { }

  getInvoices(seller:any, page:any, filters:any[], date:any, role:any){
    let url = `${InvoicesService.BASE_URL}${InvoicesService.BASE_PATCH}${InvoicesService.API_ORDERING}?limit=1000&offset=${page}`;
    url += `&seller=${seller}&seller.role=${role}`
    let result =  lastValueFrom(this.http.get<any[]>(url));
    return result;
  }

  updateInvoice(patchData:any,invoiceId:any){
    let url = `${InvoicesService.BASE_URL}${InvoicesService.BASE_PATCH}${InvoicesService.API_ORDERING}/${invoiceId}`;
    return this.http.patch(url, patchData)
  }
}

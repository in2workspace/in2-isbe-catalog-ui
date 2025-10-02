import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {components} from "../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];

@Injectable({
  providedIn: 'root'
})
export class AttachmentServiceService {
  public static BASE_URL: String = environment.BASE_URL;

  constructor(private http: HttpClient) { }

  uploadFile(file:any){
    let url = `${AttachmentServiceService.BASE_URL}/charging/api/assetManagement/assets/uploadJob`;
    return this.http.post<any>(url, file);
  }
}

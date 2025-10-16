import {TranslateModule} from "@ngx-translate/core";
import { Component, Input, forwardRef } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import {SharedModule} from "../../../shared.module";
import { MarkdownComponent } from "ngx-markdown";
import {
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-offer-summary',
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    MarkdownComponent,
    NgClass,
    PickerComponent,
    SharedModule],
  templateUrl: './offer-summary.component.html',
  styleUrl: './offer-summary.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OfferSummaryComponent),
      multi: true
    }
  ]
})
export class OfferSummaryComponent{

  @Input() productOfferForm!: FormGroup;

  get isLicenseEmpty(): boolean {
    const licenseValue = this.productOfferForm.get('license')?.value;
    return !licenseValue || (typeof licenseValue === 'object' && Object.keys(licenseValue).length === 0);
  }
  
  

}

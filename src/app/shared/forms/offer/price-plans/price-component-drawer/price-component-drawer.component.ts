import {Component, EventEmitter, HostListener, Input, OnInit, Output, ChangeDetectorRef} from '@angular/core';
import {FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {MarkdownTextareaComponent} from "../../../markdown-textarea/markdown-textarea.component";
import { UsageServiceService } from 'src/app/services/usage-service.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {TranslateModule} from "@ngx-translate/core";
import {NgClass} from "@angular/common";
import { initFlowbite } from 'flowbite';
import * as moment from 'moment';
import { certifications } from 'src/app/models/certification-standards.const';
import { LoginInfo } from 'src/app/models/interfaces';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-price-component-drawer',
  standalone: true,
  templateUrl: './price-component-drawer.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MarkdownTextareaComponent,
    TranslateModule,
    NgClass
  ],
  styleUrl: './price-component-drawer.component.css'
})
export class PriceComponentDrawerComponent implements OnInit {
  @Input() component: any | null = null;
  @Input() prodChars: any[] | [] = [];
  @Input() profileData: boolean = false;
  @Output() close = new EventEmitter<any | null>();
  @Output() save = new EventEmitter<any>();

  isOpen = false;
  initialized = false;

  priceComponentForm!: FormGroup;
  showValueSelect:boolean=false;
  selectedCharacteristic:any=undefined;
  touchedCharCheck:boolean=false;
  selectedCharacteristicVal:any;
  showDiscount:boolean=false;
  filteredChars:any[]=[];
  usageSpecs:any[]=[];
  selectedUsageSpec:any;
  selectedMetric:any;
  showMetricSelect:boolean=false;
  seller:any='';
  showPopover = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly usageService: UsageServiceService,
    private readonly auth: AuthService
  ) {}

  ngOnInit() {
    this.initialized = false;
    setTimeout(() => {
      this.isOpen = true;
      this.initialized = true;
    }, 50);

    for(const element of this.prodChars){
      if (!certifications.some(certification => certification.name === element.name)) {
        this.filteredChars.push(element);
      }
    }

    this.priceComponentForm = this.fb.group({
      name: ['', Validators.required],
      price:['', [Validators.required, Validators.min(0.01), Validators.max(1000000000)]],
      description: [''],
      priceType: ['one time', Validators.required],
      discountValue: [null, [Validators.min(0), Validators.max(100)]],
      discountUnit: ['percentage'],
      discountDuration: [null, [Validators.min(1)]],
      discountDurationUnit: ['days'],
      recurringPeriod: ['month'],
      usageUnit: [''],
      usageSpecId: [''],
      selectedCharacteristic:[undefined]
    });

    if (this.component) {
      this.priceComponentForm.patchValue(this.component);
      this.cdr.detectChanges();
      
      const selectedCharControl = this.priceComponentForm.get('selectedCharacteristic');
      const selectedCharValue = selectedCharControl?.value;
      
      if (Array.isArray(selectedCharValue) && selectedCharValue.length > 0) {
        const pscv = selectedCharValue[0]?.productSpecCharacteristicValue;
      
        if (Array.isArray(pscv) && pscv.length > 0) {
          if ('valueFrom' in pscv[0]) {
            this.showValueSelect = false;
          } else {
            this.showValueSelect = true;
          }
        } else {
          this.showValueSelect = true;
        }
      }
      
      if(this.priceComponentForm.get('discountValue')?.value != null){
        this.showDiscount=true;
      }
      const selectedChar = this.priceComponentForm.get('selectedCharacteristic')?.value?.[0];

      if (selectedChar) {
        this.selectedCharacteristic = selectedChar;
      }
    }
    this.initPartyInfo();
    this.usageService.getAllUsageSpecs(this.seller).then(data => {
      this.usageSpecs=data;
      if(this.priceComponentForm.get('usageSpecId')){
        this.selectedUsageSpec = this.usageSpecs.find((element: { id: any; }) => element.id == this.priceComponentForm.get('usageSpecId')?.value)
        this.selectedMetric = this.priceComponentForm.get('usageUnit')?.value
        this.showMetricSelect=true;
      }
    })
  }


  initPartyInfo(){
   this.auth.sellerId$
    .pipe(take(1))
    .subscribe(id => {
      this.seller = id || '';
    });
  }

  submitForm() {
    if (this.priceComponentForm.valid) {
      this.save.emit(this.priceComponentForm.value);
      this.closeDrawer();
    }
  }

  changePriceComponentChar(event: any){
    if(event.target.value == ''){
      this.showValueSelect = false;
      return
    }

    let charValue = this.prodChars.find(
      (char: { id: any; }) => char.id === event.target.value
    );

    this.selectedCharacteristic = charValue;
    this.cdr.detectChanges();

    if('valueFrom' in this.selectedCharacteristic.productSpecCharacteristicValue[0]){
      // This is a range characteristic, so no value to select
      this.showValueSelect = false;
    } else if('unitOfMeasure' in this.selectedCharacteristic.productSpecCharacteristicValue[0]){
      // This is a number characteristic
      this.selectedCharacteristicVal = this.selectedCharacteristic.productSpecCharacteristicValue[0].value;
      this.showValueSelect = true;
    } else {
      // This is a string characteristic
      this.selectedCharacteristicVal = this.selectedCharacteristic.productSpecCharacteristicValue[0].value;
      this.showValueSelect = true;
    }

    this.priceComponentForm.patchValue({
      selectedCharacteristic: this.mapChars(this.selectedCharacteristicVal)
    });
  }

  private mapChars(charValue: any): any {
    console.log(this.selectedCharacteristic)
    const char: any = {
      id: this.selectedCharacteristic.id,
      name: this.selectedCharacteristic.name,
      description: this.selectedCharacteristic.description || '',
    }

    // Add the productSpecCharacteristicValue only if needed
    // Range chars not include a value
    if (this.showValueSelect) {
      char.productSpecCharacteristicValue = [this.selectedCharacteristic.productSpecCharacteristicValue.find((opt: any) => {
        return String(opt.value) === String(charValue);
      })];
    }

    return char
  }

  changePriceComponentCharValue(event: any){
    this.selectedCharacteristicVal = event.target.value;
    this.priceComponentForm.patchValue({
      selectedCharacteristic: this.mapChars(event.target.value)
    });
  }

  changePriceComponentUsageSpec(event: any){    
    if(event.target.value == ''){
      this.showValueSelect = false;
      return
    }
    this.selectedUsageSpec= this.usageSpecs.find((element: { id: any; }) => element.id == event.target.value)
    if(this.selectedUsageSpec.specCharacteristic.length>0){
      this.selectedMetric=this.selectedUsageSpec.specCharacteristic[0].name;
    } else {
      this.selectedMetric='';
    }
    this.priceComponentForm.patchValue({
      usageUnit: this.selectedMetric
    });
    
    this.showMetricSelect=true;
    this.priceComponentForm.patchValue({
      usageSpecId: this.selectedUsageSpec.id
    })
  }

  changePriceComponentMetric(event: any){
    //this.selectedMetric= this.selectedUsageSpec.specCharacteristic.find((element: { name: any; }) => element.name == event.target.value)
    this.selectedMetric = event.target.value
    console.log(this.selectedMetric)
    this.priceComponentForm.patchValue({
      usageUnit: this.selectedMetric
    });
  }

  closeDrawer() {
    this.isOpen = false;
    // If editing, do nothing; if creating, clear form
    setTimeout(() => this.close.emit(null), 500);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    event.stopPropagation();  // Prevent closing parent drawer
    this.closeDrawer();
  }

  hasKey(obj: any, key: string): boolean {
    return key in obj;
  }
}

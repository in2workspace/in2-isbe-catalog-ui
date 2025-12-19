import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/services/product-service.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import {EventMessageService} from "src/app/services/event-message.service";
import { LoginInfo } from 'src/app/models/interfaces';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import * as moment from 'moment';
import { noWhitespaceValidator } from 'src/app/validators/validators';

import {components} from "src/app/models/product-catalog";
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { NgClass } from '@angular/common';
import { MarkdownTextareaComponent } from 'src/app/shared/forms/markdown-textarea/markdown-textarea.component';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';
type Catalog_Update = components["schemas"]["Catalog_Update"];
type StepId = 'general-info' | 'summary';

interface StepNavItem {
  id: StepId;
  labelKey: string;
  onClick: () => void;
  isDisabled: () => boolean;
}

@Component({
    selector: 'update-catalog',
    templateUrl: './update-catalog.component.html',
    styleUrl: './update-catalog.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, MarkdownComponent, NgClass, MarkdownTextareaComponent,ReactiveFormsModule]
})
export class UpdateCatalogComponent implements OnInit {
  @Input() cat: any;

  seller:any='';

  catalogToUpdate: Catalog_Update | undefined;

  currentStep: StepId = 'general-info';
  stepNavigation: StepNavItem[] = [];

  //markdown variables:
  showPreview:boolean=false;
  showEmoji:boolean=false;
  description:string='';  

  //CONTROL VARIABLES:
  showGeneral:boolean=true;
  showSummary:boolean=false;
  //Check if step was done
  generalDone:boolean=false;

  //SERVICE GENERAL INFO:
  generalForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100), noWhitespaceValidator]),
    description: new FormControl('',Validators.maxLength(100000)),
  });
  catStatus:any='Active';

  errorMessage:any='';
  showError:boolean=false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly api: ApiServiceService,
    private readonly auth: AuthService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if(this.showEmoji==true){
      this.showEmoji=false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.initPartyInfo();
    this.populateCatInfo();
    this.initNavigationSteps();
  }

  populateCatInfo(){
    //GENERAL INFORMATION
    this.generalForm.controls['name'].setValue(this.cat.name);
    this.generalForm.controls['description'].setValue(this.cat.description);
    this.catStatus=this.cat.lifecycleStatus;
  }

  initPartyInfo(){
   this.auth.sellerId$
    .pipe(take(1))
    .subscribe(id => {
      this.seller = id || '';
    });
  }

  goBack() {
    this.eventMessage.emitSellerCatalog(true);
  }

  toggleGeneral(){
    this.selectStep('general-info');
    this.showGeneral=true;
    this.showSummary=false;
    this.showPreview=false;
  }

  setCatStatus(status:any){
    this.catStatus=status;
    this.cdr.detectChanges();
  }

  showFinish(){
    if(this.generalForm.value.name!=null){
      this.catalogToUpdate={
        description: this.generalForm.value.description != null ? this.generalForm.value.description : '',
        lifecycleStatus: this.catStatus,
      }
      if(this.cat.name != this.generalForm.value.name){
        this.catalogToUpdate.name=this.generalForm.value.name;
      }
      this.showGeneral=false;
      this.showSummary=true;
      this.selectStep('summary');
    }
    this.showPreview=false;
  }

  createCatalog(){
    this.api.updateCatalog(this.catalogToUpdate,this.cat.id).subscribe({
      next: data => {
        this.goBack();
      },
      error: error => {
        console.error('There was an error while updating!', error);
        if(error.error.error){
          console.error(error)
          this.errorMessage='Error: '+error.error.error;
        } else {
          this.errorMessage='¡Hubo un error al actualizar el catálogo!';
        }
        this.showError=true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    })
  }

  initNavigationSteps() {
    this.stepNavigation = [
      {
        id: 'general-info',
        labelKey: 'UPDATE_CATALOG._general',
        onClick: () => this.toggleGeneral(),
        isDisabled: () => false
      },
      {
        id: 'summary',
        labelKey: 'UPDATE_CATALOG._finish',
        onClick: () => this.showFinish(),
        isDisabled: () => this.generalForm.invalid
      }
    ];
  }

  get currentStepIndex(): number {
    return this.stepNavigation.findIndex(step => step.id === this.currentStep);
  }

  isStepComplete(index: number): boolean {
    const activeIndex = this.currentStepIndex;
    return activeIndex !== -1 && index < activeIndex;
  }

  isCurrentStep(stepId: StepId): boolean {
    return this.currentStep === stepId;
  }

  isStepDisabled(step: StepNavItem): boolean {
    return step.isDisabled();
  }

  handleStepClick(step: StepNavItem) {
    if (this.isStepDisabled(step)) return;
    this.selectStep(step.id);
    step.onClick();
  }

  selectStep(step: StepId){
    this.currentStep = step;
  }

  //Markdown actions:
  addBold() {
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + ' **bold text** '
    });
  }

  addItalic() {
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + ' _italicized text_ '
    });
  }

  addList(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + '\n- First item\n- Second item'
    });    
  }

  addOrderedList(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + '\n1. First item\n2. Second item'
    });    
  }

  addCode(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + '\n`code`'
    });    
  }

  addCodeBlock(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + '\n```\ncode\n```'
    }); 
  }

  addBlockquote(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + '\n> blockquote'
    });    
  }

  addLink(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + ' [title](https://www.example.com) '
    });    
  } 

  addTable(){
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + '\n| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |'
    });
  }

  addEmoji(event:any){
    this.showEmoji=false;
    const currentText = this.generalForm.value.description;
    this.generalForm.patchValue({
      description: currentText + event.emoji.native
    });
  }

  togglePreview(){
    if(this.generalForm.value.description){
      this.description=this.generalForm.value.description;
    } else {
      this.description=''
    }  
  }
}

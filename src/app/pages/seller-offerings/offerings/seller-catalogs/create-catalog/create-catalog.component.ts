import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
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
import { catchError, EMPTY, finalize, switchMap, take, tap } from 'rxjs';
type Catalog_Create = components["schemas"]["Catalog_Create"];
type Category_Create = components["schemas"]["Category_Create"];

@Component({
    selector: 'create-catalog',
    templateUrl: './create-catalog.component.html',
    styleUrl: './create-catalog.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, MarkdownComponent, NgClass, MarkdownTextareaComponent, ReactiveFormsModule]
})
export class CreateCatalogComponent implements OnInit {
  seller:any='';

  catalogToCreate:Catalog_Create | undefined;
  categoryToCreate:Category_Create | undefined;

  stepsElements:string[]=['general-info','summary'];
  stepsCircles:string[]=['general-circle','summary-circle'];

  //markdown variables:
  showPreview:boolean=false;
  showEmoji:boolean=false;
  description:string='';  

  //CONTROL VARIABLES:
  showGeneral:boolean=true;
  showSummary:boolean=false;
  //Check if step was done
  generalDone:boolean=false;
  finishDone:boolean=false;

  //SERVICE GENERAL INFO:
  generalForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100), noWhitespaceValidator]),
    description: new FormControl('', Validators.maxLength(100000)),
  });

  errorMessage:any='';
  showError:boolean=false;
  private inFlight = false;

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly api: ApiServiceService
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
    this.selectStep('general-info','general-circle');
    this.showGeneral=true;
    this.showSummary=false;
    this.showPreview=false;
  }

  showFinish(){
    this.finishDone=true;
    if(this.generalForm.value.name!=null){
      this.catalogToCreate={
        name: this.generalForm.value.name,
        description: this.generalForm.value.description != null ? this.generalForm.value.description : '',
        lifecycleStatus: "Active",
        relatedParty: [
          {
              id: this.seller,
              role: "Owner",
              "@referredType": ''
          }
        ],
      }
      this.showGeneral=false;
      this.showSummary=true;
      this.selectStep('summary','summary-circle');
    }
    this.showPreview=false;
  }

  

  private getApiErrorMessage(err: any, fallback: string): string {
    return err?.error?.error
      ?? err?.error?.message
      ?? err?.message
      ?? fallback;
  }

  createCatalog(): void {
    if (this.inFlight) return;

    const name = this.catalogToCreate?.name?.trim();
    if (!name) {
      this.errorMessage = 'Proporcione un nombre de catálogo.';
      this.showError = true;
      setTimeout(() => (this.showError = false), 3000);
      return;
    }

    this.categoryToCreate = {
      name,
      lifecycleStatus: 'Active',
      isRoot: true,
    };

    this.inFlight = true;

    this.api.postCategory(this.categoryToCreate).pipe(
      tap(cat => {
        this.catalogToCreate!.category = [cat];
      }),
      switchMap(() => this.api.postCatalog(this.catalogToCreate!)),
      tap(() => this.goBack()),
      catchError(err => {
        const creatingCategory = !this.catalogToCreate?.category;
        const fallback = creatingCategory
          ? '¡Hubo un error al crear la categoría!'
          : '¡Hubo un error al crear el catálogo!';

        this.errorMessage = this.getApiErrorMessage(err, fallback);
        this.showError = true;
        setTimeout(() => (this.showError = false), 3000);
        return EMPTY;
      }),
      finalize(() => {
        this.inFlight = false;
      })
    ).subscribe();
  }

  //STEPS METHODS
  removeClass(elem: HTMLElement, cls:string) {
    var str = " " + elem.className + " ";
    elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  addClass(elem: HTMLElement, cls:string) {
      elem.className += (" " + cls);
  }

  unselectMenu(elem:HTMLElement | null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        this.removeClass(elem,cls)
      }
    }
  }

  selectMenu(elem:HTMLElement| null,cls:string){
    if(elem != null){
      if(!elem.className.match(cls)){
        this.addClass(elem,cls)
      }
    }
  }
  
  //STEPS CSS EFFECTS:
  selectStep(step:string,stepCircle:string){
    const index = this.stepsElements.findIndex(item => item === step);
    if (index !== -1) {
      this.stepsElements.splice(index, 1);
      this.selectMenu(document.getElementById(step),'text-primary-100 dark:text-primary-50')
      this.unselectMenu(document.getElementById(step),'text-gray-500') 
      for(let i=0; i<this.stepsElements.length;i++){
        this.unselectMenu(document.getElementById(this.stepsElements[i]),'text-primary-100 dark:text-primary-50')
        this.selectMenu(document.getElementById(this.stepsElements[i]),'text-gray-500') 
      }
      this.stepsElements.push(step);
    }
    const circleIndex = this.stepsCircles.findIndex(item => item === stepCircle);
    if (index !== -1) {
      this.stepsCircles.splice(circleIndex, 1);
      this.selectMenu(document.getElementById(stepCircle),'border-primary-100 dark:border-primary-50')
      this.unselectMenu(document.getElementById(stepCircle),'border-gray-400');
      for(let i=0; i<this.stepsCircles.length;i++){
        this.unselectMenu(document.getElementById(this.stepsCircles[i]),'border-primary-100 dark:border-primary-50')
        this.selectMenu(document.getElementById(this.stepsCircles[i]),'border-gray-400');
      }
      this.stepsCircles.push(stepCircle);
    }
  }

}

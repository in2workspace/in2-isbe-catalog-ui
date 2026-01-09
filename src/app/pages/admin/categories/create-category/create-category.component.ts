import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { ApiServiceService } from 'src/app/services/product-service.service';
import {EventMessageService} from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import {components} from "src/app/models/product-catalog";
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { DatePipe, NgClass } from '@angular/common';
import { CategoriesRecursionComponent } from 'src/app/shared/categories-recursion/categories-recursion.component';
import { MarkdownTextareaComponent } from 'src/app/shared/forms/markdown-textarea/markdown-textarea.component';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';
type Category_Create = components["schemas"]["Category_Create"];
type StepId = 'general-info' | 'summary';

interface StepNavItem {
  id: StepId;
  labelKey: string;
  onClick: () => void;
  isDisabled: () => boolean;
}

@Component({
    selector: 'create-category',
    templateUrl: './create-category.component.html',
    styleUrl: './create-category.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, MarkdownComponent, NgClass, CategoriesRecursionComponent, DatePipe, MarkdownTextareaComponent,ReactiveFormsModule]
})
export class CreateCategoryComponent implements OnInit {
  seller:any='';
  categoryToCreate:Category_Create | undefined;

  categories:any[]=[];
  unformattedCategories:any[]=[];

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
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl(''),
  });
  isParent:boolean=true;
  parentSelectionCheck:boolean=false;
  selectedCategory:any=undefined;
  selected:any[];
  loading: boolean = false;

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
      if(ev.type === 'CategoryAdded') {
        this.addCategory(ev.value);
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
    this.initNavigationSteps();
  }

  initPartyInfo() {
    this.auth.sellerId$.pipe(take(1)).subscribe(sellerId => {
      this.seller = sellerId || '';
      this.getCategories();
    });
  }


  goBack() {
    this.eventMessage.emitAdminCategories(true);
  }

  getCategories(){
    this.api.getLaunchedCategories().then(data => {      
      for(let i=0; i < data.length; i++){
        this.findChildren(data[i],data);
        this.unformattedCategories.push(data[i]);
      }
      this.loading=false;
      this.cdr.detectChanges();
      initFlowbite();
    }) 
  }

  findChildren(parent:any,data:any[]){
    let childs = data.filter((p => p.parentId === parent.id));
    parent["children"] = childs;
    if(parent.isRoot == true){
      this.categories.push(parent)
    } else {
      this.saveChildren(this.categories,parent)
    }
    if(childs.length != 0){
      for(let i=0; i < childs.length; i++){
        this.findChildren(childs[i],data)
      }
    }
  }

  findChildrenByParent(parent:any){
    let childs: any[] = []
    this.api.getCategoriesByParentId(parent.id).then(c => {
      childs=c;
      parent["children"] = childs;
      if(parent.isRoot == true){
        this.categories.push(parent)
      } else {
        this.saveChildren(this.categories,parent)
      }
      if(childs.length != 0){
        for(let i=0; i < childs.length; i++){
          this.findChildrenByParent(childs[i])
        }
      }
      initFlowbite();
    })

  }

  saveChildren(superCategories:any[],parent:any){
    for(let i=0; i < superCategories.length; i++){
      let children = superCategories[i].children;
      if (children != undefined){
        let check = children.find((element: { id: any; }) => element.id == parent.id) 
        if (check != undefined) {
          let idx = children.findIndex((element: { id: any; }) => element.id == parent.id)
          children[idx] = parent
          superCategories[i].children = children         
        }
        this.saveChildren(children,parent)
      }          
    }
  }

  toggleGeneral(){
    this.selectStep('general-info');
    this.showGeneral=true;
    this.showSummary=false;
    this.showPreview=false;
  }

  toggleParent(){
    this.isParent=!this.isParent;
    this.parentSelectionCheck=!this.parentSelectionCheck;
    this.cdr.detectChanges();
  }

  addCategory(cat:any){
    if(this.selectedCategory==undefined){
      this.selectedCategory=cat;
      this.selected=[];
      this.selected.push(cat);
    } else {
      const index = this.selected.findIndex(item => item.id === cat.id);
      if (index !== -1) {
        this.selected=[];
        this.selectedCategory=undefined;
      } else {
        this.selectedCategory=cat;
        this.selected=[];
        this.selected.push(cat);
      }
    }

    this.cdr.detectChanges();
  }

  isCategorySelected(cat:any){
    if(this.selectedCategory==undefined){
      return false;
    } else {
      if(cat.id==this.selectedCategory.id){
        return true
      } else {
        return false
      }
    }
  }

  showFinish(){
    if(this.generalForm.value.name!=null){
      this.generalDone=true;
      this.categoryToCreate={
        name: this.generalForm.value.name,
        description: this.generalForm.value.description != null ? this.generalForm.value.description : '',
        lifecycleStatus: "In design",
        isRoot: this.isParent
      }
      if(this.isParent==false){
        this.categoryToCreate.parentId=this.selectedCategory.id;
      }
      this.showGeneral=false;
      this.showSummary=true;
      this.selectStep('summary');
    }
    this.showPreview=false;
  }

  createCategory(){
    this.api.postCategory(this.categoryToCreate).subscribe({
      next: data => {
        this.goBack();
      },
      error: error => {
        console.error('There was an error while updating!', error);
        if(error.error.error){
          this.errorMessage='Error: '+error.error.error;
        } else {
          this.errorMessage='¡Hubo un error al crear la categoría!';
        }
        this.showError=true;
        // setTimeout(() => {
        //   this.showError = false;
        // }, 3000);
      }
    })
  }

  initNavigationSteps() {
    this.stepNavigation = [
      {
        id: 'general-info',
        labelKey: 'CREATE_CATEGORIES._general',
        onClick: () => this.toggleGeneral(),
        isDisabled: () => !this.generalDone && this.currentStep !== 'general-info'
      },
      {
        id: 'summary',
        labelKey: 'CREATE_CATEGORIES._finish',
        onClick: () => this.showFinish(),
        isDisabled: () => true
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
    }  else {
      this.description=''
    }   
  }
}

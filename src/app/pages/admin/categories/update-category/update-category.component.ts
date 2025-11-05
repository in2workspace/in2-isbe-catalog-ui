import { Component, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import { ApiServiceService } from 'src/app/services/product-service.service';
import {EventMessageService} from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import {components} from "src/app/models/product-catalog";
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { DatePipe, NgClass } from '@angular/common';
import { CategoriesRecursionComponent } from 'src/app/shared/categories-recursion/categories-recursion.component';
import { MarkdownTextareaComponent } from 'src/app/shared/forms/markdown-textarea/markdown-textarea.component';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';
import { StatusSelectorComponent } from 'src/app/shared/lifecycle-status/status-selector/status-selector.component';
import { hasNonStatusChanges, normalizeToInternal, StatusCode } from 'src/app/shared/lifecycle-status/lifecycle-status';
import { ReminderMessageComponent } from 'src/app/shared/reminder-message/reminder-message.component';
type Category_Update = components["schemas"]["Category_Update"];

@Component({
    selector: 'update-category',
    templateUrl: './update-category.component.html',
    styleUrl: './update-category.component.css',
    standalone: true,
    imports: [ReminderMessageComponent, FormsModule, StatusSelectorComponent, ErrorMessageComponent, TranslateModule, MarkdownComponent, NgClass, CategoriesRecursionComponent, DatePipe, MarkdownTextareaComponent, ReactiveFormsModule]
})
export class UpdateCategoryComponent implements OnInit {
  @Input() category: any;

  seller:any='';
  categoryToUpdate:Category_Update | undefined;

  categories:any[]=[];
  unformattedCategories:any[]=[];

  catStatusAnchor: StatusCode;
  catStatusDraft: string;

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

  //SERVICE GENERAL INFO:
  generalForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl(''),
  });
  isParent:boolean=true;
  parentSelectionCheck:boolean=false;
  checkDisableParent:boolean=false;
  selectedCategory:any=undefined;
  selected:any[];
  loading: boolean = false;

  errorMessage:any='';
  showError:boolean=false;

  showReminder:boolean=false;
  edited:boolean=false;

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
  }

  initPartyInfo(): void {
    this.auth.sellerId$
      .pipe(take(1))
      .subscribe(sellerId => {
        this.seller = sellerId || '';
        this.getCategories();
        this.populateCatInfo();
      });
  }


  populateCatInfo(){
    //GENERAL INFORMATION
    this.generalForm.controls['name'].setValue(this.category.name);
    this.generalForm.controls['description'].setValue(this.category.description);
    this.catStatusAnchor = normalizeToInternal(this.category.lifecycleStatus) as StatusCode;
    this.catStatusDraft  = this.category.lifecycleStatus;
    if(this.category.isRoot==false){
      this.isParent=false;
      this.parentSelectionCheck=true;
      this.checkDisableParent=true;
    } else {
      this.isParent=true;
      this.parentSelectionCheck=false;
    }
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
      if(this.category.isRoot==false){
        const index = this.categories.findIndex(item => item.id === this.category.parentId);
        if (index !== -1) {
          this.selectedCategory=this.categories[index]
          this.selected=[]
          this.selected.push(this.selectedCategory)
        }
      }
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

  saveChildren(superCategories:any[],parent:any) {
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

  toggleGeneral() {
    this.selectStep('general-info','general-circle');
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
      this.categoryToUpdate={
        name: this.generalForm.value.name,
        description: this.generalForm.value.description != null ? this.generalForm.value.description : '',
        lifecycleStatus: this.catStatusDraft,
        version: this.incrementVersion(this.category.version),
        isRoot: this.isParent
      }
      if(this.isParent==false){
        this.categoryToUpdate.parentId=this.selectedCategory.id;
      }
      this.showGeneral=false;
      this.showSummary=true;
      this.selectStep('summary','summary-circle');
    }
    this.showPreview=false;

    const original = {
      name: this.category.name,
      description: this.category.description,
      lifecycleStatus: this.category.lifecycleStatus,
      isRoot: this.category.isRoot,
      parentId: this.category.parentId
    };

    const current = {
      name: this.generalForm.value.name,
      description: this.generalForm.value.description,
      lifecycleStatus: this.catStatusDraft,
      isRoot: this.isParent,
      parentId: this.isParent ? null : this.selectedCategory?.id
    };

    this.edited = hasNonStatusChanges(original, current);
    
    if (this.edited && this.catStatusDraft === 'Launched') {
      this.showReminder=true;
      setTimeout(() => {
        this.showReminder = false;
        this.cdr.detectChanges();
      }, 3000);
    }

  }

  incrementVersion(version: string): string {
    const [major, minor] = version.split('.').map(Number);
    const newMajor = major + 1;
    const newMinor = 0;
    return `${newMajor}.${newMinor}`;
  }


  updateCategory(){
    this.api.updateCategory(this.categoryToUpdate,this.category.id).subscribe({
      next: data => {
        this.catStatusAnchor = normalizeToInternal(this.categoryToUpdate!.lifecycleStatus) as StatusCode;
        this.catStatusDraft  = this.categoryToUpdate!.lifecycleStatus!;
        this.goBack();
      },
      error: error => {
        console.error('There was an error while updating!', error);
        if(error.error.error){
          console.error(error)
          this.errorMessage='Error: '+error.error.error;
        } else {
          this.errorMessage='¡Hubo un error al crear la categoría!';
        }
        this.showError=true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    })
  }

  setCatStatus(status:any){
    this.catStatusDraft = status;
    this.cdr.detectChanges();
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

  isCatValid(){
    if((this.edited && this.catStatusDraft !== 'Active')|| !this.generalForm.valid){
      return true;
    }
    return false;
  }
}

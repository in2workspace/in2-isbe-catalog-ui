import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import {components} from "src/app/models/product-catalog";
import { environment } from 'src/environments/environment';
import { ProductSpecServiceService } from 'src/app/services/product-spec-service.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import {EventMessageService} from "src/app/services/event-message.service";
import {AttachmentServiceService} from "src/app/services/attachment-service.service";
import { PaginationService } from 'src/app/services/pagination.service';
import { LoginInfo } from 'src/app/models/interfaces';
import { initFlowbite } from 'flowbite';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry, NgxFileDropModule } from 'ngx-file-drop';
import { certifications } from 'src/app/models/certification-standards.const'
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { noWhitespaceValidator } from 'src/app/validators/validators';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, NgClass } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { MarkdownTextareaComponent } from 'src/app/shared/forms/markdown-textarea/markdown-textarea.component';

type CharacteristicValueSpecification = components["schemas"]["CharacteristicValueSpecification"];
type ProductSpecification_Create = components["schemas"]["ProductSpecification_Create"];
type BundledProductSpecification = components["schemas"]["BundledProductSpecification"];
type ProductSpecificationCharacteristic = components["schemas"]["ProductSpecificationCharacteristic"];
type ProductSpecificationRelationship = components["schemas"]["ProductSpecificationRelationship"];
type AttachmentRefOrValue = components["schemas"]["AttachmentRefOrValue"];

@Component({
    selector: 'create-product-spec',
    templateUrl: './create-product-spec.component.html',
    styleUrl: './create-product-spec.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, NgxFileDropModule, NgClass, DatePipe, MarkdownComponent, ReactiveFormsModule, FormsModule, MarkdownTextareaComponent]
})
export class CreateProductSpecComponent implements OnInit {

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  //PAGE SIZES:
  PROD_SPEC_LIMIT: number = environment.PROD_SPEC_LIMIT;
  BUNDLE_ENABLED: boolean= environment.BUNDLE_ENABLED;
  MAX_FILE_SIZE: number=environment.MAX_FILE_SIZE;

  //CONTROL VARIABLES:
  showGeneral:boolean=true;
  showBundle:boolean=false;
  showCompliance:boolean=false;
  showChars:boolean=false;
  showAttach:boolean=false;
  showRelationships:boolean=false;
  showSummary:boolean=false;

  //Check if step was done
  generalDone:boolean=false;
  bundleDone:boolean=false;
  complianceDone:boolean=false;
  charsDone:boolean=false;
  attachDone:boolean=false;
  relationshipDone:boolean=false;
  finishDone:boolean=false;

  stepsElements:string[]=['general-info','bundle','compliance','chars','attach','relationships','summary'];
  stepsCircles:string[]=['general-circle','bundle-circle','compliance-circle','chars-circle','attach-circle','relationships-circle','summary-circle'];

  showPreview:boolean=false;
  showEmoji:boolean=false;
  description:string='';  
  seller:any='';

  //PRODUCT GENERAL INFO:
  generalForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100), noWhitespaceValidator]),
    brand: new FormControl('', [Validators.required, noWhitespaceValidator]),
    version: new FormControl('0.1', [Validators.required,Validators.pattern('^-?[0-9]\\d*(\\.\\d*)?$'), noWhitespaceValidator]),
    number: new FormControl(''),
    description: new FormControl(''),
  });

  //CHARS INFO
  charsForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100), noWhitespaceValidator]),
    description: new FormControl('')
  });
  
  stringCharSelected:boolean=true;
  numberCharSelected:boolean=false;
  rangeCharSelected:boolean=false;
  prodChars:ProductSpecificationCharacteristic[]=[];
  finishChars:ProductSpecificationCharacteristic[]=[];
  creatingChars:CharacteristicValueSpecification[]=[];
  showCreateChar:boolean=false;

  //BUNDLE INFO:
  bundleChecked:boolean=false;
  bundlePage=0;
  bundlePageCheck:boolean=false;
  loadingBundle:boolean=false;
  loadingBundle_more:boolean=false;
  prodSpecs:any[]=[];
  nextProdSpecs:any[]=[];
  //final selected products inside bundle
  prodSpecsBundle:BundledProductSpecification[]=[];

  //COMPLIANCE PROFILE INFO:
  buttonISOClicked:boolean=false;
  availableISOS:any[]=[];
  selectedISOS:any[]=[];
  selectedISO:any;
  showUploadFile:boolean=false;
  disableCompNext:boolean=true;
  selfAtt:any;
  showUploadAtt:boolean=false;

  //RELATIONSHIPS INFO:
  prodRelationships:any[]=[];
  relToCreate:any;
  showCreateRel:boolean=false;
  prodSpecRelPage=0;
  prodSpecRelPageCheck:boolean=false;
  loadingprodSpecRel:boolean=false;
  loadingprodSpecRel_more:boolean=false;
  prodSpecRels:any[]=[];
  nextProdSpecRels:any[]=[];
  selectedProdSpec:any={id:''};
  selectedRelType:any='migration';

  //ATTACHMENT INFO
  showImgPreview:boolean=false;
  imgPreview:any='';
  prodAttachments:AttachmentRefOrValue[]=[];
  attachToCreate:AttachmentRefOrValue={url:'',attachmentType:''};
  attImageName = new FormControl('', [Validators.required, Validators.pattern('^https?:\\/\\/.*\\.(?:png|jpg|jpeg|gif|bmp|webp)$')])

  //FINAL PRODUCT USING API CALL STRUCTURE
  productSpecToCreate:ProductSpecification_Create | undefined;

  errorMessage:any='';
  showError:boolean=false;

  //CHARS
  stringValue: string = '';
  numberValue: string = '';
  numberUnit: string = '';
  fromValue: string = '';
  toValue: string = '';
  rangeUnit: string = '';

  filenameRegex = /^[A-Za-z0-9_.-]+$/;

  constructor(
    private readonly prodSpecService: ProductSpecServiceService,
    private readonly cdr: ChangeDetectorRef,
    private readonly localStorage: LocalStorageService,
    private readonly eventMessage: EventMessageService,
    private readonly attachmentService: AttachmentServiceService,
    private readonly paginationService: PaginationService
  ) {
    for(const element of certifications){
      this.availableISOS.push(element)
    }
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if (this.showEmoji) {
      this.showEmoji = false;
      this.cdr.detectChanges();
    }
    if(this.showUploadFile){
      this.showUploadFile=false;
      this.cdr.detectChanges();
    }
  }

  @ViewChild('attachName') attachName!: ElementRef;
  @ViewChild('imgURL') imgURL!: ElementRef;
  

  public files: NgxFileDropEntry[] = [];

  ngOnInit() {
    this.initPartyInfo();
    if (this.IS_ISBE) {
      this.stepsElements = this.stepsElements.filter(s => s !== 'compliance');
      this.stepsCircles = this.stepsCircles.filter(c => c !== 'compliance-circle');
    }
  }

  initPartyInfo(){
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(JSON.stringify(aux) != '{}' && (((aux.expire - moment().unix())-4) > 0)) {
      if(aux.logged_as==aux.id){
        this.seller = aux.seller;
      } else {
        let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as)
        this.seller = loggedOrg.seller
      }
    }
  }

  goBack() {
    this.eventMessage.emitSellerProductSpec(true);
  }

  togglePreview(){
    if(this.generalForm.value.description){
      this.description=this.generalForm.value.description;
    } else {
      this.description=''
    }
  }

  toggleGeneral(){
    this.selectStep('general-info','general-circle');
    this.showBundle=false;
    this.showGeneral=true;
    this.showCompliance=false;
    this.showChars=false;
    this.showAttach=false;
    this.showRelationships=false;
    this.showSummary=false;
    this.showPreview=false;
    this.refreshChars();
  }

  toggleBundle(){
    this.selectStep('bundle','bundle-circle');
    this.showBundle=true;
    this.showGeneral=false;
    this.showCompliance=false;
    this.showChars=false;
    this.showAttach=false;
    this.showRelationships=false;
    this.showSummary=false;
    this.showPreview=false;
    this.refreshChars();
  }

  toggleBundleCheck(){
    this.prodSpecs=[];
    this.bundlePage=0;
    this.bundleChecked=!this.bundleChecked;
    if(this.bundleChecked){
      this.loadingBundle=true;
      this.getProdSpecs(false);
    } else {
      this.prodSpecsBundle=[];
    }
  }

  async getProdSpecs(next:boolean){
    if(!next){
      this.loadingBundle=true;
    }
    
    let options = {
      "filters": ['Active','Launched'],
      "seller": this.seller
    }

    this.paginationService.getItemsPaginated(this.bundlePage, this.PROD_SPEC_LIMIT, next, this.prodSpecs,this.nextProdSpecs, options,
      this.prodSpecService.getProdSpecByUser.bind(this.prodSpecService)).then(data => {
      this.bundlePageCheck=data.page_check;      
      this.prodSpecs=data.items;
      this.nextProdSpecs=data.nextItems;
      this.bundlePage=data.page;
      this.loadingBundle=false;
      this.loadingBundle_more=false;
    })
  }

  async nextBundle(){
    await this.getProdSpecs(true);
  }

  addProdToBundle(prod:any){
    const index = this.prodSpecsBundle.findIndex(item => item.id === prod.id);
    if (index !== -1) {
      this.prodSpecsBundle.splice(index, 1);
    } else {
      this.prodSpecsBundle.push({
        id: prod.id,
        href: prod.href,
        lifecycleStatus: prod.lifecycleStatus,
        name: prod.name
      });
    }    
    this.cdr.detectChanges();
  }

  isProdInBundle(prod:any){
    const index = this.prodSpecsBundle.findIndex(item => item.id === prod.id);
    if (index !== -1) {
      return true
    } else {
      return false;
    } 
  }

  toggleCompliance(){
    this.selectStep('compliance','compliance-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showCompliance=true;
    this.showChars=false;
    this.showAttach=false;
    this.showRelationships=false;
    this.showSummary=false;
    this.showPreview=false;
    this.refreshChars();
  }

  addISO(iso:any){
    const index = this.availableISOS.findIndex(item => item.name === iso.name);
    if (index !== -1) {
      this.availableISOS.splice(index, 1);
      this.selectedISOS.push({name: iso.name, url: '', mandatory: iso.mandatory, domesupported: iso.domesupported});
    }
    this.buttonISOClicked=!this.buttonISOClicked;
    this.cdr.detectChanges();
  }

  removeISO(iso:any){
    const index = this.selectedISOS.findIndex(item => item.name === iso.name);
    if (index !== -1) {
      this.selectedISOS.splice(index, 1);
      this.availableISOS.push({name: iso.name, mandatory: iso.mandatory, domesupported: iso.domesupported});
    }  
    this.cdr.detectChanges(); 
  }

  removeSelfAtt(){
    const index = this.finishChars.findIndex(item => item.name === this.selfAtt.name);
    if (index !== -1) {
      this.finishChars.splice(index, 1);
    }
    this.selfAtt='';
    this.cdr.detectChanges();
  }

  checkValidISOS():boolean{
    let invalid = this.selectedISOS.find((p => {
      return p.url === ''
    }));
    if(invalid){
      return true;
    } else {
      return false;
    }
    
  }

  public dropped(files: NgxFileDropEntry[],sel:any) {
    this.files = files;
    for (const droppedFile of files) {
 
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              const base64String: string = e.target.result.split(',')[1];
              let prod_name='';
              if(this.generalForm.value.name!=null){
                prod_name=this.generalForm.value.name.replaceAll(/\s/g,'')+'_';
              }
              let fileBody = {
                content: {
                  name: prod_name+file.name,
                  data: base64String
                },
                contentType: file.type,
                isPublic: true
              }
              if(!this.isValidFilename(fileBody.content.name)){
                this.errorMessage='File names can only include alphabetical characters (A-Z, a-z) and a limited set of symbols, such as underscores (_), hyphens (-), and periods (.)';
                console.error('There was an error while uploading file!');
                this.showError=true;
                setTimeout(() => {
                  this.showError = false;
                }, 3000);
                return;
              }
              //IF FILES ARE HIGHER THAN 3MB THROW AN ERROR
              if(file.size>this.MAX_FILE_SIZE){
                this.errorMessage='File size must be under 3MB.';
                console.error('There was an error while uploading file!');
                this.showError=true;
                setTimeout(() => {
                  this.showError = false;
                }, 3000);
                return;
              }
              if(this.showCompliance && !this.showUploadAtt){
                const index = this.selectedISOS.findIndex(item => item.name === sel.name);
                this.attachmentService.uploadFile(fileBody).subscribe({
                  next: data => {
                      this.selectedISOS[index].url=data.content;
                      this.showUploadFile=false;
                      this.cdr.detectChanges();
                  },
                  error: error => {
                      console.error('There was an error while uploading the file!', error);
                      if(error.error.error){
                        console.error(error)
                        this.errorMessage='Error: '+error.error.error;
                      } else {
                        this.errorMessage='There was an error while uploading the file!';
                      }
                      if (error.status === 413) {
                        this.errorMessage='File size too large! Must be under 3MB.';
                      }
                      this.showError=true;
                      setTimeout(() => {
                        this.showError = false;
                      }, 3000);
                  }
                });
              }
              if(this.showUploadAtt){
                const index = this.finishChars.findIndex(item => item.name === this.selfAtt.name);
                this.attachmentService.uploadFile(fileBody).subscribe({
                  next: data => {
                      if (index !== -1) {
                        this.selfAtt.productSpecCharacteristicValue=[{
                          isDefault: true,
                          value: data.content
                        }];
                        this.finishChars[index] = this.selfAtt;
                      } else {
                        this.selfAtt = {
                          id: 'urn:ngsi-ld:characteristic:'+uuidv4(),
                          name: 'Compliance:SelfAtt',
                          productSpecCharacteristicValue: [{
                            isDefault: true,
                            value: data.content
                          }]
                        }
                        this.finishChars.push(this.selfAtt)
                      }
                      this.showUploadFile=false;
                      this.showUploadAtt=false;
                      this.cdr.detectChanges();
                  },
                  error: error => {
                      console.error('There was an error while uploading the file!', error);
                      if(error.error.error){
                        console.error(error)
                        this.errorMessage='Error: '+error.error.error;
                      } else {
                        this.errorMessage='There was an error while uploading the file!';
                      }
                      if (error.status === 413) {
                        this.errorMessage='File size too large! Must be under 3MB.';
                      }
                      this.showError=true;
                      setTimeout(() => {
                        this.showError = false;
                      }, 3000);
                  }
                });
              }
              if(this.showAttach){
                this.attachmentService.uploadFile(fileBody).subscribe({
                  next: data => {
                      if(sel=='img'){
                        if(file.type.startsWith("image")){
                          this.showImgPreview=true;
                          this.imgPreview=data.content;
                          this.prodAttachments.push({
                            name: 'Profile Picture',
                            url: this.imgPreview,
                            attachmentType: file.type
                          })
                        } else {
                          this.errorMessage='File must have a valid image format!';
                          this.showError=true;
                          setTimeout(() => {
                            this.showError = false;
                          }, 3000);
                        }
                      } else {
                        this.attachToCreate={url:data.content,attachmentType:file.type};
                      }

                      this.cdr.detectChanges();
                  },
                  error: error => {
                      console.error('There was an error while uploading!', error);
                      if(error.error.error){
                        console.error(error)
                        this.errorMessage='Error: '+error.error.error;
                      } else {
                        this.errorMessage='There was an error while uploading the file!';
                      }
                      if (error.status === 413) {
                        this.errorMessage='File size too large! Must be under 3MB.';
                      }
                      this.showError=true;
                      setTimeout(() => {
                        this.showError = false;
                      }, 3000);
                  }
                });
              }
            };
            reader.readAsDataURL(file);
          }
 
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  isValidFilename(filename: string): boolean {
    return this.filenameRegex.test(filename);
  }
 
  public fileOver(event: any){
    console.log(event);
  }
 
  public fileLeave(event: any){
    console.log('leave')
    console.log(event);
  }

  toggleUploadSelfAtt(){
    this.showUploadFile=true;
    this.showUploadAtt=true;
  }

  toggleUploadFile(sel:any){
    this.showUploadFile=true;
    this.selectedISO=sel;    
  }

  uploadFile(){
    console.log('uploading...')
  }

  toggleChars(){
    this.selectStep('chars','chars-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showCompliance=false;
    this.showChars=true;
    this.showAttach=false;
    this.showRelationships=false;
    this.showSummary=false;

    this.showCreateChar=false;
    this.stringCharSelected=true;
    this.numberCharSelected=false;
    this.rangeCharSelected=false;
    this.showPreview=false;
    this.refreshChars();
  }

  toggleAttach(){
    this.selectStep('attach','attach-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showCompliance=false;
    this.showChars=false;
    this.showAttach=true;
    this.showRelationships=false;
    this.showSummary=false;
    this.showPreview=false;
    setTimeout(() => {        
      initFlowbite();   
    }, 100);
    this.refreshChars();
  }

  removeImg(){    
    this.showImgPreview=false;
    const index = this.prodAttachments.findIndex(item => item.url === this.imgPreview);
    if (index !== -1) {
      this.prodAttachments.splice(index, 1);
    }
    this.imgPreview='';
    this.cdr.detectChanges();
  }

  saveImgFromURL(){
    this.showImgPreview=true;
    this.imgPreview=this.imgURL.nativeElement.value;
    this.prodAttachments.push({
      name: 'Profile Picture',
      url: this.imgPreview,
      attachmentType: 'Picture'
    })
    this.attImageName.reset();
    this.cdr.detectChanges();
  }

  toggleRelationship(){
    this.prodSpecRels=[];
    this.prodSpecRelPage=0;
    this.showCreateRel=false;
    this.loadingprodSpecRel=true;
    this.getProdSpecsRel(false);
    this.selectStep('relationships','relationships-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showCompliance=false;
    this.showChars=false;
    this.showAttach=false;
    this.showRelationships=true;
    this.showSummary=false;
    this.showPreview=false;
    this.refreshChars();
  }

  async getProdSpecsRel(next:boolean){
    if(!next){
      this.loadingprodSpecRel=true;
    }
    
    let options = {
      "filters": ['Active','Launched'],
      "seller": this.seller
    }

    this.paginationService.getItemsPaginated(this.prodSpecRelPage, this.PROD_SPEC_LIMIT, next, this.prodSpecRels, this.nextProdSpecRels, options,
      this.prodSpecService.getProdSpecByUser.bind(this.prodSpecService)).then(data => {
      this.prodSpecRelPageCheck=data.page_check;      
      this.prodSpecRels=data.items;
      this.nextProdSpecRels=data.nextItems;
      this.prodSpecRelPage=data.page;
      this.loadingprodSpecRel=false;
      this.loadingprodSpecRel_more=false;
    })
  }

  selectRelationship(rel:any){
    this.selectedProdSpec=rel;
  }

  async nextProdSpecsRel(){
    await this.getProdSpecsRel(true);
  }

  onRelChange(event: any) {
    this.selectedRelType=event.target.value
  }

  saveRel(){
    this.showCreateRel=false;
    this.prodRelationships.push({
      id: this.selectedProdSpec.id,
      href: this.selectedProdSpec.href,
      relationshipType: this.selectedRelType,
      productSpec: this.selectedProdSpec
    });
    this.selectedRelType='migration';
  }

  deleteRel(rel:any){
    const index = this.prodRelationships.findIndex(item => item.id === rel.id);
    if (index !== -1) {
      this.prodRelationships.splice(index, 1);
    }   
    this.cdr.detectChanges(); 
  }

  refreshChars(){
    this.stringValue= '';
    this.numberValue = '';
    this.numberUnit = '';
    this.fromValue = '';
    this.toValue = '';
    this.rangeUnit = '';
    this.stringCharSelected=true;
    this.numberCharSelected=false;
    this.rangeCharSelected=false;
    this.creatingChars=[];
  }

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
      } else {
        console.log('already unselected')
      }
    }
  }

  selectMenu(elem:HTMLElement| null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        console.log('already selected')
      } else {
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
      for(const element of this.stepsElements){
        this.unselectMenu(document.getElementById(element),'text-primary-100 dark:text-primary-50')
        this.selectMenu(document.getElementById(element),'text-gray-500') 
      }
      this.stepsElements.push(step);
    }
    const circleIndex = this.stepsCircles.findIndex(item => item === stepCircle);
    if (index !== -1) {
      this.stepsCircles.splice(circleIndex, 1);
      this.selectMenu(document.getElementById(stepCircle),'border-primary-100 dark:border-primary-50')
      this.unselectMenu(document.getElementById(stepCircle),'border-gray-400');
      for(const element of this.stepsCircles){
        this.unselectMenu(document.getElementById(element),'border-primary-100 dark:border-primary-50')
        this.selectMenu(document.getElementById(element),'border-gray-400');
      }
      this.stepsCircles.push(stepCircle);
    }
  }

  onTypeChange(event: any) {
    if(event.target.value=='string'){
      this.stringCharSelected=true;
      this.numberCharSelected=false;
      this.rangeCharSelected=false;
    }else if (event.target.value=='number'){
      this.stringCharSelected=false;
      this.numberCharSelected=true;
      this.rangeCharSelected=false;
    }else{
      this.stringCharSelected=false;
      this.numberCharSelected=false;
      this.rangeCharSelected=true;
    }
    this.creatingChars=[];
  }

  addCharValue(){
    if(this.stringCharSelected){
      if(this.creatingChars.length==0){
        this.creatingChars.push({
          isDefault:true,
          value:this.stringValue as any
        })
      } else{
        this.creatingChars.push({
          isDefault:false,
          value:this.stringValue as any
        })
      }
      this.stringValue='';  
    } else if (this.numberCharSelected){
      if(this.creatingChars.length==0){
        this.creatingChars.push({
          isDefault:true,
          value:this.numberValue as any,
          unitOfMeasure:this.numberUnit
        })
      } else{
        this.creatingChars.push({
          isDefault:false,
          value:this.numberValue as any,
          unitOfMeasure:this.numberUnit
        })
      }
      this.numberUnit='';
      this.numberValue='';
    }else{
      if(this.creatingChars.length==0){
        this.creatingChars.push({
          isDefault:true,
          valueFrom:this.fromValue as any,
          valueTo:this.toValue as any,
          unitOfMeasure:this.rangeUnit
        })
      } else{
        this.creatingChars.push({
          isDefault:false,
          valueFrom:this.fromValue as any,
          valueTo:this.toValue as any,
          unitOfMeasure:this.rangeUnit})
      } 
    }
    this.fromValue='';
    this.toValue='';
    this.rangeUnit='';
  }

  removeCharValue(char:any,idx:any){
    this.creatingChars.splice(idx, 1);
  }

  selectDefaultChar(char:any,idx:any){
    for(let i=0;i<this.creatingChars.length;i++){
      if(i==idx){
        this.creatingChars[i].isDefault=true;
      } else {
        this.creatingChars[i].isDefault=false;
      }
    }
  }

  saveChar(){
    if(this.charsForm.value.name!=null){
      this.prodChars.push({
        id: 'urn:ngsi-ld:characteristic:'+uuidv4(),
        name: this.charsForm.value.name,
        description: this.charsForm.value.description ?? '',
        productSpecCharacteristicValue: this.creatingChars
      })
    }

    this.charsForm.reset();
    this.creatingChars=[];
    this.showCreateChar=false;
    this.stringCharSelected=true;
    this.numberCharSelected=false;
    this.rangeCharSelected=false;
    this.refreshChars();
    this.cdr.detectChanges();
  }

  deleteChar(char:any){
    const index = this.prodChars.findIndex(item => item.id === char.id);
    if (index !== -1) {
      this.prodChars.splice(index, 1);
    }   
    this.cdr.detectChanges();   
  }

  checkInput(value: string): boolean {
    return value.trim().length === 0;
  }

  showFinish(){
    this.relationshipDone=true;
    this.finishDone=true;
    for(const element of this.prodChars){
      const index = this.finishChars.findIndex(item => item.name === element.name);
      if (index == -1) {
        this.finishChars.push(element)
      }
    }
    for(const element of this.selectedISOS){
      const index = this.finishChars.findIndex(item => item.name === element.name);
      if (index == -1) {
        this.finishChars.push({
          id: 'urn:ngsi-ld:characteristic:'+uuidv4(),
          name: element.name,
          productSpecCharacteristicValue: [{
            isDefault: true,
            value: element.url
          }]
        })
      }
    }
    let rels = [];
    for(const element of this.prodRelationships){
      rels.push({
        id: element.id,
        href: element.href,
        name: element.name,
        relationshipType: element.relationshipType
      })
    }
    
    if(this.generalForm.value.name!=null && this.generalForm.value.version!=null && this.generalForm.value.brand!=null){
      this.productSpecToCreate={
        name: this.generalForm.value.name,
        description: this.generalForm.value.description ?? '',
        version: this.generalForm.value.version,
        brand: this.generalForm.value.brand,
        productNumber: this.generalForm.value.number ?? '',
        lifecycleStatus: "Active",
        isBundle: this.bundleChecked,
        bundledProductSpecification: this.prodSpecsBundle,
        productSpecCharacteristic: this.finishChars,
        productSpecificationRelationship: rels,
        attachment: this.prodAttachments,
        relatedParty: [
          {
              id: this.seller,
              role: "Owner",
              "@referredType": ''
          }
        ],
      }
    }
    
    this.selectStep('summary','summary-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showCompliance=false;
    this.showChars=false;
    this.showAttach=false;
    this.showRelationships=false;
    this.showSummary=true;
    this.showPreview=false;
    this.refreshChars();
  }

  createProduct(){
    this.prodSpecService.postProdSpec(this.productSpecToCreate).subscribe({
      next: data => {
        this.goBack();
      },
      error: error => {
        console.error('There was an error while creating!', error);
        if(error.error.error){
          this.errorMessage='Error: '+error.error.error;
        } else {
          this.errorMessage='There was an error while creating the product!';
        }
        this.showError=true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    });
  }

}
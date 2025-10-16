import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {NgClass, NgIf} from "@angular/common";
import {ApiServiceService} from "../../../services/product-service.service";
import { lastValueFrom } from 'rxjs';
import {components} from "src/app/models/product-catalog";
import {EventMessageService} from "src/app/services/event-message.service";
import {FormChangeState, PricePlanChangeState} from "../../../models/interfaces";
import {Subscription} from "rxjs";
import * as moment from 'moment';
import { certifications } from 'src/app/models/certification-standards.const';
import { UsageSpecGeneralInfoComponent } from './usage-spec-general-info/usage-spec-general-info.component'
import { UsageSpecMetricsComponent } from './usage-spec-metrics/usage-spec-metrics.component'
import { UsageSpecSummaryComponent } from './usage-spec-summary/usage-spec-summary.component'
import { AccountServiceService } from 'src/app/services/account-service.service'
import { UsageServiceService } from 'src/app/services/usage-service.service'
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'usage-spec-form',
  standalone: true,
  imports: [
    UsageSpecGeneralInfoComponent,
    UsageSpecMetricsComponent,
    UsageSpecSummaryComponent,
    TranslateModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './usage-spec.component.html',
  styleUrl: './usage-spec.component.css'
})
export class UsageSpecComponent implements OnInit {

  @Input() formType: 'create' | 'update' = 'create';
  @Input() usageSpec: any = {};
  @Input() seller: any;

  usageSpecForm: FormGroup;
  currentStep = 0;
  highestStep = 0;
  steps = [
    'General Info',
    'Metrics',
    'Summary'
  ];
  isFormValid = false;
  loadingData:boolean=false;

  errorMessage:any='';
  showError:boolean=false;

  private formChanges: { [key: string]: FormChangeState } = {};
  private formSubscription: Subscription | null = null;
  hasChanges: boolean = false;

  constructor(private api: ApiServiceService,
              private eventMessage: EventMessageService,
              private fb: FormBuilder,
              private accService: AccountServiceService,
              private usageSpecService: UsageServiceService) {

    this.usageSpecForm = this.fb.group({
      generalInfo: this.fb.group({}),
      metrics: new FormControl([])
    });

    // Subscribe to form validation changes
    this.usageSpecForm.statusChanges.subscribe(status => {
      this.isFormValid = status === 'VALID';
    });

    // Subscribe to subform changes
    this.formSubscription = this.eventMessage.messages$.subscribe(message => {
      if (message.type === 'SubformChange') {
        const changeState = message.value as FormChangeState;
        this.handleSubformChange(changeState);
      }
    });
  }

  handleSubformChange(change: FormChangeState) {
    this.formChanges[change.subformType] = change;
    this.hasChanges = Object.keys(this.formChanges).length > 0;
  }

  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  goToStep(index: number) {
    // Solo validar en modo creación
    if (this.formType === 'create' && index > this.currentStep) {
      // Validar el paso actual
      const currentStepValid = this.validateCurrentStep();
      if (!currentStepValid) {
        return; // No permitir avanzar si el paso actual no es válido
      }
    }
    
    this.currentStep = index;
    if(this.currentStep>this.highestStep){
      this.highestStep=this.currentStep
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0: // General Info
        return this.usageSpecForm.get('generalInfo')?.valid || false;
      case 1: // Metrics
        return true;
      default:
        return true;
    }
  }

  canNavigate(index: number) {
    if(this.formType == 'create'){
      return (this.usageSpecForm.get('generalInfo')?.valid &&  (index <= this.currentStep)) || (this.usageSpecForm.get('generalInfo')?.valid &&  (index <= this.highestStep));
    } else {
      return this.usageSpecForm.get('generalInfo')?.valid
    }
  }  

  handleStepClick(index: number): void {
    if (this.canNavigate(index)) {
      this.goToStep(index);
    }
  }
  

  submitForm() {
    if (this.formType === 'update') {
      // Aquí irá la lógica de actualización
      // Por ahora solo mostramos los cambios
      this.updateUsageSpec();
    } else {
      // Lógica de creación existente
      this.createUsageSpec();
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.formType === 'update' && this.usageSpec) {
      this.loadingData=true;
      await this.loadUsageSpecData();
      this.loadingData=false;
    }
  }

  loadUsageSpecData(){
    if(this.usageSpec){
      const metrics = this.usageSpec.specCharacteristic = this.usageSpec.specCharacteristic.map((item: any) => ({
        ...item,
        id: uuidv4()
      }));
      this.usageSpecForm.patchValue({
        generalInfo: {
          name: this.usageSpec.name,
          description: this.usageSpec.description
        },
        metrics: metrics
      });
    }
  }

  async createUsageSpec(){

    const formValue = this.usageSpecForm.value;
    const generalInfo = formValue.generalInfo;
    const metrics = formValue.metrics.map(({ id, ...rest }: any) => rest);

    const usageSpec: any = {
      name: generalInfo.name,
      description: generalInfo.description || '',
      specCharacteristic: metrics,
      relatedParty: [
        {
          id: this.seller,
          href: this.seller,
        }
      ],
    }

    this.usageSpecService.postUsageSpec(usageSpec).subscribe({
      next: data => {
        this.goBack();
      },
      error: error => {
        console.error('There was an error while creating the usageSpec!', error);
        if(error.error.error){
          console.error(error)
          this.errorMessage='Error: '+error.error.error;
        } else {
          this.errorMessage='There was an error while creating the usageSpec!';
        }
        this.showError=true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    });

  }

  async updateUsageSpec(){

    // Preparar el payload base con los datos que no han cambiado
    const basePayload: any = {
      name: this.usageSpec.name,
      description: this.usageSpec.description,
      specCharacteristic: this.usageSpec.specCharacteristic
    };

    // Procesar cada cambio emitido por los subformularios
    for (const [subformType, change] of Object.entries(this.formChanges)) {

      switch (subformType) {
        case 'generalInfo':
          // Actualizar información general
          basePayload.name = change.currentValue.name;
          basePayload.description = change.currentValue.description;
          break;
        case 'metrics':
          // Actualizar metricas
          const metrics = change.currentValue.map((metric: any) => ({
            name: metric.name,
            description: metric.description,
            valueType: 'number'
          }));
          basePayload.specCharacteristic = metrics
          break;
      }
    }

    try {
      // Llamar a la API para actualizar la oferta
      await lastValueFrom(this.usageSpecService.updateUsageSpec(basePayload, this.usageSpec.id));
      this.goBack();
    } catch (error: any) {
      console.error('❌ Error updating Usage Spec:', error);
      this.errorMessage = error?.error?.error ? 'Error: ' + error.error.error : '¡Se produjo un error al actualizar la especificación de uso!';
      this.showError = true;
      setTimeout(() => (this.showError = false), 3000);
    }
  }


  goBack() {
    this.eventMessage.emitUsageSpecList(true);
  }

}

import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {MarkdownTextareaComponent} from "../../markdown-textarea/markdown-textarea.component";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EventMessageService} from "src/app/services/event-message.service";
import {StatusSelectorComponent} from "../../../lifecycle-status/status-selector/status-selector.component";
import {TranslateModule} from "@ngx-translate/core";
import {FormChangeState} from "../../../../models/interfaces";

interface License {
  treatment: string;
  description: string;
}

@Component({
  selector: 'app-license-form',
  standalone: true,
    imports: [
        MarkdownTextareaComponent,
        ReactiveFormsModule,
        TranslateModule
    ],
  templateUrl: './license.component.html',
  styleUrl: './license.component.css'
})
export class LicenseComponent implements OnInit, OnDestroy {
  @Input() form!: AbstractControl;
  @Input() formType!: string;
  @Input() data: any;
  @Output() formChange = new EventEmitter<FormChangeState>();

  constructor(
    private eventMessage: EventMessageService) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'UpdateOffer') {
        if (this.isEditMode && this.hasBeenModified && this.originalValue) {
          const currentValue = {
            treatment: this.treatmentControl?.value || '',
            description: this.descControl?.value || ''
          };
          
          const dirtyFields = this.getDirtyFields(currentValue);
          
          if (dirtyFields.length > 0) {
            const changeState: FormChangeState = {
              subformType: 'license',
              isDirty: true,
              dirtyFields,
              originalValue: this.originalValue,
              currentValue
            };
    
            this.formChange.emit(changeState);
          }
        }
      }
    })
  } 

  freeLicenseSelected: boolean = false;
  private originalValue: License | null = null;
  private hasBeenModified: boolean = false;
  private isEditMode: boolean = false;

  get formGroup(): FormGroup {
    return this.form as FormGroup;  // Lo convierte en FormGroup
  }

  get treatmentControl(): FormControl | null {
    const control = this.formGroup.get('treatment');
    return control instanceof FormControl ? control : null;
  }

  get descControl(): FormControl | null {
    const control = this.formGroup.get('description');
    return control instanceof FormControl ? control : null;
  }

  ngOnInit() {
    this.isEditMode = this.formType === 'update';

    if (this.isEditMode && this.data) {
      //LICENSE
      if (Array.isArray(this.data.productOfferingTerm)) {
        this.formGroup.addControl('treatment', new FormControl<string>(this.data.productOfferingTerm[0].name));
        this.formGroup.addControl('description', new FormControl<string>(this.data.productOfferingTerm[0].description));
        
        // Store original value only in edit mode
        this.originalValue = {
          treatment: this.data.productOfferingTerm[0].name,
          description: this.data.productOfferingTerm[0].description
        };
      } else {
        this.formGroup.addControl('treatment', new FormControl<string>(''));
        this.formGroup.addControl('description', new FormControl<string>(''));
      }
    } else {
      this.formGroup.addControl('treatment', new FormControl<string>(''));
      this.formGroup.addControl('description', new FormControl<string>(''));
    }

    // Subscribe to form changes only in edit mode
    if (this.isEditMode) {
      this.formGroup.valueChanges.subscribe(() => {
        this.hasBeenModified = true;
      });
    }
  }

  ngOnDestroy() {    
    // Solo emitir cambios si estamos en modo edición y hay cambios reales
    if (this.isEditMode && this.hasBeenModified && this.originalValue) {
      const currentValue = {
        treatment: this.treatmentControl?.value || '',
        description: this.descControl?.value || ''
      };
      
      const dirtyFields = this.getDirtyFields(currentValue);
      
      if (dirtyFields.length > 0) {
        const changeState: FormChangeState = {
          subformType: 'license',
          isDirty: true,
          dirtyFields,
          originalValue: this.originalValue,
          currentValue
        };
        this.formChange.emit(changeState);
      }
    }
  }

  private getDirtyFields(currentValue: License): string[] {
    const dirtyFields: string[] = [];
    
    if (!this.originalValue) return dirtyFields;

    if (currentValue.treatment !== this.originalValue.treatment) {
      dirtyFields.push('treatment');
    }
    
    if (currentValue.description !== this.originalValue.description) {
      dirtyFields.push('description');
    }
    
    return dirtyFields;
  }
}

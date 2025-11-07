import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../../shared.module";
import {MarkdownTextareaComponent} from "../../markdown-textarea/markdown-textarea.component";
import {StatusSelectorComponent} from "../../../lifecycle-status/status-selector/status-selector.component";
import {EventMessageService} from "../../../../services/event-message.service";
import {FormChangeState} from "../../../../models/interfaces";
import {Subscription} from "rxjs";
import {debounceTime} from "rxjs/operators";
import { noWhitespaceValidator } from 'src/app/validators/validators';

interface GeneralInfo {
  name: string;
  description: string;
}

@Component({
  selector: 'usage-spec-general-info',
  standalone: true,
  imports: [    
    ReactiveFormsModule,
    SharedModule,
    MarkdownTextareaComponent,
    StatusSelectorComponent
  ],
  templateUrl: './usage-spec-general-info.component.html',
  styleUrl: './usage-spec-general-info.component.css'
})
export class UsageSpecGeneralInfoComponent implements OnInit, OnDestroy {
  @Input() form!: AbstractControl;
  @Input() formType!: string;
  @Input() data: any;
  @Output() formChange = new EventEmitter<FormChangeState>();

  private originalValue: GeneralInfo;
  private hasBeenModified: boolean = false;
  private isEditMode: boolean = false;

  constructor(private eventMessage: EventMessageService) {
  }

  get formGroup(): FormGroup {
    return this.form as FormGroup;
  }

  get nameControl(): FormControl | null {
    const control = this.formGroup.get('name');
    return control instanceof FormControl ? control : null;
  }

  get descControl(): FormControl | null {
    const control = this.formGroup.get('description');
    return control instanceof FormControl ? control : null;
  }

  ngOnInit() {
    this.isEditMode = this.formType === 'update';
    
    if (this.isEditMode && this.data) {
      this.formGroup.addControl('name', new FormControl<string>(this.data.name, [Validators.required, Validators.maxLength(100), noWhitespaceValidator]));
      this.formGroup.addControl('description', new FormControl<string>(this.data.description, Validators.maxLength(100000)));
      
      // Store original value only in edit mode
      this.originalValue = {
        name: this.data.name,
        description: this.data.description
      };
    } else {
      this.formGroup.addControl('name', new FormControl<string>('', [Validators.required, Validators.maxLength(100), noWhitespaceValidator]));
      this.formGroup.addControl('description', new FormControl<string>(''));
    }

    // Subscribe to form changes only in edit mode
    if (this.isEditMode) {
      this.formGroup.valueChanges.pipe(
        debounceTime(500) // Esperar 500ms después del último cambio antes de emitir
      ).subscribe((newValue) => {
        const dirtyFields = this.getDirtyFields(newValue);
        
        if (dirtyFields.length > 0) {
          this.hasBeenModified = true;
          const changeState: FormChangeState = {
            subformType: 'generalInfo',
            isDirty: true,
            dirtyFields,
            originalValue: this.originalValue,
            currentValue: newValue
          };
          this.eventMessage.emitSubformChange(changeState);
        } else {
          this.hasBeenModified = false;
        }
      });
    }
  }

  ngOnDestroy() {
  }

  private getDirtyFields(currentValue: GeneralInfo): string[] {
    return Object.keys(currentValue).filter(key => {
      const currentFieldValue = currentValue[key as keyof GeneralInfo];
      const originalFieldValue = this.originalValue[key as keyof GeneralInfo];
      return JSON.stringify(currentFieldValue) !== JSON.stringify(originalFieldValue);
    });
  }

  protected readonly FormControl = FormControl;


}

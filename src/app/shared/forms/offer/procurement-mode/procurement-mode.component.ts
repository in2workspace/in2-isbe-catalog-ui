import {AfterViewInit, ChangeDetectorRef, Component, forwardRef, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {DatePipe, NgClass, NgIf, NgTemplateOutlet} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {initFlowbite} from "flowbite";
import {FormChangeState} from "../../../../models/interfaces";
import {EventMessageService} from "src/app/services/event-message.service";

interface ProcurementMode {
  id: string;
  name: string;
}

@Component({
  selector: 'app-procurement-mode',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProcurementModeComponent),
      multi: true
    }
  ],
  templateUrl: './procurement-mode.component.html',
  styleUrl: './procurement-mode.component.css'
})
export class ProcurementModeComponent implements ControlValueAccessor, AfterViewInit, OnInit, OnDestroy {
  @Input() form!: AbstractControl;
  @Input() formType!: string;
  @Input() data: any;
  @Output() formChange = new EventEmitter<FormChangeState>();

  procurementModes = [{
    id: 'manual',
    name: 'Manual'
  }, {
    id: 'payment-automatic',
    name: 'Payment Automatic - Procurement Manual'
  }, {
    id: 'automatic',
    name: 'Automatic'
  }];
  
  procurementMode: string = 'manual';
  private originalValue: ProcurementMode | null = null;
  private hasBeenModified: boolean = false;
  private isEditMode: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private eventMessage: EventMessageService) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'UpdateOffer') {
        if (this.isEditMode && this.hasBeenModified && this.originalValue) {
          const currentValue = {
            id: this.procurementMode,
            name: this.procurementModes.find(m => m.id === this.procurementMode)?.name || 'Manual'
          };
          
          // Solo emitir si el valor es diferente al original
          if (JSON.stringify(currentValue) !== JSON.stringify(this.originalValue)) {
            this.formChange.emit({
              subformType: 'procurement',
              isDirty: true,
              dirtyFields: ['id', 'name'],
              originalValue: this.originalValue,
              currentValue: currentValue
            });
          }
        }
      }
    })
  }

  // As ControlValueAccessor
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(pmode: any): void {
    if (pmode) {
      // Si es un objeto, usar el id directamente
      const selectedMode = pmode.id || pmode;
      this.procurementMode = selectedMode;
      
      // Actualizar el FormGroup si existe
      if (this.formGroup) {
        this.formGroup.patchValue({
          mode: selectedMode
        });
      }
      
      // Emitir el valor completo
      const mode = this.procurementModes.find(m => m.id === selectedMode);
      this.onChange(mode || { id: selectedMode, name: 'Manual' });
    }
  }

  get formGroup(): FormGroup {
    return this.form as FormGroup;
  }

  get modeControl(): FormControl | null {
    const control = this.formGroup.get('mode');
    return control instanceof FormControl ? control : null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  getInitialProcurementMode(): string {
    if (this.formType === 'update' && this.data?.productOfferingTerm) {
      const procurementTerm = this.data.productOfferingTerm.find(
        (term: any) => term.name === 'procurement'
      );
      return procurementTerm?.description || 'manual';
    }
    // Por defecto, si es creación o no encuentra el valor adecuado
    return 'manual';
  }

  ngOnInit() {
    const initialValue = this.getInitialProcurementMode();
    this.isEditMode = this.formType === 'update';

    // Inicializar el control del formulario
    this.formGroup.addControl('mode', new FormControl<string>(initialValue, [Validators.required]));
    
    // Guardar el valor original solo en modo edición
    if (this.isEditMode) {
      this.originalValue = {
        id: initialValue,
        name: this.procurementModes.find(m => m.id === initialValue)?.name || 'Manual'
      };
    }

    // Suscribirse a los cambios del formulario
    this.form.valueChanges.subscribe(value => {
      if (value && value.mode) {
        const mode = this.procurementModes.find(m => m.id === value.mode) || this.procurementModes[0];
        
        this.procurementMode = mode.id;
        this.hasBeenModified = true;
      }
    });
  }

  changeProcurement(event: any) {
    this.procurementMode = event.target.value;
    let pm = this.procurementModes.find(mode => mode.id === event.target.value);
    
    if (pm) {
      // Actualizar el FormGroup
      this.formGroup.patchValue({
        mode: event.target.value
      });
      
      this.hasBeenModified = true;
      
      // Emitir el valor completo
      this.onChange(pm);
    }
  }

  ngAfterViewInit() {
    // Forzar la detección de cambios después de que la vista esté lista
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy() {
    // Solo emitir cambios en modo edición y si ha habido modificaciones
    if (this.isEditMode && this.hasBeenModified && this.originalValue) {
      const currentValue = {
        id: this.procurementMode,
        name: this.procurementModes.find(m => m.id === this.procurementMode)?.name || 'Manual'
      };
      
      // Solo emitir si el valor es diferente al original
      if (JSON.stringify(currentValue) !== JSON.stringify(this.originalValue)) {
        this.formChange.emit({
          subformType: 'procurement',
          isDirty: true,
          dirtyFields: ['id', 'name'],
          originalValue: this.originalValue,
          currentValue: currentValue
        });
      }
    }
  }
}

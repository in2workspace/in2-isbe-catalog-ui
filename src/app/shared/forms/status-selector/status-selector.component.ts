import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {SharedModule} from "../../shared.module";
import { TranslateModule } from '@ngx-translate/core';

type StatusCode = 'active' | 'launched' | 'retired' | 'obsolete';

type StatusExternal = 'Active' | 'Launched' | 'Retired' | 'Obsolete';

const toExternal: Record<StatusCode, StatusExternal> = {
  active: 'Active',
  launched: 'Launched',
  retired: 'Retired',
  obsolete: 'Obsolete'
};

const toInternal: Record<StatusExternal, StatusCode> = {
  Active: 'active',
  Launched: 'launched',
  Retired: 'retired',
  Obsolete: 'obsolete'
};

@Component({
  selector: 'app-status-selector',
  standalone: true,
  imports: [
    SharedModule,TranslateModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StatusSelectorComponent),
      multi: true
    }
  ],
  templateUrl: './status-selector.component.html',
  styleUrl: './status-selector.component.css'
})

export class StatusSelectorComponent implements ControlValueAccessor {
  @Input() statuses: string[] = ['active', 'launched', 'retired', 'obsolete'];  // Estados disponibles
  selectedStatus: string = '';

  onChange = (status: string) => {};
  onTouched = () => {};

  writeValue(status: string): void {
    if (!status) { this.selectedStatus = ''; return; }

    const lowered = status.toLowerCase() as StatusCode;
    const isInternal = (['active','launched','retired','obsolete'] as const).includes(lowered);

    this.selectedStatus = isInternal
      ? lowered
      : toInternal[(status as StatusExternal)] ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.onChange(toExternal[status as StatusCode]); // Notifica al formulario padre
    this.onTouched();
  }

  getStatusClasses(status: string): string {
    const statusColors: Record<string, string> = {
      "active": 'text-[#269c43]',
      "launched": 'text-[#269c43]',
      "retired": 'text-[#b40404]',
      "obsolete": 'text-gray-800'
    };

    const baseClasses = "cursor-pointer flex items-center justify-center p-4 rounded-lg space-x-4 transition-all";

    return this.selectedStatus === status
      ? `${baseClasses} bg-[#d2e0f0] font-semibold ${statusColors[status] || 'text-gray-500'}`
      : `${baseClasses} text-gray-500 hover:bg-[#d2e0f0]`;
  }

  getFillColor(status: string): string {
    const statusColors: Record<string, string> = {
      "active": "#0f9d58",   // Verde
      "launched": "#269c43", // Verde oscuro
      "retired": "#b40404",  // Rojo oscuro
      "obsolete": "#000000"  // Negro
    };
    return this.selectedStatus === status ? statusColors[status] : "#808080";
  }

}

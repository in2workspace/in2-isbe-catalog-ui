import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {SharedModule} from "../../shared.module";
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';

type StatusCode = 'in_design' | 'active' | 'launched' | 'retired' | 'obsolete';

type StatusExternal = 'In design' | 'Active' | 'Launched' | 'Retired' | 'Obsolete';

const toExternal: Record<StatusCode, StatusExternal> = {
  in_design: 'In design',
  active: 'Active',
  launched: 'Launched',
  retired: 'Retired',
  obsolete: 'Obsolete'
};

const toInternal: Record<StatusExternal, StatusCode> = {
  'In design': 'in_design',
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
  @Input() statuses: string[] = ['in_design', 'active', 'launched', 'retired', 'obsolete'];  // Estados disponibles
  selectedStatus: string = '';
  disableLaunched: boolean;

  onChange = (status: string) => {};
  onTouched = () => {};

  constructor(private auth: AuthService) {
    this.auth.loginInfo$
      .pipe(take(1))
      .subscribe(li => {
        const roles = li?.roles ?? [];
        const names = (roles as any[]).map(r => (r?.name ?? r?.id ?? r));
        this.disableLaunched = !names.includes('admin');
      });
  }

  writeValue(status: string): void {
    if (!status) { this.selectedStatus = ''; return; }

    const lowered = status.toLowerCase() as StatusCode;
    const isInternal = (['in_design', 'active','launched','retired','obsolete'] as const).includes(lowered);

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
    if (this.disableLaunched && status === 'launched') return;
    this.selectedStatus = status;
    this.onChange(toExternal[status as StatusCode]); // Notifica al formulario padre
    this.onTouched();
  }

  getStatusClasses(status: string): string {
    const statusColors: Record<string, string> = {
      "in_design": 'text-[#808080]',
      "active": 'text-[#269c43]',
      "launched": 'text-[#269c43]',
      "retired": 'text-[#b40404]',
      "obsolete": 'text-gray-800'
    };

    const baseClasses = "cursor-pointer flex items-center justify-center p-4 rounded-lg space-x-4 transition-all";

    return this.selectedStatus === status
      ? `${baseClasses} bg-[#d2e0f0] dark:bg-primary-100 font-semibold ${statusColors[status] || 'text-gray-500'}`
      : `${baseClasses} text-gray-500 dark:text-gray-200 hover:bg-[#d2e0f0] dark:hover:bg-gray-700`;
  }

  getFillColor(status: string): string {
    const statusColors: Record<string, string> = {
      "in_design": "#a8a8a8", // Gris
      "active": "#0f9d58",   // Verde
      "launched": "#269c43", // Verde oscuro
      "retired": "#b40404",  // Rojo oscuro
      "obsolete": "#000000"  // Negro
    };
    return this.selectedStatus === status ? statusColors[status] : "#808080";
  }

}

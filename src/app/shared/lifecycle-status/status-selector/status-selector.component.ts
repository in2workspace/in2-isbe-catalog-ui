import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SharedModule } from "../../shared.module";
import { TranslateModule } from '@ngx-translate/core';
import {
  StatusCode, LIFECYCLE_STATES, normalizeToInternal, normalizeToExternal,
  ModelType, canTransitionFromAnchor, displayedFromAnchor
} from '../lifecycle-status';

@Component({
  selector: 'app-status-selector',
  standalone: true,
  imports: [SharedModule, TranslateModule],
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
export class StatusSelectorComponent implements ControlValueAccessor, OnChanges {

  @Input() statuses: StatusCode[] = [...LIFECYCLE_STATES];
  @Input() allowLaunched = false;
  @Input() modelType: ModelType = 'offering';

  /** ANCLA: estado persistido (interno) */
  @Input() anchor!: StatusCode;

  /** Selección temporal que se resalta en UI */
  selectedStatus: StatusCode | '' = '';

  /** CVA hooks */
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};
  disabled = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['anchor'] && this.anchor) {
      // cuando cambia el ancla desde el padre, reflejamos en la UI
      this.selectedStatus = this.anchor;
    }
  }

  /** CVA: valor que viene de ngModel (externo) */
  writeValue(status: string): void {
    const internal = normalizeToInternal(status);
    if (!internal) { this.selectedStatus = ''; return; }
    // si el padre no pasó anchor, usamos este como ancla inicial
    if (!this.anchor) this.anchor = internal as StatusCode;
    this.selectedStatus = internal;
  }

  /** CVA: registra callbacks */
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  /** Opciones visibles calculadas desde el ANCLA (sin multi-hop) */
  get displayedStatuses(): StatusCode[] {
    if (!this.anchor) return [];
    return displayedFromAnchor(this.statuses, this.anchor, this.modelType, this.allowLaunched);
  }

  selectStatus(next: string): void {
    if (this.disabled) return;

    const nextInternal = normalizeToInternal(next) as StatusCode;
    if (!nextInternal || !this.anchor) return;
    if (!this.displayedStatuses.includes(nextInternal)) return;
    if (!canTransitionFromAnchor(this.modelType, this.anchor, nextInternal, this.allowLaunched)) return;

    this.selectedStatus = nextInternal;
    // Emite EXTERNO (“Active”, “Launched”…) para ngModel
    this.onChange(normalizeToExternal(nextInternal));
    this.onTouched();
  }

  getStatusClasses(status: string): string {
    const statusColors: Record<string, string> = {
      "in_design": 'text-[#269c43]',
      "active": 'text-[#269c43]',
      "launched": 'text-[#269c43]',
      "retired": 'text-[#b40404]',
      "obsolete": 'text-gray-800'
    };

    const base = "flex items-center justify-center p-4 rounded-lg space-x-4 transition-all";
    const active = this.selectedStatus === status;
    const color = statusColors[status] || 'text-gray-500';

    const disabled = this.disabled || !this.displayedStatuses.includes(status as StatusCode);

    if (active) {
      return `${base} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} bg-[#d2e0f0] dark:bg-primary-100 font-semibold ${color}`;
    }
    return `${base} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-gray-500 dark:text-gray-200 hover:bg-[#d2e0f0] dark:hover:bg-gray-700`;
  }

  getFillColor(status: string): string {
    const statusColors: Record<string, string> = {
      "in_design": "#a8a8a8",
      "active": "#0f9d58",
      "launched": "#269c43",
      "retired": "#b40404",
      "obsolete": "#000000"
    };
    return this.selectedStatus === status ? statusColors[status] : "#808080";
  }
}

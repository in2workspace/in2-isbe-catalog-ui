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
  @Input() allowLaunched = true;
  @Input() modelType: ModelType = 'offering';

  @Input() anchor!: StatusCode;

  selectedStatus: StatusCode | '' = '';

  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};
  disabled = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['anchor'] && this.anchor) {
      this.selectedStatus = this.anchor;
    }
  }

  writeValue(status: string): void {
    const internal = normalizeToInternal(status);
    if (!internal) { this.selectedStatus = ''; return; }
    if (!this.anchor) this.anchor = internal as StatusCode;
    this.selectedStatus = internal;
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

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
    this.onChange(normalizeToExternal(nextInternal));
    this.onTouched();
  }

  getStatusClasses(status: string): string {
    const statusColors: Record<string, string> = {
      "in_design": 'text-primary-100 bg-secondary-300/30',
      "active": 'text-primary-100 bg-primary-50/30',
      "launched": 'text-primary-100 bg-green/30',
      "retired": 'text-primary-100 bg-gray-50/30',
      "obsolete": 'text-primary-100 bg-black/30'
    };

    const base = "flex items-center justify-center px-2 py-1.5 rounded gap-2 transition-all";
    const active = this.selectedStatus === status;
    const color = statusColors[status] || 'text-primary-100';

    const disabled = this.disabled || !this.displayedStatuses.includes(status as StatusCode);

    if (active) {
      return `${base} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}  font-semibold ${color}`;
    }
    return `${base} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-gray-500  hover:bg-gray-0`; 
  }

  getFillColor(status: string): string {
    const statusColors: Record<string, string> = {
      "in_design": "#000000",
      "active": "#000000",
      "launched": "#000000",
      "retired": "#000000",
      "obsolete": "#000000"
    };
    return this.selectedStatus === status ? statusColors[status] : "#808080";
  }
}

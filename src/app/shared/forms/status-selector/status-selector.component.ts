import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SharedModule } from "../../shared.module";
import { TranslateModule } from '@ngx-translate/core';
import { StatusCode, LIFECYCLE_STATES, normalizeToInternal, filterDisplayedStatuses, canTransition, normalizeToExternal } from '../../lifecycle-status/lifecycle-status';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

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
export class StatusSelectorComponent implements ControlValueAccessor {

  @Input() statuses: StatusCode[] = [...LIFECYCLE_STATES];
  allowLaunched: boolean = false;

  selectedStatus: StatusCode | '' = '';

  onChange = (_: string) => {};
  onTouched = () => {};

  constructor(private auth: AuthService) {
    this.auth.loginInfo$
      .pipe(take(1))
      .subscribe(li => {
        const roles = li?.roles ?? [];
        const names = (roles as any[]).map(r => (r?.name ?? r?.id ?? r));
        this.allowLaunched = names.includes('admin');
      });
  }

  writeValue(status: string): void {
    this.selectedStatus = normalizeToInternal(status);
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  get displayedStatuses(): StatusCode[] {
    return filterDisplayedStatuses(this.statuses, this.selectedStatus, this.allowLaunched);
  }

  selectStatus(next: string): void {
    const nextInternal = normalizeToInternal(next) as StatusCode;
    if (!nextInternal) return;

    if (!this.displayedStatuses.includes(nextInternal)) return;
    const from = (this.selectedStatus || 'in_design') as StatusCode;
    if (!canTransition(from, nextInternal)) return;

    this.selectedStatus = nextInternal;
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

    const disabled = !this.displayedStatuses.includes(status as StatusCode);

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

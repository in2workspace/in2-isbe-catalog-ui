import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { StatusSelectorComponent } from './status-selector.component';
import { TranslateModule } from '@ngx-translate/core';

jest.mock('../lifecycle-status', () => ({
  __esModule: true,
  LIFECYCLE_STATES: ['in_design', 'active', 'launched', 'retired', 'obsolete'],
  normalizeToInternal: (s: string | null) => {
    if (!s) return null;
    return s.startsWith('external_') ? s.replace('external_', '') : s;
  },
  normalizeToExternal: (s: string) => `external_${s}`,
  canTransitionFromAnchor: jest.fn(() => true),
  displayedFromAnchor: jest.fn((statuses: string[], anchor: string) => {
    const idx = statuses.indexOf(anchor);
    return idx >= 0 ? statuses.slice(idx) : [];
  }),
}));


describe('StatusSelectorComponent', () => {
  let component: StatusSelectorComponent;
  let fixture: ComponentFixture<StatusSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusSelectorComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges sets selectedStatus when anchor changes', () => {
    component.anchor = 'active';
    component.selectedStatus = '';
    component.ngOnChanges({
      anchor: { currentValue: 'active', previousValue: undefined, firstChange: true, isFirstChange: () => true } as any
    });
    expect(component.selectedStatus).toBe('active');
  });

  it('writeValue normalizes external value and sets anchor if missing', () => {
    component.anchor = undefined as any;
    component.selectedStatus = '';
    component.writeValue('external_active');
    expect(component.selectedStatus).toBe('active');
    expect(component.anchor).toBe('active');
  });

  it('selectStatus does nothing when disabled', () => {
    const onChangeMock = jest.fn();
    const onTouchedMock = jest.fn();
    component.registerOnChange(onChangeMock);
    component.registerOnTouched(onTouchedMock);

    component.disabled = true;
    component.anchor = 'in_design';
    component.selectStatus('active');

    expect(component.selectedStatus).not.toBe('active');
    expect(onChangeMock).not.toHaveBeenCalled();
    expect(onTouchedMock).not.toHaveBeenCalled();
  });

  it('selectStatus updates selectedStatus and calls onChange/onTouched when transition is allowed', () => {
    const onChangeMock = jest.fn();
    const onTouchedMock = jest.fn();
    component.registerOnChange(onChangeMock);
    component.registerOnTouched(onTouchedMock);

    component.disabled = false;
    component.anchor = 'in_design';
    component.selectStatus('active');

    expect(component.selectedStatus).toBe('active');
    expect(onChangeMock).toHaveBeenCalledWith('external_active');
    expect(onTouchedMock).toHaveBeenCalled();
  });

  it('getStatusClasses returns active styling for selected status and disabled styling when not displayed', () => {
    component.anchor = 'in_design';
    component.selectedStatus = 'active';
    component.disabled = false;

    const activeClasses = component.getStatusClasses('active');
    expect(activeClasses).toContain('bg-[#d2e0f0]');
    expect(activeClasses).toContain('font-semibold');
    component.anchor = undefined as any;
    const disabledClasses = component.getStatusClasses('retired');
    expect(disabledClasses).toContain('cursor-not-allowed');
  });

  it('getFillColor returns the mapped color for the selected status and default otherwise', () => {
    component.selectedStatus = 'active';
    expect(component.getFillColor('active')).toBe('#0f9d58');
    expect(component.getFillColor('in_design')).toBe('#808080');
  });
});

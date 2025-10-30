export type StatusCode = 'in_design' | 'active' | 'launched' | 'retired' | 'obsolete';
export type StatusExternal = 'In design' | 'Active' | 'Launched' | 'Retired' | 'Obsolete';

export const LIFECYCLE_STATES: readonly StatusCode[] = [
  'in_design', 'active', 'launched', 'retired', 'obsolete'
] as const;

export const toExternal: Record<StatusCode, StatusExternal> = {
  in_design: 'In design',
  active: 'Active',
  launched: 'Launched',
  retired: 'Retired',
  obsolete: 'Obsolete'
};

export const toInternal: Record<StatusExternal, StatusCode> = {
  'In design': 'in_design',
  Active: 'active',
  Launched: 'launched',
  Retired: 'retired',
  Obsolete: 'obsolete'
};

export const LIFECYCLE_TRANSITIONS: Record<StatusCode, StatusCode[]> = {
  in_design: ['active', 'launched'],
  active:    ['launched', 'retired'],
  launched:  ['retired'],
  retired:   ['obsolete'],
  obsolete:  []
};

export function canTransition(from: StatusCode, to: StatusCode): boolean {
  if (from === to) return true;
  return LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function normalizeToInternal(status: string | null | undefined): StatusCode | '' {
  if (!status) return '';
  const lowered = (status as string).toLowerCase() as StatusCode;
  if ((LIFECYCLE_STATES as readonly string[]).includes(lowered)) return lowered;
  return toInternal[status as StatusExternal] ?? '';
}

export function normalizeToExternal(status: StatusCode | ''): string {
  return status ? toExternal[status] : '';
}

export function filterDisplayedStatuses(
  base: readonly StatusCode[],
  current: StatusCode | '',
  allowLaunched: boolean
): StatusCode[] {
  return base.filter(s => {
    if (s !== 'launched') return true;
    return current === 'launched' || allowLaunched;
  });
}

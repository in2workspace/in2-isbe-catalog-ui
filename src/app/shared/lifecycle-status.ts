export type StatusCode = 'in_design' | 'active' | 'launched' | 'retired' | 'obsolete';
export type StatusExternal = 'In design' | 'Active' | 'Launched' | 'Retired' | 'Obsolete';
export type ModelType = 'offering' | 'spec' | 'category';

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

const GENERIC_TRANSITIONS: Record<StatusCode, StatusCode[]> = {
  in_design: ['active', 'launched'],
  active:    ['launched', 'retired'],
  launched:  ['retired'],
  retired:   ['obsolete'],
  obsolete:  []
};

const OFFERING_TRANSITIONS: Record<StatusCode, StatusCode[]> = {
  in_design: ['active'],
  active:    ['launched', 'retired'],
  launched:  ['retired'],
  retired:   ['obsolete'],
  obsolete:  []
};

export function normalizeToInternal(status: string | null | undefined): StatusCode | '' {
  if (!status) return '';
  const lowered = (status as string).toLowerCase() as StatusCode;
  if ((LIFECYCLE_STATES as readonly string[]).includes(lowered)) return lowered;
  return toInternal[status as StatusExternal] ?? '';
}

export function normalizeToExternal(status: StatusCode | ''): string {
  return status ? toExternal[status] : '';
}

function transitionsFor(model: ModelType) {
  return model === 'offering' ? OFFERING_TRANSITIONS : GENERIC_TRANSITIONS;
}

export function filterDisplayedStatuses(base: readonly StatusCode[], current: StatusCode | '', model: ModelType, allowLaunched: boolean): StatusCode[] {
  if (model !== 'offering') return [...base];
  return base.filter(s => {
    if (s !== 'launched') return true;
    return current === 'launched' || allowLaunched;
  });
}

export function canTransition(model: ModelType, from: StatusCode, to: StatusCode, allowLaunched: boolean): boolean {
  if (from === to) return true;

  const map = transitionsFor(model);
  const allowed = map[from]?.includes(to) ?? false;
  if (!allowed) return false;

  if (model === 'offering' && to === 'launched' && from !== 'launched') {
    return !!allowLaunched;
  }
  return true;
}

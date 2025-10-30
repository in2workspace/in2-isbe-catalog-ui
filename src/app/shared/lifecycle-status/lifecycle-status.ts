export type StatusCode = 'in_design' | 'active' | 'launched' | 'retired' | 'obsolete';
export type StatusExternal = 'In design' | 'Active' | 'Launched' | 'Retired' | 'Obsolete';
export type ModelType = 'offering' | 'spec' | 'category';

export const LIFECYCLE_STATES: readonly StatusCode[] = [
  'in_design','active','launched','retired','obsolete'
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

function mapFor(model: ModelType) {
  return model === 'offering' ? OFFERING_TRANSITIONS : GENERIC_TRANSITIONS;
}

export function allowedTargets(
  model: ModelType,
  from: StatusCode,
  allowLaunched: boolean
): StatusCode[] {
  const base = mapFor(model)[from] ?? [];
  if (model === 'offering' && !allowLaunched) {
    return base.filter(s => s !== 'launched');
  }
  return base;
}

export function displayedFromAnchor( base: readonly StatusCode[], anchor: StatusCode, model: ModelType, allowLaunched: boolean): StatusCode[] {
  const oneHop = allowedTargets(model, anchor, allowLaunched);
  const candidates = Array.from(new Set<StatusCode>([anchor, ...oneHop]))
    .filter(s => base.includes(s));

  if (model !== 'offering') return candidates;

  return candidates.filter(s => {
    if (s !== 'launched') return true;
    return anchor === 'launched' || allowLaunched;
  });
}

export function canTransitionFromAnchor( model: ModelType, anchor: StatusCode, to: StatusCode, allowLaunched: boolean): boolean {
  if (to === anchor) return true;
  return allowedTargets(model, anchor, allowLaunched).includes(to);
}

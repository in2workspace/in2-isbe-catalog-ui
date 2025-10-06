export interface LoginInfo {
  id: string;
  user: string;
  email: string;
  token: string;
  expire: number;
  seller: string;
  username: string;
  roles: Array<{ id: string; name: string }>;
  organizations: Array<{
    id: string;
    name: string;
    roles: Array<{ id: string; name: string }>;
    partyId?: string;
    description?: string;
  }>;
  logged_as: string;
}

function rolesFromPowers(vc: any): string[] {
  const powers: any[] = vc?.credentialSubject?.mandate?.power ?? [];
  const mandator = vc?.credentialSubject?.mandate?.mandator ?? {};
  const roleSet = new Set<string>();

  let hasOnboarding = false;

  for (const p of powers) {
    const fn = (p?.tmf_function || p?.function || '').toLowerCase();
    switch (fn) {
      case 'onboarding':
        roleSet.add('orgAdmin');
        hasOnboarding = true;
        break;
      case 'productoffering':
        roleSet.add('seller');
        break;
      case 'certification':
        roleSet.add('certifier');
        break;
      default:
        break;
    }
  }

  if (!hasOnboarding) {
    roleSet.add('individual');
  }

  const orgName = (mandator?.organization || '').toLowerCase();
  if (orgName.includes('in2')) {
    //roleSet.add('admin'); //TODO: check
  }

  return Array.from(roleSet);
}


export function claimsToLoginInfo(claims: any, token: string): LoginInfo {
  const exp: number = claims?.exp ?? 0;

  const vc = claims?.vc ?? {};
  const mandate = vc?.credentialSubject?.mandate ?? {};
  const mandatee = mandate?.mandatee ?? {};
  const mandator = mandate?.mandator ?? {};
  const issuer = vc?.issuer ?? {};

  const email: string = mandatee?.email ?? '';
  const userLocalPart = email.includes('@') ? email.split('@')[0] : (mandatee?.firstName || mandatee?.first_name || 'user').toLowerCase();

  const firstName = mandatee?.firstName ?? mandatee?.first_name ?? '';
  const lastName  = mandatee?.lastName  ?? mandatee?.last_name  ?? '';
  const username  = [firstName, lastName].filter(Boolean).join(' ').trim() || userLocalPart;

  const orgId   = mandator?.organizationIdentifier ?? issuer?.organizationIdentifier ?? '';
  const orgName = mandator?.organization ?? issuer?.organization ?? '';

  const roleStrings = rolesFromPowers(vc);
  const roleObjects = roleStrings.map(r => ({ id: r, name: r }));

  const organizations = orgId && orgName
    ? [{
        id: orgId,
        name: orgName,
        roles: roleObjects
      }]
    : [];

  return {
    id: vc?.id,
    user: userLocalPart,
    email,
    token,
    expire: exp,
    seller: roleStrings.includes('seller') ? 'seller' : '',
    username,
    roles: roleObjects,
    organizations,
    logged_as: orgId,
  };
}

// legacy-auth-adapter.service.ts
import { Injectable } from '@angular/core';

export interface LegacySession {
  isAuthenticated: boolean;
  accessToken?: string;
  roles: string[];
  exp?: number;
  claims?: any;
}

function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  if (pad) input += '='.repeat(pad);
  return atob(input);
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class LegacyTokenAdapterService {
  private readonly KEY = 'accessToken';

  read(): LegacySession {
    const token = localStorage.getItem(this.KEY);
    if (!token) return { isAuthenticated: false, roles: [] };

    const claims = decodeJwtPayload<any>(token);
    if (!claims) return { isAuthenticated: false, roles: [] };

    const now = Math.floor(Date.now() / 1000);
    const exp = typeof claims.exp === 'number' ? claims.exp : 0;
    // if (!exp || exp - now - 4 <= 0) return { isAuthenticated: false, roles: [] };

    let roles: string[] = [];
    if (Array.isArray(claims.roles)) roles = claims.roles;
    else if (typeof claims.role === 'string') roles = [claims.role];
    else if (claims.realm_access?.roles) roles = claims.realm_access.roles;
    else if (claims.resource_access) {
      const all = Object.values<any>(claims.resource_access).flatMap((r: any) => r?.roles ?? []);
      roles = Array.from(new Set(all));
    }

    return {
      isAuthenticated: true,
      accessToken: token,
      roles,
      exp,
      claims,
    };
  }

  clear(): void {
    localStorage.removeItem(this.KEY);
  }
}

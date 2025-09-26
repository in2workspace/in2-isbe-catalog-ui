import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer, firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { LoginServiceService } from 'src/app/services/login-service.service';
import { AuthService } from 'src/app/guard/auth.service';
import { decodeJwt } from 'src/app/guard/jwt.util';

@Injectable({ providedIn: 'root' })
export class RefreshLoginServiceService {
  private sub?: Subscription;
  private readonly LEEWAY_SECONDS = 4;
  private readonly EXTERNAL_TOKEN_KEY = 'accessToken';

  constructor(
    private readonly api: LoginServiceService,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  
  startInterval(dueMs: number): void {
    this.stopInterval();
    if (!Number.isFinite(dueMs) || dueMs <= 0) return;

    this.sub = timer(dueMs).subscribe(() => {
      this.refreshOnce().catch((err) => {
        console.error('Refresh error:', err);
        this.handleLogoutFlow();
      });
    });
  }

  
  scheduleFromExp(expSeconds: number): void {
    const now = moment().unix();
    const remaining = expSeconds - now - this.LEEWAY_SECONDS;
    const dueMs = Math.max(0, remaining * 1000);
    this.startInterval(dueMs);
  }

  async scheduleFromCurrentToken(): Promise<void> {
    const token = await firstValueFrom(this.auth.getToken());
    if (!token) return this.stopInterval();

    const exp = decodeJwt<Record<string, any>>(token)?.['exp'] as number | undefined;
    if (!exp) return this.stopInterval();

    this.scheduleFromExp(this.normalizeEpochSeconds(exp));
  }

  stopInterval(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }

  private async refreshOnce(): Promise<void> {
    const token = await firstValueFrom(this.auth.getToken());
    if (!token) {
      this.handleLogoutFlow();
      return;
    }
    const refreshed = await this.api.getLogin(token);
    const now = moment().unix();
    const stillValid = refreshed?.expire && refreshed.expire > now + this.LEEWAY_SECONDS;
    if (!refreshed?.accessToken || !stillValid) {
      this.handleLogoutFlow();
      return;
    }
    localStorage.setItem(this.EXTERNAL_TOKEN_KEY, refreshed.accessToken);
    this.auth.reloadFromSession?.();

    this.scheduleFromExp(refreshed.expire);
  }

  private handleLogoutFlow(): void {
    this.stopInterval();
    localStorage.removeItem(this.EXTERNAL_TOKEN_KEY);

    this.api.logout?.().catch((err) => console.warn('logout API error', err));

    this.router
      .navigate(['/dashboard'])
      .then(() => window.location.reload())
      .catch((err) => console.warn('router error on logout', err));
  }

  private normalizeEpochSeconds(expLike: number): number {
    return expLike > 10_000_000_000 ? Math.floor(expLike / 1000) : expLike;
  }

}

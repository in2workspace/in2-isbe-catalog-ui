// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const requiredRoles: string[] = route.data['roles'] ?? [];
    const isIsbe: boolean = route.data['is_isbe'] ?? false;

    return this.auth.checkAuth().pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          this.auth.login();
          return of(false);
        }
        return this.auth.loginInfo$.pipe(
          take(1),
          map(li => {
            if (!li) return this.router.createUrlTree(['/dashboard']);
            if (isIsbe) return this.router.createUrlTree(['/dashboard']);

            if (requiredRoles.length > 0) {
              const roles = (li.roles ?? []).map(r => r.name ?? r.id ?? r);
              const ok = requiredRoles.some(r => roles.includes(r));
              if (!ok) return this.router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      })
    );
  }
}

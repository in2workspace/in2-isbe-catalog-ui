// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { RoleType } from '../models/user-data-authentication-response.dto';
import { AuthService } from './auth.service';

type PowerReq = { function: string; action: string };

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const redirect = (reason: string) =>
    router.createUrlTree(['/dashboard'], { queryParams: { returnUrl: state.url, reason } });

  return auth.checkAuth$().pipe(
    switchMap((isAuth) => {
      if (!isAuth) return of<UrlTree | boolean>(redirect('unauthenticated'));

      const requiredRoles = (route.data['roles'] as RoleType[] | undefined) ?? [];
      const requiredPowers = (route.data['powers'] as PowerReq[] | undefined) ?? [];
      const isIsbe = route.data['is_isbe'] as boolean | undefined;

      return auth.getUserData().pipe(
        take(1),
        map((user) => {
          if (!user) return redirect('no_user');
          if (isIsbe) return redirect('blocked_isbe');

          if (requiredRoles.length) {
            const okRole = requiredRoles.includes(user.role as RoleType);
            if (!okRole) return redirect('missing_role');
          }

          if (requiredPowers.length) {
            const okPowers = requiredPowers.every((p) => auth.hasPower(p.function, p.action));
            if (!okPowers) return redirect('missing_power');
          }

          return true;
        })
      );
    })
  );
};

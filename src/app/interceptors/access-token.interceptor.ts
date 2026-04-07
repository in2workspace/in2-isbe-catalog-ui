import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export const accessTokenInterceptor: HttpInterceptorFn = (req, next) => {

  if (!req.url.startsWith(environment.BASE_URL)) {
    return next(req);
  }

  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const oidc = inject(OidcSecurityService);

  const isAuthenticated$ = oidc.isAuthenticated$.pipe(
    map((x: any) => !!(x?.isAuthenticated ?? x))
  );

  return combineLatest([
    isAuthenticated$,
    oidc.getAccessToken()
  ]).pipe(
    take(1),
    switchMap(([isAuthenticated, token]) => {
      if (!isAuthenticated || !token) {
        return next(req);
      }

      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
    })
  );
};

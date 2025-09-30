import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MarkdownModule } from 'ngx-markdown';
import { routes } from './app/app.routes';
import { MatomoInitializationMode, MatomoInitializerService, MatomoModule } from 'ngx-matomo-client';
import { appConfigFactory } from './app/app-config-factory';

import { AuthModule, AuthInterceptor } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './app/guard/auth.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigFactory,
      deps: [MatomoInitializerService],
      multi: true
    },

    importProvidersFrom(
      MarkdownModule.forRoot(),
      TranslateModule.forRoot({
        defaultLanguage: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      MatomoModule.forRoot({ mode: MatomoInitializationMode.AUTO_DEFERRED }),

      AuthModule.forRoot({
        config: {
          postLoginRoute: environment.POST_LOGIN_ROUTE,
          authority: environment.AUTHORITY,
          redirectUrl: environment.REDIRECT_URL,
          postLogoutRedirectUri: environment.REDIRECT_URL,
          clientId: environment.SIOP_INFO.clientID,
          scope: environment.SCOPE,
          responseType: environment.RESPONSE_TYPE,
          silentRenew: true,
          useRefreshToken: true,
          historyCleanupOff: false,
          ignoreNonceAfterRefresh: true,
          triggerRefreshWhenIdTokenExpired: false,
          secureRoutes: [environment.BASE_URL].filter((route): route is string => route !== undefined)
        },
      })
    ), 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (auth: AuthService) => () => auth.checkAuth().toPromise(),
      deps: [AuthService],
    }
  ]
});

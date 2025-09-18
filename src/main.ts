import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MarkdownModule } from 'ngx-markdown';
import { routes } from './app/app.routes';
import { AppInitService } from './app/services/app-init.service';
import { MatomoInitializationMode, MatomoInitializerService, MatomoModule } from 'ngx-matomo-client';
import { appConfigFactory } from './app/app-config-factory';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigFactory,
      deps: [AppInitService, MatomoInitializerService],
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
      MatomoModule.forRoot({ mode: MatomoInitializationMode.AUTO_DEFERRED })
    )
  ]
});

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageNavService {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  navigate(path: string): void {
    const prefix = this.translate.currentLang === 'en' ? '/en' : '';
    this.router.navigate([prefix + path]);
  }
}

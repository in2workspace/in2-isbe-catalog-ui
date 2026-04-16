import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { faLinkedin, faYoutube, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import {EventMessageService} from "../../services/event-message.service";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeedbackModalComponent } from '../feedback-modal/feedback-modal.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'bae-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    standalone: true,
    imports: [FaIconComponent, FeedbackModalComponent, TranslateModule, NgClass]
})
export class FooterComponent {
  protected readonly faLinkedin = faLinkedin;
  protected readonly faYoutube = faYoutube;
  protected readonly faXTwitter = faXTwitter;
  protected readonly ISBE_LINKEDIN = environment.ISBE_LINKEDIN;
  protected readonly ISBE_YOUTUBE = environment.ISBE_YOUTUBE;
  protected readonly ISBE_X = environment.ISBE_X;
  feedback:boolean=false;
  checkLogged:boolean=false;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  private readonly LEGAL_LINKS: Record<string, { privacy: string; cookies: string; licensing: string }> = {
    en: {
      privacy: 'https://redisbe.com/en/legal/privacy-policy',
      cookies: 'https://redisbe.com/en/legal/cookies-policy',
      licensing: 'https://redisbe.com/en/legal/legal-notice',
    },
    es: {
      privacy: 'https://redisbe.com/legal/politica-de-privacidad',
      cookies: 'https://redisbe.com/legal/politica-de-cookies',
      licensing: 'https://redisbe.com/legal/aviso-legal',
    },
  };

  get legalLinks() {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    return this.LEGAL_LINKS[lang] ?? this.LEGAL_LINKS['en'];
  }

  constructor(
    private readonly router: Router,
    private readonly eventMessage: EventMessageService,
    private readonly auth: AuthService,
    private readonly translate: TranslateService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if (ev.type === 'CloseFeedback') {
        this.feedback = false;
      }

      this.auth.isAuthenticated$.subscribe(isAuth => {
        this.checkLogged = isAuth;
      });
    });
  }

  
  get isBeigeBackground(): boolean {
    const url = this.router.url.split('?')[0];
    return ['/profile', '/my-offerings', '/admin'].some(p => url === p || url.startsWith(p + '/'));
  }

  goTo(path:string) {
    this.router.navigate([path]);
  }

  open(path:string){
    window.open(path, '_blank');
  }
}
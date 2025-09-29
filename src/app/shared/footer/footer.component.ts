import { Component } from '@angular/core';
import { faLinkedin, faYoutube, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import {EventMessageService} from "../../services/event-message.service";
import { TranslateModule } from '@ngx-translate/core';
import { FeedbackModalComponent } from '../feedback-modal/feedback-modal.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'bae-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    standalone: true,
    imports: [FaIconComponent, FeedbackModalComponent, TranslateModule]
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

  constructor(
    private readonly router: Router,
    private readonly eventMessage: EventMessageService,
    private readonly auth: AuthService
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

  
  goTo(path:string) {
    this.router.navigate([path]);
  }

  open(path:string){
    window.open(path, '_blank');
  }
}
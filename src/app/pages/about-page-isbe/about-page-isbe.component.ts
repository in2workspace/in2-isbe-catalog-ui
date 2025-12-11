import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-about-page-isbe',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-page-isbe.component.html',
  styleUrl: './about-page-isbe.component.css'
})
export class AboutPageIsbeComponent {
  isbeAbout: string = environment.ISBE_ABOUT_LINK;
  private readonly router = inject(Router);

  openWindow(path: string) {
    window.open(path);
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IsbeBannerComponent } from 'src/app/shared/isbe-banner/isbe-banner.component';

@Component({
  selector: 'app-about-page-isbe',
  standalone: true,
  imports: [TranslateModule, IsbeBannerComponent],
  templateUrl: './about-page-isbe.component.html',
  styleUrl: './about-page-isbe.component.css'
})
export class AboutPageIsbeComponent {
  private readonly router = inject(Router);

  goTo(path: string) {
    this.router.navigate([path]);
  }

}

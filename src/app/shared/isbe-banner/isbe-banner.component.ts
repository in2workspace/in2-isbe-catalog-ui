import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-isbe-banner',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './isbe-banner.component.html',
})
export class IsbeBannerComponent {
  @Input() titleKey: string = '';
  @Input() descKey: string = '';
  @Input() variant: 'gradient' | 'green' = 'gradient';

  isbeAbout: string = environment.ISBE_ABOUT_LINK;

  openWindow(path: string) {
    window.open(path);
  }
}

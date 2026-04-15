import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IsbeBannerComponent } from 'src/app/shared/isbe-banner/isbe-banner.component';

@Component({
  selector: 'app-publish-service',
  standalone: true,
  imports: [TranslateModule, IsbeBannerComponent],
  templateUrl: './publish-service.component.html',
  styleUrl: './publish-service.component.css'
})
export class PublishServiceComponent {

}

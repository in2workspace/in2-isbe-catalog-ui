import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-publish-service',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './publish-service.component.html',
  styleUrl: './publish-service.component.css'
})
export class PublishServiceComponent {
  
  isbeAbout: string = environment.ISBE_ABOUT_LINK;
  
  openWindow(path: string) {
    window.open(path);
  }

}

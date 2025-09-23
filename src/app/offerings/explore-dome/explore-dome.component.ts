import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-explore-dome',
    templateUrl: './explore-dome.component.html',
    styleUrl: './explore-dome.component.css',
    standalone: true,
    imports: [TranslateModule]
})
export class ExploreDomeComponent {
  domeAbout: string = environment.ISBE_ABOUT_LINK

}

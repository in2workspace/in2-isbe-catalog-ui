import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IsbeBannerComponent } from 'src/app/shared/isbe-banner/isbe-banner.component';
import { MenuStateService } from 'src/app/services/menu-state.service';

@Component({
  selector: 'app-publish-service',
  standalone: true,
  imports: [TranslateModule, IsbeBannerComponent],
  templateUrl: './publish-service.component.html',
  styleUrl: './publish-service.component.css'
})
export class PublishServiceComponent {
  constructor(private router: Router, private menuState: MenuStateService) {}

  goToProductSpec() {
    this.menuState.setActiveTab('offerings', 'productspec');
    this.router.navigate(['/my-offerings']);
  }
}

import { Component } from '@angular/core';
import {components} from "../../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];
import {faLeaf, faHammer, faCircleNodes, faMagnifyingGlass} from "@fortawesome/pro-solid-svg-icons";
import {faLockOpen, faShieldCheck} from "@fortawesome/pro-regular-svg-icons";
import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-platform-benefits',
  templateUrl: './platform-benefits.component.html',
  styleUrl: './platform-benefits.component.css',
  standalone: true,
  imports: [TranslateModule, FaIconComponent]
})
export class PlatformBenefitsComponent {
  protected readonly faLeaf = faLeaf;
  protected readonly faHammer = faHammer;
  protected readonly faCircleNodes = faCircleNodes;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faLockOpen = faLockOpen;
  protected readonly faShieldCheck = faShieldCheck;
}

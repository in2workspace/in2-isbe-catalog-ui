import {Component, Input} from '@angular/core';
import {faAddressCard} from "@fortawesome/sharp-solid-svg-icons";
import {faCloud} from "@fortawesome/pro-solid-svg-icons";
import {components} from "../../models/product-catalog";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
type Category = components["schemas"]["Category"];

@Component({
    selector: 'bae-badge',
    templateUrl: './badge.component.html',
    styleUrl: './badge.component.css',
    standalone: true,
    imports: [FaIconComponent]
})
export class BadgeComponent {
  @Input() category:Category = {name:'Default'}
    protected readonly faAddressCard = faAddressCard;
  protected readonly faCloud = faCloud;
}

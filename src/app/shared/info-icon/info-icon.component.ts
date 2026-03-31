import { Component, Input } from '@angular/core';

@Component({
  selector: 'info-icon, app-info-icon',
  templateUrl: './info-icon.component.html',
  styleUrl: './info-icon.component.css',
  standalone: true
})
export class InfoIconComponent {
  @Input() tooltipText = '';
  @Input() tooltipTitle = '';
  @Input() ariaLabel = 'Information';
}

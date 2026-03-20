import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'ok-message',
    templateUrl: './ok-message.component.html',
    styleUrl: './ok-message.component.css',
    standalone: true
})
export class OkMessageComponent {
  @Input() message: any;
  @Output() close = new EventEmitter<void>();
}

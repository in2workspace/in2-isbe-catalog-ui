import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'error-message',
    templateUrl: './error-message.component.html',
    styleUrl: './error-message.component.css',
    standalone: true
})
export class ErrorMessageComponent {
  @Input() message: any;
  @Output() close = new EventEmitter<void>();

}

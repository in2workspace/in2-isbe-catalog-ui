import { Component, Input } from '@angular/core';

@Component({
    selector: 'reminder-message',
    templateUrl: './reminder-message.component.html',
    styleUrl: './reminder-message.component.css',
    standalone: true
})
export class ReminderMessageComponent {
  @Input() message: any;

}

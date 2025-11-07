import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'reminder-message',
    templateUrl: './reminder-message.component.html',
    styleUrl: './reminder-message.component.css',
    standalone: true,
    imports: [TranslateModule]
})
export class ReminderMessageComponent {
  @Input() message: any;

}

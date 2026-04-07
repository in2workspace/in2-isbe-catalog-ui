import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'alert-message',
    templateUrl: './alert-message.component.html',
    styleUrl: './alert-message.component.css',
    standalone: true,
    imports: [TranslateModule]
})
export class AlertMessageComponent {
  @Input() translationKey: string;
  @Input() showActions: boolean = false;
  @Output() accept = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onAccept() {
    this.accept.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}

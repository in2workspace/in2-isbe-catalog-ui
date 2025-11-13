import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'isbe-message',
    templateUrl: './isbe-message.component.html',
    styleUrl: './isbe-message.component.css',
    standalone: true,
    imports: [TranslateModule]
})
export class IsbeMessageComponent {
  @Output() close = new EventEmitter();

  closeMessage() { 
    this.close.emit(); 
  }  
}

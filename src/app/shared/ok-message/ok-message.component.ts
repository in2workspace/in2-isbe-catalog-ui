import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'ok-message',
    templateUrl: './ok-message.component.html',
    styleUrl: './ok-message.component.css',
    standalone: true
})
export class OkMessageComponent implements OnInit {
  @Input() title: string = '';
  @Input() message: any;
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    setTimeout(() => this.close.emit(), 5000);
  }
}

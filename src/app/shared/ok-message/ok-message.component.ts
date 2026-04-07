import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'ok-message',
    templateUrl: './ok-message.component.html',
    styleUrl: './ok-message.component.css',
    standalone: true
})
export class OkMessageComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() message: any;
  @Output() close = new EventEmitter<void>();

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  ngOnInit(): void {
    this.closeTimer = setTimeout(() => {
      if (!this.destroyed) {
        this.close.emit();
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}

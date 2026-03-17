import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'cb-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() maxHeigth = 90;
  @Input() showCloseIcon = true;
  
  @Output() close = new EventEmitter<void>();

  @ViewChild("header", { static: false }) header: ElementRef<HTMLDivElement>;
  @ViewChild("footer", { static: false }) footer: ElementRef<HTMLDivElement>;

  get headerHeight(): number {
    if (!this.header) {
      return 0;
    }

    return this.header.nativeElement.scrollHeight;
  }

  get footerHeight(): number {
    if (!this.footer) {
      return 0;
    }

    return this.footer.nativeElement.scrollHeight;
  }

  closeFn(): void {
    this.close.emit();
  }
}

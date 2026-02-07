import { Component, Input } from '@angular/core';

@Component({
  selector: 'cb-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  @Input() rounded = false;

  @Input() disabled = false;
  @Input() selected = false;
}

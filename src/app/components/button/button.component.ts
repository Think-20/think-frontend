import { Component, Input } from '@angular/core';

@Component({
  selector: 'cb-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() theme: 'info' | 'transparent' = 'transparent';
  
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
}

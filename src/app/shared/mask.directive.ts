import { Directive, HostListener, Input, OnInit, forwardRef, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Directive({
    selector: '[mask]',
    providers: [{
        provide: NG_VALUE_ACCESSOR, 
        useExisting: forwardRef(() => MaskDirective),
        multi: true 
    }]
})
export class MaskDirective implements ControlValueAccessor {

  @Input('mask') mask: string
  onTouched: any
  onChange: any

  constructor(
    private elementRef: ElementRef
  ) { }

  writeValue(value: any): void {
    const input = this.elementRef.nativeElement as HTMLInputElement
    input.value = value
  }

  registerOnChange(fn: any): void {
      this.onChange = fn
  }

  registerOnTouched(fn: any): void {
      this.onTouched = fn
  }

  private getActiveMask(value: string): string {
    if (this.mask === 'cpfcnpj') {
      return value.length > 11 ? '99.999.999/9999-99' : '999.999.999-99'
    }

    return this.mask
  }
    
  @HostListener('keyup', ['$event']) 
  onKeyup($event: any) {
    var rawValue = $event.target.value.replace(/\D/g, '');
    var activeMask = this.getActiveMask(rawValue);
    var maskDigits = activeMask.replace(/[^9]/g, '').length;
    var valor = rawValue;

    if (valor.length > maskDigits) {
      valor = valor.substr(0, maskDigits);
    }

    var pad = activeMask.replace(/\D/g, '').replace(/9/g, '_');
    var valorMask = valor
    if (pad.length > valor.length) {
      valorMask = valor + pad.substring(0, pad.length - valor.length);
    }
 
    if ($event.keyCode === 8) {
      this.onChange(valor);
      return;
    }
 
    this.onChange(valor);
 
    var valorMaskPos = 0;
    var maskedValue = '';
    for (var i = 0; i < activeMask.length; i++) {
      if (activeMask.charAt(i) === '?') {
        continue;
      } else if (isNaN(parseInt(activeMask.charAt(i)))) {
        maskedValue += activeMask.charAt(i);
      } else {
        maskedValue += valorMask.charAt(valorMaskPos++) || '';
      }
    }
    
    if (maskedValue.indexOf('_') > -1) {
      maskedValue = maskedValue.substr(0, maskedValue.indexOf('_'));
    }
 
    $event.target.value = maskedValue;
  }
 
  @HostListener('blur', ['$event']) 
  onBlur($event: any) {
    var rawValue = $event.target.value.replace(/\D/g, '');
    var activeMask = this.getActiveMask(rawValue);
    var maskDigits = activeMask.replace(/[^9]/g, '').length;

    if (rawValue.length === 0) {
      this.onChange('');
      this.onTouched('');
      $event.target.value = '';
      return;
    }

    if (rawValue.length === maskDigits) {
      return;
    }

    this.onChange('');
    this.onTouched('');
    $event.target.value = '';
  }

}
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousands'
})
export class ThousandsPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1000) {
      let numeroOriginal: number = value;
      let numeroSemDecimais: number = Math.floor(numeroOriginal);

      const formattedNumber = (numeroSemDecimais / 1000);

      return formattedNumber.toLocaleString(undefined, { minimumFractionDigits: 0 }) + 'k';
    } else {
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }}
}
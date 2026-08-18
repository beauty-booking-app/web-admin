import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyArs', standalone: true })
export class CurrencyArsPipe implements PipeTransform {
  transform(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}

import { Input, Pipe, PipeTransform } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Pipe({
  name: 'countAnimation'
})
export class CountAnimationPipe implements PipeTransform {

  transform(value: number, interv = 10): Observable<number> {
    return interval(interv).pipe(
      take(value + 1),
      map(i => i)
    );
  }
}
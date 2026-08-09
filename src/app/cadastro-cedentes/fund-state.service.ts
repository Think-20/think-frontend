import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FundStateService {
  private fundIdSubject = new BehaviorSubject<string | null>(null);

  get fundId$(): Observable<string | null> {
    return this.fundIdSubject.asObservable();
  }

  get currentFundId(): string | null {
    return this.fundIdSubject.value;
  }

  setFundId(id: string | null): void {
    this.fundIdSubject.next(id);
  }
}

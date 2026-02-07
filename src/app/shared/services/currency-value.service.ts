import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable()
export class CurrencyValueService implements OnDestroy {
  private visible$ = new BehaviorSubject<boolean>(true);

  private onDestroy$ = new Subject<void>();

  get visibleObservable(): Observable<boolean> {
    return this.visible$.asObservable();
  }

  private get key(): string {
    return "sv";
  }

  init(): void {
    const currencyValueVisible = localStorage.getItem(this.key) === "true";

    this.visible$.next(!!currencyValueVisible);
  }

  toggle(): void {
    const value = !this.visible$.getValue();

    localStorage.setItem(this.key, String(value));

    this.visible$.next(value);
  }

  ngOnDestroy(): void {
    this.visible$.complete();

    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

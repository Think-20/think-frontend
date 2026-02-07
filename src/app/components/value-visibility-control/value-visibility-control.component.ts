import { Component, OnDestroy, OnInit } from "@angular/core";
import { CurrencyValueService } from "app/shared/services/currency-value.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "cb-value-visibility-control",
  templateUrl: "./value-visibility-control.component.html",
  styleUrls: ["./value-visibility-control.component.scss"],
})
export class ValueVisibilityControlComponent implements OnInit, OnDestroy {
  visible = false;

  private onDestroy$ = new Subject<void>();

  constructor(private currencyValueService: CurrencyValueService) {}

  ngOnInit(): void {
    this.currencyValueService.visibleObservable
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((visible) => (this.visible = visible));
  }

  toggle(event: PointerEvent): void {
    event.stopPropagation();
    
    this.currencyValueService.toggle();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

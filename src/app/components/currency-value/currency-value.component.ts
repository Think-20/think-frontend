import { CurrencyPipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { CurrencyValueService } from "app/shared/services/currency-value.service";
import { Observable } from 'rxjs';

@Component({
  selector: "cb-currency-value",
  templateUrl: "./currency-value.component.html",
  styleUrls: ["./currency-value.component.scss"],
})
export class CurrencyValueComponent implements OnInit {
  @Input() maskChar = "*";
  @Input() maskLength = 3;
  @Input() currencyCode? = "BRL";
  @Input() display?: "code" | "symbol" | "symbol-narrow" | string | boolean = "symbol";
  @Input() digitsInfo?: string = "1.0-2";
  @Input() value = 0;

  mask: string;

  visible$: Observable<boolean>;

  constructor(
    private currencyPipe: CurrencyPipe,
    private currencyValueService: CurrencyValueService
  ) {}

  ngOnInit() {
    this.mask = this.maskedValue();

    this.visible$ = this.currencyValueService.visibleObservable;
  }

  private maskedValue(): string {
    const value = this.currencyPipe.transform(
      this.value < 0 ? -1234 : 1234,
      this.currencyCode,
      this.display,
      this.digitsInfo
    );

    const prefixMatch = value.match(/^[^\d]+/);

    const prefix = prefixMatch ? prefixMatch[0] : "";

    const mask = (this.maskChar || "•").repeat(this.maskLength || 4);

    return `${prefix}${mask}`;
  }
}

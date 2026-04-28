import { Component, Input } from "@angular/core";
import { banks, EBank } from "app/shared/enums/bank.enum";

@Component({
  selector: "cb-bank-image",
  templateUrl: "./bank-image.component.html",
  styleUrls: ["./bank-image.component.scss"]
})
export class BankImageComponent {
  @Input() bank: EBank;

  bankEnum = EBank;

  get data(): { code: string; name: string; image: string } {
    if (!this.bank) {
      return null;
    }

    return banks.get(this.bank);
  }
}

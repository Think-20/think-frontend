import { Component, Input } from "@angular/core";
import { banks, EBank } from "app/shared/enums/bank.enum";

@Component({
  selector: "cb-bank-image",
  templateUrl: "./bank-image.component.html",
  styleUrls: ["./bank-image.component.scss"],
})
export class BankImageComponent {
  @Input() bank: {
      code: EBank.bancoDoBrasil,
      name: "Banco do Brasil S.A.",
      image: "assets/images/banks/banco-do-brasil.jpg",
    } | null;
}

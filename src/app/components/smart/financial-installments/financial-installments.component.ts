import { Component, Input } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "cb-financial-installments",
  templateUrl: "./financial-installments.component.html",
  styleUrls: ["./financial-installments.component.scss"],
})
export class FinancialInstallmentsComponent {
  @Input() form: FormGroup;

  get parcelas(): FormArray {
    if (!this.form) {
      return null as any;
    }
    return this.form.get("parcelas") as FormArray;
  }

  valorControlAt(index: number): FormControl {
    const g = this.parcelas.at(index) as FormGroup;
    return g.get("valor") as FormControl;
  }

  dataControlAt(index: number): FormControl {
    const g = this.parcelas.at(index) as FormGroup;
    return g.get("data") as FormControl;
  }

  trackByIndex(index: number, _item: AbstractControl): number {
    return index;
  }
}

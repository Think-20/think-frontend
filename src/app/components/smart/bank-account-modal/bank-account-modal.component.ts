import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { banks } from 'app/shared/enums/bank.enum';

@Component({
  selector: "cb-bank-account-modal",
  templateUrl: "./bank-account-modal.component.html",
  styleUrls: ["./bank-account-modal.component.scss"],
})
export class BankAccountModalComponent {
  submitted = false;

  banks =  Array.from(banks.values());
  
  form = new FormGroup({
    bank: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    agency: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\d{4}$/),
    ]),
    account: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\d{5,12}-?[\dXx]?$/),
    ]),
  });

  get bank(): FormControl {
    return this.form.get("bank") as FormControl;
  }

  get name(): FormControl {
    return this.form.get("name") as FormControl;
  }

  get agency(): FormControl {
    return this.form.get("agency") as FormControl;
  }

  get account(): FormControl {
    return this.form.get("account") as FormControl;
  }

  constructor(public dialog: MatDialogRef<BankAccountModalComponent>) {}

  close(): void {
    this.dialog.close();
  }

  save(): void {
    this.submitted = true;
  }
}

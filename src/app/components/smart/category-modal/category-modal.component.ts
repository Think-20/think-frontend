import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "cb-category-modal",
  templateUrl: "./category-modal.component.html",
  styleUrls: ["./category-modal.component.scss"],
})
export class CategoryModalComponent {
  form = new FormGroup({
    name: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(40),
    ]),
    color: new FormControl(null, [Validators.required]),
  });

  constructor(public dialog: MatDialogRef<CategoryModalComponent>) {}

  close(): void {
    this.dialog.close();
  }

  save(): void {}
}

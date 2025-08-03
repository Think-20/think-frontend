import { CheckInService } from "./../../check-in.service";
import {
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatSnackBar } from "@angular/material";
import { IOtherCnpj } from "app/check-in/models/other-cnpj.model";
import { CheckInOtherCnpjComponent } from "../check-in-other-cnpj/check-in-other-cnpj.component";

@Component({
  selector: "cb-check-in-other-cnpjs",
  templateUrl: "./check-in-other-cnpjs.component.html",
  styleUrls: ["./check-in-other-cnpjs.component.scss"],
})
export class CheckInOtherCnpjsComponent implements OnInit {
  @ViewChildren("otherCnpj")
  otherCnpjElements: QueryList<CheckInOtherCnpjComponent>;

  @Input() checkInId: number;

  formArray = new FormArray([]);

  constructor(
    private snackBar: MatSnackBar,
    private checkInService: CheckInService,
    public dialog: MatDialogRef<CheckInOtherCnpjsComponent>
  ) {}

  ngOnInit(): void {
    this.checkInService.getOtherCnpjs(this.checkInId).subscribe({
      next: (cnpjs) => {
        cnpjs.forEach((item) => this.formArray.push(this.addForm(item)));
      },
    });
  }

  private addForm(item: IOtherCnpj): FormGroup {
    const form = new FormGroup({
      id: new FormControl(item.id),
      identifier: new FormControl(this.generateIdentifier()),
      cnpj: new FormControl(item.cnpj, [Validators.required, Validators.minLength(18)]),
      name: new FormControl(item.name, [Validators.required]),
      value: new FormControl(item.value || 0, [Validators.required]),
    });

    form.controls.id.disable();
    form.controls.identifier.disable();

    return form;
  }

  add(): void {
    this.formArray.push(
      this.addForm({
        value: 0,
      })
    );

    setTimeout(() => this.otherCnpjElements.last.focusName());
  }

  remove(index: number): void {
    this.checkInService
      .deleteOtherCnpj(this.formArray.at(index).get("id").value)
      .subscribe({
        next: () => {
          this.formArray.removeAt(index)

          this.snackBar.open("Removido com sucesso!");
        },
        error: (err) => this.snackBar.open("Falha na remoção."),
      });
  }

  generateIdentifier() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

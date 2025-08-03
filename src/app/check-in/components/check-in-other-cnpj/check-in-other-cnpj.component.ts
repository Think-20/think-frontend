import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CheckInService } from "app/check-in/check-in.service";
import { IOtherCnpj } from "app/check-in/models/other-cnpj.model";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "cb-check-in-other-cnpj",
  templateUrl: "./check-in-other-cnpj.component.html",
  styleUrls: ["./check-in-other-cnpj.component.scss"],
})
export class CheckInOtherCnpjComponent implements AfterViewInit, OnDestroy {
  @ViewChild("inputName", { static: false }) name: ElementRef<HTMLInputElement>;

  @Input() form: FormGroup;
  @Input() checkInId: number;
  @Output() remove = new EventEmitter<boolean>();

  private onDestroy$ = new Subject<void>();

  constructor(private checkInService: CheckInService) {}

  ngAfterViewInit(): void {
    this.form.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        if (this.form.valid) {
          this.save();
        }
      });
  }

  focusName(): void {
    this.name.nativeElement.focus();
  }

  private save(): void {
    const obj = this.form.value;

    delete obj.identifier;

    obj.checkin_id = this.checkInId;

    (obj.id
      ? this.checkInService.putOtherCnpj(obj)
      : this.checkInService.postOtherCnpj(obj)
    ).subscribe({
      next: (response) => {
        this.form.get("id").setValue(response.object.id);
      },
      error: (err) => console.error("Error saving CNPJ:", err),
    });
  }

  delete(): void {
    this.remove.emit(true);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

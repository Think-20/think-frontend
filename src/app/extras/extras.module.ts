import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";

import { CheckInModule } from "../check-in/check-in.module";
import { ExtraFormComponent } from "./components/extra-form/extra-form.component";
import { ExtrasGridComponent } from "./components/extras-grid/extras-grid.component";
import { ExtrasComponent } from "./extras.component";

@NgModule({
  declarations: [ExtrasComponent, ExtrasGridComponent, ExtraFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    CheckInModule,
  ],
  exports: [ExtrasComponent, ExtrasGridComponent, ExtraFormComponent],
  entryComponents: [ExtraFormComponent],
})
export class ExtrasModule {}

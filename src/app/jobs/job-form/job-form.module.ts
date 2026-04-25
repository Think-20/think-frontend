import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { RouterModule } from "@angular/router";
import { CurrencyMaskModule } from "ng2-currency-mask";

import { FormDirectivesModule } from "../../shared/form-directives.module";
import { StarsModule } from "../../shared/stars/stars.module";
import { JobFormComponent } from "./job-form.component";

@NgModule({
  declarations: [JobFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    CurrencyMaskModule,
    StarsModule,
    FormDirectivesModule,
  ],
  exports: [JobFormComponent],
})
export class JobFormModule {}

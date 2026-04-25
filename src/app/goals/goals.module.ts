import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { CurrencyMaskModule } from "ng2-currency-mask";

import { GoalsComponent } from "./goals.component";
import { GoalsRoutingModule } from "./goals-routing.module";

@NgModule({
  declarations: [GoalsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    CurrencyMaskModule,
    GoalsRoutingModule,
  ],
})
export class GoalsModule {}

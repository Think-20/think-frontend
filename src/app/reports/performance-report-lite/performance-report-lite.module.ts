import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";

import { NumberAbbreviationPipe } from "../../shared/number-abbreviation.pipe";
import { PerformanceReportLiteComponent } from "./performance-report-lite.component";
import { PerformanceReportLiteRoutingModule } from "./performance-report-lite-routing.module";

@NgModule({
  declarations: [PerformanceReportLiteComponent, NumberAbbreviationPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    PerformanceReportLiteRoutingModule,
  ],
})
export class PerformanceReportLiteModule {}

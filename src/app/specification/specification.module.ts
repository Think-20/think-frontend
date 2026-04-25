import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { FileUploadSharedModule } from "../shared/file-upload/file-upload-shared.module";
import { SpecificationFormComponent } from "./specification-form/specification-form.component";
import { SpecificationComponent } from "./specification.component";

@NgModule({
  declarations: [SpecificationComponent, SpecificationFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FileUploadSharedModule,
  ],
  exports: [SpecificationComponent, SpecificationFormComponent],
})
export class SpecificationModule {}

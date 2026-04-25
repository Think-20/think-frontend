import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";

import { FileUploadSharedModule } from "../shared/file-upload/file-upload-shared.module";
import { ProjectsComponent } from "./projects.component";

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    FileUploadSharedModule,
  ],
  exports: [ProjectsComponent],
  providers: [DatePipe],
})
export class ProjectsModule {}

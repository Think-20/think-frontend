import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

import { FileUploadSharedModule } from "../shared/file-upload/file-upload-shared.module";
import { ProjectPhotosComponent } from "./project-photos.component";

@NgModule({
  declarations: [ProjectPhotosComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    FileUploadSharedModule,
  ],
  exports: [ProjectPhotosComponent],
  providers: [DatePipe],
})
export class ProjectPhotosModule {}

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { NgxImageGalleryModule } from "ngx-image-gallery";

import { ImageViewerComponent } from "../image-viewer/image-viewer.component";
import { FileUploadComponent } from "./file-upload.component";
import { MessageLoadingComponent } from "./message-loading/message-loading";

@NgModule({
  declarations: [FileUploadComponent, ImageViewerComponent, MessageLoadingComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgxImageGalleryModule,
  ],
  exports: [FileUploadComponent, ImageViewerComponent, MessageLoadingComponent],
  entryComponents: [ImageViewerComponent, MessageLoadingComponent],
})
export class FileUploadSharedModule {}

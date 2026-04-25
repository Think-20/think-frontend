import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

import { JobTabComponent } from "./job-tab.component";

@NgModule({
  declarations: [JobTabComponent],
  imports: [CommonModule, MatIconModule],
  exports: [JobTabComponent],
})
export class JobTabModule {}

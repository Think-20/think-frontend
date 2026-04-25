import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { JobsComponent } from "./jobs.component";

@NgModule({
  declarations: [JobsComponent],
  imports: [CommonModule, RouterModule],
  exports: [JobsComponent],
})
export class JobsShellModule {}

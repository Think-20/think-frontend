import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { JobsKanbanComponent } from "./jobs-kanban.component";

const routes: Routes = [
  {
    path: "",
    component: JobsKanbanComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsKanbanRoutingModule {}

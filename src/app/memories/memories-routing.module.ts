import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { MemoriesContainerComponent } from "./components/memories-container/memories-container.component";

const routes: Routes = [
  {
    path: "",
    component: MemoriesContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoriesRoutingModule {}

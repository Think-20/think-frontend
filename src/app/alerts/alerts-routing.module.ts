import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AlertsContainerComponent } from "./components/alerts-container/alerts-container.component";

const routes: Routes = [
  {
    path: "",
    component: AlertsContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertsRoutingModule {}

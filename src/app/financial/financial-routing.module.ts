import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { JobTabsComponent } from "../jobs/job-tabs/job-tabs.component";
import { JobsComponent } from "../jobs/jobs.component";
import { AuthGuard } from "../login/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: JobsComponent,
    children: [
      {
        path: "",
        redirectTo: "list",
        pathMatch: "full",
      },
      {
        path: "new",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "new/:available_date",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "edit/:id",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "show/:id",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "list",
        loadChildren: "app/financial/financial-list.module#FinancialListModule",
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinancialRoutingModule {}

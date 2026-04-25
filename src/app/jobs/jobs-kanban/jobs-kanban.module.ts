import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";

import { StarsModule } from "../../shared/stars/stars.module";
import { JobsKanbanCardComponent } from "./jobs-kanban-card/jobs-kanban-card.component";
import { JobsKanbanColumnComponent } from "./jobs-kanban-column/jobs-kanban-column.component";
import { JobsKanbanComponent } from "./jobs-kanban.component";
import { JobsKanbanRoutingModule } from "./jobs-kanban-routing.module";

@NgModule({
  declarations: [JobsKanbanComponent, JobsKanbanColumnComponent, JobsKanbanCardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    ScrollingModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    StarsModule,
    JobsKanbanRoutingModule,
  ],
})
export class JobsKanbanModule {}

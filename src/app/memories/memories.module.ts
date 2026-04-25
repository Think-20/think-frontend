import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";

import { StarsModule } from "../shared/stars/stars.module";
import { MemoriesContainerComponent } from "./components/memories-container/memories-container.component";
import { MemoriesRoutingModule } from "./memories-routing.module";

@NgModule({
  declarations: [MemoriesContainerComponent],
  imports: [CommonModule, MatCardModule, MatInputModule, StarsModule, MemoriesRoutingModule],
})
export class MemoriesModule {}

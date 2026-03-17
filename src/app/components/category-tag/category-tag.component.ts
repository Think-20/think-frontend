import { Component, Input } from "@angular/core";

@Component({
  selector: "cb-category-tag",
  templateUrl: "./category-tag.component.html",
  styleUrls: ["./category-tag.component.scss"],
})
export class CategoryTagComponent {
  @Input() category;
}

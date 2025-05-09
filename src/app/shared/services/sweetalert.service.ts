import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({
  providedIn: "root",
})
export class SweetAlertService {
  alertOk(title: string, text: string) {
    Swal.fire({
      title,
      text,
      icon: "warning",
      customClass: {
        popup: "sweetalert-custom",
      },
    });
  }
}

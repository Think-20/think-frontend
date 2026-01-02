import { Component, OnInit } from "@angular/core";
import { API } from "app/app.api";
import { AuthService } from "app/login/auth.service";
import { User } from "app/user/user.model";

@Component({
  selector: "cb-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit {
  api = API;
  user: User = null;

  opened = true;

  administradores = false;
  administrativo = false;
  atendimento = false;
  criacao = false;
  diretoria = false;
  planejamento = false;
  producao = false;
  events = false;
  reports = false;
  centroCusto = false;
  orcamento = false;

  admVisible = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUser();

    let isDiretoria =
      this.user && this.user.employee && this.user.employee.department_id === 1;

    let isFinanceiro = this.user && this.user.employee_id === 53;

    this.admVisible = isDiretoria || isFinanceiro;
  }

  hasNoPermission(user: User, url: string): boolean {
    return (
      user.displays.filter((display) => {
        return display.url === url && display.access === "N";
      }).length > 0
    );
  }

  hasNoPermissionDepartament(
    user: User,
    url: string,
    department: string
  ): boolean {
    if (!user) {
      return;
    }

    const userDepartament = user.employee.department.description;

    if (userDepartament === "Diretoria") {
      return this.hasNoPermission(user, url);
    }

    return this.hasNoPermission(user, url) || userDepartament !== department;
  }

  toggleMenu() {
    this.opened = !this.opened;
  }
}

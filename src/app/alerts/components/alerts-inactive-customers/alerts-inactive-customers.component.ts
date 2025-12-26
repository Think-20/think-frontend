import { AuthService } from 'app/login/auth.service';
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Client } from 'app/clients/client.model';
import { AlertService } from 'app/alerts/alerts.service';

@Component({
  selector: "app-alerts-inactive-customers",
  templateUrl: "./alerts-inactive-customers.component.html",
  styleUrls: ["./alerts-inactive-customers.component.scss"],
})
export class AlertsInactiveCustomersComponent implements OnInit {
  clients: Client[] = [];

  atendimento = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private alertsService: AlertService,
  ) {
    this.atendimento = this.authService.currentUser().employee.department_id === 4
  }

  ngOnInit() {
    this.load();
  }

  load(): void {
    const snackBar = this.snackBar.open("Carregando...");

    this.alertsService.getAlertClientsInactive().subscribe((response) => {
      this.clients = response;
      
      snackBar.dismiss();
    });
  }
}

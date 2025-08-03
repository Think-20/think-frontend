import { Employee } from 'app/employees/employee.model';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { City } from "app/address/city.model";
import { CityService } from "app/address/city.service";
import { State } from "app/address/state.model";
import { CheckInModel } from "app/check-in/check-in.model";
import { Client } from "app/clients/client.model";
import { Job } from "app/jobs/job.model";
import { Observable, of, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { StateService } from 'app/address/state.service';
import { CheckInOtherCnpjsComponent } from '../check-in-other-cnpjs/check-in-other-cnpjs.component';

@Component({
  selector: "cb-check-in-billing",
  templateUrl: "./check-in-billing.component.html",
  styleUrls: ["./check-in-billing.component.scss"],
})
export class CheckInBillingComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() job = new Job();
  @Input() employees: Employee[] = [];
  @Input() checkInModel = new CheckInModel();

  states: Observable<State[]>;

  cities: Observable<City[]>;

  get agencies(): Client[] {
    const agencies: Client[] = [];

    if (!this.job) {
      return agencies;
    }

    if (this.job.client) {
      agencies.push(this.job.client);
    }

    if (this.job.agency) {
      agencies.push(this.job.agency);
    }

    return agencies;
  }

  get agency(): Client {
    const index = this.agencies.findIndex(x => x.id === this.checkInModel.billing_client_id);

    if (index >= 0) {
      return this.agencies[index];
    }

    return null;
  }

  cityControl = new FormControl();

  stateControl = new FormControl();

  private onDestroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cityService: CityService,
    private stateService: StateService,
  ) {}

  ngAfterViewInit(): void {
    this.observerCity();
    this.observerState();
  }

  private observerCity = (): void => {
    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    this.cityControl.valueChanges
      .debounceTime(500)
      .do(() => snackBarStateCharging = this.snackBar.open('Aguarde...'))
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(cityName => {
        if (!this.stateControl.value || !cityName) {
          this.cities = of([]);
          
          snackBarStateCharging.dismiss();

          return;
        }

        let stateId = this.stateControl.value.id || this.stateControl.value;

        this.cities = this.cityService.cities(stateId, cityName);

        snackBarStateCharging.dismiss();
      }, () => {
        snackBarStateCharging.dismiss();
      });
  }

  private observerState = (): void => {
    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    this.stateControl.valueChanges
      .debounceTime(500)
      .do(() => snackBarStateCharging = this.snackBar.open('Aguarde...'))
      .subscribe(stateName => {
        this.states = this.stateService.states(stateName);

        snackBarStateCharging.dismiss();
      }, () => {
        snackBarStateCharging.dismiss();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('checkInModel')) {
      const currentValue: CheckInModel = changes.checkInModel.currentValue;
      const previousValue: CheckInModel = changes.checkInModel.previousValue;

      this.setPropertyDefaultValue('costumer_service_employee', this.job.attendance.id);
      this.setPropertyDefaultValue('budget_employee', 11);
      this.setPropertyDefaultValue('production_manager_employee', 20);

      if (currentValue && previousValue && currentValue.billing_client_id != previousValue.billing_client_id) {
        this.updateAgency(this.agency);
      }
    }
  }

  private setPropertyDefaultValue(
    property:
      | "costumer_service_employee"
      | "budget_employee"
      | "production_manager_employee",
    value: number
  ): void {
    if (!this.checkInModel[property]) {
      this.checkInModel[property] = value;
    }
  }

  updateAgency(agency: Client): void {
    if (agency && agency.city_id) {
      this.loadCity(agency.city_id);
    }
  }

  displayState = (state: State) => state ? state.name : null;

  displayCity = (city: City) => city ? city.name : null;

  private loadCity(cityId: number): void {
    this.cityService.citiesById(cityId).subscribe({
      next: (city) => {
        this.cityControl.setValue(city);

        this.stateControl.setValue(city.state);
      },
    });
  }

  faturarOutrosCNPJs(): void {
    const modal = this.dialog.open(CheckInOtherCnpjsComponent, {
      width: '500px',
    });

    modal.componentInstance.checkInId = this.checkInModel.id;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

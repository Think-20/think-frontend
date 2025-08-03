import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { MatSnackBar } from "@angular/material";
import { ErrorHandler } from "../shared/error-handler.service";
import { CheckInModel } from './check-in.model';
import { Http, RequestOptions } from "@angular/http";
import { API } from "../app.api";
import { of } from 'rxjs';
import { IOtherCnpj } from './models/other-cnpj.model';

@Injectable()
export class CheckInService {
  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
  ) {}

  checkIn(checkInId: number): Observable<CheckInModel> {
    return this.http
      .get(`${API}/checking/${checkInId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  post(checkInModel: CheckInModel): Observable<{
    message?: string;
    object?: CheckInModel;
  }> {
    this.deleteReadOnlyProperties(checkInModel);

    return this.http
      .post(`${API}/checking`, JSON.stringify(checkInModel), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  put(checkInModel: CheckInModel): Observable<{
    message?: string;
    object?: CheckInModel;
  }> {
    this.deleteReadOnlyProperties(checkInModel);

    return this.http
      .put(`${API}/checking`, JSON.stringify(checkInModel), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  resetAcceptClient(
    checkInId: number,
    date: string,
    accept: number,
  ): Observable<{
    message?: string;
    object?: CheckInModel;
  }> {
    const checkInModel = {
      id: checkInId,
      accept_client_date: date,
      accept_client: accept,
    };

    return this.http
      .put(`${API}/checking`, JSON.stringify(checkInModel), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  sendEmail(checkInId: number) {
    const body = {
      checkin_id: checkInId,
    };

    return this.http
      .post(
        `${API}/checking/email`,
        JSON.stringify(body),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  private deleteReadOnlyProperties(checkInModel: CheckInModel) {
    delete checkInModel.hash;

    delete checkInModel.extras_accept_client;
    delete checkInModel.extras_accept_client_date;

    delete checkInModel.accept_client;
    delete checkInModel.accept_client_date;

    delete checkInModel.extras_obs;
  }

  getOtherCnpjs(checkInId: number): Observable<IOtherCnpj[]> {
    return this.http
      .get(`${API}/cnpjs/${checkInId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  postOtherCnpj(body: IOtherCnpj): Observable<{ object: IOtherCnpj }> {
    delete body.id;
    
    return this.http
      .post(`${API}/cnpjs`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  putOtherCnpj(body: IOtherCnpj): Observable<{ object: IOtherCnpj }> {
    return this.http
      .put(`${API}/cnpjs`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  deleteOtherCnpj(id: number): Observable<any> {
    return this.http
      .delete(`${API}/cnpjs/${id}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}

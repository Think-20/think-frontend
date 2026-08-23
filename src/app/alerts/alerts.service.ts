import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from '../../app/app.api';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { EditStatus, ProjectStatus, ProjectsPendency } from './alerts.model';
import { catchError, map } from 'rxjs/operators';


@Injectable()
export class AlertService {

  status: ProjectStatus[] = [
    {
      id: 1,
      name: "Stand-by"
    },
    {
      id: 2,
      name: "Declinado"
    },
    {
      id: 3,
      name: "Aprovado"
    },
    {
      id: 4,
      name: "Reprovado"
    },
    {
      id: 5,
      name: "Negociação avançada"
    },
  ]

  // Estado reativo usado para avisar a aplicação quando a lista de alertas está vazia.
  // Qualquer componente que assinar esse observable consegue reagir à condição.
  private _listEmptySubject = new BehaviorSubject<boolean>(false);

  get listEmpty$() {
    return this._listEmptySubject.asObservable();
  }

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
  ) { }

  // Busca os alertas/pendências vindos da API.
  // Esse método é usado para saber se há itens pendentes de atualização ou aprovação.
  getAlerts(): Observable<ProjectsPendency> {
    const url = `notifywindow`

    return this.http.get(`${API}/${url}`)
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  // Atualiza o status de um projeto.
  // É o ponto de integração com o backend para mudar a situação do registro.
  updateStatusProject(project: EditStatus): Observable<EditStatus> {
    const url = 'job/edit'

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(project),
      new RequestOptions()
  )
  .map(response => response.json())
  .catch((err) => {
      this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
      })
      return ErrorHandler.capture(err)
  })
}

  getStatus(): ProjectStatus[] {

    return this.status;
  }

  // Temporariamente desativado: verificação de existência de alertas.
  // hasAlerts(): Observable<boolean> {
  //   return this.getAlerts().pipe(
  //     map(alerts => alerts.update_pendency.count > 0),
  //     catchError(err => {
  //       console.error('Error checking for alerts:', err);
  //       return of(false);
  //     })
  //   );
  // }

  // Temporariamente desativado: emissão do estado de lista vazia.
  // setListEmpty(value: boolean) {
  //   this._listEmptySubject.next(value);
  // }

}

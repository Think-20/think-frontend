import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable, of } from 'rxjs';
import { HomeData } from './models/home-data.model';

@Injectable()
export class HomeService {
  searchValue: any = {}
  pageIndex = 0
  layoutGrid: string;
  layoutGrid2: string;

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  home(params?: {}, page: number = 0): Observable<HomeData> {
    let url = `dashboard`
    return this.http.post(`${API}/${url}`,
      JSON.stringify(params),
      new RequestOptions()
    )
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })

    // const homeData: HomeData = {
    //   alertas: 1,
    //   memorias: 7,
    //   tempo_medio_aprovacao_dias: {
    //     ref: 38,
    //     total: 45
    //   },
    //   intervalo_medio_aprovacao_dias: {
    //     ref: 13,
    //     total: 7
    //   },
    //   ticket_medio_aprovacao: {
    //     ref: 190000,
    //     total: 183000
    //   },
    //   maior_venda: {
    //     ref: 5338000,
    //     total: 453000
    //   },
    //   tendencia_aprovacao_anual: {
    //     ref: 4231080,
    //     total: 4200000
    //   },
    //   media_aprovacao_mes: {
    //     ref: 400000,
    //     total: 420000
    //   },
    //   ticket_medio_jobs: {
    //     ref: 170000,
    //     total: 183000
    //   },
    //   ultimo_aprovado: 'Nestlé | Apas',
    //   ultimo_job_aprovado: "",
    //   eventos_rolando: "",
    //   aniversariante: "",
    //   comunicados: "",
    //   metas: "",
    //   recordes: "",
    //   ranking: {
    //     total: 1,
    //   },
    //   jobs: {
    //     labels: ["Aprovados", "Avançados", "Ajustes", "Stand-By", 'Reprovados'],
    //     colors: ["#adca5f", "#e82489", "#4fa2b1", "#00abeb", "#ffcd37"],
    //     series: [20, 10, 10, 30, 40],
    //     meta_jobs: 1200000,
    //     meta_aprovacao: 400000,
    //     total: 103,
    //     aprovados: {
    //       total: 7,
    //       porcentagem: 20,
    //       valor: 2000000
    //     },
    //     avancados: {
    //       total: 12,
    //       porcentagem: 10,
    //       valor: 2000000
    //     },
    //     ajustes: {
    //       total: 23,
    //       porcentagem: 10,
    //       valor: 2000000
    //     },
    //     stand_by: {
    //       total: 54,
    //       porcentagem: 30,
    //       valor: 2000000
    //     },
    //     reprovados: {
    //       total: 73,
    //       porcentagem: 40,
    //       valor: 2000000
    //     },
      // metas: {
      //   ultimos_doze_meses: {
      //       atual: 4950000,
      //       meta: 4800000,
      //       porcentagem: 50,
      //   },
      //   mes: {
      //     atual: 280000,
      //     meta: 4800000,
      //     porcentagem: 75,
      //   },
      //   quarter: {
      //     atual: 1300000,
      //     meta: 1200000,
      //     porcentagem: 40
      //   },
      //   anual: {
      //     atual: 3810000,
      //     meta: 4800000,
      //     porcentagem: 35
      //   },
      // },
    //     em_producao: {
    //       total: 4,
    //       total_em_producao: 500,
    //       jobs: [
    //         {
    //           total: 100,
    //           valor: 90,
    //           nome: "Ford | Salão Automóvel",
    //         },
    //         {
    //           total: 100,
    //           valor: 80,
    //           nome: "Microsoft | Futurecomm",
    //         },
    //         {
    //           total: 100,
    //           valor: 40,
    //           nome: "Nestlé | Rock in Rio",
    //         },
    //         {
    //           total: 100,
    //           valor: 35,
    //           nome: "Coca-Cola | Apas",
    //         },
    //       ]
    //     },
    //     prazo_final: {
    //       total: 5,
    //       valor: 7000000
    //     },
    //   },
    //   jobs2: {
    //     labels: ["Cenografia", "Stand", "PDV", "Showrooms", 'Outsiders'],
    //     colors: ["#adca5f", "#e82489", "#4fa2b1", "#00abeb", "#ffcd37"],
    //     series: [44, 55, 41, 17],
    //     meta_jobs: 1200000,
    //     total: 103,
    //     meta_aprovacao: 400000,
    //   },
    //   tendencia: {
    //     meses_ano: ["Jan 23", "Fev 23", "Mar 23", "Abr 23", "Mai 23", "Jun 23", "Jul 23", "Ago 23", "Set 23", "Out 23", "Nov 23", "Dez 23"],
    //     series: [
    //       {
    //         name: "High - 2013",
    //         data: [28, 29, 33, 30, 45, 68, 68, 43, 42, 55, 33, 33],
    //       },
    //       {
    //         name: "Low - 2013",
    //         data: [12, 20, 25, 60, 32, 20, 10, 50, 25, 33, 33, 33]
    //       }
    //     ],
    //     colors: ["#77B6EA", "#545454"],
    //     meta_mensal: 400000,
    //   },
    //   sold_out: {
    //     total: 1,
    //     valor: 2000000
    //   }
    // }

    //  return of(homeData);
  }
}
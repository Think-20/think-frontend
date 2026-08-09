import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'cb-cedentes',
  templateUrl: './cedentes.component.html',
  styleUrls: ['./cedentes.component.css']
})
export class CedentesComponent implements OnInit {
  showModal = false;
  fundosExistem: any[] = [];
  fund_id: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.buscarFundos();
  }

  buscarFundos() {
    const url = `${environment.api}/funds/all`;

    this.http.post(url, {}).subscribe({
      next: (res: any) => {
        this.fundosExistem = this.extractFundData(res);

        console.log(this.fundosExistem);
      },
      error: (err) => {
        console.error('Erro ao carregar fundos:', err);
        this.fundosExistem = [];
      }
    });
  }

  private extractFundData(res: any): any[] {
    if (res && Array.isArray(res.pagination.data)) {
      return res.pagination.data;
    }
    return [];
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  selecionarFundo(fundo: any) {

    console.log('Fundo selecionado:', fundo);

    // navega para tela de cadastro
    this.router.navigate(
      ['/cadastroCedentes', fundo.id]
    );

  }

}

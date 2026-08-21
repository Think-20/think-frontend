import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../environments/environment.prod';
import { FundStateService } from '../fund-state.service';

@Component({
  selector: 'cb-list-cedentes',
  templateUrl: './list-cedentes.component.html',
  styleUrls: ['./list-cedentes.component.css']
})
export class ListCedentesComponent implements OnInit {
  fundId: string | null = null;

  formBusca!: FormGroup;
  cedentes: any = { data: [] };
  cedentesFiltrados: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private fundState: FundStateService) { }

  ngOnInit() {
    this.formBusca = this.fb.group({
      pesquisa: ['']
    });

    const pesquisaControl = this.formBusca.get('pesquisa');
    if (pesquisaControl) {
      pesquisaControl.valueChanges.subscribe(() => {
        this.aplicarFiltro();
      });
    }

    this.fundId = this.fundState.currentFundId;
    this.fundState.fundId$.subscribe((id) => {
      this.fundId = id;
      this.buscarCedentes();
    });

    this.buscarCedentes();
  }

  buscarCedentes() {
    const url = `${environment.api}/cedentes/all`;
    const body: any = {
      fund_id: this.fundId
    };

    this.http.post(url, body).subscribe({
      next: (res: any) => {
        this.cedentes = res;
        this.organizarCedentes();
        this.aplicarFiltro();
      },
      error: (err) => {
        console.error(err);
        this.cedentes = { data: [] };
        this.organizarCedentes();
        this.aplicarFiltro();
      }
    });
  }

  aplicarFiltro(): void {
    const pesquisaControl = this.formBusca ? this.formBusca.get('pesquisa') : null;
    const termoBusca = this.normalizarTexto(pesquisaControl ? pesquisaControl.value : '');
    const listaCedentes = this.cedentes && Array.isArray(this.cedentes.data) ? this.cedentes.data : [];

    if (!termoBusca) {
      this.cedentesFiltrados = [...listaCedentes];
      return;
    }

    this.cedentesFiltrados = listaCedentes.filter((cedente: any) => {
      const nome = this.normalizarTexto(cedente ? cedente.nome : '');
      const documento = this.normalizarTexto(cedente ? cedente.documento : '');
      const id = this.normalizarTexto(cedente ? cedente.id : '');

      return nome.includes(termoBusca) || documento.includes(termoBusca) || id.includes(termoBusca);
    });
  }

  private normalizarTexto(valor: any): string {
    return String(valor || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  formatarStatus(status: string): string {
    console.log('STATUS ORIGINAL:', status);
    if (!status) {
      return 'pendente';
    }

    return String(status)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  }

  organizarCedentes() {
    if (!this.cedentes || !Array.isArray(this.cedentes.data)) {
      this.cedentes.data = [];
    }
  }
}

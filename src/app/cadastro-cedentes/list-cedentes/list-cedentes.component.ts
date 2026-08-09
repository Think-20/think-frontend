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
  cedentes: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private fundState: FundStateService) { }

  ngOnInit() {
    this.formBusca = this.fb.group({
      pesquisa: ['']
    });

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
      },
      error: (err) => {
        console.error(err);
        this.organizarCedentes();
      }
    });
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
    // No list view, a organização pode ser feita aqui se for necessário.
    // Por enquanto, apenas mantém a estrutura solicitada.
  }
}

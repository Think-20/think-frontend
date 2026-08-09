import { Component, OnInit, OnDestroy } from '@angular/core';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cb-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ContratosComponent implements OnInit, OnDestroy {
  totalPartesRelacionadas = 0;
  private destroy$ = new Subject<void>();

  constructor(private cedenteDataService: CedenteDataService) { }

  ngOnInit() {
    this.atualizarQuantidadePartesRelacionadas();

    this.cedenteDataService.obterDados$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.atualizarQuantidadePartesRelacionadas();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private atualizarQuantidadePartesRelacionadas() {
    const dados = this.cedenteDataService.obterDados();
    this.totalPartesRelacionadas = Array.isArray(dados.partes_relacionadas) ? dados.partes_relacionadas.length : 0;
  }
}

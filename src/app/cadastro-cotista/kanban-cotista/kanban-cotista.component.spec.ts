import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

import { CotistaKanban, KanbanCotistaComponent } from './kanban-cotista.component';

describe('KanbanCotistaComponent', () => {
  let component: KanbanCotistaComponent;
  let fixture: ComponentFixture<KanbanCotistaComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanCotistaComponent ],
      imports: [CommonModule, DragDropModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    httpTestingController = TestBed.get(HttpTestingController);
    fixture = TestBed.createComponent(KanbanCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const request = httpTestingController.expectOne(`${environment.api}/cotistas/all`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ per_page: 100 });
    request.flush({ data: [] });
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cotistas from the API when the kanban initializes', () => {
    const cotista: CotistaKanban = { id: 1, nome: 'Cotista existente', status: 'aprovado' };
    const apiFixture = TestBed.createComponent(KanbanCotistaComponent);
    apiFixture.detectChanges();
    const request = httpTestingController.expectOne(`${environment.api}/cotistas/all`);
    request.flush({ data: [cotista] });

    expect(apiFixture.componentInstance.cotistas).toEqual([cotista]);
    expect(apiFixture.componentInstance.aprovados).toEqual([cotista]);
  });

  it('should keep attachments from navigation state when the list response omits them', () => {
    const arquivos = [{
      document_type: 1,
      original_name: 'identificacao.pdf',
      content_base64: 'encoded-document',
      base64: 'encoded-document'
    }];
    const cotista = { id: 2, status: 'rascunho', arquivos };
    const originalState = window.history.state;
    window.history.replaceState({ cotistas: [cotista] }, '');

    const apiFixture = TestBed.createComponent(KanbanCotistaComponent);
    apiFixture.detectChanges();
    const request = httpTestingController.expectOne(`${environment.api}/cotistas/all`);
    request.flush({ data: [{ id: 2, status: 'rascunho' }] });

    expect(apiFixture.componentInstance.cotistas[0].arquivos).toEqual(arquivos);
    window.history.replaceState(originalState, '');
  });

  it('should open a draft cotista for editing when its card is clicked', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    const cotista: CotistaKanban = { id: 2, nome: 'Cotista em rascunho', status: 'rascunho' };

    component.abrirCotista(cotista);

    expect(navigateSpy).toHaveBeenCalledWith('/cadastro-cotista/nova', {
      state: { cotista }
    });
  });

  it('should show all four columns when there are no cotistas', () => {
    expect(component.kanbanColumns.map(column => column.status)).toEqual([
      'rascunho', 'pendente', 'aprovado', 'cancelado'
    ]);
    expect(fixture.nativeElement.querySelectorAll('.containerCards').length).toBe(4);
  });

  it('should show a button to create a new cotista', () => {
    const button = fixture.nativeElement.querySelector('.novo-cotista-button') as HTMLAnchorElement;

    expect(button.textContent).toContain('Novo cotista');
    expect(button.querySelector('mat-icon').textContent).toContain('add');
    expect(button.getAttribute('href')).toBe('/cadastro-cotista/nova');
  });

  it('should display the four requested columns and group cotistas by status', () => {
    component.cotistas = [
      { id: 1, nome: 'Cotista em rascunho', sexo: 'Feminino', documento: '111', suitability: { perfil: 'Conservador' }, status: 'rascunho' },
      { id: 2, nome: 'Cotista pendente', status: 'pendente' },
      { id: 3, nome: 'Cotista aprovado', status: 'aprovado' },
      { id: 4, nome: 'Cotista cancelado', status: 'cancelado' }
    ];
    component.ngOnChanges({
      cotistas: new SimpleChange(undefined, component.cotistas, true)
    });

    expect(component.kanbanColumns.map(column => column.status)).toEqual([
      'rascunho', 'pendente', 'aprovado', 'cancelado'
    ]);
    expect(component.rascunhos.length).toBe(1);
    expect(component.pendentes.length).toBe(1);
    expect(component.aprovados.length).toBe(1);
    expect(component.cancelados.length).toBe(1);
  });

  it('should show only name, sex, document, and suitability profile on each card', () => {
    component.cotistas = [{
      id: 1,
      nome_completo: 'Cotista Teste',
      sexo: 'Feminino',
      documento: '52998224725',
      email: 'cotista@example.com',
      suitability: { perfil: 'Moderado' },
      status: 'aprovado'
    }];
    component.ngOnChanges({
      cotistas: new SimpleChange(undefined, component.cotistas, true)
    });
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.cardKanban') as HTMLElement;
    expect(card.textContent).toContain('Cotista Teste');
    expect(card.textContent).toContain('Sexo: Feminino');
    expect(card.textContent).toContain('Documento: 52998224725');
    expect(card.textContent).toContain('Perfil: Moderado');
    expect(card.textContent).not.toContain('cotista@example.com');
    expect(card.textContent).not.toContain('COT-1');
    expect(component.aprovados.length).toBe(1);
  });

  it('should delete a cotista and remove its card after the API succeeds', () => {
    const cotista: CotistaKanban = { id: 31, nome: 'Cotista removido', status: 'pendente' };
    component.cotistas = [cotista];
    component.ngOnChanges({
      cotistas: new SimpleChange(undefined, component.cotistas, true)
    });
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector(
      '[aria-label="Excluir cotista"]'
    ) as HTMLButtonElement;
    expect(deleteButton.closest('.cardKanban')).not.toBeNull();
    deleteButton.click();

    const request = httpTestingController.expectOne(`${environment.api}/cotista/remove/31`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});

    expect(component.cotistas).toEqual([]);
    expect(component.pendentes).toEqual([]);
  });

  it('should load cotistas from browser history when navigation state is unavailable', () => {
    const cotista = {
      nome_completo: 'Cotista da navegação',
      sexo: 'Masculino',
      documento: '12345678901',
      perfil: 'Conservador',
      status: 'pendente'
    };
    const originalState = window.history.state;
    window.history.replaceState({ cotistas: [cotista] }, '');

    const historyFixture = TestBed.createComponent(KanbanCotistaComponent);
    historyFixture.detectChanges();
    const request = httpTestingController.expectOne(`${environment.api}/cotistas/all`);
    request.error(new ErrorEvent('Network error'));
    historyFixture.detectChanges();

    const card = historyFixture.nativeElement.querySelector('.cardKanban') as HTMLElement;
    expect(card.textContent).toContain('Cotista da navegação');
    expect(card.textContent).toContain('Sexo: Masculino');
    expect(card.textContent).toContain('Documento: 12345678901');
    expect(card.textContent).toContain('Perfil: Conservador');

    window.history.replaceState(originalState, '');
  });

  it('should move a cotista between columns and emit its new status', () => {
    const cotista: CotistaKanban = { id: 1, status: 'pendente' };
    component.cotistas = [cotista];
    component.ngOnChanges({
      cotistas: new SimpleChange(undefined, component.cotistas, true)
    });
    let emittedStatus: string;
    component.statusAlterado.subscribe(change => emittedStatus = change.statusAtual);

    component.drop({
      previousContainer: { data: component.pendentes },
      container: { id: 'aprovado', data: component.aprovados },
      previousIndex: 0,
      currentIndex: 0
    } as CdkDragDrop<CotistaKanban[]>);

    expect(component.pendentes.length).toBe(0);
    expect(component.aprovados.length).toBe(1);
    expect(cotista.status).toBe('aprovado');
    expect(emittedStatus).toBe('aprovado');

    const request = httpTestingController.expectOne(`${environment.api}/cotista/patch`);
    request.flush({});
  });

  it('should patch the complete cotista and restore its previous status if the request fails', () => {
    spyOn(console, 'error');
    const cotista: CotistaKanban = {
      id: 25,
      nome_completo: 'Cotista Teste',
      tipo_pessoa: 'fisica',
      documento: '52998224725',
      status: 'pendente',
      suitability: { perfil: 'Moderado', respostas: [] }
    };
    component.cotistas = [cotista];
    component.ngOnChanges({
      cotistas: new SimpleChange(undefined, component.cotistas, true)
    });

    component.drop({
      previousContainer: { data: component.pendentes },
      container: { id: 'aprovado', data: component.aprovados },
      previousIndex: 0,
      currentIndex: 0
    } as CdkDragDrop<CotistaKanban[]>);

    const request = httpTestingController.expectOne(`${environment.api}/cotista/patch`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      ...cotista,
      enviar: true,
      status: 'aprovado'
    });

    request.flush({}, { status: 500, statusText: 'Server Error' });

    expect(cotista.status).toBe('pendente');
    expect(component.pendentes).toEqual([cotista]);
    expect(component.aprovados).toEqual([]);
  });

  it('should not send persisted attachment metadata when changing cotista status', () => {
    const cotista: CotistaKanban = {
      id: 26,
      status: 'pendente',
      arquivos: [{ document_type: 1, original_name: 'identificacao.pdf' }],
      cotista_files: [{ document_type: 1, original_name: 'identificacao.pdf' }]
    };
    component.cotistas = [cotista];
    component.ngOnChanges({
      cotistas: new SimpleChange(undefined, component.cotistas, true)
    });

    component.drop({
      previousContainer: { data: component.pendentes },
      container: { id: 'aprovado', data: component.aprovados },
      previousIndex: 0,
      currentIndex: 0
    } as CdkDragDrop<CotistaKanban[]>);

    const request = httpTestingController.expectOne(`${environment.api}/cotista/patch`);
    expect(request.request.body.status).toBe('aprovado');
    expect(request.request.body.arquivos).toBeUndefined();
    expect(request.request.body.cotista_files).toBeUndefined();
    request.flush({});
  });
});

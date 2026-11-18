import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { CotistaKanban, KanbanCotistaComponent } from './kanban-cotista.component';

describe('KanbanCotistaComponent', () => {
  let component: KanbanCotistaComponent;
  let fixture: ComponentFixture<KanbanCotistaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanCotistaComponent ],
      imports: [CommonModule, DragDropModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    expect(card.textContent).toContain('Nome: Cotista Teste');
    expect(card.textContent).toContain('Sexo: Feminino');
    expect(card.textContent).toContain('Documento: 52998224725');
    expect(card.textContent).toContain('Perfil: Moderado');
    expect(card.textContent).not.toContain('cotista@example.com');
    expect(card.textContent).not.toContain('COT-1');
    expect(component.aprovados.length).toBe(1);
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

    component.ngOnInit();
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.cardKanban') as HTMLElement;
    expect(card.textContent).toContain('Nome: Cotista da navegação');
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
  });
});

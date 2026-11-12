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

  it('should display the four requested columns and group cotistas by status', () => {
    component.cotistas = [
      { id: 1, nome: 'Cotista em rascunho', status: 'rascunho' },
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

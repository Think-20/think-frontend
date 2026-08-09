import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoCedenteInfoComponent } from './historico-cedente-info.component';

describe('HistoricoCedenteInfoComponent', () => {
  let component: HistoricoCedenteInfoComponent;
  let fixture: ComponentFixture<HistoricoCedenteInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricoCedenteInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoCedenteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

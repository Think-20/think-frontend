import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliacaoCedenteInfoComponent } from './avaliacao-cedente-info.component';

describe('AvaliacaoCedenteInfoComponent', () => {
  let component: AvaliacaoCedenteInfoComponent;
  let fixture: ComponentFixture<AvaliacaoCedenteInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvaliacaoCedenteInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvaliacaoCedenteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

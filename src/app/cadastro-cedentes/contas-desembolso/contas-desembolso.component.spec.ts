import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasDesembolsoComponent } from './contas-desembolso.component';

describe('ContasDesembolsoComponent', () => {
  let component: ContasDesembolsoComponent;
  let fixture: ComponentFixture<ContasDesembolsoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContasDesembolsoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContasDesembolsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

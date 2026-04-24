import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPeriodFilterComponent } from './financial-period-filter.component';

describe('FinancialPeriodFilterComponent', () => {
  let component: FinancialPeriodFilterComponent;
  let fixture: ComponentFixture<FinancialPeriodFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialPeriodFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialPeriodFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

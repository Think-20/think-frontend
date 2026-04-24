import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialDateFilterComponent } from './financial-date-filter.component';

describe('FinancialDateFilterComponent', () => {
  let component: FinancialDateFilterComponent;
  let fixture: ComponentFixture<FinancialDateFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialDateFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialDateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

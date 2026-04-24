import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialFilterComponent } from './financial-filter.component';

describe('FinancialFilterComponent', () => {
  let component: FinancialFilterComponent;
  let fixture: ComponentFixture<FinancialFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

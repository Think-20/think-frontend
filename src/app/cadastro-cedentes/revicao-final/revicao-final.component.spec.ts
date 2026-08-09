import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevicaoFinalComponent } from './revicao-final.component';

describe('RevicaoFinalComponent', () => {
  let component: RevicaoFinalComponent;
  let fixture: ComponentFixture<RevicaoFinalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevicaoFinalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevicaoFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

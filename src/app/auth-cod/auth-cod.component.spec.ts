import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCodComponent } from './auth-cod.component';

describe('AuthCodComponent', () => {
  let component: AuthCodComponent;
  let fixture: ComponentFixture<AuthCodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthCodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

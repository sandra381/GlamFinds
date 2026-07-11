import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarARTComponent } from './agregar-art.component';

describe('AgregarARTComponent', () => {
  let component: AgregarARTComponent;
  let fixture: ComponentFixture<AgregarARTComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarARTComponent]
    });
    fixture = TestBed.createComponent(AgregarARTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

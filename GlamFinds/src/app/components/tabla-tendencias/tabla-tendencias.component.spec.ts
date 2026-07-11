import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaTendenciasComponent } from './tabla-tendencias.component';

describe('TablaTendenciasComponent', () => {
  let component: TablaTendenciasComponent;
  let fixture: ComponentFixture<TablaTendenciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaTendenciasComponent]
    });
    fixture = TestBed.createComponent(TablaTendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

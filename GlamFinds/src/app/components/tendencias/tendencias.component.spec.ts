import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TendenciasComponent } from './tendencias.component';

describe('TendenciasComponent', () => {
  let component: TendenciasComponent;
  let fixture: ComponentFixture<TendenciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TendenciasComponent]
    });
    fixture = TestBed.createComponent(TendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaMaquillajeComponent } from './tabla-maquillaje.component';

describe('TablaMaquillajeComponent', () => {
  let component: TablaMaquillajeComponent;
  let fixture: ComponentFixture<TablaMaquillajeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaMaquillajeComponent]
    });
    fixture = TestBed.createComponent(TablaMaquillajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

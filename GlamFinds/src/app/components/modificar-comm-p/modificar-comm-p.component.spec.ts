import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarCommPComponent } from './modificar-comm-p.component';

describe('ModificarCommPComponent', () => {
  let component: ModificarCommPComponent;
  let fixture: ComponentFixture<ModificarCommPComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModificarCommPComponent]
    });
    fixture = TestBed.createComponent(ModificarCommPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

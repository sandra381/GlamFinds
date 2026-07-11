import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarCommComponent } from './modificar-comm.component';

describe('ModificarCommComponent', () => {
  let component: ModificarCommComponent;
  let fixture: ComponentFixture<ModificarCommComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModificarCommComponent]
    });
    fixture = TestBed.createComponent(ModificarCommComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

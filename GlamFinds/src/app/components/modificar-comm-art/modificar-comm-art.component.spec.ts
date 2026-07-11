import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarCommARTComponent } from './modificar-comm-art.component';

describe('ModificarCommARTComponent', () => {
  let component: ModificarCommARTComponent;
  let fixture: ComponentFixture<ModificarCommARTComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModificarCommARTComponent]
    });
    fixture = TestBed.createComponent(ModificarCommARTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

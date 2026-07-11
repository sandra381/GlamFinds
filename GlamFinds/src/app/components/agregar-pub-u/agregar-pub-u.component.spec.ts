import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPubUComponent } from './agregar-pub-u.component';

describe('AgregarPubUComponent', () => {
  let component: AgregarPubUComponent;
  let fixture: ComponentFixture<AgregarPubUComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarPubUComponent]
    });
    fixture = TestBed.createComponent(AgregarPubUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

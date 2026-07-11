import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaDescuentosComponent } from './tabla-descuentos.component';

describe('TablaDescuentosComponent', () => {
  let component: TablaDescuentosComponent;
  let fixture: ComponentFixture<TablaDescuentosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaDescuentosComponent]
    });
    fixture = TestBed.createComponent(TablaDescuentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

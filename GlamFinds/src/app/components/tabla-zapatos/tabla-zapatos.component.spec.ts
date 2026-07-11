import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaZapatosComponent } from './tabla-zapatos.component';

describe('TablaZapatosComponent', () => {
  let component: TablaZapatosComponent;
  let fixture: ComponentFixture<TablaZapatosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaZapatosComponent]
    });
    fixture = TestBed.createComponent(TablaZapatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

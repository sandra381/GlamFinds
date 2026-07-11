import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaAccesoriosComponent } from './tabla-accesorios.component';

describe('TablaAccesoriosComponent', () => {
  let component: TablaAccesoriosComponent;
  let fixture: ComponentFixture<TablaAccesoriosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaAccesoriosComponent]
    });
    fixture = TestBed.createComponent(TablaAccesoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

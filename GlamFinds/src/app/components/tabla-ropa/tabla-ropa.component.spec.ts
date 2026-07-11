import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaRopaComponent } from './tabla-ropa.component';

describe('TablaRopaComponent', () => {
  let component: TablaRopaComponent;
  let fixture: ComponentFixture<TablaRopaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaRopaComponent]
    });
    fixture = TestBed.createComponent(TablaRopaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

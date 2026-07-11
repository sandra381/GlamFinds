import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryOnComponent } from './try-on.component';

describe('TryOnComponent', () => {
  let component: TryOnComponent;
  let fixture: ComponentFixture<TryOnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TryOnComponent]
    });
    fixture = TestBed.createComponent(TryOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

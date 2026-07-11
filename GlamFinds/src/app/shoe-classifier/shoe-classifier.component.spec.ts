import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoeClassifierComponent } from './shoe-classifier.component';

describe('ShoeClassifierComponent', () => {
  let component: ShoeClassifierComponent;
  let fixture: ComponentFixture<ShoeClassifierComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShoeClassifierComponent]
    });
    fixture = TestBed.createComponent(ShoeClassifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

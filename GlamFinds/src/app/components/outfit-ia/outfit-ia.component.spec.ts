import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutfitIaComponent } from './outfit-ia.component';

describe('OutfitIaComponent', () => {
  let component: OutfitIaComponent;
  let fixture: ComponentFixture<OutfitIaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OutfitIaComponent]
    });
    fixture = TestBed.createComponent(OutfitIaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

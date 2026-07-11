import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodboardComponent } from './moodboard.component';

describe('MoodboardComponent', () => {
  let component: MoodboardComponent;
  let fixture: ComponentFixture<MoodboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoodboardComponent]
    });
    fixture = TestBed.createComponent(MoodboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

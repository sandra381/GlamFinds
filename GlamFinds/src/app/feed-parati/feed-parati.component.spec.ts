import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedParatiComponent } from './feed-parati.component';

describe('FeedParatiComponent', () => {
  let component: FeedParatiComponent;
  let fixture: ComponentFixture<FeedParatiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedParatiComponent]
    });
    fixture = TestBed.createComponent(FeedParatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedSiguiendoComponent } from './feed-siguiendo.component';

describe('FeedSiguiendoComponent', () => {
  let component: FeedSiguiendoComponent;
  let fixture: ComponentFixture<FeedSiguiendoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedSiguiendoComponent]
    });
    fixture = TestBed.createComponent(FeedSiguiendoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

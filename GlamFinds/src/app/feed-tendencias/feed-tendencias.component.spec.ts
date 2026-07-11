import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedTendenciasComponent } from './feed-tendencias.component';

describe('FeedTendenciasComponent', () => {
  let component: FeedTendenciasComponent;
  let fixture: ComponentFixture<FeedTendenciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedTendenciasComponent]
    });
    fixture = TestBed.createComponent(FeedTendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

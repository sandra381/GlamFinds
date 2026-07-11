import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandlookComponent } from './randlook.component';

describe('RandlookComponent', () => {
  let component: RandlookComponent;
  let fixture: ComponentFixture<RandlookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RandlookComponent]
    });
    fixture = TestBed.createComponent(RandlookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

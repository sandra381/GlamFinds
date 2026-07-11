import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DupsComponent } from './dups.component';

describe('DupsComponent', () => {
  let component: DupsComponent;
  let fixture: ComponentFixture<DupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DupsComponent]
    });
    fixture = TestBed.createComponent(DupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

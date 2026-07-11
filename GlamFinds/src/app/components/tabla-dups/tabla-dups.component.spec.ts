import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaDupsComponent } from './tabla-dups.component';

describe('TablaDupsComponent', () => {
  let component: TablaDupsComponent;
  let fixture: ComponentFixture<TablaDupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaDupsComponent]
    });
    fixture = TestBed.createComponent(TablaDupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

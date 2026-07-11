import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagecolorComponent } from './imagecolor.component';

describe('ImagecolorComponent', () => {
  let component: ImagecolorComponent;
  let fixture: ComponentFixture<ImagecolorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImagecolorComponent]
    });
    fixture = TestBed.createComponent(ImagecolorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

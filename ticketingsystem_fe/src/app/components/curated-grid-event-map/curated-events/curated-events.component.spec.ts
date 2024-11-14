import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratedEventsComponent } from './curated-events.component';

describe('CuratedEventsComponent', () => {
  let component: CuratedEventsComponent;
  let fixture: ComponentFixture<CuratedEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuratedEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuratedEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

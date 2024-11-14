import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventmapComponent } from './event-map.component';

describe('EventmapComponent', () => {
  let component: EventmapComponent;
  let fixture: ComponentFixture<EventmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

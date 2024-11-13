import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueEventListComponent } from './venue-event-list.component';

describe('VenueEventListComponent', () => {
  let component: VenueEventListComponent;
  let fixture: ComponentFixture<VenueEventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueEventListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

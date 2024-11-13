import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueEventEditComponent } from './venue-event-edit.component';

describe('VenueEventEditComponent', () => {
  let component: VenueEventEditComponent;
  let fixture: ComponentFixture<VenueEventEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueEventEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueEventEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

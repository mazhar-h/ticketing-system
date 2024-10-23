import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsDetailModalComponent } from './booking-details-modal.component';

describe('BookingsDetailModalComponent', () => {
  let component: BookingsDetailModalComponent;
  let fixture: ComponentFixture<BookingsDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingsDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingsDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

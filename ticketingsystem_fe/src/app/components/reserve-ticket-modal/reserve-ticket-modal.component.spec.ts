import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveTicketModalComponent } from './reserve-ticket-modal.component';

describe('ReserveTicketModalComponent', () => {
  let component: ReserveTicketModalComponent;
  let fixture: ComponentFixture<ReserveTicketModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReserveTicketModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReserveTicketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

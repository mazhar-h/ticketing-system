import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSelectionModalComponent } from './ticket-selection-modal.component';

describe('TicketSelectionModalComponent', () => {
  let component: TicketSelectionModalComponent;
  let fixture: ComponentFixture<TicketSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSelectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

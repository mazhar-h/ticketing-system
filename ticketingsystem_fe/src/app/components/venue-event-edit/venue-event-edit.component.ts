import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { PerformerService } from '../../services/performer.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Papa } from 'ngx-papaparse';


@Component({
  selector: 'app-venue-event-edit',
  templateUrl: './venue-event-edit.component.html',
  styleUrls: ['./venue-event-edit.component.css'],
})
export class VenueEventEditComponent implements OnInit {
  eventId!: string;
  eventForm: FormGroup;
  performersArray: FormArray;
  performerSuggestions: Array<Array<any>> = [];

  statusOptions = ['OPEN', 'CANCELED', 'CLOSED'];
  ticketStatuses = ['AVAILABLE', 'UNAVAILABLE'];

  constructor(
    private papa: Papa,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private eventService: EventService,
    private performerService: PerformerService,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      performers: this.fb.array([]),
      date: ['', Validators.required],
      ticketExpirationDate: ['', Validators.required],
      status: ['', Validators.required],
      tickets: this.fb.array([]),
    });

    this.performersArray = this.eventForm.get('performers') as FormArray;
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || '';
    this.loadEventDetails();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.papa.parse(text, {
          header: true,
          complete: (result: any) => {
            result.data.splice(result.data.length - 1, 1);
            this.addTickets(result.data);
          },
        });
      };

      reader.onerror = (e) => {
        console.error('File could not be read! Code ' + e.target?.error?.name);
      };

      reader.readAsText(file);
    }
  }


  get tickets(): FormArray {
    return this.eventForm.get('tickets') as FormArray;
  }

  loadEventDetails(): void {
    this.eventService.getEvent(this.eventId).subscribe(
      (data: any) => {
        this.eventForm.patchValue({
          name: data.name,
          date: data.date,
          ticketExpirationDate: data.ticketExpiry,
          status: data.status || 'OPEN',
        });

        data.performers.forEach((performer: any) => {
          this.addPerformer(performer);
        });

        this.tickets.clear();
        data.tickets.forEach((ticket: any) => {
          if (ticket.status === 'UNAVAILABLE') {
            const ticketForm = this.createTicketForm(ticket);
            this.tickets.push(ticketForm);
          }
        });
      },
      (error: any) => {
        console.error('Error loading event details: ', error);
      }
    );
  }

  createTicketForm(ticket: any) {
    const ticketForm = this.fb.group({
      id: [{ value: ticket.id, disabled: true }],
      name: [ticket.name],
      price: [ticket.price],
      status: [ticket.status],
    });

    return ticketForm;
  }

  addPerformer(performer: any = { id: '', name: '' }): void {
    const performerGroup = this.fb.group({
      id: [performer.id],
      name: [performer.name, Validators.required],
    });

    this.performersArray.push(performerGroup);
    this.performerSuggestions.push([]);
    this.setupPerformerAutoComplete(this.performersArray.length - 1);
  }

  addTicket(ticket?: any) {
    const ticketForm = this.createTicketForm(
      ticket || { id: null, name: '', price: '', status: 'AVAILABLE' }
    );
    this.tickets.push(ticketForm);
  }

  addTickets(tickets: { name: string; price: number; quantity: number }[]) {
    tickets.forEach((ticket: any) => {
      for (let i = 0; i < ticket.quantity; i++) { 
      const ticketForm = this.fb.group({
        id: null,
        name: [ticket.name],
        price: [ticket.price],
        status: ticket.status || 'AVAILABLE'
      });

      (this.eventForm.get('tickets') as FormArray).push(ticketForm);
    }});
  }

  removeTicket(index: number) {
    this.tickets.removeAt(index);
  }

  removePerformer(index: number): void {
    this.performersArray.removeAt(index);
    this.performerSuggestions.splice(index, 1);
  }

  setupPerformerAutoComplete(index: number): void {
    this.performersArray
      .at(index)
      .get('name')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          if (searchTerm) {
            return this.performerService.searchPerformers(searchTerm);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (results: any[]) => {
          this.performerSuggestions[index] = results;
        },
        error: (error) => {
          console.error('Error fetching performer suggestions: ', error);
        },
      });
  }

  selectPerformer(index: number, performer: any): void {
    this.performersArray.at(index).patchValue({
      id: performer.id,
      name: performer.name,
    });
    this.performerSuggestions[index] = [];
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      let performerIds: any[] = [];
      this.eventForm.value.performers.map((p: any) => {
        performerIds.push(p.id);
      });
      const updatedEvent = {
        name: this.eventForm.value.name,
        performerIds: performerIds,
        date: this.eventForm.value.date,
        ticketExpiry: this.eventForm.value.ticketExpirationDate,
        status: this.eventForm.value.status,
        tickets: this.eventForm.getRawValue().tickets
      };

      this.eventService.updateEvent(this.eventId, updatedEvent).subscribe({
        next: () => {
          console.log('Event updated successfully');
          this.router.navigate(['/venue', 'events']);
        },
        error: (error: any) => {
          console.error('Error updating event: ', error);
        },
      });
    }
  }
}

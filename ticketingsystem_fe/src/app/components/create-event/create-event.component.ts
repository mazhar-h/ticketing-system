import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  debounceTime,
  switchMap,
  filter,
  distinctUntilChanged,
} from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { PerformerService } from 'src/app/services/performer.service';
import { UserService } from 'src/app/services/user.service';
import { EventService } from 'src/app/services/event.service';
import { tick } from '@angular/core/testing';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  performerSearchResults: Array<any[]> = [];
  selectedPerformerIds: number[] = [];
  searchTerms = new Subject<string>();
  currentIndex = 0;

  constructor(
    private papa: Papa,
    private fb: FormBuilder,
    private performerService: PerformerService,
    private userService: UserService,
    private eventService: EventService
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      performers: this.fb.array([]), // Array of performers
      tickets: this.fb.array([]), // Array of tickets
    });

    // Initialize search result arrays for each performer
    this.performers.valueChanges.subscribe(() => {
      this.performerSearchResults = this.performers.controls.map(() => []);
    });
  }

  ngOnInit() {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchText: string) => {
          const index = this.currentIndex;
          if (searchText.length > 1) {
            return this.performerService.searchPerformers(searchText);
          } else {
            this.performerSearchResults[index] = [];
            return [];
          }
        })
      )
      .subscribe((results) => {
        const index = this.currentIndex;
        this.performerSearchResults[index] = results;
      });
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

  get performers(): FormArray {
    return this.eventForm.get('performers') as FormArray;
  }

  get tickets(): FormArray {
    return this.eventForm.get('tickets') as FormArray;
  }

  addPerformer() {
    const performerForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.performers.push(performerForm);
    this.performerSearchResults.push([]);
  }

  onSearchPerformer(index: number, searchText: string) {
    this.currentIndex = index;
    this.searchTerms.next(searchText); 
  }

  selectPerformer(index: number, performer: any) {
    this.selectedPerformerIds.push(performer.id);
    const performerControl = this.performers.at(index).get('name');
    if (performerControl) {
      performerControl.setValue(performer.name);
    }
    this.performerSearchResults[index] = [];
  }

  removePerformer(index: number) {
    this.performers.removeAt(index);
    this.selectedPerformerIds.splice(index, 1);
  }

  addTicket() {
    const ticketForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(1)]],
    });
    (this.eventForm.get('tickets') as FormArray).push(ticketForm);
  }

  addTickets(tickets: { name: string; price: number; quantity: number }[]) {
    tickets.forEach((ticket: any) => {
      const ticketForm = this.fb.group({
        name: [ticket.name, Validators.required],
        price: [ticket.price, Validators.required],
        quantity: [ticket.quantity, Validators.required],
      });

      (this.eventForm.get('tickets') as FormArray).push(ticketForm);
    });
  }

  removeTicket(index: number) {
    (this.eventForm.get('tickets') as FormArray).removeAt(index);
  }

  formTicketsToRequestTickets(): any[] {
    if (this.eventForm.valid) {
      const eventFormData = this.eventForm.value;
      let tickets: any[] = [];
      eventFormData.tickets.forEach((element: any) => {
        for (let i = 0; i < element.quantity; i++) {
          let ticket = {
            name: element.name,
            price: element.price,
          };
          tickets.push(ticket);
        }
      });
      return tickets;
    }
    return [];
  }

  // Submit the form
  onSubmit() {
    if (this.eventForm.valid) {
      const eventFormData = this.eventForm.value;
      this.userService.getUser().subscribe({
        next: (response) => {
          let eventData = {
            name: eventFormData.name,
            venueId: response.id,
            tickets: this.formTicketsToRequestTickets(),
            performerIds: this.selectedPerformerIds,
          };
          this.eventService.createEvent(eventData).subscribe({
            next: () => {
              this.eventForm.reset();
              alert("Event created!");
            },
          });
        },
      });
    } else {
      console.log('Form is not valid');
    }
  }
}

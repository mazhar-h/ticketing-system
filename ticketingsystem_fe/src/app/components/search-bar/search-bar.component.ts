import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  searchTerm: string = '';
  @Output() search = new EventEmitter<string>();

  constructor(private router: Router) {}

  submitSearch() {
    this.search.emit(this.searchTerm);
    this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
  }
}

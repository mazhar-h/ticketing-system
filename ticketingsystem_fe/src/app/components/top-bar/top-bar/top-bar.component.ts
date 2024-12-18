import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent {  
  @Output() search = new EventEmitter<string>();
  
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']);
  }

  onSearch(term: string) {
    this.search.emit(term);
  }
}

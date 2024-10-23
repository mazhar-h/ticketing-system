import { Component } from '@angular/core';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent {

  onFileSelected(event: Event): void { 
    const file = (event.target as HTMLInputElement).files?.[0]; 
    if (file) { 
      const reader = new FileReader(); 
       
      reader.onload = (e) => { 
        const text = e.target?.result as string; 
        console.log(text); // Do something with the file content 
      }; 
 
      reader.onerror = (e) => { 
        console.error("File could not be read! Code " + e.target?.error?.name); 
      }; 
 
      reader.readAsText(file); // Read the file as text 
    } 
  } 
}

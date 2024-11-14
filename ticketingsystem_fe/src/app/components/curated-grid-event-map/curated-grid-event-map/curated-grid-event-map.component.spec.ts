import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratedGridEventMapComponent } from './curated-grid-event-map.component';

describe('CuratedGridEventMapComponent', () => {
  let component: CuratedGridEventMapComponent;
  let fixture: ComponentFixture<CuratedGridEventMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuratedGridEventMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuratedGridEventMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

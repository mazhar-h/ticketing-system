import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResult2Component } from './search-result2.component';

describe('SearchResult2Component', () => {
  let component: SearchResult2Component;
  let fixture: ComponentFixture<SearchResult2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResult2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchResult2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

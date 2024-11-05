import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeReauthComponent } from './stripe-reauth.component';

describe('StripeReauthComponent', () => {
  let component: StripeReauthComponent;
  let fixture: ComponentFixture<StripeReauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeReauthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeReauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

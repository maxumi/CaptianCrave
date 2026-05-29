import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantInfo } from './restaurant-info';

describe('RestaurantInfo', () => {
  let component: RestaurantInfo;
  let fixture: ComponentFixture<RestaurantInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

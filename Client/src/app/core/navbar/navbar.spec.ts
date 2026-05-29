import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { getTranslocoModule } from '../../shared/test/transloco-testing.module';
import { provideRouter } from '@angular/router';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, getTranslocoModule()],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

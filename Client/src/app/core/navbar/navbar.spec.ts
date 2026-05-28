import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { getTranslocoModule } from '../../shared/test/transloco-testing.module';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, getTranslocoModule()]
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

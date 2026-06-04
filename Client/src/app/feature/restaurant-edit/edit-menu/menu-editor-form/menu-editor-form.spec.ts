import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuEditorForm } from './menu-editor-form';

describe('MenuEditorForm', () => {
  let component: MenuEditorForm;
  let fixture: ComponentFixture<MenuEditorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuEditorForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuEditorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

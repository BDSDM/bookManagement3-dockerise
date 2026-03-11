import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBorrowsComponent } from './all-borrows.component';

describe('AllBorrowsComponent', () => {
  let component: AllBorrowsComponent;
  let fixture: ComponentFixture<AllBorrowsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllBorrowsComponent]
    });
    fixture = TestBed.createComponent(AllBorrowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {
  Component,
  OnInit,
  AfterViewInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Borrow, BorrowService } from 'src/app/core/services/borrow.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from 'src/app/core/services/book.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-borrows',
  templateUrl: './borrows.component.html',
  styleUrls: ['./borrows.component.css'],
})
export class BorrowsComponent implements OnInit, AfterViewInit {
  borrows: Borrow[] = [];
  dataSource = new MatTableDataSource<Borrow>([]);
  displayedColumns: string[] = [
    'borrowDate',
    'returnDate',
    'status',
    'bookId',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('returnDialog') returnDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  selectedBorrow!: Borrow;
  returnForm: FormGroup;

  constructor(
    private borrowService: BorrowService,
    private bookService: BookService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) {
    this.returnForm = this.fb.group({
      returnDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadBorrows();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // -------------------- Load borrows --------------------
  loadBorrows() {
    const userId = this.authService.getUserId();

    this.borrowService.getBorrowsByUserId(userId).subscribe({
      next: (data) => {
        this.borrows = data;

        const requests = this.borrows.map((borrow) =>
          this.bookService
            .getBookById(borrow.bookId)
            .pipe(map((book) => ({ ...borrow, bookTitle: book.title }))),
        );

        forkJoin(requests).subscribe({
          next: (updatedBorrows) => {
            this.borrows = updatedBorrows;
            this.dataSource.data = this.borrows;

            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
          },
          error: (err) => console.error('Erreur récupération titres:', err),
        });
      },
      error: (err) => console.error('Erreur API:', err),
    });
  }

  // -------------------- Open return dialog --------------------
  openReturnDialog(borrow: Borrow) {
    this.selectedBorrow = borrow;

    this.returnForm.reset({
      returnDate: new Date().toISOString().split('T')[0],
    });

    this.dialogRef = this.dialog.open(this.returnDialog);
  }

  // -------------------- Confirm return --------------------
  confirmReturn() {
    const rawDate = this.returnForm.value.returnDate;
    const returnDate = new Date(rawDate).toISOString();

    const updatedBorrow: Borrow = {
      ...this.selectedBorrow,
      returnDate: returnDate,
      status: 'retourné',
    };

    this.borrowService
      .updateBorrow(this.selectedBorrow.id!, updatedBorrow)
      .subscribe({
        next: () => {
          this.snackBar.open('📚 Emprunt restitué avec succès !', 'Fermer', {
            duration: 2500,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });

          this.loadBorrows();
          this.dialogRef.close();
        },
        error: (err) => console.error('Erreur restitution:', err),
      });
  }
}

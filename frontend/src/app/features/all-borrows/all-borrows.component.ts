import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Borrow,
  BorrowService,
  BorrowWithUserName,
} from 'src/app/core/services/borrow.service';
import { BookService } from 'src/app/core/services/book.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-all-borrows',
  templateUrl: './all-borrows.component.html',
  styleUrls: ['./all-borrows.component.css'],
})
export class AllBorrowsComponent implements OnInit {
  borrows: BorrowWithUserName[] = [];
  dataSource = new MatTableDataSource<BorrowWithUserName>([]);
  displayedColumns: string[] = [
    'borrowerName',
    'borrowDate',
    'returnDate',
    'status',
    'bookTitle',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private borrowService: BorrowService,
    private bookService: BookService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBorrows();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // -------------------- Charger tous les emprunts --------------------
  loadBorrows() {
    this.borrowService.getAllBorrows().subscribe({
      next: (data) => {
        // Étendre Borrow en BorrowWithUserName
        this.borrows = data.map((b) => ({ ...b }));

        // Pour chaque emprunt, récupérer titre du livre et nom de l'emprunteur
        this.borrows.forEach((borrow) => {
          // Titre du livre
          this.bookService.getBookById(borrow.bookId).subscribe({
            next: (book) => (borrow.bookTitle = book.title),
            error: (err) => console.error('Erreur titre livre:', err),
          });

          // Nom de l'emprunteur
          this.userService.getUserById(borrow.userId).subscribe({
            next: (user) => (borrow.borrowerName = user.name),
            error: (err) =>
              console.error('Erreur récupération nom utilisateur:', err),
          });
        });

        this.dataSource.data = this.borrows;
      },
      error: (err) => console.error('Erreur API:', err),
    });
  }

  // -------------------- Supprimer un emprunt --------------------
  deleteBorrow(borrow: Borrow) {
    if (!borrow.id) return;
    this.borrowService.deleteBorrow(borrow.id).subscribe({
      next: () => {
        this.snackBar.open('Emprunt supprimé avec succès !', 'Fermer', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
        this.loadBorrows();
      },
      error: (err) => console.error(err),
    });
  }
}

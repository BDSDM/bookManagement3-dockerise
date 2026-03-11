import { Component, OnInit } from '@angular/core';
import { Book } from 'src/app/core/models/book.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { BorrowService, Borrow } from 'src/app/core/services/borrow.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css'],
})
export class MyOrdersComponent implements OnInit {
  orders: Book[] = [];
  userId: number = 0;
  isSending: boolean = false;
  borrowDate: Date | null = null;

  constructor(
    private authService: AuthService,
    private ordersService: OrdersService,
    private borrowService: BorrowService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadOrders();
  }

  // -------------------- Load orders from localStorage --------------------
  loadOrders(): void {
    const ordersKey = `orders_${this.userId}`;
    this.orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  }

  // -------------------- Cancel orders --------------------
  cancelOrders(): void {
    const ordersKey = `orders_${this.userId}`;
    const hasOrdersKey = `hasOrders_${this.userId}`;

    localStorage.removeItem(ordersKey);
    localStorage.removeItem(hasOrdersKey);

    this.orders = [];

    this.snackBar.open('✅ Vos commandes ont été annulées', 'Fermer', {
      duration: 2500,
    });
  }

  // -------------------- Confirm orders --------------------
  confirmOrders(): void {
    if (this.orders.length === 0) {
      this.snackBar.open(
        "😔 Vous n'avez aucune commande à confirmer.",
        'Fermer',
        { duration: 2500 },
      );
      return;
    }

    if (!this.borrowDate) {
      this.snackBar.open(
        "❌ Vous devez sélectionner une date d'emprunt.",
        'Fermer',
        { duration: 2500 },
      );
      return;
    }

    const email = this.authService.getUserEmail();
    if (!email) {
      this.snackBar.open('❌ Impossible de récupérer votre email.', 'Fermer', {
        duration: 2500,
      });
      return;
    }

    this.isSending = true;

    // 🔹 Convert selected date safely (YYYY-MM-DD)
    const d = this.borrowDate;
    const borrowDateStr = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

    // 🔹 Send confirmation email
    this.ordersService.sendOrdersEmail(email, this.orders).subscribe({
      next: () => {
        // 🔹 Create borrow entry for each book
        this.orders.forEach((book) => {
          const borrow: Borrow = {
            borrowDate: borrowDateStr,
            returnDate: '',
            status: 'en cours',
            userId: this.userId,
            bookId: book.id!,
          };

          this.borrowService.createBorrow(borrow).subscribe({
            next: () => console.log('Borrow créé pour le livre', book.title),
            error: (err) => console.error('Erreur Borrow:', err),
          });
        });

        this.snackBar.open('📧 Email envoyé avec succès !', 'Fermer', {
          duration: 5000,
        });

        this.cancelOrders();

        this.snackBar.open(
          '📧 Un email de récapitulation vous a été envoyé !',
          'Fermer',
          { duration: 3000 },
        );

        this.isSending = false;
        this.borrowDate = null;
      },

      error: (err) => {
        console.error(err);

        this.snackBar.open("❌ Erreur lors de l'envoi de l'email.", 'Fermer', {
          duration: 3000,
        });

        this.isSending = false;
      },
    });
  }
}

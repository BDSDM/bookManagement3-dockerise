import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

export interface Borrow {
  id?: number;
  borrowDate: string; // ISO string format (ex: 2025-11-26)
  returnDate: string;
  status: string;
  userId: number;
  bookId: number;
  bookTitle?: string;
}
export interface BorrowWithUserName extends Borrow {
  borrowerName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  private apiUrl = environment.apiUrlBorrow;

  constructor(private http: HttpClient) {}

  // ✅ Créer un emprunt
  createBorrow(borrow: Borrow): Observable<Borrow> {
    return this.http.post<Borrow>(`${this.apiUrl}/create`, borrow);
  }

  // ✅ Mettre à jour un emprunt
  updateBorrow(id: number, borrow: Borrow): Observable<Borrow> {
    return this.http.put<Borrow>(`${this.apiUrl}/update/${id}`, borrow);
  }

  // ✅ Récupérer un emprunt par ID
  getBorrowById(id: number): Observable<Borrow> {
    return this.http.get<Borrow>(`${this.apiUrl}/${id}`);
  }

  // ✅ Récupérer tous les emprunts
  getAllBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.apiUrl}/all`);
  }

  // ✅ Supprimer un emprunt
  deleteBorrow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // ✅ Récupérer les emprunts par utilisateur
  getBorrowsByUserId(userId: number): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ Récupérer les emprunts par livre
  getBorrowsByBookId(bookId: number): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.apiUrl}/book/${bookId}`);
  }

  // ✅ Récupérer les emprunts par statut
  getBorrowsByStatus(status: string): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.apiUrl}/status/${status}`);
  }
}

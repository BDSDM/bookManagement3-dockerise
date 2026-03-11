package com.bookManagement.pojo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "borrows")
public class Borrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Date d'emprunt
    @Column(nullable = false)
    private LocalDate borrowDate;

    // Date prévue de retour
    @Column(nullable = true)
    private LocalDate returnDate;

    // Statut de l'emprunt (ex: "en cours", "retourné", "retard")
    @Column(nullable = false)
    private String status;

    // Relation avec User (un user peut avoir plusieurs emprunts)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Relation avec Book (un livre peut être emprunté plusieurs fois)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // Constructeurs
    public Borrow() {}

    public Borrow(LocalDate borrowDate, LocalDate returnDate, String status, User user, Book book) {
        this.borrowDate = borrowDate;
        this.returnDate = returnDate;
        this.status = status;
        this.user = user;
        this.book = book;
    }

    // Getters & Setters
    public Long getId() { return id; }

    public LocalDate getBorrowDate() { return borrowDate; }
    public void setBorrowDate(LocalDate borrowDate) { this.borrowDate = borrowDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
}

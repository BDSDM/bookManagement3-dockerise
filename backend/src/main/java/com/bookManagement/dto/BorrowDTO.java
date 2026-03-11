package com.bookManagement.dto;

import java.time.LocalDate;

public class BorrowDTO {

    private Long id;
    private LocalDate borrowDate;
    private LocalDate returnDate;
    private String status;
    private Long userId;
    private Long bookId;

    public BorrowDTO() {}

    public BorrowDTO(Long id, LocalDate borrowDate, LocalDate returnDate, String status, Long userId, Long bookId) {
        this.id = id;
        this.borrowDate = borrowDate;
        this.returnDate = returnDate;
        this.status = status;
        this.userId = userId;
        this.bookId = bookId;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getBorrowDate() { return borrowDate; }
    public void setBorrowDate(LocalDate borrowDate) { this.borrowDate = borrowDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
}

package com.bookManagement.dao;

import com.bookManagement.pojo.Borrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowDao extends JpaRepository<Borrow, Long> {

    // Récupérer tous les emprunts d'un utilisateur
    List<Borrow> findByUserId(Long userId);

    // Récupérer tous les emprunts d'un livre
    List<Borrow> findByBookId(Long bookId);

    // Récupérer les emprunts par statut (ex: "PENDING", "RETURNED")
    List<Borrow> findByStatus(String status);
}

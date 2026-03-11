package com.bookManagement.restImpl;

import com.bookManagement.dto.BorrowDTO;
import com.bookManagement.service.BorrowService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
public class BorrowRestImpl {

    private final BorrowService borrowService;

    public BorrowRestImpl(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    // ✅ Créer un nouvel emprunt
    @PostMapping("/create")
    public BorrowDTO createBorrow(@RequestBody BorrowDTO dto) {
        return borrowService.createBorrow(dto);
    }

    // ✅ Mettre à jour un emprunt existant
    @PutMapping("/update/{id}")
    public BorrowDTO updateBorrow(@PathVariable ("id") Long id, @RequestBody BorrowDTO dto) {
        return borrowService.updateBorrow(id, dto);
    }

    // ✅ Récupérer un emprunt par son ID
    @GetMapping("/{id}")
    public BorrowDTO getBorrowById(@PathVariable Long id) {
        return borrowService.getBorrowById(id);
    }

    // ✅ Récupérer tous les emprunts
    @GetMapping("/all")
    public List<BorrowDTO> getAllBorrows() {
        return borrowService.getAllBorrows();
    }

    // ✅ Supprimer un emprunt
    @DeleteMapping("/delete/{id}")
    public void deleteBorrow(@PathVariable("id") Long id) {
        borrowService.deleteBorrow(id);
    }

    // ✅ Récupérer tous les emprunts d'un utilisateur
    @GetMapping("/user/{userId}")
    public List<BorrowDTO> getBorrowsByUserId(@PathVariable("userId") Long userId) {
        return borrowService.getBorrowsByUserId(userId);
    }

    // ✅ Récupérer tous les emprunts d'un livre
    @GetMapping("/book/{bookId}")
    public List<BorrowDTO> getBorrowsByBookId(@PathVariable Long bookId) {
        return borrowService.getBorrowsByBookId(bookId);
    }

    // ✅ Récupérer les emprunts par statut
    @GetMapping("/status/{status}")
    public List<BorrowDTO> getBorrowsByStatus(@PathVariable String status) {
        return borrowService.getBorrowsByStatus(status);
    }
}

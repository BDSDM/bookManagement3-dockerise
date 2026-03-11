package com.bookManagement.service;

import com.bookManagement.dto.BorrowDTO;
import java.util.List;

public interface BorrowService {

    BorrowDTO createBorrow(BorrowDTO borrowDTO);

    BorrowDTO updateBorrow(Long id, BorrowDTO borrowDTO);

    BorrowDTO getBorrowById(Long id);

    List<BorrowDTO> getAllBorrows();

    void deleteBorrow(Long id);

    List<BorrowDTO> getBorrowsByUserId(Long userId);

    List<BorrowDTO> getBorrowsByBookId(Long bookId);

    List<BorrowDTO> getBorrowsByStatus(String status);
}

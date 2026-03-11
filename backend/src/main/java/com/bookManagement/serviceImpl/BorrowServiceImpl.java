package com.bookManagement.serviceImpl;

import com.bookManagement.dao.BorrowDao;
import com.bookManagement.dao.BookDao;
import com.bookManagement.dao.UserDao;
import com.bookManagement.dto.BorrowDTO;
import com.bookManagement.pojo.Borrow;
import com.bookManagement.pojo.Book;
import com.bookManagement.pojo.User;
import com.bookManagement.service.BorrowService;
import com.bookManagement.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class BorrowServiceImpl implements BorrowService {

    private final BorrowDao borrowDao;
    private final BookDao bookDao;
    private final UserDao userDao;
    private final NotificationService notificationService;

    public BorrowServiceImpl(BorrowDao borrowDao,
                             BookDao bookDao,
                             UserDao userDao,
                             NotificationService notificationService) {
        this.borrowDao = borrowDao;
        this.bookDao = bookDao;
        this.userDao = userDao;
        this.notificationService = notificationService;
    }

    @Override
    public BorrowDTO createBorrow(BorrowDTO dto) {

        if (dto == null) {
            throw new RuntimeException("Borrow data is missing");
        }

        if (dto.getBookId() == null) {
            throw new RuntimeException("Book ID is required");
        }

        if (dto.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        Book book = bookDao.findById(dto.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + dto.getBookId()));

        User user = userDao.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));

        if (!book.getStatus()) {
            throw new RuntimeException("Book is not available");
        }

        Borrow borrow = new Borrow();
        borrow.setBook(book);
        borrow.setUser(user);

        // Set borrow date
        borrow.setBorrowDate(LocalDate.now());

        // Return date may be null
        borrow.setReturnDate(dto.getReturnDate());

        borrow.setStatus("BORROWED");

        book.setStatus(false);

        Borrow savedBorrow = borrowDao.save(borrow);

        notifyAdmins(
                "Book borrowed: "
                        + savedBorrow.getBook().getTitle()
                        + " by user: "
                        + savedBorrow.getUser().getName()
        );

        BorrowDTO response = new BorrowDTO();
        response.setId(savedBorrow.getId());
        response.setBookId(savedBorrow.getBook().getId());
        response.setUserId(savedBorrow.getUser().getId());
        response.setStatus(savedBorrow.getStatus());
        response.setBorrowDate(savedBorrow.getBorrowDate());
        response.setReturnDate(savedBorrow.getReturnDate());

        return response;
    }

    @Override
    public BorrowDTO updateBorrow(Long id, BorrowDTO dto) {

        Borrow borrow = borrowDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow not found with id: " + id));

        borrow.setStatus(dto.getStatus());

        // ✅ Save return date
        borrow.setReturnDate(dto.getReturnDate());

        Borrow updated = borrowDao.save(borrow);

        if ("CANCELED".equalsIgnoreCase(dto.getStatus())
                || "retourné".equalsIgnoreCase(dto.getStatus())) {

            notifyAdmins(
                    "Borrow updated: "
                            + updated.getBook().getTitle()
                            + " status changed to: "
                            + updated.getStatus()
                            + " by user: "
                            + updated.getUser().getName()
            );

            if ("RETURNED".equalsIgnoreCase(dto.getStatus())) {
                Book book = updated.getBook();
                book.setStatus(true);
                bookDao.save(book);
            }
        }

        BorrowDTO response = new BorrowDTO();
        response.setId(updated.getId());
        response.setBookId(updated.getBook().getId());
        response.setUserId(updated.getUser().getId());
        response.setStatus(updated.getStatus());
        response.setBorrowDate(updated.getBorrowDate());
        response.setReturnDate(updated.getReturnDate());

        return response;
    }

    @Override
    public BorrowDTO getBorrowById(Long id) {

        Borrow borrow = borrowDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow not found with id: " + id));

        BorrowDTO dto = new BorrowDTO();
        dto.setId(borrow.getId());
        dto.setBookId(borrow.getBook().getId());
        dto.setUserId(borrow.getUser().getId());
        dto.setStatus(borrow.getStatus());
        dto.setBorrowDate(borrow.getBorrowDate());
        dto.setReturnDate(borrow.getReturnDate());

        return dto;
    }

    @Override
    public List<BorrowDTO> getAllBorrows() {

        return borrowDao.findAll().stream().map(b -> {
            BorrowDTO dto = new BorrowDTO();
            dto.setId(b.getId());
            dto.setBookId(b.getBook().getId());
            dto.setUserId(b.getUser().getId());
            dto.setStatus(b.getStatus());
            dto.setBorrowDate(b.getBorrowDate());
            dto.setReturnDate(b.getReturnDate());
            return dto;
        }).toList();
    }

    @Override
    public void deleteBorrow(Long id) {

        Borrow borrow = borrowDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow not found with id: " + id));

        borrowDao.delete(borrow);

        Book book = borrow.getBook();
        book.setStatus(true);
        bookDao.save(book);

        notifyAdmins(
                "Borrow canceled: "
                        + borrow.getBook().getTitle()
                        + " by user: "
                        + borrow.getUser().getName()
        );
    }

    @Override
    public List<BorrowDTO> getBorrowsByUserId(Long userId) {

        return borrowDao.findByUserId(userId).stream().map(b -> {
            BorrowDTO dto = new BorrowDTO();
            dto.setId(b.getId());
            dto.setBookId(b.getBook().getId());
            dto.setUserId(b.getUser().getId());
            dto.setStatus(b.getStatus());
            dto.setBorrowDate(b.getBorrowDate());
            dto.setReturnDate(b.getReturnDate());
            return dto;
        }).toList();
    }

    @Override
    public List<BorrowDTO> getBorrowsByBookId(Long bookId) {

        return borrowDao.findByBookId(bookId).stream().map(b -> {
            BorrowDTO dto = new BorrowDTO();
            dto.setId(b.getId());
            dto.setBookId(b.getBook().getId());
            dto.setUserId(b.getUser().getId());
            dto.setStatus(b.getStatus());
            dto.setBorrowDate(b.getBorrowDate());
            dto.setReturnDate(b.getReturnDate());
            return dto;
        }).toList();
    }

    @Override
    public List<BorrowDTO> getBorrowsByStatus(String status) {

        return borrowDao.findByStatus(status).stream().map(b -> {
            BorrowDTO dto = new BorrowDTO();
            dto.setId(b.getId());
            dto.setBookId(b.getBook().getId());
            dto.setUserId(b.getUser().getId());
            dto.setStatus(b.getStatus());
            dto.setBorrowDate(b.getBorrowDate());
            dto.setReturnDate(b.getReturnDate());
            return dto;
        }).toList();
    }

    private void notifyAdmins(String message) {

        List<User> admins = userDao.findByRole("admin");

        if (admins != null && !admins.isEmpty()) {
            notificationService.sendToAdmins(admins, message);
        }
    }
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BookReview {
  struct Book {
    uint256 id;
    string name;
    uint256 ratingsCount;
  }
  struct UserRating {
    address user;
    string comment;
    uint256 rate;
  }

  // Map ratings book_id -> Book
  mapping(uint256 => UserRating) public bookRatings;

  mapping(uint256 => Book) public books;
  uint256 public booksCount;
  uint256 public userRatingCount;

  event ratingEvent(uint256 indexed _bookId);

  constructor() {
    addBook("Book 1");
    addBook("Book 2");
    addBook("Book 3");
  }

  function addBook(string memory _name) public {
    booksCount++;
    books[booksCount] = Book(booksCount, _name, 0);
  }

  function rate(
    uint256 _bookId,
    string memory _comment,
    uint256 _rate
  ) public {
    // require a valid book
    require(_bookId > 0 && _bookId <= booksCount);

    // update book rating Count
    books[_bookId].ratingsCount++;

    userRatingCount++;
    bookRatings[_bookId] = UserRating(msg.sender, _comment, _rate);

    // trigger rating event
    emit ratingEvent(_bookId);
  }
}

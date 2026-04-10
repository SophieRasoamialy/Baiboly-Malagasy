import React from "react";
import type { Book } from "../../types";
import "./Reader.css";

interface BookSelectionProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

const BookSelection: React.FC<BookSelectionProps> = ({
  books,
  onBookClick,
}) => {
  return (
    <div className="fade-in">
      <div className="testament-section">
        <h2 className="testament-header">Testamenta Taloha</h2>
        <div className="book-grid">
          {books.slice(0, 39).map((book) => (
            <div
              key={book.name}
              className="card book-card"
              onClick={() => onBookClick(book)}
            >
              <h3>{book.name}</h3>
              <p>{book.chapters.length} Toko</p>
            </div>
          ))}
        </div>
      </div>

      <div className="testament-section">
        <h2 className="testament-header">Testamenta Vaovao</h2>
        <div className="book-grid">
          {books.slice(39).map((book) => (
            <div
              key={book.name}
              className="card book-card"
              onClick={() => onBookClick(book)}
            >
              <h3>{book.name}</h3>
              <p>{book.chapters.length} Toko</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookSelection;

import React from "react";
import type { BibleData } from "../../types";
import "./Search.css";

interface SearchFilterBarProps {
  searchFilter: string;
  setSearchFilter: (filter: "all" | "old" | "new" | "book") => void;
  searchBook: string;
  setSearchBook: (book: string) => void;
  bibleData: BibleData | null;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchFilter,
  setSearchFilter,
  searchBook,
  setSearchBook,
  bibleData,
}) => {
  return (
    <div className="search-filter-bar fade-in">
      <button
        className={`filter-btn ${searchFilter === "all" ? "active" : ""}`}
        onClick={() => setSearchFilter("all")}
      >
        Rehetra
      </button>
      <button
        className={`filter-btn ${searchFilter === "old" ? "active" : ""}`}
        onClick={() => setSearchFilter("old")}
      >
        T. Taloha
      </button>
      <button
        className={`filter-btn ${searchFilter === "new" ? "active" : ""}`}
        onClick={() => setSearchFilter("new")}
      >
        T. Vaovao
      </button>
      <button
        className={`filter-btn ${searchFilter === "book" ? "active" : ""}`}
        onClick={() => setSearchFilter("book")}
      >
        Boky
      </button>
      {searchFilter === "book" && (
        <select
          className="book-select"
          value={searchBook}
          onChange={(e) => setSearchBook(e.target.value)}
        >
          <option value="">Safidio ny boky...</option>
          {bibleData?.books.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default SearchFilterBar;

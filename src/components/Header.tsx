import React from "react";
import type { BibleData } from "../types";
import SearchFilterBar from "./search/SearchFilterBar";
import "./Header.css";

interface HeaderProps {
  onBackToBooks: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (isFocused: boolean) => void;
  searchFilter: "all" | "old" | "new" | "book";
  setSearchFilter: (filter: "all" | "old" | "new" | "book") => void;
  searchBook: string;
  setSearchBook: (book: string) => void;
  bibleData: BibleData | null;
}

const Header: React.FC<HeaderProps> = ({
  onBackToBooks,
  searchQuery,
  setSearchQuery,
  isSearching,
  setIsSearching,
  isSearchFocused,
  setIsSearchFocused,
  searchFilter,
  setSearchFilter,
  searchBook,
  setSearchBook,
  bibleData,
}) => {
  return (
    <header>
      <div className="header-left">
        <h1 onClick={onBackToBooks} style={{ cursor: "pointer" }}>
          <span className="header-brand-icon">✝</span>
          <span>
            Ny Baiboly
            <small className="header-subtitle">Malagasy Bible</small>
          </span>
        </h1>
      </div>

      <div className="header-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Hikaroka (3+ litera)..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 3) setIsSearching(true);
              else setIsSearching(false);
            }}
            className="search-input"
          />
          {(isSearching || searchQuery.length > 0) && (
            <button
              className="close-search"
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
                setSearchFilter("all");
              }}
            >
              ×
            </button>
          )}

          {(isSearchFocused || searchQuery.length > 0) && (
            <SearchFilterBar
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              searchBook={searchBook}
              setSearchBook={setSearchBook}
              bibleData={bibleData}
            />
          )}
        </div>
      </div>

      <div className="header-right">
        <button className="boky-btn" onClick={onBackToBooks}>
          Boky
        </button>
      </div>
    </header>
  );
};

export default Header;

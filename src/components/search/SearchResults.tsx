import React from "react";
import type { SearchResult } from "../../types";
import "./Search.css";

interface SearchResultsProps {
  results: SearchResult[];
  searchQuery: string;
  onResultClick: (result: SearchResult) => void;
  highlightText: (text: string, query: string) => React.ReactNode;
  formatTitle: (title: string) => string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchQuery,
  onResultClick,
  highlightText,
  formatTitle,
}) => {
  return (
    <div className="search-results fade-in">
      <h2>Vokatry ny fikarohana ({results.length})</h2>
      {results.length === 0 ? (
        <p className="no-results">Tsy nisy hita ny teny nampidirinao.</p>
      ) : (
        <div className="results-list">
          {results.map((result, idx) => (
            <div
              key={idx}
              className="card result-card"
              onClick={() => onResultClick(result)}
            >
              <div className="result-meta">
                {result.bookName} {result.chapterNumber}:{result.verse.verse}
                {result.verse.title && (
                  <div className="result-verse-title">
                    {highlightText(
                      formatTitle(result.verse.title),
                      searchQuery,
                    )}
                  </div>
                )}
              </div>
              <p className="result-text">
                {highlightText(result.verse.text, searchQuery)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

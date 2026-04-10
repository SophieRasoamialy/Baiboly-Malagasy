import React from "react";
import type { Book, Chapter } from "../../types";
import "./Reader.css";

interface ChapterSelectionProps {
  selectedBook: Book;
  onChapterClick: (chapter: Chapter) => void;
  onBackToBooks: () => void;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({
  selectedBook,
  onChapterClick,
  onBackToBooks,
}) => {
  return (
    <div className="chapter-selection fade-in">
      <div className="view-header">
        <h2>{selectedBook.name}</h2>
        <button onClick={onBackToBooks} className="btn-link">
          ← Hiverina amin'ny boky
        </button>
      </div>
      <div className="chapter-grid">
        {selectedBook.chapters.map((chapter) => (
          <button
            key={chapter.chapter}
            className="chapter-btn"
            onClick={() => onChapterClick(chapter)}
          >
            {chapter.chapter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChapterSelection;

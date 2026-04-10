import React from "react";
import type { Book, Chapter } from "../../types";
import VerseItem from "./VerseItem";
import "./Reader.css";

interface VerseReaderProps {
  selectedBook: Book;
  selectedChapter: Chapter;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onBackToChapters: () => void;
  onCopy: (text: string, reference: string, verseId: string) => void;
  copiedVerse: string | null;
  formatTitle: (title: string) => string;
}

const VerseReader: React.FC<VerseReaderProps> = ({
  selectedBook,
  selectedChapter,
  onPrevChapter,
  onNextChapter,
  onBackToChapters,
  onCopy,
  copiedVerse,
  formatTitle,
}) => {
  return (
    <div className="verse-reader fade-in">
      <div className="view-header sticky-subheader">
        <div className="subheader-content">
          <button
            onClick={onPrevChapter}
            className="nav-arrow"
            title="Toko teo aloha"
          >
            ←
          </button>
          <h2>
            {selectedBook.name} {selectedChapter.chapter}
          </h2>
          <button
            onClick={onNextChapter}
            className="nav-arrow"
            title="Toko manaraka"
          >
            →
          </button>
        </div>
        <button onClick={onBackToChapters} className="btn-link">
          ← Safidio ny toko
        </button>
      </div>
      <div className="verses-list">
        {selectedChapter.verses.map((verse) => (
          <VerseItem
            key={verse.verse}
            verse={verse}
            chapterNumber={selectedChapter.chapter}
            bookName={selectedBook.name}
            isCopied={
              copiedVerse === `${selectedChapter.chapter}-${verse.verse}`
            }
            onCopy={onCopy}
            formatTitle={formatTitle}
          />
        ))}
      </div>
      <div className="bottom-nav">
        <button onClick={onPrevChapter} className="btn-secondary">
          ← Toko teo aloha
        </button>
        <button onClick={onBackToChapters} className="btn-link">
          Hiverina
        </button>
        <button onClick={onNextChapter} className="btn-secondary">
          Toko manaraka →
        </button>
      </div>
    </div>
  );
};

export default VerseReader;

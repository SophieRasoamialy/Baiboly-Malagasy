import React from "react";
import type { Verse } from "../../types";
import "./Reader.css";

interface VerseItemProps {
  verse: Verse;
  chapterNumber: number;
  bookName: string;
  isCopied: boolean;
  onCopy: (text: string, reference: string, verseId: string) => void;
  formatTitle: (title: string) => string;
}

const VerseItem: React.FC<VerseItemProps> = ({
  verse,
  chapterNumber,
  bookName,
  isCopied,
  onCopy,
  formatTitle,
}) => {
  const verseId = `${chapterNumber}-${verse.verse}`;
  const reference = `${bookName} ${chapterNumber}:${verse.verse}`;

  return (
    <div id={`verse-${verse.verse}`} className="verse-item">
      {verse.title && formatTitle(verse.title) && (
        <h4 className="verse-title">{formatTitle(verse.title)}</h4>
      )}
      <div className="verse-content-wrapper">
        <p>
          <span className="verse-number">{verse.verse}</span>
          {verse.text}
        </p>
        <button
          className={`copy-btn ${isCopied ? "copied" : ""}`}
          onClick={() => onCopy(verse.text, reference, verseId)}
          title="Adikao"
        >
          {isCopied ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default VerseItem;

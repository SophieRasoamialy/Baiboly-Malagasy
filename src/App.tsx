import { useState, useEffect, useMemo, useCallback } from "react";
import type { BibleData, Book, Chapter, Verse } from "./types";
import "./App.css";

interface SearchResult {
  bookName: string;
  chapterNumber: number;
  verse: Verse;
}

interface HistoryItem {
  bookName: string;
  chapterNumber: number;
  timestamp: number;
}

function App() {
  const [bibleData, setBibleData] = useState<BibleData | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("baiboly-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<
    "all" | "old" | "new" | "book"
  >("all");
  const [searchBook, setSearchBook] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("baiboly-darkmode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("baiboly-darkmode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    fetch("/data/baiboly.json")
      .then((res) => res.json())
      .then((data) => {
        setBibleData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load bible data:", err);
        setLoading(false);
      });
  }, []);

  const updateHistory = useCallback(
    (bookName: string, chapterNumber: number, timestamp: number) => {
      const newItem: HistoryItem = { bookName, chapterNumber, timestamp };
      const filteredHistory = history.filter(
        (item) =>
          !(item.bookName === bookName && item.chapterNumber === chapterNumber),
      );
      const updatedHistory = [newItem, ...filteredHistory].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("baiboly-history", JSON.stringify(updatedHistory));
    },
    [history],
  );

  const handleBookClick = useCallback((book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setIsSearching(false);
  }, []);

  const handleChapterClick = useCallback(
    (chapter: Chapter) => {
      setSelectedChapter(chapter);
      setIsSearching(false);
      if (selectedBook) {
        updateHistory(selectedBook.name, chapter.chapter, Date.now());
      }
    },
    [selectedBook, updateHistory],
  );

  const handleBackToBooks = useCallback(() => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setIsSearching(false);
  }, []);

  const handleBackToChapters = useCallback(() => {
    setSelectedChapter(null);
    setIsSearching(false);
  }, []);

  const handlePrevChapter = useCallback(() => {
    if (!selectedBook || !selectedChapter) return;
    const currentIndex = selectedBook.chapters.findIndex(
      (c) => c.chapter === selectedChapter.chapter,
    );
    if (currentIndex > 0) {
      const prevChapter = selectedBook.chapters[currentIndex - 1];
      setSelectedChapter(prevChapter);
      updateHistory(selectedBook.name, prevChapter.chapter, Date.now());
      window.scrollTo(0, 0);
    } else {
      const bookIndex =
        bibleData?.books.findIndex((b) => b.name === selectedBook.name) ?? -1;
      if (bookIndex > 0) {
        const prevBook = bibleData!.books[bookIndex - 1];
        const lastChapter = prevBook.chapters[prevBook.chapters.length - 1];
        setSelectedBook(prevBook);
        setSelectedChapter(lastChapter);
        updateHistory(prevBook.name, lastChapter.chapter, Date.now());
        window.scrollTo(0, 0);
      }
    }
  }, [selectedBook, selectedChapter, bibleData, updateHistory]);

  const handleNextChapter = useCallback(() => {
    if (!selectedBook || !selectedChapter) return;
    const currentIndex = selectedBook.chapters.findIndex(
      (c) => c.chapter === selectedChapter.chapter,
    );
    if (currentIndex < selectedBook.chapters.length - 1) {
      const nextChapter = selectedBook.chapters[currentIndex + 1];
      setSelectedChapter(nextChapter);
      updateHistory(selectedBook.name, nextChapter.chapter, Date.now());
      window.scrollTo(0, 0);
    } else {
      const bookIndex =
        bibleData?.books.findIndex((b) => b.name === selectedBook.name) ?? -1;
      if (bookIndex !== -1 && bookIndex < bibleData!.books.length - 1) {
        const nextBook = bibleData!.books[bookIndex + 1];
        const firstChapter = nextBook.chapters[0];
        setSelectedBook(nextBook);
        setSelectedChapter(firstChapter);
        updateHistory(nextBook.name, firstChapter.chapter, Date.now());
        window.scrollTo(0, 0);
      }
    }
  }, [selectedBook, selectedChapter, bibleData, updateHistory]);

  const formatTitle = (title: string) => {
    // Split into [...] blocks, keep only real section titles (not footnotes)
    const parts = title
      .split(/\]\s*\[/)
      .map((p) => p.replace(/^\[|\]$/g, "").trim())
      .filter((p) => p && !p.startsWith("*") && !p.startsWith("(") && p !== "")
      .map((p) => p.replace(/[[\]*]/g, "").trim())
      .filter((p) => p.length > 0);
    return parts.join(" — ");
  };

  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 3) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="highlight-text">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const copyToClipboard = (
    text: string,
    reference: string,
    verseId: string,
  ) => {
    const fullText = `${reference}\n${text}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedVerse(verseId);
      setTimeout(() => setCopiedVerse(null), 2000);
    });
  };

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 3 || !bibleData) return [];
    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    let booksToSearch = bibleData.books;
    if (searchFilter === "old") {
      booksToSearch = bibleData.books.slice(0, 39);
    } else if (searchFilter === "new") {
      booksToSearch = bibleData.books.slice(39);
    } else if (searchFilter === "book" && searchBook) {
      const book = bibleData.books.find((b) => b.name === searchBook);
      booksToSearch = book ? [book] : [];
    }

    for (const book of booksToSearch) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (
            verse.text.toLowerCase().includes(query) ||
            (verse.title && verse.title.toLowerCase().includes(query))
          ) {
            results.push({
              bookName: book.name,
              chapterNumber: chapter.chapter,
              verse,
            });
            if (results.length >= 100) return results;
          }
        }
      }
    }
    return results;
  }, [searchQuery, bibleData, searchFilter, searchBook]);

  const handleSearchResultClick = useCallback(
    (result: SearchResult) => {
      const book = bibleData?.books.find((b) => b.name === result.bookName);
      if (book) {
        const chapter = book.chapters.find(
          (c) => c.chapter === result.chapterNumber,
        );
        if (chapter) {
          setSelectedBook(book);
          setSelectedChapter(chapter);
          updateHistory(book.name, chapter.chapter, Date.now());
          setIsSearching(false);
          setSearchQuery("");
          setTimeout(() => {
            const element = document.getElementById(
              `verse-${result.verse.verse}`,
            );
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              element.classList.add("highlight-verse");
              setTimeout(
                () => element.classList.remove("highlight-verse"),
                3000,
              );
            }
          }, 100);
        }
      }
    },
    [bibleData, updateHistory],
  );

  const handleHistoryClick = useCallback(
    (item: HistoryItem) => {
      const book = bibleData?.books.find((b) => b.name === item.bookName);
      if (book) {
        const chapter = book.chapters.find(
          (c) => c.chapter === item.chapterNumber,
        );
        if (chapter) {
          setSelectedBook(book);
          setSelectedChapter(chapter);
          updateHistory(book.name, chapter.chapter, Date.now());
          setIsSearching(false);
          window.scrollTo(0, 0);
        }
      }
    },
    [bibleData, updateHistory],
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Entina mampiditra ny Baiboly...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <h1 onClick={handleBackToBooks} style={{ cursor: "pointer" }}>
            <span className="header-brand-icon">✝</span>
            <span>
              Ny Baiboly
              <small className="header-subtitle">Malagasy Bible</small>
            </span>
          </h1>
        </div>

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
          )}
        </div>

        <div className="nav-controls">
          {/* Dark mode toggle */}
          <button
            className="dark-mode-btn"
            onClick={() => setDarkMode((d) => !d)}
            title={darkMode ? "Mode andro" : "Mode alina"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              /* Sun icon */
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-2a1 1 0 0 0 1-1V2a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm0 16a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zm9-9h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zM5 12a1 1 0 0 0-1-1H2a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1zm12.66-6.24-1.41 1.41a1 1 0 1 0 1.41 1.41l1.41-1.41a1 1 0 0 0-1.41-1.41zM6.34 17.66l-1.41 1.41a1 1 0 1 0 1.41 1.41l1.41-1.41a1 1 0 0 0-1.41-1.41zm11.32 1.41 1.41-1.41a1 1 0 0 0-1.41-1.41l-1.41 1.41a1 1 0 0 0 1.41 1.41zM6.34 6.34 4.93 4.93a1 1 0 0 0-1.41 1.41l1.41 1.41a1 1 0 0 0 1.41-1.41z" />
              </svg>
            ) : (
              /* Moon icon */
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {selectedBook && !isSearching && (
            <button onClick={handleBackToBooks} className="btn-secondary">
              Boky
            </button>
          )}
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          {history.length > 0 && (
            <div className="history-section">
              <div className="sidebar-card">
                <div className="sidebar-title">Novakianao farany</div>
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="history-card"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <span className="history-dot"></span>
                      <span className="history-book">{item.bookName}</span>
                      <span className="history-chapter">
                        {item.chapterNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        <main>
          {isSearching ? (
            <div className="search-results fade-in">
              <h2>Vokatry ny fikarohana ({searchResults.length})</h2>
              {searchResults.length === 0 ? (
                <p className="no-results">
                  Tsy nisy hita ny teny nampidirinao.
                </p>
              ) : (
                <div className="results-list">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="card result-card"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="result-meta">
                        {result.bookName} {result.chapterNumber}:
                        {result.verse.verse}
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
          ) : !selectedBook ? (
            <div className="fade-in">
              <div className="testament-section">
                <h2 className="testament-header">Testamenta Taloha</h2>
                <div className="book-grid">
                  {bibleData?.books.slice(0, 39).map((book) => (
                    <div
                      key={book.name}
                      className="card book-card"
                      onClick={() => handleBookClick(book)}
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
                  {bibleData?.books.slice(39).map((book) => (
                    <div
                      key={book.name}
                      className="card book-card"
                      onClick={() => handleBookClick(book)}
                    >
                      <h3>{book.name}</h3>
                      <p>{book.chapters.length} Toko</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !selectedChapter ? (
            <div className="chapter-selection fade-in">
              <div className="view-header">
                <h2>{selectedBook.name}</h2>
                <button onClick={handleBackToBooks} className="btn-link">
                  ← Hiverina amin'ny boky
                </button>
              </div>
              <div className="chapter-grid">
                {selectedBook.chapters.map((chapter) => (
                  <button
                    key={chapter.chapter}
                    className="chapter-btn"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    {chapter.chapter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="verse-reader fade-in">
              <div className="view-header sticky-subheader">
                <div className="subheader-content">
                  <button
                    onClick={handlePrevChapter}
                    className="nav-arrow"
                    title="Toko teo aloha"
                  >
                    ←
                  </button>
                  <h2>
                    {selectedBook.name} {selectedChapter.chapter}
                  </h2>
                  <button
                    onClick={handleNextChapter}
                    className="nav-arrow"
                    title="Toko manaraka"
                  >
                    →
                  </button>
                </div>
                <button onClick={handleBackToChapters} className="btn-link">
                  ← Safidio ny toko
                </button>
              </div>
              <div className="verses-list">
                {selectedChapter.verses.map((verse) => (
                  <div
                    key={verse.verse}
                    id={`verse-${verse.verse}`}
                    className="verse-item"
                  >
                    {verse.title && formatTitle(verse.title) && (
                      <h4 className="verse-title">
                        {formatTitle(verse.title)}
                      </h4>
                    )}
                    <div className="verse-content-wrapper">
                      <p>
                        <span className="verse-number">{verse.verse}</span>
                        {verse.text}
                      </p>
                      <button
                        className={`copy-btn ${copiedVerse === `${selectedChapter.chapter}-${verse.verse}` ? "copied" : ""}`}
                        onClick={() =>
                          copyToClipboard(
                            verse.text,
                            `${selectedBook.name} ${selectedChapter.chapter}:${verse.verse}`,
                            `${selectedChapter.chapter}-${verse.verse}`,
                          )
                        }
                        title="Adikao"
                      >
                        {copiedVerse ===
                        `${selectedChapter.chapter}-${verse.verse}` ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bottom-nav">
                <button onClick={handlePrevChapter} className="btn-secondary">
                  ← Toko teo aloha
                </button>
                <button onClick={handleBackToChapters} className="btn-link">
                  Hiverina
                </button>
                <button onClick={handleNextChapter} className="btn-secondary">
                  Toko manaraka →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

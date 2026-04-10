import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  BibleData,
  Book,
  Chapter,
  HistoryItem,
  SearchResult,
} from "./types";
import { formatTitle, highlightText } from "./utils";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SearchResults from "./components/search/SearchResults";
import BookSelection from "./components/reader/BookSelection";
import ChapterSelection from "./components/reader/ChapterSelection";
import VerseReader from "./components/reader/VerseReader";
import "./App.css";

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
    setSearchQuery("");
  }, []);

  const handleBackToChapters = useCallback(() => {
    setSelectedChapter(null);
  }, []);

  const handlePrevChapter = useCallback(() => {
    if (selectedBook && selectedChapter) {
      const idx = selectedBook.chapters.findIndex(
        (c) => c.chapter === selectedChapter.chapter,
      );
      if (idx > 0) {
        handleChapterClick(selectedBook.chapters[idx - 1]);
      }
    }
  }, [selectedBook, selectedChapter, handleChapterClick]);

  const handleNextChapter = useCallback(() => {
    if (selectedBook && selectedChapter) {
      const idx = selectedBook.chapters.findIndex(
        (c) => c.chapter === selectedChapter.chapter,
      );
      if (idx < selectedBook.chapters.length - 1) {
        handleChapterClick(selectedBook.chapters[idx + 1]);
      }
    }
  }, [selectedBook, selectedChapter, handleChapterClick]);

  useEffect(() => {
    if (selectedChapter) {
      window.scrollTo(0, 0);
    }
  }, [selectedChapter]);

  const copyToClipboard = useCallback(
    (text: string, reference: string, verseId: string) => {
      const fullText = `${reference}\n${text}`;
      navigator.clipboard.writeText(fullText).then(() => {
        setCopiedVerse(verseId);
        setTimeout(() => setCopiedVerse(null), 2000);
      });
    },
    [],
  );

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
          setTimeout(() => {
            const el = document.getElementById(`verse-${result.verse.verse}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
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
      <Header
        onBackToBooks={handleBackToBooks}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        searchBook={searchBook}
        setSearchBook={setSearchBook}
        bibleData={bibleData}
      />

      <div className="main-layout">
        <Sidebar
          history={history}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onHistoryClick={handleHistoryClick}
        />

        <main>
          {isSearching ? (
            <SearchResults
              results={searchResults}
              searchQuery={searchQuery}
              onResultClick={handleSearchResultClick}
              highlightText={highlightText}
              formatTitle={formatTitle}
            />
          ) : !selectedBook ? (
            <BookSelection
              books={bibleData?.books || []}
              onBookClick={handleBookClick}
            />
          ) : !selectedChapter ? (
            <ChapterSelection
              selectedBook={selectedBook}
              onChapterClick={handleChapterClick}
              onBackToBooks={handleBackToBooks}
            />
          ) : (
            <VerseReader
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              onBackToChapters={handleBackToChapters}
              onCopy={copyToClipboard}
              copiedVerse={copiedVerse}
              formatTitle={formatTitle}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

export interface Verse {
  verse: number;
  text: string;
  title?: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  chapters: Chapter[];
}

export interface BibleMetadata {
  source: string;
  language: string;
  with_titles: boolean;
  robust_extraction: boolean;
  extracted_at: string;
}

export interface BibleData {
  metadata: BibleMetadata;
  books: Book[];
}

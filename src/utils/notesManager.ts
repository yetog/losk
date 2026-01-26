export interface ChapterNote {
  chapterId: string;
  note: string;
  timestamp: number;
  lastEdited: number;
}

interface NotesStorage {
  notes: ChapterNote[];
}

const STORAGE_KEY = 'losk_chapter_notes';

export const loadChapterNote = (chapterId: string): ChapterNote | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const storage: NotesStorage = JSON.parse(stored);
    return storage.notes.find(note => note.chapterId === chapterId) || null;
  } catch (error) {
    console.error('Error loading chapter note:', error);
    return null;
  }
};

export const saveChapterNote = (chapterId: string, noteText: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storage: NotesStorage = stored ? JSON.parse(stored) : { notes: [] };
    
    const existingNoteIndex = storage.notes.findIndex(note => note.chapterId === chapterId);
    const now = Date.now();

    if (existingNoteIndex >= 0) {
      storage.notes[existingNoteIndex] = {
        ...storage.notes[existingNoteIndex],
        note: noteText,
        lastEdited: now
      };
    } else {
      storage.notes.push({
        chapterId,
        note: noteText,
        timestamp: now,
        lastEdited: now
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error saving chapter note:', error);
  }
};

export const deleteChapterNote = (chapterId: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const storage: NotesStorage = JSON.parse(stored);
    storage.notes = storage.notes.filter(note => note.chapterId !== chapterId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error deleting chapter note:', error);
  }
};

export const getAllNotes = (): ChapterNote[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const storage: NotesStorage = JSON.parse(stored);
    return storage.notes;
  } catch (error) {
    console.error('Error getting all notes:', error);
    return [];
  }
};

export const exportNotesToText = (): string => {
  const notes = getAllNotes();
  if (notes.length === 0) return 'No notes yet.';

  return notes
    .map(note => {
      const date = new Date(note.lastEdited).toLocaleDateString();
      return `Chapter: ${note.chapterId}\nDate: ${date}\n\n${note.note}\n\n---\n`;
    })
    .join('\n');
};

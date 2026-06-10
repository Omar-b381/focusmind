import { getDatabase, isFallbackDatabase } from '../database';
import { getFallbackCollection, insertFallback } from '../database/fallback';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../database/schema';

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  emoji: string;
  color: string | null;
  taskId: number | null;
  projectId: number | null;
  pathId: number | null;
  moduleId: number | null;
  area: string;
  aiSummary: string | null;
  aiKeywords: string;
  embeddingHash: string | null;
  searchContent: string | null;
  wordCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export class SecondBrainService {
  // Extract wiki-links like [[Marketing]] or [[Feynman Note]] from markdown content
  extractWikiLinks(content: string): string[] {
    const regex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const title = match[1].trim();
      if (title && !links.includes(title)) {
        links.push(title);
      }
    }
    return links;
  }

  // Synchronize links for a note by checking mentioned note titles and storing them in note_links
  async syncLinks(noteId: number, content: string): Promise<void> {
    const mentionedTitles = this.extractWikiLinks(content);
    
    if (isFallbackDatabase()) {
      const allNotes = getFallbackCollection('notes');
      const targetNotes = allNotes.filter((n: any) => mentionedTitles.includes(n.title));
      
      // Delete old links
      const links = getFallbackCollection('note_links');
      const remainingLinks = links.filter((l: any) => l.sourceNoteId !== noteId);
      // Replace collection array
      const fallbackData = getFallbackCollection('note_links');
      fallbackData.length = 0;
      remainingLinks.forEach((l: any) => fallbackData.push(l));
      
      // Insert new links
      for (const target of targetNotes) {
        insertFallback('note_links', {
          sourceNoteId: noteId,
          targetNoteId: target.id,
          linkType: 'reference',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      const db = getDatabase();
      
      // Delete old links
      db.delete(schema.noteLinks).where(eq(schema.noteLinks.sourceNoteId, noteId)).run();
      
      if (mentionedTitles.length > 0) {
        // Find matching notes in DB
        const targetNotes = db.select()
          .from(schema.notes)
          .where(inArray(schema.notes.title, mentionedTitles))
          .all();
          
        for (const target of targetNotes) {
          db.insert(schema.noteLinks).values({
            sourceNoteId: noteId,
            targetNoteId: target.id,
            linkType: 'reference',
            createdAt: new Date()
          } as any).run();
        }
      }
    }
  }

  // Get all backlinks pointing to noteId
  async getBacklinks(noteId: number): Promise<any[]> {
    if (isFallbackDatabase()) {
      const links = getFallbackCollection('note_links').filter((l: any) => l.targetNoteId === noteId);
      const sourceIds = links.map((l: any) => l.sourceNoteId);
      return getFallbackCollection('notes').filter((n: any) => sourceIds.includes(n.id));
    } else {
      const db = getDatabase();
      const links = db.select()
        .from(schema.noteLinks)
        .where(eq(schema.noteLinks.targetNoteId, noteId))
        .all();
      
      const sourceIds = links.map(l => l.sourceNoteId);
      if (sourceIds.length === 0) return [];
      
      return db.select()
        .from(schema.notes)
        .where(inArray(schema.notes.id, sourceIds))
        .all();
    }
  }
}

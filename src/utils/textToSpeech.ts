/**
 * Enhanced Text-to-Speech Manager
 * Supports paragraph-based reading with progress tracking
 */

export interface TTSOptions {
  rate?: number;
  voice?: SpeechSynthesisVoice;
  onParagraphStart?: (index: number) => void;
  onParagraphEnd?: (index: number) => void;
  onComplete?: () => void;
  onProgress?: (current: number, total: number) => void;
}

export interface ParsedParagraph {
  text: string;
  isSceneHeader: boolean;
  sceneNumber?: number;
}

export class TextToSpeechManager {
  private synth: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isPaused: boolean = false;
  private paragraphs: string[] = [];
  private currentParagraphIndex: number = 0;
  private options: TTSOptions = {};
  private isReading: boolean = false;
  private isCancelling: boolean = false; // Prevent cancelled utterance from continuing

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * Split content into readable paragraphs (excludes headers for TTS)
   */
  private splitIntoParagraphs(text: string): string[] {
    // Split by double newlines or scene markers, filter empty
    return text
      .split(/\n\n+|\{\{SCENE_\d+\}\}/)
      .map(p => p.trim())
      .filter(p => p.length > 0 && !p.startsWith('##')); // Skip empty and headers for TTS
  }

  /**
   * Parse content for display - KEEPS headers for UI rendering
   * Returns paragraphs with headers included and marked
   */
  parseContentWithHeaders(text: string): ParsedParagraph[] {
    const lines = text
      .split(/\n\n+|\{\{SCENE_\d+\}\}/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    let sceneCounter = 0;
    return lines.map(text => {
      const isSceneHeader = /^##\s*(INT\.|EXT\.|INT\/EXT\.)/.test(text);
      if (isSceneHeader) {
        sceneCounter++;
      }
      return {
        text,
        isSceneHeader,
        sceneNumber: isSceneHeader ? sceneCounter : undefined
      };
    });
  }

  /**
   * Parse content into plain text paragraphs (for backward compatibility)
   * INCLUDES headers now for proper scene marker IDs
   */
  parseContent(text: string): string[] {
    return text
      .split(/\n\n+|\{\{SCENE_\d+\}\}/)
      .map(p => p.trim())
      .filter(p => p.length > 0); // Keep headers for UI, TTS will skip them
  }

  /**
   * Read entire content from the beginning
   */
  speak(text: string, options?: TTSOptions) {
    this.stop();
    this.paragraphs = this.splitIntoParagraphs(text); // TTS uses filtered list
    this.options = options || {};
    this.currentParagraphIndex = 0;
    this.isReading = true;
    this.isCancelling = false;
    this.speakCurrentParagraph();
  }

  /**
   * Start reading from a specific paragraph index
   * Note: The index maps to the UI paragraph array (which includes headers)
   * We need to map it to the TTS paragraph array (which excludes headers)
   */
  speakFromParagraph(text: string, uiIndex: number, options?: TTSOptions) {
    this.stop();

    // Parse full content to understand mapping
    const allParagraphs = this.parseContent(text);
    this.paragraphs = this.splitIntoParagraphs(text);
    this.options = options || {};

    // Find the corresponding TTS index by counting non-header paragraphs up to uiIndex
    let ttsIndex = 0;
    for (let i = 0; i < uiIndex && i < allParagraphs.length; i++) {
      if (!allParagraphs[i].startsWith('##')) {
        ttsIndex++;
      }
    }

    // If the clicked paragraph is a header, start from next readable paragraph
    if (allParagraphs[uiIndex]?.startsWith('##')) {
      // ttsIndex is already correct (pointing to next non-header)
    }

    this.currentParagraphIndex = Math.max(0, Math.min(ttsIndex, this.paragraphs.length - 1));
    this.isReading = true;
    this.isCancelling = false;
    this.speakCurrentParagraph();
  }

  /**
   * Speak the current paragraph
   */
  private speakCurrentParagraph() {
    // Check if we were cancelled
    if (this.isCancelling) {
      this.isCancelling = false;
      return;
    }

    if (this.currentParagraphIndex >= this.paragraphs.length) {
      this.isReading = false;
      this.options.onComplete?.();
      return;
    }

    const paragraph = this.paragraphs[this.currentParagraphIndex];

    // Skip empty paragraphs
    if (!paragraph || paragraph.trim().length === 0) {
      this.currentParagraphIndex++;
      this.speakCurrentParagraph();
      return;
    }

    this.utterance = new SpeechSynthesisUtterance(paragraph);
    this.utterance.rate = this.options.rate || 1.0;

    if (this.options.voice) {
      this.utterance.voice = this.options.voice;
    }

    // Notify paragraph start
    this.options.onParagraphStart?.(this.currentParagraphIndex);
    this.options.onProgress?.(this.currentParagraphIndex + 1, this.paragraphs.length);

    // Store reference for closure
    const expectedIndex = this.currentParagraphIndex;

    // When paragraph ends, move to next
    this.utterance.onend = () => {
      // Only continue if this is the expected paragraph (not a cancelled one)
      if (this.currentParagraphIndex !== expectedIndex) {
        console.log('[TTS] Ignoring onend for cancelled paragraph:', expectedIndex);
        return;
      }

      console.log('[TTS] Paragraph ended:', this.currentParagraphIndex, 'isReading:', this.isReading, 'isPaused:', this.isPaused);
      this.options.onParagraphEnd?.(this.currentParagraphIndex);
      this.currentParagraphIndex++;

      if (this.isReading && !this.isPaused && !this.isCancelling) {
        console.log('[TTS] Continuing to paragraph:', this.currentParagraphIndex, 'of', this.paragraphs.length);
        // Small delay between paragraphs for natural pacing
        setTimeout(() => {
          if (this.isReading && !this.isPaused && !this.isCancelling) {
            this.speakCurrentParagraph();
          }
        }, 300);
      } else {
        console.log('[TTS] Not continuing - isReading:', this.isReading, 'isPaused:', this.isPaused);
      }
    };

    this.utterance.onerror = (event) => {
      // 'interrupted' is normal when we cancel, not a real error
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log('[TTS] Utterance interrupted (normal during navigation)');
        return;
      }
      console.error('[TTS] Error:', event.error);
      this.isReading = false;
    };

    console.log('[TTS] Speaking paragraph:', this.currentParagraphIndex, 'text:', paragraph.substring(0, 50) + '...');

    // Chrome has a bug where synthesis can get stuck - resume first
    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(this.utterance);
    this.isPaused = false;
  }

  /**
   * Skip to next paragraph
   */
  nextParagraph() {
    if (this.currentParagraphIndex < this.paragraphs.length - 1) {
      this.isCancelling = true;
      this.synth.cancel();
      this.currentParagraphIndex++;
      this.isCancelling = false;
      this.speakCurrentParagraph();
    }
  }

  /**
   * Go to previous paragraph
   */
  previousParagraph() {
    if (this.currentParagraphIndex > 0) {
      this.isCancelling = true;
      this.synth.cancel();
      this.currentParagraphIndex--;
      this.isCancelling = false;
      this.speakCurrentParagraph();
    }
  }

  /**
   * Jump to a specific paragraph (by TTS index)
   */
  goToParagraph(index: number) {
    if (index >= 0 && index < this.paragraphs.length) {
      this.isCancelling = true;
      this.synth.cancel();
      this.currentParagraphIndex = index;
      this.isCancelling = false;
      this.speakCurrentParagraph();
    }
  }

  /**
   * Jump to a UI paragraph index (handles header mapping)
   */
  goToUIParagraph(uiIndex: number, allParagraphs: string[]) {
    // Map UI index to TTS index
    let ttsIndex = 0;
    for (let i = 0; i < uiIndex && i < allParagraphs.length; i++) {
      if (!allParagraphs[i].startsWith('##')) {
        ttsIndex++;
      }
    }

    // If clicked a header, go to next content paragraph
    if (allParagraphs[uiIndex]?.startsWith('##')) {
      // ttsIndex already points to correct position
    }

    this.goToParagraph(Math.min(ttsIndex, this.paragraphs.length - 1));
  }

  pause() {
    if (this.synth.speaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    this.isCancelling = true;
    this.synth.cancel();
    this.isPaused = false;
    this.isReading = false;
    this.utterance = null;
    this.currentParagraphIndex = 0;
    this.isCancelling = false;
  }

  /**
   * Update reading speed (can be called while reading)
   */
  setRate(rate: number) {
    this.options.rate = rate;
    // If currently reading, restart current paragraph with new rate
    if (this.isReading && !this.isPaused) {
      this.isCancelling = true;
      this.synth.cancel();
      this.isCancelling = false;
      this.speakCurrentParagraph();
    }
  }

  /**
   * Update voice (can be called while reading)
   */
  setVoice(voice: SpeechSynthesisVoice) {
    this.options.voice = voice;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  getIsReading(): boolean {
    return this.isReading;
  }

  getCurrentParagraphIndex(): number {
    return this.currentParagraphIndex;
  }

  getTotalParagraphs(): number {
    return this.paragraphs.length;
  }

  /**
   * Get paragraph text by index (for highlighting)
   */
  getParagraphText(index: number): string | null {
    return this.paragraphs[index] || null;
  }

  /**
   * Get all paragraphs (for rendering clickable content)
   */
  getParagraphs(): string[] {
    return this.paragraphs;
  }
}

export const ttsManager = new TextToSpeechManager();

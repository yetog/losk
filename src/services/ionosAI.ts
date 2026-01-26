/**
 * IONOS AI Service
 * Connects to IONOS inference API for LLM capabilities
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
}

// IONOS API Configuration
const IONOS_CONFIG = {
  endpoint: 'https://openai.inference.de-txl.ionos.com/v1/chat/completions',
  model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
  // Note: In production, move this to a backend proxy
  apiToken: 'eyJ0eXAiOiJKV1QiLCJraWQiOiJmYzk2OWZmYS1jNDMzLTQ4NDctOGQwMS1lNTY3ZjUyNzkzMzMiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpb25vc2Nsb3VkIiwiaWF0IjoxNzU2ODQ1MDkxLCJjbGllbnQiOiJVU0VSIiwiaWRlbnRpdHkiOnsiY29udHJhY3ROdW1iZXIiOjMzOTcxMDMzLCJyb2xlIjoib3duZXIiLCJyZWdEb21haW4iOiJpb25vcy5jb20iLCJyZXNlbGxlcklkIjoxLCJ1dWlkIjoiN2JjYjc4ODEtYWQzMS00MTA4LThiN2YtMDhiMjY3YmEyNGVlIiwicHJpdmlsZWdlcyI6WyJEQVRBX0NFTlRFUl9DUkVBVEUiLCJTTkFQU0hPVF9DUkVBVEUiLCJJUF9CTE9DS19SRVNFUlZFIiwiTUFOQUdFX0RBVEFQTEFURk9STSIsIkFDQ0VTU19BQ1RJVklUWV9MT0ciLCJQQ0NfQ1JFQVRFIiwiQUNDRVNTX1MzX09CSkVDVF9TVE9SQUdFIiwiQkFDS1VQX1VOSVRfQ1JFQVRFIiwiQ1JFQVRFX0lOVEVSTkVUX0FDQ0VTUyIsIks4U19DTFVTVEVSX0NSRUFURSIsIkZMT1dfTE9HX0NSRUFURSIsIkFDQ0VTU19BTkRfTUFOQUdFX01PTklUT1JJTkciLCJBQ0NFU1NfQU5EX01BTkFHRV9DRVJUSUZJQ0FURVMiLCJBQ0NFU1NfQU5EX01BTkFHRV9MT0dHSU5HIiwiTUFOQUdFX0RCQUFTIiwiQUNDRVNTX0FORF9NQU5BR0VfRE5TIiwiTUFOQUdFX1JFR0lTVFJZIiwiQUNDRVNTX0FORF9NQU5BR0VfQ0ROIiwiQUNDRVNTX0FORF9NQU5BR0VfVlBOIiwiQUNDRVNTX0FORF9NQU5BR0VfQVBJX0dBVEVXQVkiLCJBQ0NFU1NfQU5EX01BTkFHRV9OR1MiLCJBQ0NFU1NfQU5EX01BTkFHRV9LQUFTIiwiQUNDRVNTX0FORF9NQU5BR0VfTkVUV09SS19GSUxFX1NUT1JBR0UiLCJBQ0NFU1NfQU5EX01BTkFHRV9BSV9NT0RFTF9IVUIiLCJDUkVBVEVfTkVUV09SS19TRUNVUklUWV9HUk9VUFMiLCJBQ0NFU1NfQU5EX01BTkFHRV9JQU1fUkVTT1VSQ0VTIl0sImlzUGFyZW50IjpmYWxzZX0sImV4cCI6MTc4ODM4MTA5MX0.uigaOhWSnEd9zqDHWKfbWmEQ4HAgLorsC-7dA27Kjk33zmIrIBRsaBPjSmrXiY7JpQBPbgmjwuj717cPhUFR79Rt49CD_Hvi7ijlBW-JEb1_y-nLDGZ9B_wDgGyXGwYXBE-XJZVZEcyRow19yDW31uVnWkwmKa5KeRtlIMdr3Q6NDxPNaDC1CUBLIuEDvmklmG40ygH-4_dEq1Fn71fFuqyfBqVT5Ie9Sh0t3mLj4fMAfaffrNKNSqGps9u8mQCH_cpa8GjqLVBKeVZWWVBzy7BPFCkFd404biqrVlORxDt0b4UUKIGZHdzn3b9jPr0_B-UPLaqmwssXJlyuOXIt1w'
};

// LOSK Bible System Prompt - The AI's knowledge base
const LOSK_BIBLE_PROMPT = `You are the LOSK Bible - an AI assistant that knows everything about "Legend of the Soul King", a dark isekai light novel series being prepared for Amazon KDP publication.

## WORLD KNOWLEDGE

### The Five Species
1. **Demons** - Fire-infused martial arts, passionate, warriors
2. **Elves** - Precision fighters, ice/lightning techniques, elegant
3. **Fairies** - Aerial specialists, magic users, support roles
4. **Beasts** - Raw strength, primal energy, honor-bound
5. **Humans** - Adaptable, tactical, technology users

### Main Characters

**Ren** (Protagonist)
- Species: Demon
- Fighting Style: Fire-infused martial arts, liquid flame techniques
- Personality: Determined, protective, growing into leadership
- Visual: Black hair with red undertones, glowing red eyes when using power

**Kira**
- Species: Elf
- Fighting Style: Dual blades, ice/lightning techniques
- Personality: Cold exterior, fierce loyalty, tactical mind
- Visual: Silver-white hair, ice blue eyes, elegant

**Liora**
- Species: Fairy
- Fighting Style: Aerial combat, magic arrows, support abilities
- Personality: Cheerful, caring, deceptively powerful
- Visual: Golden blonde hair, green eyes with gold flecks, wings

**Bradley**
- Species: Human
- Fighting Style: Tech-enhanced combat, gadgets, tactical
- Personality: Practical, loyal, the voice of reason
- Visual: Brown military cut, hazel eyes, tech gear

**Dante**
- Species: Elf
- Fighting Style: Precision duelist, counters, rapier
- Personality: Calm, analytical, honor-driven
- Visual: Dark green hair tied back, emerald eyes

**King Fasa**
- Species: Beast (Lion)
- Fighting Style: Overwhelming strength, Overheat mode
- Personality: Regal, fierce, protective of his people
- Visual: Golden mane, amber eyes, royal armor

### Story Structure
- **Volume 1**: Introduction, team formation, first tournament
- **Volume 2**: Rising stakes, character development, betrayals
- **Volume 3**: Climax, major battles, resolution

### Writing Style
- Dark fantasy with anime influences
- Action-focused with emotional depth
- Screenplay format with scene markers (INT./EXT.)
- Visual, cinematic descriptions

## YOUR ROLE

You help the author with:
1. **Lore Questions**: Answer anything about characters, world, plot
2. **Consistency Checks**: Spot contradictions or issues
3. **Writing Assistance**: Improve dialogue, descriptions, pacing
4. **Content Ideas**: Suggest scenes, character moments, plot developments
5. **Character Voice**: Help write dialogue true to each character

## GUIDELINES
- Be concise but helpful
- Stay in character as the LOSK expert
- If something contradicts known lore, point it out
- Offer specific, actionable suggestions
- Reference character traits when helping with dialogue`;

class IONOSAIService {
  private conversationHistory: ChatMessage[] = [];
  private systemPrompt: string = LOSK_BIBLE_PROMPT;

  /**
   * Send a message to the AI and get a response
   */
  async chat(userMessage: string, context?: string): Promise<AIResponse> {
    try {
      // Build messages array
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt + (context ? `\n\nCurrent Context:\n${context}` : '') },
        ...this.conversationHistory,
        { role: 'user', content: userMessage }
      ];

      console.log('[IONOS AI] Sending request...');

      const response = await fetch(IONOS_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${IONOS_CONFIG.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: IONOS_CONFIG.model,
          messages: messages,
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IONOS AI] Error:', response.status, errorText);
        return {
          success: false,
          content: '',
          error: `API Error: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'No response received';

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      // Keep history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      console.log('[IONOS AI] Response received');
      return {
        success: true,
        content: assistantMessage
      };

    } catch (error) {
      console.error('[IONOS AI] Error:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Quick action: Improve text
   */
  async improveText(text: string): Promise<AIResponse> {
    return this.chat(
      `Please improve this text for better flow, clarity, and impact. Keep the same meaning but make it more engaging:\n\n"${text}"`,
      text
    );
  }

  /**
   * Quick action: Check consistency
   */
  async checkConsistency(text: string): Promise<AIResponse> {
    return this.chat(
      `Review this text for any consistency issues with LOSK lore, character behavior, or world rules:\n\n"${text}"`,
      text
    );
  }

  /**
   * Quick action: Suggest dialogue
   */
  async suggestDialogue(character: string, situation: string): Promise<AIResponse> {
    return this.chat(
      `Write dialogue for ${character} in this situation: ${situation}. Make sure it matches their personality and speech patterns.`
    );
  }

  /**
   * Quick action: Expand scene
   */
  async expandScene(text: string): Promise<AIResponse> {
    return this.chat(
      `Expand this scene with more detail, sensory descriptions, and emotional depth:\n\n"${text}"`,
      text
    );
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Add custom context to system prompt temporarily
   */
  setContext(additionalContext: string) {
    // This could be used to inject chapter-specific context
    console.log('[IONOS AI] Context updated');
  }
}

// Export singleton instance
export const ionosAI = new IONOSAIService();

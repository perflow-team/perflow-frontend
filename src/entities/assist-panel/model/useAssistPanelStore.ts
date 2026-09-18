import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AssistPanelState {
  activePanel: 'closed' | 'chat' | 'dictionary' | 'relations'
  characterCardEntityId: string | null
  // Sentence the entity was clicked in — required by POST /ai/novels/{id}/dictionary
  // alongside the word itself (characterCardEntityId doubles as the word here).
  characterCardContext: string | null
  characterCardScope: string | null
  resumeSummaryDismissed: boolean
  openCharacterCard: (word: string, contextSentence: string, scope: string) => void
  closeCharacterCard: () => void
  setActivePanel: (panel: AssistPanelState['activePanel']) => void
  dismissResumeSummary: () => void
}

// resumeSummaryDismissed is persisted to sessionStorage (not memory-only) so
// "don't show again this session" survives a page reload within the same
// browser tab, matching the spec's session-scoped dismissal.
export const useAssistPanelStore = create<AssistPanelState>()(
  persist(
    (set) => ({
      activePanel: 'closed',
      characterCardEntityId: null,
      characterCardContext: null,
      characterCardScope: null,
      resumeSummaryDismissed: false,
      openCharacterCard: (word, contextSentence, scope) =>
        set({ characterCardEntityId: word, characterCardContext: contextSentence, characterCardScope: scope }),
      closeCharacterCard: () => set({ characterCardEntityId: null, characterCardContext: null, characterCardScope: null }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      dismissResumeSummary: () => set({ resumeSummaryDismissed: true }),
    }),
    {
      name: 'assist-panel-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ resumeSummaryDismissed: state.resumeSummaryDismissed }),
    },
  ),
)

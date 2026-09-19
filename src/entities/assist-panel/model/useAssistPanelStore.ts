import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AssistPanelState {
  activePanel: 'closed' | 'chat' | 'dictionary' | 'relations'
  characterCardEntityId: string | null
  characterCardContext: string | null
  characterCardScope: string | null
  characterCardOffset: number
  resumeSummaryDismissed: boolean
  openCharacterCard: (word: string, contextSentence: string, scope: string, offset?: number) => void
  closeCharacterCard: () => void
  setActivePanel: (panel: AssistPanelState['activePanel']) => void
  dismissResumeSummary: () => void
}

export const useAssistPanelStore = create<AssistPanelState>()(
  persist(
    (set) => ({
      activePanel: 'closed',
      characterCardEntityId: null,
      characterCardContext: null,
      characterCardScope: null,
      characterCardOffset: 0,
      resumeSummaryDismissed: false,
      openCharacterCard: (word, contextSentence, scope, offset = 0) =>
        set({ characterCardEntityId: word, characterCardContext: contextSentence, characterCardScope: scope, characterCardOffset: offset }),
      closeCharacterCard: () => set({ characterCardEntityId: null, characterCardContext: null, characterCardScope: null, characterCardOffset: 0 }),
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

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AssistPanelState {
  activePanel: 'closed' | 'chat' | 'dictionary'
  characterCardEntityId: string | null
  resumeSummaryDismissed: boolean
  openCharacterCard: (entityId: string) => void
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
      resumeSummaryDismissed: false,
      openCharacterCard: (entityId) => set({ characterCardEntityId: entityId }),
      closeCharacterCard: () => set({ characterCardEntityId: null }),
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

interface SaveProgressParams {
  novelId: string
  episodeId: string
  progress: number
}

// Mocks the server call that persists reading progress. Called through a
// throttled wrapper (see useReaderProgress) so it fires at most every 500ms
// regardless of how often the UI-facing progress value changes.
export function saveReadingProgress({ novelId, episodeId, progress }: SaveProgressParams): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.debug('[mock] saved progress', { novelId, episodeId, progress: Math.round(progress * 100) })
      resolve()
    }, 150)
  })
}

interface FetchLastReadParams {
  novelId: string
  episodeId: string
}

export interface LastReadState {
  progress: number
  daysSinceLastVisit: number
  visitedOtherEpisodeSince: boolean
  summaryLines: string[]
}

// Mocks fetching the reader's last saved position for this episode, used to
// decide whether the resume-summary popup should appear.
export function fetchLastReadState({}: FetchLastReadParams): Promise<LastReadState | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        progress: 0.28,
        daysSinceLastVisit: 3,
        visitedOtherEpisodeSince: false,
        summaryLines: [
          '어린 왕자의 별에 새로운 씨앗이 자라나 신비로운 꽃을 피웠어요.',
          '까다롭고 허영심 많은 꽃은 어린 왕자에게 이런저런 요구를 하기 시작해요.',
          '어린 왕자는 꽃에게 매일 아침 신선한 물을 주며 돌보고 있어요.',
        ],
      })
    }, 250)
  })
}

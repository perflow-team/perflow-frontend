export interface ReaderHandle {
  pageForward: () => void
  pageBackward: () => void
  jumpToProgress: (progress: number) => void
}

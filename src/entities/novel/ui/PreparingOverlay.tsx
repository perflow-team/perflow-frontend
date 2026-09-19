interface PreparingOverlayProps {
  /** Shorter label for cramped thumbnails (e.g. the mobile list row). */
  short?: boolean
}

function PreparingOverlay({ short = false }: PreparingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <span className="text-center text-label-small font-medium text-white sm:text-label-large">
        {short ? '준비중' : '준비중입니다.'}
      </span>
    </div>
  )
}

export default PreparingOverlay

// Ambient two-layer wave, echoing the wordmark's flow motif. Each path is a
// single period (1440 wide) built from evenly-dividing sub-waves, so tiling
// the same path at a +1440 offset and drifting by -50% loops seamlessly.
function WaveBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden">
      <svg
        className="wave-layer-back absolute inset-x-0 bottom-0 h-full w-[200%]"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C120,46 240,74 480,60 C600,46 720,74 960,60 C1080,46 1200,74 1440,60
             C1560,46 1680,74 1920,60 C2040,46 2160,74 2400,60 C2520,46 2640,74 2880,60
             V120 H0 Z"
          className="fill-primary-700/25"
        />
      </svg>
      <svg
        className="wave-layer-front absolute inset-x-0 bottom-0 h-full w-[200%]"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,70 C90,60 180,80 360,70 C450,60 540,80 720,70 C810,60 900,80 1080,70
             C1170,60 1260,80 1440,70 C1530,60 1620,80 1800,70 C1890,60 1980,80 2160,70
             C2250,60 2340,80 2520,70 C2610,60 2700,80 2880,70
             V120 H0 Z"
          className="fill-primary-600/20"
        />
      </svg>
    </div>
  )
}

export default WaveBackdrop

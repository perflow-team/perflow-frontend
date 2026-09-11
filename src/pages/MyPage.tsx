import Header from '../components/Header'

// Spec 3.5: 리더 화면 스펙 범위 밖 — 이 페이지는 향후 독서 습관 대시보드가
// 붙을 자리와, 그때 연동할 API 지점만 표시하는 자리표시자(placeholder)다.
function MyPage() {
  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-10 py-16">
        <h1 className="text-headline-small text-neutral-900">마이페이지</h1>
        <p className="mt-2 text-body-medium text-neutral-500">
          독서 습관 대시보드는 별도 화면으로 구현 예정입니다. 아래는 이 화면이 붙게 될 API 연동 지점입니다.
        </p>

        <ul className="mt-8 space-y-3">
          <li className="rounded-lg border border-neutral-200 p-4">
            <p className="text-title-small font-semibold text-neutral-900">GET /users/me/reading-stats</p>
            <p className="mt-1 text-body-small text-neutral-500">
              누적 독서 시간, 완독 작품 수, 장르별 편중도 등 습관 통계
            </p>
          </li>
          <li className="rounded-lg border border-neutral-200 p-4">
            <p className="text-title-small font-semibold text-neutral-900">GET /users/me/reading-history</p>
            <p className="mt-1 text-body-small text-neutral-500">
              작품별 마지막 읽은 회차 · progress — 이어보기 목록에 사용
            </p>
          </li>
          <li className="rounded-lg border border-neutral-200 p-4">
            <p className="text-title-small font-semibold text-neutral-900">GET /users/me/bookmarks</p>
            <p className="mt-1 text-body-small text-neutral-500">관심작 등록 목록</p>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default MyPage

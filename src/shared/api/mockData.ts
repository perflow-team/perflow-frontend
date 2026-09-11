export interface ContentBlock {
  type: 'heading' | 'paragraph'
  text: string
}

export const READER_CONTENT: ContentBlock[] = [
  { type: 'paragraph', text: '나는 곧 그 꽃에 대해 알게 되었어.' },
  { type: 'paragraph', text: '어린 왕자의 별에는 언제나 소박한 꽃들만 피어 있었어.' },
  { type: 'paragraph', text: '꽃잎이 한 겹뿐이라 자리도 많이 차지하지 않는 그 꽃들은, 누구에게도 폐를 끼치지 않은 채 조용히 지내고 있었지.' },
  { type: 'paragraph', text: '아침이면 풀숲 사이로 얼굴을 내밀었다가, 저녁이 되면 다시 스르르 시들어 버리곤 했어.' },
  { type: 'paragraph', text: '그런데 어느 날, 어디선가 날아온 씨앗 하나가 싹을 틔웠어.' },
  { type: 'paragraph', text: '어린 왕자는 다른 새싹들과는 어딘가 다른 그 잔가지를 유심히 지켜보았지. 혹시 새로운 종류의 바오바브나무일지도 모르니까 말이야.' },
  { type: 'paragraph', text: '하지만 그 작은 줄기는 어느 순간 자라기를 멈추더니, 꽃을 피울 준비를 시작했어.' },
  { type: 'paragraph', text: '커다란 꽃봉오리가 맺히는 걸 지켜보던 어린 왕자는, 뭔가 신비로운 일이 벌어질 것만 같은 예감이 들었어.' },
  { type: 'paragraph', text: '그러나 그 꽃은 초록빛 꽃받침 속에 몸을 숨긴 채, 좀처럼 자신의 아름다움을 완성하려 들지 않았지.' },
  { type: 'paragraph', text: '그러면서도 꽃은 정성스레 자신의 빛깔을 골라나갔어. 천천히 옷을 갖춰 입듯, 꽃잎을 한 장 한 장 펼쳐나갔지.' },
  { type: 'paragraph', text: '그 꽃은 들에 흔한 양귀비처럼 아무렇게나 피어나고 싶지는 않은 듯했어.' },
  { type: 'paragraph', text: '가장 눈부신 모습으로, 단 한 번에 자신을 드러내고 싶었던 거야. 그래, 정말 그랬어!' },
  { type: 'paragraph', text: '그 꽃은 무척이나 멋을 부릴 줄 아는 꽃이었던 거지. 신비로운 채비를 갖추며 그렇게 며칠이 또 흘러갔어.' },
  { type: 'paragraph', text: '그러던 어느 날 아침, 해가 떠오를 무렵, 마침내 그 꽃은 자신의 모습을 드러냈어.' },
  { type: 'heading', text: '꽃과 마주함' },
  { type: 'paragraph', text: '그토록 공들여 채비를 마친 꽃은, 심드렁하게 하품을 하며 말했어.' },
  { type: 'paragraph', text: '"아, 이제 막 일어났어요... 죄송해요... 아직 머리가 좀 헝클어져 있죠..."' },
  { type: 'paragraph', text: '어린 왕자는 감탄을 감출 수가 없었어. "정말 아름다워요!"' },
  { type: 'paragraph', text: '"그렇죠,"라고 꽃이 나긋하게 대답했어. "저는 태양과 같은 순간에 태어났는걸요..."' },
  { type: 'paragraph', text: '어린 왕자는 이 꽃이 그리 겸손하지 않다는 걸 금세 눈치챘지만, 그럼에도 그녀의 존재만으로 이미 마음이 벅차올랐어.' },
  { type: 'paragraph', text: '"이제 슬슬 아침 식사 시간인 것 같은데요,"라며 꽃이 다시 덧붙였어. "제게도 신경을 좀 써주시겠어요?"' },
  { type: 'heading', text: '물주기' },
  { type: 'paragraph', text: '어린 왕자는 어쩔 줄 몰라 하면서도, 이내 정신을 차리고 맑은 물을 물뿌리개에 가득 담아 꽃에게 건넸어.' },
  { type: 'paragraph', text: '그렇게 그 꽃은, 자칫 상처받기 쉬운 자신의 허영심으로 어린 왕자를 조금씩 애태우는 법을 알아가고 있었던 거야.' },
  { type: 'paragraph', text: '다음 날 어린 왕자는 사업가의 별을 떠나 가로등지기의 별로 향했어. 그 별에는 숫자만 세는 어른과, 쉴 틈 없이 불을 켰다 끄는 또 다른 어른이 살고 있었지.' },
  { type: 'paragraph', text: '여행이 계속될수록, 어린 왕자는 어른들의 세계가 얼마나 이상한 규칙들로 가득한지 조금씩 깨달아갔어.' },
]

export const ENTITY_KEYWORD = '꽃'

export interface EntityFact {
  unlockAt: number
  label: string
  text: string
}

export interface EntityRecord {
  id: string
  name: string
  type: string
  firstAppearsAt: number
  facts: EntityFact[]
}

export const ENTITIES: Record<string, EntityRecord> = {
  rose: {
    id: 'rose',
    name: '장미',
    type: '인물',
    firstAppearsAt: 0.05,
    facts: [
      {
        unlockAt: 0.05,
        label: '기본 설정',
        text: '어린왕자의 별인 소행성 B-612에 어느 날 씨앗에서 싹튼 꽃이 자라나요. 아름답지만 허영심 많고 까다로운 성격을 가지고 있어요.',
      },
      {
        unlockAt: 0.45,
        label: '주요 장면',
        text: '어린왕자가 지구에 도착해 수많은 장미가 핀 정원을 보고 큰 충격을 받아요. 자기 별의 꽃이 우주에 단 하나뿐인 존재인 줄 알았는데, 똑같이 생긴 꽃이 수천 송이나 있었으니까요.',
      },
      {
        unlockAt: 0.8,
        label: '결말부 서사',
        text: '여우에게 "길들인다"는 개념을 배우면서, 자신의 꽃이 특별한 이유는 겉모습이 아니라 그동안 함께 보낸 시간과 쏟은 정성 때문이라는 걸 깨닫게 돼요.',
      },
    ],
  },
}

export interface DictionaryTerm {
  id: string
  term: string
  definition: string
  firstAppearsAt: number
}

export const DICTIONARY_TERMS: DictionaryTerm[] = [
  { id: 'b612', term: '소행성 B-612', definition: '어린 왕자가 살던, 집채만 한 크기의 아주 작은 소행성.', firstAppearsAt: 0 },
  { id: 'baobab', term: '바오바브나무', definition: '뿌리를 그대로 두면 별 전체를 뒤덮어 버릴 수 있는 거대한 나무. 어린 왕자가 매일 뽑아내며 경계한다.', firstAppearsAt: 0.05 },
  { id: 'rose-thorn', term: '장미의 가시', definition: '장미가 스스로를 지킬 수 있다고 믿는 네 개의 가시.', firstAppearsAt: 0.1 },
  { id: 'businessman', term: '사업가', definition: '별들을 "소유"하고 있다고 주장하며 밤낮없이 숫자만 세는 어른.', firstAppearsAt: 0.55 },
  { id: 'lamplighter', term: '가로등지기', definition: '너무 작아 1분마다 하루가 지나가는 별에서, 규칙에 따라 쉼 없이 불을 켰다 끄는 어른.', firstAppearsAt: 0.6 },
  { id: 'taming', term: '길들이기', definition: '여우가 어린 왕자에게 알려주는 개념. 관계를 맺고 서로에게 세상에 하나뿐인 존재가 되는 것.', firstAppearsAt: 0.85 },
]

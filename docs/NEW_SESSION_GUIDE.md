# New Session Guide

## 🚀 새 Claude Code 세션을 열었을 때

---

## Step 1: 항상 먼저 실행

```
/init
```

이 명령어는 Claude가 CLAUDE.md를 읽고 프로젝트 상황을 자동으로 파악하게 합니다.

---

## Step 2: 상황에 맞는 프롬프트 사용

### 📌 Option 1: 표준 시작 (개발 작업)

```
현재 진행 상황 확인하고 이번 주 할 일 알려줘
```

또는 더 구체적으로:
```
Week 1 작업 시작하자. AI auto-detection 구현부터 시작
```

---

### 📅 Option 2: 주간 리뷰 (매주 월요일)

```
주간 리뷰 해줘. 지난주 진행사항 확인하고 PROGRESS.md 업데이트
```

Claude가 자동으로:
1. PROGRESS.md 읽기
2. 지난 주 완료 항목 체크
3. 메트릭 업데이트 요청
4. 이번 주 목표 설정

---

### 🚨 Option 3: 긴급 작업 (버그 수정 등)

```
[버그 설명]. 이거 급하게 고쳐야 해. 하지만 먼저 현재 로드맵에서 우선순위 확인해줘
```

Claude가 ROADMAP.md 확인 후 우선순위 판단

---

### 🤔 Option 4: 의사결정 필요할 때

```
[결정 사항]. COMMERCIALIZATION.md 기반으로 이게 맞는 방향인지 조언해줘
```

또는:
```
Week 8 게이트 평가해줘. 수익화 진행해도 될지 판단
```

---

### 📢 Option 5: 마케팅 작업

```
Week 5 런칭 준비하자. MARKETING.md 보고 이번주 해야할 것들 정리해줘
```

---

## 📋 단계별 프롬프트 템플릿

### Phase 1: 개발 단계 (Week 1-4)

**AI 기능 시작:**
```
AI_AUTO_DETECT.md 보고 Week 1 작업 시작. Tesseract.js 설치부터 해줘
```

**UI 통합:**
```
Week 2 작업. "Auto-Fix" 버튼 UI 만들자. AI_AUTO_DETECT.md 참고
```

**테스트:**
```
AI 기능 테스트하자. 샘플 문서 20개로 정확도 측정
```

**성능 최적화:**
```
AI 기능 Web Worker로 옮기자. 성능 최적화 필요
```

**배포 준비:**
```
DEPLOYMENT.md 따라서 Vercel 배포 준비하자
```

---

### Phase 2: 런칭 단계 (Week 5-8)

**Reddit 포스트:**
```
MARKETING.md의 Reddit 전략 보고 r/selfhosted 포스트 작성해줘
```

**Hacker News:**
```
Show HN 포스트 작성. MARKETING.md 템플릿 사용
```

**Product Hunt:**
```
Product Hunt 런칭 체크리스트 확인하고 준비물 정리
```

**사용자 피드백:**
```
피드백 50개 받았어. 주요 이슈 정리하고 우선순위 매겨줘
```

**메트릭 분석:**
```
Week 5 메트릭:
- 방문자: [숫자]
- NPS: [숫자]
- 가입: [숫자]

목표 대비 분석하고 다음 액션 추천해줘
```

**SEO 작업:**
```
MARKETING.md 보고 SEO 블로그 포스트 2개 작성하자
```

---

### Phase 3: 수익화 단계 (Week 9-12)

**Stripe 설정:**
```
MONETIZATION.md 보고 Stripe 통합 시작하자
```

**가격 페이지:**
```
가격 페이지 만들자. Free vs Pro vs Business 비교 표 포함
```

**결제 플로우:**
```
Stripe Checkout 구현. MONETIZATION.md의 코드 예시 참고
```

**Early Bird 프로모션:**
```
Early Bird 50% 할인 캠페인 준비. 이메일 템플릿 작성
```

**첫 고객 후:**
```
첫 고객 생겼어! 축하 트윗 작성하고 PROGRESS.md 업데이트
```

**구글 광고:**
```
Google Ads 시작하자. 키워드 리스트와 광고 카피 만들어줘
```

---

## 🎯 상황별 빠른 프롬프트

| 상황 | 프롬프트 |
|------|----------|
| **처음 시작** | `현재 페이즈 확인하고 다음 할 일 알려줘` |
| **매주 월요일** | `주간 리뷰하고 PROGRESS.md 업데이트` |
| **작업 막힘** | `[문제]. 로드맵 보고 이거 지금 해야 하는 일 맞아?` |
| **의사결정** | `[선택지]. COMMERCIALIZATION.md 기반으로 조언해줘` |
| **마일스톤 달성** | `[마일스톤] 완료! PROGRESS.md 업데이트하고 다음 단계` |
| **위기 상황** | `[문제]. Red flag 체크. 피봇 고려해야 해?` |
| **메트릭 업데이트** | `이번주 메트릭: 방문자 [X], 가입 [Y], 수익 $[Z]. 대시보드 업데이트` |
| **방향 잃음** | `지금 뭐 하고 있었지? 현재 우선순위 알려줘` |

---

## 📝 주간 리뷰 전체 프로세스

**매주 월요일 아침에 실행:**

```
/init

주간 리뷰 시작:
1. 지난주 완료 항목 확인
2. PROGRESS.md 업데이트
3. CLAUDE.md의 메트릭 대시보드 업데이트
4. 이번주 목표 설정
5. 블로커 있으면 해결 방법 제안

완료되면 요약해줘
```

---

## 🚨 Phase 게이트 평가 프롬프트

### Week 4: Phase 1 완료 평가

```
Phase 1 게이트 평가:
- AI 기능 정확도: [%]
- 배포 상태: [안정/불안정]
- 런칭 자산: [준비됨/미완성]
- 법률 페이지: [완료/미완성]

CLAUDE.md의 Phase 1 Gate 기준으로 평가하고
다음 페이즈 진행 가능한지 판단해줘
```

**기준:**
- ✅ AI 정확도 >85%
- ✅ 배포 안정적
- ✅ 런칭 자산 완료
- ✅ 법률 페이지 완료

→ 4개 모두 ✅ 면 Phase 2 진행

---

### Week 8: Phase 2 완료 평가

```
Phase 2 게이트 평가:
- 누적 방문자: [숫자]명 (목표: 10,000+)
- NPS: [숫자] (목표: >30)
- "Would pay" 설문: [%] (목표: >20%)

PROCEED / DELAY / PIVOT 중 뭐 해야 해?
근거와 함께 추천해줘
```

**Decision Matrix:**
- **PROCEED:** 2+ 기준 충족 → Phase 3 (결제 통합)
- **DELAY:** 1 기준 충족 → 기능 추가, 4주 후 재평가
- **PIVOT:** 0 기준 충족 → 오픈소스 전환 또는 피봇

---

### Week 12: Phase 3 완료 평가

```
Phase 3 게이트 평가:
- MRR: $[숫자] (목표: >$50)
- 유료 고객: [숫자]명 (목표: >10)
- Churn rate: [%] (목표: <20%)

3개월 후속 투자 결정 도와줘:
- Continue (계속 성장)
- Pause (잠시 멈춤)
- Pivot (방향 전환)
```

---

## 💡 Pro Tips

### ✅ Tip 1: 항상 /init 먼저
모든 새 세션은 `/init`으로 시작. Claude가 CLAUDE.md를 자동으로 읽습니다.

### ✅ Tip 2: 문서 참조 명시
```
AI_AUTO_DETECT.md 보고 [작업]
MARKETING.md 기반으로 [작업]
DEPLOYMENT.md 따라서 [작업]
```
Claude가 해당 문서를 읽고 정확하게 작업합니다.

### ✅ Tip 3: 진행상황 항상 기록
```
[작업 완료]. PROGRESS.md에 기록해줘
```
추적 가능성 유지.

### ✅ Tip 4: 방향 잃었을 때
```
지금 뭐 하고 있었지? ROADMAP.md 보고 현재 우선순위 알려줘
```

### ✅ Tip 5: 메트릭 업데이트
```
이번주 메트릭:
- 방문자: [숫자]
- 가입: [숫자]
- 수익: $[숫자]

CLAUDE.md 대시보드 업데이트하고 목표 대비 분석해줘
```

### ✅ Tip 6: 결정 전 문서 확인
중요한 결정 전에는 항상:
- 전략적 결정 → COMMERCIALIZATION.md
- 기술 결정 → AI_AUTO_DETECT.md / DEPLOYMENT.md
- 가격 결정 → MONETIZATION.md
- 마케팅 결정 → MARKETING.md

### ✅ Tip 7: 커밋 전 리뷰
```
[작업 완료]. 코드 리뷰하고 ROADMAP.md에 맞는지 확인 후 커밋
```

---

## 📚 주요 문서 Quick Reference

| 문서 | 용도 | 언제 참조? |
|------|------|----------|
| **CLAUDE.md** | 프로젝트 개요, 진행상황 | 모든 세션 시작 시 |
| **PROGRESS.md** | 주간 진행 추적 | 매주 월요일 |
| **ROADMAP.md** | 12주 상세 계획 | 작업 우선순위 확인 |
| **AI_AUTO_DETECT.md** | AI 기능 구현 스펙 | Week 1-2 개발 시 |
| **DEPLOYMENT.md** | 배포 전략 | Week 4 배포 준비 시 |
| **MARKETING.md** | 마케팅 전략 | Week 5-8 런칭 시 |
| **MONETIZATION.md** | 가격/결제 전략 | Week 9-12 수익화 시 |
| **COMMERCIALIZATION.md** | 시장/전략 분석 | 중요 의사결정 시 |

---

## 🔄 작업 플로우 예시

### 예시 1: Week 1 월요일 아침

```
/init

주간 리뷰하고 Week 1 목표 확인해줘
```

→ Claude: "Week 1 목표는 AI auto-detection 기반 구축입니다..."

```
좋아. AI_AUTO_DETECT.md 보고 Tesseract.js 설치부터 시작하자
```

→ Claude: Tesseract.js 설치 및 기본 설정 진행

```
완료. PROGRESS.md에 "Tesseract.js 설치 완료" 기록해줘
```

---

### 예시 2: Week 5 Product Hunt 런칭

```
/init

오늘 Product Hunt 런칭이야. MARKETING.md 보고 체크리스트 확인
```

→ Claude: Product Hunt 런칭 체크리스트 제공

```
First Comment 작성해줘. 템플릿 사용
```

→ Claude: First Comment 작성

```
런칭 완료! 방문자 5,000명 왔어. PROGRESS.md 업데이트
```

---

### 예시 3: Week 8 Go/No-Go 결정

```
/init

Phase 2 게이트 평가:
- 방문자: 12,000명
- NPS: 45
- "Would pay": 35%

수익화 진행해도 될까?
```

→ Claude: "3개 기준 모두 충족! PROCEED 추천..."

```
좋아. Week 9 Stripe 통합 시작하자. MONETIZATION.md 참고
```

---

## 🎯 이 가이드 사용법

1. **북마크하세요:** 이 파일을 즐겨찾기
2. **매 세션 참조:** 새 세션마다 이 가이드 확인
3. **커스터마이즈:** 본인 스타일에 맞게 프롬프트 수정
4. **업데이트:** 새로운 패턴 발견 시 추가

---

**이 가이드를 활용하면 어떤 세션에서도 5분 안에 작업 재개 가능합니다!** 🚀
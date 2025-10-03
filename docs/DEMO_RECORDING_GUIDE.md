# Demo Recording Guide

30초 데모 영상 제작 가이드입니다.

## 🎬 녹화 준비

### 1. 화면 녹화 도구 설정

**Windows 사용자:**
1. **Xbox Game Bar** (기본 내장)
   - `Win + G` 키를 눌러 실행
   - 녹화 버튼 클릭 또는 `Win + Alt + R`
   - 저장 위치: `C:\Users\[사용자명]\Videos\Captures`

**또는 OBS Studio (추천):**
1. https://obsproject.com/ 다운로드
2. 설치 후 실행
3. Sources → Display Capture 추가
4. Settings → Output → Recording Quality: High Quality, Medium File Size
5. 녹화 시작: `Ctrl + Shift + R`

### 2. 브라우저 설정

1. **Chrome 시크릿 모드** 열기 (`Ctrl + Shift + N`)
   - 확장 프로그램 없이 깨끗한 화면
   - 캐시 없이 실제 사용자 경험

2. **브라우저 창 크기**: 1920x1080 (Full HD)
   - `F11`로 전체화면 모드
   - 또는 브라우저 창을 16:9 비율로 조정

3. **개발자 도구 닫기** (`F12` 토글)

4. **사이트 접속**: https://pdf-angle-corrector.vercel.app/

### 3. 샘플 파일 준비

**프로젝트 폴더에 있는 파일 사용:**
- `Clinical Chart.pdf` (AI 각도 감지 테스트용)

**또는 직접 준비:**
- 기울어진 스캔 문서 (영수증, 계약서, 양식 등)
- 각도: 5-10도 정도 기울어진 것이 시각적으로 좋음

## 🎥 녹화 시나리오 (30초)

### 타임라인

| 시간 | 액션 | 화면 내용 | 설명 |
|------|------|-----------|------|
| 0-3초 | 사이트 로딩 | 타이틀 "Document Angle Corrector" 표시 | 깔끔한 첫인상 |
| 3-5초 | PDF Mode 확인 | "PDF Mode" 탭 선택됨 | 기본 모드 강조 |
| 5-8초 | 파일 업로드 | Clinical Chart.pdf 드래그 앤 드롭 | 사용 편의성 |
| 8-10초 | PDF 미리보기 | 기울어진 문서 표시 | 문제 상황 인식 |
| 10-13초 | AI Auto-Fix 클릭 | "✨ Auto-Fix with AI" 버튼 클릭 | 핵심 기능 |
| 13-16초 | AI 분석 중 | "AI analyzing document..." 로딩 | AI 작동 시각화 |
| 16-20초 | 자동 교정 완료 | 각도 슬라이더가 자동으로 조정됨 | Before/After 비교 |
| 20-23초 | 결과 확인 | 교정된 문서 미리보기 | 성공적인 결과 |
| 23-26초 | Save PDF | "Save PDF" 버튼 클릭 → 다운로드 | 간단한 저장 |
| 26-30초 | 마무리 메시지 | "100% Privacy-First • Works Offline" | 핵심 가치 강조 |

### 상세 스크립트

**[0-3초] 인트로**
- 페이지 로딩 완료
- 타이틀과 서브헤딩 천천히 보여주기
- 마우스 커서는 화면 중앙 또는 밖에 위치

**[3-5초] 모드 확인**
- "PDF Mode" 탭 위에 마우스 호버
- 이미 선택되어 있음을 확인

**[5-8초] 파일 업로드**
- 마우스로 Clinical Chart.pdf를 드래그
- 업로드 영역(파란색 박스)에 드롭
- "Loading PDF..." 메시지 표시

**[8-10초] 미리보기**
- 기울어진 PDF 페이지 표시
- 슬라이더는 0도 (기본값)
- 잠시 멈춤 (2초) - 문제 상황 인식

**[10-13초] AI Auto-Fix 시작**
- "✨ Auto-Fix with AI" 버튼에 마우스 호버
- 클릭
- 즉시 "AI analyzing document..." 상태 표시

**[13-16초] AI 분석**
- 로딩 인디케이터 회전
- 페이지 상단에 상태 메시지 표시
- OpenCV.js 로딩 (필요시)

**[16-20초] 자동 교정**
- AI가 감지한 각도로 슬라이더 자동 이동
- 실시간으로 PDF 회전 적용
- Before/After 차이 명확히 보이도록 천천히

**[20-23초] 결과 확인**
- 교정된 문서를 스크롤로 확인
- 여러 페이지가 있다면 2-3페이지 스크롤

**[23-26초] 저장**
- "Save PDF" 버튼에 마우스 호버
- 클릭
- "Generating PDF..." 상태 표시
- 파일 저장 대화상자 표시 (또는 자동 다운로드)

**[26-30초] 마무리**
- 저장 완료 메시지
- 화면 하단 또는 타이틀 근처에 추가 텍스트 오버레이:
  - "100% Privacy-First"
  - "Works Offline"
  - "No Data Upload"

## 🎬 녹화 팁

### 품질 향상
1. **부드러운 마우스 이동**
   - 급격한 움직임 피하기
   - 클릭 전 1초 정도 호버

2. **타이밍 조절**
   - 각 단계 사이 0.5-1초 여유
   - 너무 빠르면 시청자가 따라가기 어려움

3. **화면 정리**
   - 불필요한 탭 모두 닫기
   - 알림, 팝업 비활성화
   - 바탕화면 아이콘 정리

4. **음소거**
   - 배경 소음 제거
   - 무음 영상으로 제작 (텍스트로만 설명)

### 편집 포인트

**녹화 후 편집 사항:**
1. **인트로/아웃트로 추가** (선택사항)
   - 타이틀 카드: "Document Angle Corrector"
   - 엔딩 카드: "Try it now: pdf-angle-corrector.vercel.app"

2. **텍스트 오버레이**
   - 0-3초: "AI-Powered PDF Angle Correction"
   - 10-13초: "Click Auto-Fix with AI"
   - 16-20초: "Automatically Corrected!"
   - 26-30초: "100% Privacy-First • Works Offline"

3. **속도 조절**
   - AI 분석 중(13-16초): 1.5배속 (시간 절약)
   - 나머지: 정상 속도

## 📤 GIF 변환 및 최적화

### 1. 영상 → GIF 변환

**ezgif.com 사용 (추천):**
1. https://ezgif.com/video-to-gif 접속
2. 녹화한 영상 업로드 (MP4, AVI, MOV 등)
3. Convert to GIF 클릭
4. 최적화 설정:
   - Size: 800px width (파일 크기 감소)
   - Frame rate: 10-15 fps (부드러움 유지)
   - Method: Lanczos3 (품질 우선)
5. Convert! 클릭
6. Optimize 탭에서 추가 압축:
   - Compression level: 35-50
   - Color reduction: 128 colors

**파일 크기 목표:**
- Reddit 업로드: < 20MB (권장 < 10MB)
- Twitter: < 5MB
- Website embed: < 3MB

### 2. 품질 vs 크기 균형

**고품질 버전 (Website, Product Hunt):**
- 크기: 1920x1080 → 1280x720
- Frame rate: 15 fps
- Colors: 256
- 파일 크기: ~8-15MB

**압축 버전 (Twitter, Email):**
- 크기: 800x450
- Frame rate: 10 fps
- Colors: 128
- 파일 크기: ~3-5MB

### 3. 여러 플랫폼용 준비

**저장할 파일들:**
```
demo/
├── demo-full.mp4          # 원본 영상 (Full HD, 30fps)
├── demo-hq.gif            # 고품질 GIF (1280x720, 15fps)
├── demo-compressed.gif    # 압축 GIF (800x450, 10fps)
└── thumbnail.png          # 썸네일 (첫 프레임 캡처)
```

## 🚀 배포 및 사용

### 업로드 위치

1. **GitHub Repository**
   ```bash
   git add demo/
   git commit -m "Add demo video and GIF"
   git push
   ```

2. **README.md에 추가**
   ```markdown
   ## 🎬 Demo

   ![Demo](demo/demo-hq.gif)

   [Watch Full Video](demo/demo-full.mp4)
   ```

3. **랜딩 페이지에 임베드** (다음 단계)
   - App.tsx에 "How it works" 섹션 추가
   - GIF 또는 영상 자동 재생

### 플랫폼별 활용

**Reddit:**
- 게시글에 demo-hq.gif 직접 업로드
- 또는 Imgur 링크 사용

**Product Hunt:**
- Gallery에 demo-full.mp4 업로드
- 썸네일로 thumbnail.png 사용

**Twitter:**
- demo-compressed.gif 첨부
- 280자 설명 추가

**Website:**
- Hero 섹션에 자동재생 GIF
- "See it in action" 버튼으로 전체 영상 모달

## ✅ 체크리스트

녹화 전:
- [ ] 브라우저 시크릿 모드 열기
- [ ] 화면 해상도 1920x1080 설정
- [ ] 개발자 도구 닫기
- [ ] 샘플 PDF 준비 (Clinical Chart.pdf)
- [ ] 녹화 도구 테스트 (5초 테스트 녹화)
- [ ] 배경 소음 확인 (마이크 음소거 권장)
- [ ] 알림 비활성화

녹화 중:
- [ ] 0-3초: 인트로 (타이틀 표시)
- [ ] 3-5초: PDF Mode 확인
- [ ] 5-8초: 파일 업로드 (드래그 앤 드롭)
- [ ] 8-10초: 기울어진 문서 미리보기
- [ ] 10-13초: AI Auto-Fix 버튼 클릭
- [ ] 13-16초: AI 분석 중
- [ ] 16-20초: 자동 각도 교정 완료
- [ ] 20-23초: 교정 결과 확인 (스크롤)
- [ ] 23-26초: Save PDF 버튼 클릭
- [ ] 26-30초: 마무리 메시지 (Privacy-First)

녹화 후:
- [ ] 영상 재생해서 품질 확인
- [ ] 필요시 재녹화 (2-3번 시도 권장)
- [ ] 최고 품질 버전 선택
- [ ] GIF 변환 (ezgif.com)
- [ ] 파일 크기 최적화 (< 10MB)
- [ ] 여러 버전 저장 (HQ, Compressed)
- [ ] GitHub에 업로드
- [ ] README.md 업데이트

## 📝 다음 단계

데모 영상 완성 후:
1. ✅ Week 3 Task 1 완료 체크
2. ➡️ Week 3 Task 2: Reddit 런치 포스트 작성
3. ➡️ 랜딩 페이지에 "How it works" 섹션 추가

---

**예상 소요 시간:**
- 녹화 준비: 15분
- 녹화 (2-3회 시도): 10분
- 편집 및 GIF 변환: 15분
- **총합: ~40분**

**녹화 성공 후 이 파일에 체크 표시해주세요! ✅**

# NeonTetris

NeonTetris의 **단일 원본 저장소(Single Source of Truth)** 입니다.

현재 기준선은 ChatGPT 대화에서 완성된 Neon Tetris v7의 정적 웹앱이며, 앞으로 기능 추가·수정은 이 저장소를 기준으로 진행합니다.

## 현재 고정된 핵심 기능

- 10×20 테트리스 보드
- 7-bag 랜덤
- 좌우 이동, 소프트 드롭, 하드 드롭, 회전
- Hold / Next
- Ghost piece
- Score / Best / Lines / Level
- Pause / Restart
- 모바일 좌측 방향 패드 + 우측 Rotate / Hold / Drop
- 블록 착지 시 화면 들썩임과 충격 연출
- 1~4줄 삭제 강도별 파티클·충격파·불꽃 연출
- 줄 삭제 음성: Line Clear / Double Combo / Triple Combo / Quattro
- Web Audio 기반 이동·회전·홀드·착지·하드드롭·라인삭제·게임오버 효과음
- 118 BPM 신스 멜로디 BGM
- 사운드 ON/OFF 토글 및 음소거 상태 저장
- 반응형 모바일 UI

전체 보존 계약은 [docs/FEATURE_CONTRACT.md](docs/FEATURE_CONTRACT.md)를 참고하세요.

## 변경 원칙

앞으로 모든 변경은 기존 기능을 지우지 않는 것을 기본값으로 합니다.

1. 새 기능은 별도 브랜치에서 작업합니다.
2. 고정 기능을 의도적으로 바꾸는 경우에만 FEATURE_CONTRACT를 수정합니다.
3. 정적 계약 테스트와 실제 브라우저 스모크 테스트가 모두 통과해야 합니다.
4. PR에서 변경사항과 기존 기능 영향 여부를 확인한 뒤 main에 반영합니다.
5. 실패한 변경은 이전 정상 커밋으로 즉시 되돌릴 수 있습니다.

## 로컬 실행

정적 파일이므로 간단한 HTTP 서버만 있으면 됩니다.

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 테스트

```bash
npm install
npm test
npx playwright install chromium
npm run test:browser
```

GitHub Actions에서도 같은 회귀 검사를 자동 실행합니다.

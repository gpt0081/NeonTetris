# Frozen Feature Contract

이 문서는 사용자가 명시적으로 변경을 요구하기 전까지 **사라지면 안 되는 기능 계약**입니다.

## 게임 규칙

- 보드는 10열 × 20행이어야 한다.
- I/J/L/O/S/T/Z 7종 블록을 사용한다.
- 7-bag 랜덤을 유지한다.
- 좌우 이동, 소프트 드롭, 하드 드롭, 시계/반시계 회전을 지원한다.
- Hold는 한 블록당 한 번만 가능해야 한다.
- Next와 Hold 미리보기가 존재해야 한다.
- Ghost piece가 존재해야 한다.
- Score, Best, Lines, Level이 표시되어야 한다.
- Best는 localStorage에 유지되어야 한다.
- Pause와 Restart가 동작해야 한다.

## 조작 계약

키보드:
- Left / Right: 이동
- Down: 소프트 드롭
- Up / X: 시계 회전
- Z: 반시계 회전
- Space: 하드 드롭
- C: Hold
- P / Escape: Pause
- R: Restart

모바일:
- 왼쪽에 방향 조작 버튼 묶음
- 오른쪽에 Rotate / Hold / Drop 버튼 묶음
- 모바일 조작 버튼은 총 6개

## 연출 계약

- 모든 블록 착지 때 게임 UI 전체가 짧게 들썩인다.
- 일반 착지에도 충격감 있는 화면 반응이 존재한다.
- 줄 삭제 수가 많을수록 연출 강도가 증가한다.
- 1줄, 2줄, 3줄, 4줄 이상이 서로 다른 단계의 이펙트를 가진다.
- 라인 삭제에는 충격파·파티클·불꽃/스파크·플래시가 존재한다.
- 과도한 파티클로 프레임을 심각하게 떨어뜨리지 않도록 현재 최적화 수준을 유지한다.

## 라인 음성 계약

- 1줄: "Line Clear!"
- 2줄: "Double Combo!"
- 3줄: "Triple Combo!"
- 4줄 이상: "Quattro!"
- 영어 음성 합성을 사용한다.
- 음소거 시 음성도 함께 꺼진다.

## 사운드 계약

- 이동 효과음
- 회전 효과음
- Hold 효과음
- 착지 효과음
- Hard Drop 효과음
- Line Clear 단계별 효과음
- Game Over 효과음
- 118 BPM 계열 신스 BGM
- 명확한 리드 멜로디 존재
- 사운드 버튼은 ON/OFF 토글이어야 한다.
- 음소거 상태는 localStorage에 저장되어야 한다.

## UI 계약

다음 DOM ID는 회귀 테스트 기준 식별자로 유지한다.

- #gameCanvas
- #nextCanvas
- #holdCanvas
- #score
- #best
- #lines
- #level
- #pauseBtn
- #restartBtn
- #soundBtn
- #fxBanner

## 변경 규칙

이 문서의 항목을 삭제하거나 의미를 약화시키는 변경은 사용자의 명시적인 요구가 없으면 허용하지 않는다.


## 플레이어·랭킹 계약

- 첫 게임 시작 전 닉네임 입력 게이트가 표시되어야 한다.
- 닉네임은 최대 12자로 정규화하고 마지막 닉네임을 로컬에 기억한다.
- 게임 종료 시 닉네임별 최고 점수를 로컬 랭킹에 기록한다.
- 랭킹은 점수 내림차순으로 정렬하고 상위 기록을 표시한다.
- 현재 구현은 서버가 없는 정적 앱이므로 랭킹 범위는 해당 기기의 localStorage이다.

## 연속 드롭 계약

- Hard Drop을 실행할 때마다 DROP 연속 카운트가 1 증가한다.
- 좌우 이동, 회전, Hard Drop은 연속 카운트를 유지한다.
- Soft Drop, Hold, Pause, Restart, Sound, Ranking 등 그 외 게임 버튼/명령은 연속 카운트를 0으로 초기화한다.
- 연속 Hard Drop 횟수가 증가할수록 블록 착지 시 전체 게임 화면의 흔들림과 보드 충격 강도가 증가한다.
- 각 Hard Drop마다 현재 횟수를 화려한 DROP ×N 애니메이션으로 표시한다.

# The Mind - WebSocket 멀티플레이어 보드게임

"The Mind" 보드게임을 WebSocket을 사용한 실시간 멀티플레이어 게임으로 구현한 프로젝트입니다.

## 🎮 게임 특징

- **최대 4인 멀티플레이어**: 실시간 WebSocket 연결
- **방 생성 및 참가**: 6자리 초대 코드로 간편한 참가
- **라운드 진행**: 2인(12라운드), 3-4인(10라운드)
- **카드 분배**: 1~101 카드 중 라운드별로 증가하는 카드 수
- **생명 시스템**: 3개의 생명으로 게임 진행
- **힌트 시스템**: 3, 6, 9라운드에서 힌트 제공
- **감정 표현**: Stop, OK, Low, High 이모지로 소통
- **실시간 애니메이션**: 카드 플레이, 셔플링 등 부드러운 애니메이션

## 🚀 기술 스택

### Frontend
- React 18
- Styled Components
- Framer Motion
- WebSocket (실시간 통신)

### Backend
- Node.js
- WebSocket (ws 라이브러리)
- Express.js

## 🎯 게임 규칙

1. **목표**: 모든 플레이어가 손에 있는 카드를 오름차순으로 플레이
2. **제한사항**: 말로 소통 금지, 순서대로만 플레이 가능
3. **승리 조건**: 모든 카드를 올바른 순서로 플레이
4. **패배 조건**: 생명 3개 모두 소진

## 📱 배포

### GitHub Pages
- **URL**: https://[YOUR_USERNAME].github.io/TheMind
- **자동 배포**: main 브랜치에 push 시 자동 배포

### 로컬 개발
```bash
# 의존성 설치
npm run install-all

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 🔧 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/[YOUR_USERNAME]/TheMind.git
cd TheMind
```

### 2. 의존성 설치
```bash
npm run install-all
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 브라우저에서 확인
- **클라이언트**: http://localhost:3000
- **서버**: http://localhost:3001

## 🌐 배포 방법

### GitHub Pages 자동 배포
```bash
# 빌드 및 배포
npm run deploy
```

### 수동 배포
1. `npm run build` 실행
2. `build` 폴더 내용을 GitHub Pages에 업로드

## 📁 프로젝트 구조

```
TheMind/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 게임 컴포넌트
│   │   ├── context/       # 게임 상태 관리
│   │   └── index.js       # 앱 진입점
│   ├── public/            # 정적 파일
│   └── package.json       # 클라이언트 의존성
├── server/                 # Node.js 백엔드
│   ├── index.js           # WebSocket 서버
│   └── package.json       # 서버 의존성
├── package.json            # 루트 의존성
└── README.md              # 프로젝트 문서
```

## 🎨 주요 기능

### 게임 시스템
- **방 관리**: 생성, 참가, 퇴장
- **플레이어 관리**: 호스트, 참가자 역할
- **게임 상태**: 로비, 게임 진행, 라운드 완료/실패
- **카드 시스템**: 고유 카드 분배, 플레이 검증

### UI/UX
- **반응형 디자인**: 모바일, 데스크톱 지원
- **애니메이션**: 카드 플레이, 셔플링, 감정 표현
- **시각적 효과**: Balatro 스타일 카드 쉐이더
- **사용자 피드백**: 알림, 메시지, 상태 표시

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 개발자

- **프론트엔드**: React, Styled Components, Framer Motion
- **백엔드**: Node.js, WebSocket, Express
- **게임 로직**: The Mind 보드게임 규칙 구현

## 🎉 감사의 말

- The Mind 보드게임 제작진
- React 및 Node.js 커뮤니티
- WebSocket 기술의 발전

---

**즐거운 게임 되세요! 🎮✨** 
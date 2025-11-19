# AGIfirst - AI Browser Control Platform

AGIfirst는 Groq API와 Playwright를 사용하여 브라우저를 AI가 자동으로 제어할 수 있는 혁신적인 플랫폼입니다. AI 에이전트가 사용자의 목표를 달성할 때까지 자동으로 웹 브라우저를 제어합니다.

## 🌟 주요 기능

- 🤖 **AI 기반 브라우저 자동화**: Groq의 강력한 LLM을 사용한 지능적인 브라우저 제어
- 🎮 **웹 게임 플레이**: AI가 웹 게임을 플레이할 수 있습니다
- 🔍 **자동 검색**: 복잡한 검색 작업을 AI에게 맡기세요
- 🛒 **온라인 쇼핑 지원**: 상품 검색, 비교, 구매 프로세스 자동화
- 💼 **업무 자동화**: 반복적인 웹 기반 업무를 자동화
- 🎨 **ChatGPT 스타일 UI**: 깔끔하고 직관적인 사용자 인터페이스
- 🔒 **개인 API 키**: 각 사용자가 자신의 Groq API 키를 사용

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- Groq API 키 (https://console.groq.com/ 에서 무료로 발급 가능)

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd agifirst
```

2. **의존성 설치**
```bash
npm install
```

3. **Playwright 브라우저 설치**
```bash
npx playwright install chromium
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 접속**
- http://localhost:3000 으로 접속
- Groq API 키를 입력하여 시작

### 프로덕션 빌드

```bash
npm start
```

## 🐳 Docker로 실행

```bash
# 이미지 빌드
docker build -t agifirst .

# 컨테이너 실행
docker run -p 3000:3000 agifirst
```

## ☁️ Cloudtype 배포

### 배포 방법

1. **Cloudtype 계정 생성**
   - https://cloudtype.io/ 에서 계정 생성

2. **GitHub 저장소 연결**
   - Cloudtype 대시보드에서 "새 프로젝트" 생성
   - GitHub 저장소 선택

3. **배포 설정**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `3000`
   - **환경 변수**: 필요한 경우 설정 (선택사항)

4. **배포 실행**
   - "배포하기" 버튼 클릭
   - 자동으로 빌드 및 배포 진행

### Dockerfile 기반 배포

Cloudtype은 자동으로 Dockerfile을 감지하여 배포합니다.

```yaml
# cloudtype.yml (선택사항)
name: agifirst
services:
  - name: agifirst-app
    type: web
    dockerfile: Dockerfile
    port: 3000
    resources:
      memory: 1024
      cpu: 1
```

## 📖 사용 방법

### 1. API 키 입력
- 웹사이트 접속 시 Groq API 키 입력 화면이 나타납니다
- https://console.groq.com/ 에서 발급받은 API 키를 입력하세요

### 2. 작업 요청
텍스트 입력창에 원하는 작업을 자연어로 입력하세요:

**예시:**
- "네이버에서 '인공지능 뉴스' 검색해줘"
- "유튜브에서 고양이 영상 찾아서 재생해줘"
- "구글에서 오늘 날씨 알려줘"
- "쿠팡에서 무선 이어폰 검색하고 가격 비교해줘"

### 3. AI가 작업 수행
- AI가 브라우저를 제어하며 단계별로 작업을 수행합니다
- 실시간으로 진행 상황을 확인할 수 있습니다
- 작업이 완료될 때까지 자동으로 반복 실행됩니다

### 4. 작업 중지
- 작업 실행 중 "Stop" 버튼을 클릭하여 중지할 수 있습니다

## 🏗️ 프로젝트 구조

```
agifirst/
├── server/
│   ├── index.js           # Express 서버 및 WebSocket
│   ├── groqService.js     # Groq AI 서비스
│   └── browserAgent.js    # Playwright 브라우저 자동화
├── public/
│   ├── index.html         # 메인 HTML
│   ├── style.css          # 스타일시트
│   └── app.js             # 클라이언트 JavaScript
├── Dockerfile             # Docker 설정
├── package.json           # 프로젝트 설정
└── README.md             # 문서
```

## 🔧 기술 스택

### Backend
- **Node.js & Express**: 웹 서버
- **WebSocket (ws)**: 실시간 양방향 통신
- **Playwright**: 브라우저 자동화
- **Groq SDK**: AI 모델 통합

### Frontend
- **Vanilla JavaScript**: 가볍고 빠른 클라이언트
- **WebSocket API**: 실시간 통신
- **CSS3**: 모던하고 깔끔한 UI

### Deployment
- **Docker**: 컨테이너화
- **Cloudtype**: 클라우드 배포 플랫폼

## 🔐 보안

- 사용자의 API 키는 서버에 저장되지 않습니다
- 모든 API 키는 클라이언트 세션에서만 관리됩니다
- WebSocket 연결이 끊어지면 API 키가 자동으로 삭제됩니다

## ⚠️ 주의사항

1. **API 사용량**: Groq API의 무료 티어 제한을 확인하세요
2. **브라우저 리소스**: Playwright는 실제 브라우저를 실행하므로 서버 리소스를 많이 사용합니다
3. **웹사이트 정책**: 자동화가 금지된 웹사이트에서는 사용하지 마세요
4. **책임 있는 사용**: AI 브라우저 자동화는 윤리적이고 합법적으로 사용하세요

## 🛠️ 문제 해결

### Playwright 브라우저 오류
```bash
# 브라우저 재설치
npx playwright install --with-deps chromium
```

### 포트 충돌
```bash
# .env 파일에서 포트 변경
PORT=3001
```

### WebSocket 연결 실패
- 방화벽 설정 확인
- HTTPS 환경에서는 WSS 프로토콜 사용 확인

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해주세요.

---

**AGIfirst** - AI가 브라우저를 제어하는 미래를 경험하세요 🚀
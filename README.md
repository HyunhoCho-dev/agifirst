# AGIfirst - AI Browser Control Platform

AGIfirst는 Groq API와 Selenium WebDriver를 사용하여 브라우저를 AI가 자동으로 제어할 수 있는 혁신적인 플랫폼입니다. **Jupyter Notebook처럼 사용자의 컴퓨터에서 실행**되며, 웹 브라우저를 통해 접근합니다.

## 🌟 주요 기능

- 🤖 **AI 기반 브라우저 자동화**: Groq의 강력한 LLM을 사용한 지능적인 브라우저 제어
- 💻 **로컬 실행**: Jupyter Notebook처럼 사용자의 컴퓨터에서 안전하게 실행
- 🎮 **웹 게임 플레이**: AI가 웹 게임을 플레이할 수 있습니다
- 🔍 **자동 검색**: 복잡한 검색 작업을 AI에게 맡기세요
- 🛒 **온라인 쇼핑 지원**: 상품 검색, 비교, 구매 프로세스 자동화
- 💼 **업무 자동화**: 반복적인 웹 기반 업무를 자동화
- 🎨 **ChatGPT 스타일 UI**: 깔끔하고 직관적인 사용자 인터페이스
- 🔒 **개인 API 키**: 각 사용자가 자신의 Groq API 키를 사용

## 🚀 빠른 시작

### 방법 1: 다운로드 (권장)

1. **랜딩 페이지 접속**
   - `landing/index.html`을 웹 서버에 호스팅하거나 직접 열기
   - GitHub Pages, Vercel 등 무료 호스팅 가능

2. **API 키 입력**
   - [Groq Console](https://console.groq.com/)에서 무료 API 키 발급
   - 랜딩 페이지에 API 키 입력

3. **운영체제 선택 후 다운로드**
   - Windows / macOS / Linux 중 선택
   - 실행 파일 다운로드

4. **프로그램 실행**
   - 다운로드한 파일 실행
   - 자동으로 브라우저가 열림 (http://localhost:8080)

### 방법 2: 소스 코드로 실행

#### 사전 요구사항
- Python 3.11 이상
- Chrome 또는 Chromium 브라우저
- Groq API 키

#### 실행 방법

```bash
# 저장소 클론
git clone <repository-url>
cd agifirst/client

# 의존성 설치
pip install -r requirements.txt

# 프로그램 실행
python local_app.py
```

브라우저가 자동으로 열리고 `http://localhost:8080`에 접속됩니다.

## 📖 사용 방법

### 1. API 키 입력
- 처음 실행 시 Groq API 키 입력 화면이 나타납니다
- API 키는 로컬에 안전하게 저장됩니다

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
├── client/                  # 로컬 실행 애플리케이션
│   ├── local_app.py         # 메인 애플리케이션 (Flask 서버)
│   ├── browser_agent.py     # Selenium 브라우저 자동화
│   ├── groq_service.py      # Groq AI 서비스
│   ├── public/              # 웹 UI 파일들
│   │   ├── index.html       # 메인 HTML
│   │   ├── style.css        # 스타일시트
│   │   └── app.js           # 클라이언트 JavaScript
│   ├── build.py             # 실행 파일 빌드 스크립트
│   ├── agifirst.spec        # PyInstaller 설정
│   └── requirements.txt     # Python 의존성
│
├── landing/                 # 다운로드 랜딩 페이지
│   ├── index.html           # 랜딩 페이지
│   └── download.js          # 다운로드 로직
│
├── README.md                # 프로젝트 문서
├── LOCAL_SETUP.md           # 상세 설정 가이드
└── QUICKSTART.md            # 빠른 시작 가이드
```

## 🔧 기술 스택

### Backend (로컬 실행)
- **Python 3.11**: 메인 언어
- **Flask**: 로컬 웹 서버
- **Flask-SocketIO**: 실시간 양방향 통신
- **Selenium WebDriver**: 브라우저 자동화
- **Groq SDK**: AI 모델 통합

### Frontend
- **Vanilla JavaScript**: 가볍고 빠른 클라이언트
- **WebSocket API**: 실시간 통신
- **CSS3**: 모던하고 깔끔한 UI

### Packaging
- **PyInstaller**: 실행 파일 생성 (.exe, .dmg, .AppImage)

## 🔐 보안

- API 키는 사용자의 컴퓨터에만 저장됩니다
- 모든 처리는 로컬에서 이루어집니다
- 외부 서버로 데이터가 전송되지 않습니다 (Groq API 제외)

## 📦 배포 및 빌드

### 실행 파일 생성

```bash
cd client
python build.py
```

생성된 실행 파일은 `dist/` 폴더에 저장됩니다.

### 랜딩 페이지 배포

`landing/` 폴더를 GitHub Pages, Vercel, Netlify 등에 무료로 호스팅할 수 있습니다.

자세한 내용은 [LOCAL_SETUP.md](LOCAL_SETUP.md)와 [QUICKSTART.md](QUICKSTART.md)를 참조하세요.

## ⚠️ 주의사항

1. **API 사용량**: Groq API의 무료 티어 제한을 확인하세요
2. **브라우저 리소스**: Selenium WebDriver는 실제 브라우저를 실행하므로 시스템 리소스를 사용합니다
3. **웹사이트 정책**: 자동화가 금지된 웹사이트에서는 사용하지 마세요
4. **책임 있는 사용**: AI 브라우저 자동화는 윤리적이고 합법적으로 사용하세요

## 🛠️ 문제 해결

### Chrome 브라우저 오류
- Chrome 또는 Chromium 브라우저가 설치되어 있어야 합니다
- Linux: `sudo apt install chromium-browser`
- macOS: `brew install --cask google-chrome`
- Windows: [공식 사이트](https://www.google.com/chrome/)에서 다운로드

### 포트 충돌
기본 포트(8080)가 사용 중인 경우:
```bash
PORT=8081 python client/local_app.py
```

### Python 버전 오류
Python 3.11 이상이 필요합니다:
```bash
python --version
```

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해주세요.

---

**AGIfirst** - Jupyter Notebook처럼 사용하는 AI 브라우저 자동화 🚀

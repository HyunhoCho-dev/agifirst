# AGIfirst - Local Edition Setup Guide

## 🎯 개요

AGIfirst Local Edition은 Jupyter Notebook과 같은 방식으로 작동하는 AI 브라우저 자동화 도구입니다.
**사용자의 컴퓨터에서 실행**되며, 웹 브라우저를 통해 접근합니다.

## 🏗️ 프로젝트 구조

```
agifirst/
├── landing/              # 다운로드 랜딩 페이지 (프론트엔드만)
│   ├── index.html        # 다운로드 페이지
│   ├── download.js       # 다운로드 로직
│   └── downloads/        # 빌드된 실행 파일들
│       ├── AGIfirst-Setup.exe      (Windows)
│       ├── AGIfirst.dmg            (macOS)
│       └── AGIfirst.AppImage       (Linux)
│
└── client/               # 로컬 실행 클라이언트
    ├── local_app.py      # 메인 애플리케이션
    ├── browser_agent.py  # 브라우저 제어 로직
    ├── groq_service.py   # Groq API 서비스
    ├── public/           # 웹 UI 파일들
    ├── build.py          # 빌드 스크립트
    ├── agifirst.spec     # PyInstaller 설정
    └── requirements.txt  # Python 의존성
```

## 🚀 사용자 관점: 사용 방법

### 1단계: 다운로드 페이지 접속
```
https://your-domain.com/landing/index.html
```

### 2단계: Groq API 키 입력
- [Groq Console](https://console.groq.com/)에서 API 키 발급
- 다운로드 페이지에 API 키 입력

### 3단계: 운영체제 선택 및 다운로드
- Windows / macOS / Linux 중 선택
- 다운로드 버튼 클릭

### 4단계: 프로그램 실행
- 다운로드한 파일 실행
- 자동으로 브라우저가 열림
- `http://localhost:8080` 접속 완료!

### 5단계: AI 브라우저 제어 시작
- 원하는 작업 입력
- AI가 자동으로 브라우저 제어

## 💻 개발자 관점: 빌드 방법

### 1. 로컬에서 테스트

```bash
cd client
python -m pip install -r requirements.txt
python local_app.py
```

브라우저가 자동으로 열리고 `http://localhost:8080`에서 실행됩니다.

### 2. 실행 파일 빌드

```bash
cd client
python build.py
```

빌드 과정:
1. 의존성 자동 설치
2. PyInstaller로 실행 파일 생성
3. `dist/AGIfirst/` 폴더에 실행 파일 생성
4. `../landing/downloads/`에 설치 파일 복사

### 3. 다운로드 페이지 배포

#### GitHub Pages (무료)
```bash
# 1. landing 폴더를 docs로 복사
cp -r landing docs

# 2. GitHub에 푸시
git add docs
git commit -m "Add landing page"
git push

# 3. GitHub Settings > Pages > Source를 "docs"로 설정
```

#### Vercel / Netlify (무료)
```bash
# landing 폴더를 직접 배포
cd landing
vercel deploy
# 또는
netlify deploy
```

### 4. 실행 파일 호스팅

다운로드 파일을 호스팅할 옵션:

**Option 1: GitHub Releases**
```bash
# 릴리즈 생성 및 파일 업로드
gh release create v1.0.0 \
  landing/downloads/AGIfirst-Setup.exe \
  landing/downloads/AGIfirst.dmg \
  landing/downloads/AGIfirst.AppImage
```

**Option 2: CDN (권장)**
- AWS S3 + CloudFront
- Google Cloud Storage
- DigitalOcean Spaces

## 🔧 설정 파일

로컬 실행 시 설정 파일 위치:
- **Windows**: `C:\Users\{username}\.agifirst\config.json`
- **macOS**: `/Users/{username}/.agifirst/config.json`
- **Linux**: `/home/{username}/.agifirst/config.json`

설정 파일 형식:
```json
{
  "apiKey": "gsk_...",
  "port": 8080
}
```

## 🎨 커스터마이징

### 포트 변경
`client/local_app.py` 파일에서:
```python
DEFAULT_PORT = 8080  # 원하는 포트로 변경
```

### UI 커스터마이징
`client/public/` 폴더의 파일들 수정:
- `index.html` - 구조
- `style.css` - 스타일
- `app.js` - 기능

## 📦 빌드 산출물

### Windows
- `AGIfirst-Setup.exe` (~100MB)
- 더블클릭으로 실행
- Chrome 자동 설치 확인

### macOS
- `AGIfirst.dmg` (~100MB)
- 드래그 앤 드롭 설치
- 보안 설정 확인 필요

### Linux
- `AGIfirst.AppImage` (~100MB)
- 실행 권한 부여: `chmod +x AGIfirst.AppImage`
- 더블클릭 또는 `./AGIfirst.AppImage` 실행

## 🐛 문제 해결

### 브라우저가 자동으로 열리지 않음
```
수동으로 http://localhost:8080 접속
```

### 포트가 이미 사용 중
```bash
# 다른 포트로 시작
PORT=8081 python local_app.py
```

### Chrome 드라이버 오류
```bash
# Chrome 재설치 또는 업데이트
```

### API 키 오류
```bash
# config.json 파일 삭제 후 재시작
rm ~/.agifirst/config.json
```

## 🔒 보안

- ✅ 모든 데이터는 로컬에서만 처리
- ✅ API 키는 로컬 파일에만 저장
- ✅ 외부 서버와 통신 없음 (Groq API 제외)
- ✅ localhost에서만 실행 (127.0.0.1)

## 📄 라이선스

MIT License

## 🤝 기여

Pull Request 환영합니다!

## 📞 지원

- Issues: [GitHub Issues](https://github.com/yourusername/agifirst/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/agifirst/discussions)

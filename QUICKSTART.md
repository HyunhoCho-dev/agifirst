# 🚀 AGIfirst Quick Start Guide

## 빠른 시작 (개발자용)

### 1️⃣ 로컬에서 바로 실행하기

```bash
# 1. 의존성 설치
cd client
pip install -r requirements.txt

# 2. 프로그램 실행
python local_app.py

# 3. 브라우저가 자동으로 열림!
# http://localhost:8080
```

### 2️⃣ 다운로드 페이지 테스트

```bash
# landing 폴더로 이동
cd landing

# 간단한 HTTP 서버 실행
python -m http.server 8000

# 브라우저에서 접속
# http://localhost:8000
```

### 3️⃣ 실행 파일 빌드

```bash
# client 폴더로 이동
cd client

# 빌드 스크립트 실행
python build.py

# 결과물 확인
# - 실행 파일: dist/AGIfirst/
# - 설치 파일: ../landing/downloads/
```

## 📦 배포하기 (프로덕션)

### Step 1: 실행 파일 빌드

```bash
cd client
python build.py
```

### Step 2: 다운로드 페이지 배포

**GitHub Pages (가장 쉬움):**
```bash
# 루트 디렉토리로 이동
cd ..

# landing을 docs로 복사
cp -r landing docs

# Git 커밋 & 푸시
git add docs
git commit -m "Add landing page"
git push

# GitHub Settings > Pages > Source = "docs"
```

**Vercel (빠름):**
```bash
cd landing
npx vercel
```

**Netlify:**
```bash
cd landing
npx netlify-cli deploy
```

### Step 3: 실행 파일 호스팅

**GitHub Releases (추천):**
```bash
gh release create v1.0.0 \
  landing/downloads/AGIfirst-Setup.exe \
  landing/downloads/AGIfirst.dmg \
  landing/downloads/AGIfirst.AppImage
```

### Step 4: 다운로드 URL 업데이트

`landing/download.js` 파일 수정:
```javascript
// Before (로컬 테스트)
downloadUrl = './downloads/AGIfirst-Setup.exe';

// After (프로덕션)
downloadUrl = 'https://github.com/USER/REPO/releases/download/v1.0.0/AGIfirst-Setup.exe';
```

## 🎯 사용자 시나리오

1. **웹사이트 방문**
   ```
   https://yourdomain.com
   ```

2. **Groq API 키 입력**
   - [Groq Console](https://console.groq.com/)에서 무료로 발급
   - 다운로드 페이지에 입력

3. **운영체제 선택 & 다운로드**
   - Windows / macOS / Linux 중 선택
   - 다운로드 버튼 클릭

4. **프로그램 실행**
   - 다운로드한 파일 더블클릭
   - 자동으로 브라우저 열림

5. **AI 브라우저 제어**
   - 웹 인터페이스에서 작업 입력
   - AI가 자동으로 브라우저 제어

## 🔧 주요 파일

```
agifirst/
│
├── landing/                  # 다운로드 페이지
│   ├── index.html           # UI
│   └── download.js          # 다운로드 로직
│
├── client/                   # 로컬 클라이언트
│   ├── local_app.py         # 메인 앱
│   ├── build.py             # 빌드 스크립트
│   └── requirements.txt     # 의존성
│
├── LOCAL_SETUP.md           # 상세 가이드
├── QUICKSTART.md            # 이 파일
└── README.md                # 프로젝트 소개
```

## 💡 팁

### 개발 중에는...
```bash
# 로컬에서 직접 실행
cd client
python local_app.py
```

### 배포할 때는...
```bash
# 1. 빌드
cd client
python build.py

# 2. 테스트
cd dist/AGIfirst
./AGIfirst  # 또는 AGIfirst.exe

# 3. 배포
cd ../../landing
vercel deploy --prod
```

### 문제 발생 시...
```bash
# 로그 확인
tail -f ~/.agifirst/*.log

# 설정 초기화
rm -rf ~/.agifirst

# 의존성 재설치
pip install -r requirements.txt --force-reinstall
```

## 📞 도움이 필요하신가요?

- 📖 [상세 문서](./LOCAL_SETUP.md)
- 🐛 [이슈 리포트](https://github.com/yourusername/agifirst/issues)
- 💬 [디스커션](https://github.com/yourusername/agifirst/discussions)

## ⚡ 한 줄 명령어

```bash
# 개발 환경 셋업 & 실행
cd client && pip install -r requirements.txt && python local_app.py

# 빌드 & 테스트
cd client && python build.py && cd dist/AGIfirst && ./AGIfirst

# 랜딩 페이지 배포 (Vercel)
cd landing && npx vercel --prod
```

## 🎉 완료!

이제 AGIfirst를 Jupyter Notebook처럼 사용할 수 있습니다!
- ✅ 로컬에서 실행
- ✅ 웹 브라우저로 접속
- ✅ AI가 브라우저 자동 제어

# AGIfirst Landing Page

## 🌐 다운로드 페이지 (프론트엔드만)

이 폴더는 순수 HTML/CSS/JavaScript로만 구성된 정적 웹사이트입니다.
백엔드 서버 없이 GitHub Pages, Vercel, Netlify 등에 무료로 호스팅할 수 있습니다.

## 📁 파일 구조

```
landing/
├── index.html          # 메인 다운로드 페이지
├── download.js         # 다운로드 로직
├── downloads/          # 실행 파일들 (빌드 후 생성)
│   ├── AGIfirst-Setup.exe      (Windows)
│   ├── AGIfirst.dmg            (macOS)
│   └── AGIfirst.AppImage       (Linux)
└── README.md           # 이 파일
```

## 🚀 로컬 테스트

간단한 HTTP 서버로 로컬 테스트:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

브라우저에서 `http://localhost:8000` 접속

## 📤 배포 방법

### 1. GitHub Pages (추천, 무료)

```bash
# 1. 이 폴더를 docs로 복사
cd ..
cp -r landing docs

# 2. Git에 커밋
git add docs
git commit -m "Add landing page"
git push

# 3. GitHub 저장소 Settings > Pages
#    Source: Deploy from a branch
#    Branch: main
#    Folder: /docs

# 4. 접속 URL
# https://yourusername.github.io/agifirst/
```

### 2. Vercel (무료)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
cd landing
vercel

# 프로덕션 배포
vercel --prod
```

### 3. Netlify (무료)

```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
cd landing
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

### 4. Cloudflare Pages (무료)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. Pages > Create a project
3. GitHub 저장소 연결
4. Build settings:
   - Build command: (비워두기)
   - Build output directory: `landing`

## 📦 실행 파일 호스팅

현재 이 랜딩 페이지는 **GitHub Releases**를 사용하도록 설정되어 있습니다.

### ✅ GitHub Releases로 배포하기 (현재 설정)

#### 1️⃣ 앱 빌드하기

먼저 각 플랫폼에서 앱을 빌드해야 합니다:

```bash
# 프로젝트 루트에서
cd client

# 의존성 설치 및 빌드
python3 build.py

# 빌드된 파일 위치 확인
ls -la dist/AGIfirst/
```

빌드가 완료되면 `dist/AGIfirst/` 폴더에 실행 파일이 생성됩니다.

#### 2️⃣ Windows용 ZIP 파일 생성하기

**중요**: Chrome이 exe 파일을 직접 다운로드하면 차단하므로, ZIP 파일로 압축해서 배포합니다.

```bash
# Windows에서
cd client/dist/AGIfirst/
Compress-Archive -Path AGIfirst.exe -DestinationPath AGIfirst-Windows.zip

# macOS/Linux에서
cd client/dist/AGIfirst/
zip AGIfirst-Windows.zip AGIfirst.exe
```

#### 3️⃣ GitHub Release 생성하기

**방법 A: GitHub CLI 사용 (추천)**

```bash
# GitHub CLI 설치 확인
gh --version

# 릴리즈 생성 (ZIP 파일 업로드)
gh release create v1.0.0 \
  client/dist/AGIfirst/AGIfirst-Windows.zip \
  --title "AGIfirst v1.0.0" \
  --notes "🎉 Initial release

✨ Features:
- AI Browser Control
- Local execution
- Groq API integration

📥 Download:
- Windows: AGIfirst-Windows.zip (압축 해제 후 AGIfirst.exe 실행)
- macOS: Coming soon
- Linux: Coming soon"
```

**방법 B: GitHub 웹 인터페이스 사용**

1. GitHub 저장소 방문: https://github.com/HyunhoCho-dev/agifirst
2. 오른쪽의 **"Releases"** 클릭
3. **"Draft a new release"** 클릭
4. Tag version에 `v1.0.0` 입력
5. Release title에 `AGIfirst v1.0.0` 입력
6. 빌드된 ZIP 파일 드래그 앤 드롭:
   - `AGIfirst-Windows.zip` (Windows)
   - `AGIfirst.dmg` (macOS - 준비 중)
   - `AGIfirst.AppImage` (Linux - 준비 중)
7. Release notes에 설치 방법 추가:
   ```
   📦 Windows 설치 방법:
   1. AGIfirst-Windows.zip 다운로드
   2. ZIP 파일 압축 해제
   3. AGIfirst.exe 실행
   ```
8. **"Publish release"** 클릭

#### 4️⃣ 버전 업데이트 (필요시)

새 버전을 릴리즈할 때는 `landing/download.js`의 버전을 업데이트하세요:

```javascript
// landing/download.js
const RELEASE_VERSION = 'v1.0.0'; // 👈 여기를 새 버전으로 변경
```

**참고**: Windows용은 ZIP 파일로, macOS/Linux용은 원본 파일로 배포합니다.

#### 5️⃣ 테스트하기

```bash
# 로컬에서 테스트
cd landing
python3 -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
# 다운로드 버튼 클릭하여 작동 확인
```

---

### 🔄 다른 호스팅 옵션

<details>
<summary>Option 2: CDN (클릭하여 펼치기)</summary>

GitHub Releases 대신 CDN을 사용하려면 `download.js`를 수정하세요:

```javascript
// download.js의 GITHUB_REPO 부분을 CDN URL로 변경
downloadUrl = 'https://cdn.yourdomain.com/agifirst/AGIfirst-Setup.exe';
```

**AWS S3 + CloudFront:**
```bash
aws s3 cp downloads/ s3://your-bucket/agifirst/ --recursive
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

**Google Cloud Storage:**
```bash
gsutil cp -r downloads/ gs://your-bucket/agifirst/
```

</details>

<details>
<summary>Option 3: Git LFS (클릭하여 펼치기)</summary>

**주의**: GitHub는 100MB 이상 파일을 권장하지 않습니다.

```bash
# Git LFS 사용
git lfs install
git lfs track "landing/downloads/*"
git add .gitattributes
git add landing/downloads/
git commit -m "Add executables"
git push

# download.js를 로컬 파일 경로로 변경
downloadUrl = './downloads/AGIfirst-Setup.exe';
```

</details>

## 🎨 커스터마이징

### 브랜딩 변경

`index.html`에서:
- 타이틀 변경
- 로고 이모지 변경 (🤖)
- 색상 스킴 변경

### 스타일 변경

`index.html`의 `<style>` 섹션에서:
```css
/* 메인 그라데이션 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 버튼 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 기능 추가

`download.js`에서:
- 다운로드 전 API 키 검증
- 분석 트래킹 추가
- 커스텀 메시지 추가

## 🔗 도메인 연결

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
```bash
netlify domains:add yourdomain.com
```

### GitHub Pages
1. Settings > Pages > Custom domain
2. `yourdomain.com` 입력
3. DNS에 CNAME 레코드 추가:
   ```
   CNAME  www  yourusername.github.io
   ```

## 📊 분석 추가

### Google Analytics

`index.html`의 `<head>` 섹션에 추가:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (개인정보 보호 중심)
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🧪 테스트 체크리스트

- [ ] API 키 입력 필드 동작
- [ ] 플랫폼 선택 버튼 동작
- [ ] 다운로드 버튼 클릭
- [ ] 에러 메시지 표시
- [ ] 성공 메시지 표시
- [ ] 반응형 디자인 (모바일)
- [ ] 브라우저 호환성
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## 📝 라이선스

MIT License

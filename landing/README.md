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

`downloads/` 폴더의 실행 파일들을 호스팅하는 방법:

### Option 1: GitHub Releases (추천)

```bash
# GitHub CLI로 릴리즈 생성
gh release create v1.0.0 \
  landing/downloads/AGIfirst-Setup.exe \
  landing/downloads/AGIfirst.dmg \
  landing/downloads/AGIfirst.AppImage \
  --title "AGIfirst v1.0.0" \
  --notes "Initial release"

# 다운로드 URL 업데이트
# download.js에서:
# downloadUrl = 'https://github.com/yourusername/agifirst/releases/download/v1.0.0/AGIfirst-Setup.exe'
```

### Option 2: CDN

**AWS S3 + CloudFront:**
```bash
aws s3 cp downloads/ s3://your-bucket/agifirst/ --recursive
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

**Google Cloud Storage:**
```bash
gsutil cp -r downloads/ gs://your-bucket/agifirst/
```

### Option 3: GitHub 저장소에 직접 포함

**주의**: GitHub는 100MB 이상 파일을 권장하지 않습니다.

```bash
# Git LFS 사용
git lfs install
git lfs track "landing/downloads/*"
git add .gitattributes
git add landing/downloads/
git commit -m "Add executables"
git push
```

## 🔄 다운로드 URL 업데이트

`download.js` 파일에서 다운로드 URL을 실제 호스팅 위치로 변경:

```javascript
// 로컬 파일 (개발용)
downloadUrl = './downloads/AGIfirst-Setup.exe';

// GitHub Releases
downloadUrl = 'https://github.com/USER/REPO/releases/download/v1.0.0/AGIfirst-Setup.exe';

// CDN
downloadUrl = 'https://cdn.yourdomain.com/agifirst/AGIfirst-Setup.exe';

// S3
downloadUrl = 'https://your-bucket.s3.amazonaws.com/agifirst/AGIfirst-Setup.exe';
```

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

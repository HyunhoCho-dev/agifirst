# Cloudflare Pages 배포 가이드

## 🎯 배포 대상

**`landing/` 폴더만** Cloudflare Pages에 배포됩니다.
- 정적 웹사이트 (HTML/CSS/JavaScript)
- 다운로드 페이지

`client/` 폴더는 배포하지 않습니다 (로컬 실행용)

## 🚀 Cloudflare Pages 설정 방법

### 1. 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. **Pages** 클릭
3. **Create a project** 클릭
4. **Connect to Git** 선택
5. GitHub 저장소 선택 (`agifirst`)

### 2. Build 설정 (중요!)

**Framework preset**: None

**Build configuration**:
```
Root directory:          landing
Build command:           (비워두기)
Build output directory:  /
```

**환경 변수**: 없음

### 3. 배포 실행

**Save and Deploy** 클릭!

배포가 완료되면 `https://agifirst.pages.dev` 형식의 URL이 생성됩니다.

## ✅ 배포 확인

배포 후 확인할 사항:

- [ ] `https://your-project.pages.dev` 접속 시 랜딩 페이지가 보이는가?
- [ ] API 키 입력 필드가 동작하는가?
- [ ] 플랫폼 선택 버튼이 동작하는가?
- [ ] 다운로드 버튼이 활성화되는가?

## 🔧 설정이 잘못된 경우

만약 전체 프로젝트가 업로드되고 있다면:

1. **Settings** > **Builds & deployments**로 이동
2. **Build configuration** 섹션 찾기
3. **Configure build settings** 클릭
4. **Root directory**를 `landing`으로 변경
5. **Save** 클릭
6. **Deployments** > **Retry deployment**

## 📁 배포되는 파일들

```
landing/
├── index.html          ✅ 배포됨
├── download.js         ✅ 배포됨
└── README.md           ✅ 배포됨 (필요시 제외 가능)
```

**배포되지 않는 파일들:**
```
client/                 ❌ 배포 안 됨 (로컬 실행용)
.git/                   ❌ 자동 제외
README.md (루트)        ❌ 배포 안 됨 (landing 밖)
```

## 🔗 커스텀 도메인 연결 (선택사항)

1. **Settings** > **Custom domains**
2. **Set up a custom domain** 클릭
3. 도메인 입력 (예: `agifirst.com`)
4. DNS 설정:
   ```
   CNAME  @  agifirst.pages.dev
   ```

## 🌐 배포 URL 예시

**기본 URL**: `https://agifirst.pages.dev`

**브랜치 미리보기**:
- `https://branch-name.agifirst.pages.dev`

**커스텀 도메인**:
- `https://agifirst.com` (설정 후)

## 📦 실행 파일 호스팅

`download.js`에서 참조하는 실행 파일들은 별도로 호스팅해야 합니다:

### 옵션 1: GitHub Releases (권장)

```bash
gh release create v1.0.0 \
  client/dist/AGIfirst-Setup.exe \
  client/dist/AGIfirst.dmg \
  client/dist/AGIfirst.AppImage \
  --title "AGIfirst v1.0.0" \
  --notes "Initial release"
```

### 옵션 2: Cloudflare R2 (무료 10GB)

1. **R2** > **Create bucket**
2. 파일 업로드
3. Public URL 생성
4. `download.js`에서 URL 업데이트

## 🔄 자동 배포

Git에 푸시하면 자동으로 배포됩니다:

```bash
git add landing/
git commit -m "Update landing page"
git push origin main
```

Cloudflare Pages가 자동으로:
1. 변경사항 감지
2. `landing/` 폴더만 빌드
3. 배포 완료

## 🐛 문제 해결

### 문제: "Build failed"

**원인**: Build command가 설정되어 있음

**해결**:
- Build command를 비워두기
- 정적 HTML이므로 빌드 불필요

### 문제: "404 Not Found"

**원인**: Root directory가 잘못 설정됨

**해결**:
- Root directory를 `landing`으로 설정
- 재배포

### 문제: 전체 프로젝트가 배포됨

**원인**: Root directory가 `/` 또는 비어있음

**해결**:
- Root directory를 명시적으로 `landing`으로 설정
- Settings에서 변경 후 재배포

## 📊 배포 로그 확인

1. **Deployments** 탭 클릭
2. 최근 배포 선택
3. **View build log** 클릭
4. 로그에서 어떤 파일들이 배포되었는지 확인

정상적인 로그:
```
✓ Project files loaded in landing/
✓ Building static site
✓ Deploying to Cloudflare Pages
✓ Success!
```

## 💡 팁

1. **브랜치 미리보기**:
   - 새 브랜치 푸시 시 자동으로 미리보기 URL 생성
   - PR 테스트에 유용

2. **배포 알림**:
   - Settings > Notifications에서 Discord/Slack 연동 가능

3. **환경 변수**:
   - 정적 사이트이므로 환경 변수 불필요
   - API 키는 사용자가 직접 입력

4. **캐싱**:
   - Cloudflare가 자동으로 CDN 캐싱
   - 전 세계 빠른 로딩 속도

## 🔐 보안

- HTTPS 자동 활성화
- DDoS 보호 기본 제공
- API 키는 서버로 전송되지 않음 (클라이언트에서만 사용)

## 📚 참고 문서

- [Cloudflare Pages 공식 문서](https://developers.cloudflare.com/pages/)
- [Build configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)
- [Custom domains](https://developers.cloudflare.com/pages/platform/custom-domains/)

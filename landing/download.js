// Platform selection
let selectedPlatform = 'windows';

document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove selected from all buttons
        document.querySelectorAll('.platform-btn').forEach(b => {
            b.classList.remove('selected');
        });

        // Add selected to clicked button
        this.classList.add('selected');
        selectedPlatform = this.getAttribute('data-platform');
    });
});

// Download button handler
document.getElementById('downloadBtn').addEventListener('click', async function() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const messageDiv = document.getElementById('message');
    const downloadBtn = this;

    // Clear previous messages
    messageDiv.innerHTML = '';

    // Validate API key
    if (!apiKey) {
        messageDiv.innerHTML = '<div class="error">❌ API 키를 입력해주세요</div>';
        return;
    }

    if (!apiKey.startsWith('gsk_')) {
        messageDiv.innerHTML = '<div class="error">❌ 올바른 Groq API 키 형식이 아닙니다 (gsk_로 시작해야 합니다)</div>';
        return;
    }

    // Save API key to localStorage (will be embedded in downloaded file)
    localStorage.setItem('groq_api_key', apiKey);

    // Disable button
    downloadBtn.disabled = true;
    downloadBtn.textContent = '준비 중...';

    try {
        // GitHub repository information
        const GITHUB_REPO = 'HyunhoCho-dev/agifirst';
        const RELEASE_VERSION = 'v1.0.0'; // Update this when you create a new release

        // Determine download file based on platform
        let fileName;
        let downloadUrl;

        switch(selectedPlatform) {
            case 'windows':
                fileName = 'AGIfirst-Setup.exe';
                downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_VERSION}/AGIfirst-Setup.exe`;
                break;
            case 'mac':
                fileName = 'AGIfirst.dmg';
                downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_VERSION}/AGIfirst.dmg`;
                break;
            case 'linux':
                fileName = 'AGIfirst.AppImage';
                downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_VERSION}/AGIfirst.AppImage`;
                break;
            default:
                fileName = 'AGIfirst-Setup.exe';
                downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_VERSION}/AGIfirst-Setup.exe`;
        }

        // Show starting message
        messageDiv.innerHTML = '<div class="success">✅ 다운로드를 시작합니다...</div>';

        // Direct download using window.location or <a> tag
        // This avoids CORS issues with GitHub Releases
        window.location.href = downloadUrl;

        // Show installation instructions
        setTimeout(() => {
            messageDiv.innerHTML = `
                <div class="success">
                    ✅ 다운로드가 시작되었습니다!<br>
                    <small>
                        다운로드한 파일을 실행하면 자동으로 브라우저가 열립니다.<br>
                        만약 다운로드가 시작되지 않는다면
                        <a href="https://github.com/${GITHUB_REPO}/releases" target="_blank" style="color: #198754; text-decoration: underline;">
                            여기
                        </a>에서 직접 다운로드하세요.
                    </small>
                </div>
            `;
        }, 1000);

    } catch (error) {
        const GITHUB_REPO = 'HyunhoCho-dev/agifirst';
        messageDiv.innerHTML = `
            <div class="error">
                ❌ 다운로드 중 오류가 발생했습니다.<br>
                <small>
                    <a href="https://github.com/${GITHUB_REPO}/releases" target="_blank" style="color: #dc3545; text-decoration: underline;">
                        GitHub Releases
                    </a>에서 직접 다운로드하거나, 네트워크 연결을 확인해 주세요.
                </small>
            </div>
        `;
    } finally {
        // Re-enable button
        downloadBtn.disabled = false;
        downloadBtn.textContent = '다운로드';
    }
});

// Auto-fill API key if exists in localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }
});

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
        // Determine download file based on platform
        let fileName;
        let downloadUrl;

        switch(selectedPlatform) {
            case 'windows':
                fileName = 'AGIfirst-Setup.exe';
                downloadUrl = './downloads/AGIfirst-Setup.exe';
                break;
            case 'mac':
                fileName = 'AGIfirst.dmg';
                downloadUrl = './downloads/AGIfirst.dmg';
                break;
            case 'linux':
                fileName = 'AGIfirst.AppImage';
                downloadUrl = './downloads/AGIfirst.AppImage';
                break;
            default:
                fileName = 'AGIfirst-Setup.exe';
                downloadUrl = './downloads/AGIfirst-Setup.exe';
        }

        // Show success message
        messageDiv.innerHTML = '<div class="success">✅ 다운로드를 시작합니다...</div>';

        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);

        // Show installation instructions
        setTimeout(() => {
            messageDiv.innerHTML = `
                <div class="success">
                    ✅ 다운로드 완료!<br>
                    <small>다운로드한 파일을 실행하면 자동으로 브라우저가 열립니다.</small>
                </div>
            `;
        }, 1000);

    } catch (error) {
        messageDiv.innerHTML = `<div class="error">❌ 다운로드 실패: ${error.message}</div>`;
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

#!/usr/bin/env python3
"""
Build script for AGIfirst Local Client
Creates executable files for Windows, macOS, and Linux
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a shell command"""
    print(f'Running: {" ".join(cmd)}')
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f'Error: {result.stderr}')
        return False
    print(result.stdout)
    return True

def install_dependencies():
    """Install required dependencies"""
    print('\n📦 Installing dependencies...')
    dependencies = [
        'pyinstaller',
        'flask',
        'flask-cors',
        'flask-socketio',
        'python-socketio',
        'gevent',
        'selenium',
        'webdriver-manager',
        'groq',
        'Pillow',
    ]

    for dep in dependencies:
        if not run_command([sys.executable, '-m', 'pip', 'install', dep]):
            print(f'❌ Failed to install {dep}')
            return False

    print('✅ Dependencies installed')
    return True

def build_executable():
    """Build the executable using PyInstaller"""
    print('\n🔨 Building executable...')

    # Clean previous builds
    for dir_name in ['build', 'dist']:
        dir_path = Path(dir_name)
        if dir_path.exists():
            print(f'Cleaning {dir_name}...')
            shutil.rmtree(dir_path)

    # Run PyInstaller
    if not run_command([
        sys.executable,
        '-m',
        'PyInstaller',
        'agifirst.spec',
        '--clean',
        '--noconfirm'
    ]):
        print('❌ Build failed')
        return False

    print('✅ Build completed')
    return True

def create_installer():
    """Create installer package"""
    print('\n📦 Creating installer package...')

    dist_dir = Path('dist/AGIfirst')
    if not dist_dir.exists():
        print('❌ dist/AGIfirst directory not found')
        return False

    # Determine platform
    platform = sys.platform
    output_dir = Path('../landing/downloads')
    output_dir.mkdir(parents=True, exist_ok=True)

    if platform == 'win32':
        # Windows: Create zip file
        output_file = output_dir / 'AGIfirst-Setup.exe'
        # For now, just copy the exe
        exe_file = dist_dir / 'AGIfirst.exe'
        if exe_file.exists():
            shutil.copy(exe_file, output_file)
            print(f'✅ Created: {output_file}')
        else:
            print('❌ AGIfirst.exe not found')
            return False

    elif platform == 'darwin':
        # macOS: Create .app bundle
        output_file = output_dir / 'AGIfirst.dmg'
        # For now, create a zip
        shutil.make_archive(
            str(output_dir / 'AGIfirst'),
            'zip',
            dist_dir
        )
        shutil.move(
            str(output_dir / 'AGIfirst.zip'),
            output_file
        )
        print(f'✅ Created: {output_file}')

    else:
        # Linux: Create AppImage or tar.gz
        output_file = output_dir / 'AGIfirst.AppImage'
        shutil.make_archive(
            str(output_dir / 'AGIfirst'),
            'gztar',
            dist_dir
        )
        shutil.move(
            str(output_dir / 'AGIfirst.tar.gz'),
            output_file
        )
        print(f'✅ Created: {output_file}')

    return True

def main():
    """Main build process"""
    print('=' * 60)
    print('🤖 AGIfirst Local Client Builder')
    print('=' * 60)

    # Change to client directory
    client_dir = Path(__file__).parent
    os.chdir(client_dir)

    # Step 1: Install dependencies
    if not install_dependencies():
        print('\n❌ Build failed: Could not install dependencies')
        return 1

    # Step 2: Build executable
    if not build_executable():
        print('\n❌ Build failed: PyInstaller error')
        return 1

    # Step 3: Create installer
    if not create_installer():
        print('\n❌ Build failed: Could not create installer')
        return 1

    print('\n' + '=' * 60)
    print('✅ Build completed successfully!')
    print('=' * 60)
    print('\n📁 Output files:')
    print('   - Executable: dist/AGIfirst/')
    print('   - Installer: ../landing/downloads/')
    print('\n💡 Next steps:')
    print('   1. Test the executable in dist/AGIfirst/')
    print('   2. Deploy landing page to hosting service')
    print('   3. Upload installer to CDN or file hosting')
    print()

    return 0

if __name__ == '__main__':
    sys.exit(main())

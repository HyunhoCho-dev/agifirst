# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for AGIfirst Local Client
"""

block_cipher = None

a = Analysis(
    ['local_app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('public', 'public'),
        ('browser_agent.py', '.'),
        ('groq_service.py', '.'),
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'flask_socketio',
        'socketio',
        'engineio',
        'gevent',
        'selenium',
        'webdriver_manager',
        'groq',
        'PIL',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='AGIfirst',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Set to True to show console for debugging
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon file path here if you have one
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='AGIfirst',
)

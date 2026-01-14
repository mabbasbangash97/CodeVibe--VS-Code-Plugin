import * as vscode from 'vscode';
import { Mood, DEFAULT_MOOD_CONFIGS } from '../types';

/**
 * Settings WebView Provider
 * Provides the settings UI for customizing CodeVibe
 */
export class SettingsProvider {
    public static readonly viewType = 'codevibe.settingsPanel';

    public static createOrShow(extensionUri: vscode.Uri): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        const panel = vscode.window.createWebviewPanel(
            SettingsProvider.viewType,
            'CodeVibe Settings',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri],
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = SettingsProvider.getHtmlForWebview(panel.webview, extensionUri);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'saveSetting':
                    await vscode.workspace.getConfiguration('codevibe').update(
                        message.key,
                        message.value,
                        vscode.ConfigurationTarget.Global
                    );
                    vscode.window.showInformationMessage('Setting saved!');
                    break;
                case 'resetStreak':
                    // This would need to integrate with StreakTracker
                    vscode.window.showWarningMessage(
                        'Are you sure you want to reset your streak?',
                        'Yes, Reset',
                        'Cancel'
                    ).then(async selection => {
                        if (selection === 'Yes, Reset') {
                            // Reset streak
                            vscode.window.showInformationMessage('Streak has been reset.');
                        }
                    });
                    break;
                case 'getSettings':
                    const config = vscode.workspace.getConfiguration('codevibe');
                    panel.webview.postMessage({
                        type: 'settingsLoaded',
                        data: {
                            moods: {
                                focused: {
                                    theme: config.get('moods.focused.theme'),
                                    sound: config.get('moods.focused.sound')
                                },
                                relaxed: {
                                    theme: config.get('moods.relaxed.theme'),
                                    sound: config.get('moods.relaxed.sound')
                                },
                                energized: {
                                    theme: config.get('moods.energized.theme'),
                                    sound: config.get('moods.energized.sound')
                                },
                                creative: {
                                    theme: config.get('moods.creative.theme'),
                                    sound: config.get('moods.creative.sound')
                                },
                                notFeelingIt: {
                                    theme: config.get('moods.notFeelingIt.theme'),
                                    sound: config.get('moods.notFeelingIt.sound')
                                }
                            },
                            sounds: {
                                volume: config.get('sounds.volume'),
                                enabled: config.get('sounds.enabled'),
                                streamingEnabled: config.get('sounds.streamingEnabled')
                            },
                            animations: {
                                enabled: config.get('animations.enabled')
                            },
                            streak: {
                                enabled: config.get('streak.enabled'),
                                minCharsForActivity: config.get('streak.minCharsForActivity')
                            }
                        }
                    });
                    break;
            }
        });
    }

    private static getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri): string {
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>CodeVibe Settings</title>
    <style>
      body {
        font-family: var(--vscode-font-family);
        background: var(--vscode-editor-background);
        color: var(--vscode-foreground);
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      h1 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 30px;
        background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .section {
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .section h2 {
        font-size: 16px;
        margin: 0 0 15px 0;
        color: var(--vscode-foreground);
      }
      .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--vscode-panel-border);
      }
      .setting-row:last-child {
        border-bottom: none;
      }
      .setting-label {
        display: flex;
        flex-direction: column;
      }
      .setting-label span:first-child {
        font-weight: 500;
      }
      .setting-label span:last-child {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
      }
      input[type="text"], select {
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        padding: 6px 10px;
        border-radius: 4px;
        min-width: 200px;
      }
      input[type="range"] {
        width: 150px;
      }
      .toggle {
        width: 40px;
        height: 22px;
        background: var(--vscode-panel-border);
        border-radius: 11px;
        position: relative;
        cursor: pointer;
      }
      .toggle.active {
        background: #10b981;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
      }
      .toggle.active::after {
        transform: translateX(18px);
      }
      button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background: var(--vscode-button-hoverBackground);
      }
      button.danger {
        background: #ef4444;
      }
      .mood-config {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        align-items: center;
        padding: 10px;
        background: var(--vscode-editor-background);
        border-radius: 6px;
        margin-bottom: 10px;
      }
      .mood-title {
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    </style>
</head>
<body>
    <h1>🎨 CodeVibe Settings</h1>
    
    <div class="section">
      <h2>Mood Configurations</h2>
      <div id="moodConfigs">
        <!-- Mood configs will be inserted here -->
      </div>
    </div>

    <div class="section">
      <h2>Sound Settings</h2>
      <div class="setting-row">
        <div class="setting-label">
          <span>Enable Sounds</span>
          <span>Play ambient sounds based on mood</span>
        </div>
        <div class="toggle" id="soundsEnabled"></div>
      </div>
      <div class="setting-row">
        <div class="setting-label">
          <span>Enable Streaming</span>
          <span>Allow streaming sounds from online sources</span>
        </div>
        <div class="toggle" id="streamingEnabled"></div>
      </div>
      <div class="setting-row">
        <div class="setting-label">
          <span>Default Volume</span>
          <span>Set the default volume level</span>
        </div>
        <input type="range" id="volume" min="0" max="100" value="50">
      </div>
    </div>

    <div class="section">
      <h2>Animation Settings</h2>
      <div class="setting-row">
        <div class="setting-label">
          <span>Enable Animations</span>
          <span>Show mood-specific visual effects</span>
        </div>
        <div class="toggle" id="animationsEnabled"></div>
      </div>
    </div>

    <div class="section">
      <h2>Streak Settings</h2>
      <div class="setting-row">
        <div class="setting-label">
          <span>Enable Streak Tracking</span>
          <span>Track your daily coding activity</span>
        </div>
        <div class="toggle" id="streakEnabled"></div>
      </div>
      <div class="setting-row">
        <div class="setting-label">
          <span>Minimum Characters</span>
          <span>Minimum characters typed to count as activity</span>
        </div>
        <input type="text" id="minChars" value="10">
      </div>
      <div class="setting-row">
        <div class="setting-label">
          <span>Reset Streak</span>
          <span>Clear all streak data</span>
        </div>
        <button class="danger" id="resetStreak">Reset Streak</button>
      </div>
    </div>

    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      
      // Request settings on load
      vscode.postMessage({ type: 'getSettings' });
      
      // Toggle handlers
      document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('active');
          // Save setting
        });
      });
      
      // Reset streak handler
      document.getElementById('resetStreak')?.addEventListener('click', () => {
        vscode.postMessage({ type: 'resetStreak' });
      });
      
      // Handle messages
      window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'settingsLoaded') {
          // Populate settings
          console.log('Settings loaded:', message.data);
        }
      });
    </script>
</body>
</html>`;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Mood, MoodConfig, DEFAULT_MOOD_CONFIGS, AnimationType, StreakData } from '../types';
import { MoodManager } from '../managers/MoodManager';
import { SoundManager } from '../managers/SoundManager';
import { AnimationManager } from '../managers/AnimationManager';
import { StreakTracker } from '../managers/StreakTracker';

/**
 * Sidebar WebView Provider
 * Provides the main CodeVibe UI in the VS Code sidebar
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codevibe.moodPanel';
    private _view?: vscode.WebviewView;
    private moodManager?: MoodManager;
    private soundManager?: SoundManager;
    private animationManager?: AnimationManager;
    private streakTracker?: StreakTracker;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public setManagers(
        moodManager: MoodManager,
        soundManager: SoundManager,
        animationManager: AnimationManager,
        streakTracker: StreakTracker
    ): void {
        this.moodManager = moodManager;
        this.soundManager = soundManager;
        this.animationManager = animationManager;
        this.streakTracker = streakTracker;

        // Set audio command callback
        this.soundManager.setAudioCommandCallback((command, data) => {
            if (this._view) {
                this._view.webview.postMessage({ type: 'audio', command, data });
            }
        });

        // Listen for mood changes
        this.moodManager.onMoodChanged(mood => {
            this.updateMoodInWebview(mood);
        });

        // Listen for streak updates
        this.streakTracker.onStreakUpdated(data => {
            this.updateStreakInWebview(data);
        });

        // Listen for animation changes
        this.animationManager.onAnimationChanged(({ type, color }) => {
            this.updateAnimationInWebview(type, color);
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'moodChange':
                    if (this.moodManager) {
                        await this.moodManager.setMood(message.mood as Mood);
                        if (this.streakTracker) {
                            await this.streakTracker.recordMood(message.mood as Mood);
                        }
                    }
                    break;
                case 'volumeChange':
                    if (this.soundManager) {
                        this.soundManager.setVolume(message.volume);
                    }
                    break;
                case 'toggleSound':
                    if (this.soundManager) {
                        await this.soundManager.toggleSound();
                    }
                    break;
                case 'toggleAnimations':
                    if (this.animationManager) {
                        this.animationManager.setEnabled(message.enabled);
                    }
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('codevibe.openSettings');
                    break;
                case 'ready':
                    // Webview is ready, send initial state
                    this.sendInitialState();
                    break;
            }
        });
    }

    private sendInitialState(): void {
        if (!this._view) return;

        const currentMood = this.moodManager?.getCurrentMood();
        const streakData = this.streakTracker?.getStreakData();
        const volume = this.soundManager?.getVolume() || 50;
        const isPlaying = this.soundManager?.getIsPlaying() || false;
        const animationState = this.animationManager?.getCurrentAnimation();
        const animationsEnabled = this.animationManager?.isEnabled() || true;
        const moodConfigs = this.moodManager?.getAllMoodConfigs() || DEFAULT_MOOD_CONFIGS;
        const streamingSounds = this.soundManager?.getStreamingSounds() || [];
        const bundledSounds = this.soundManager?.getBundledSounds() || [];

        this._view.webview.postMessage({
            type: 'init',
            data: {
                currentMood,
                streakData,
                volume,
                isPlaying,
                animationState,
                animationsEnabled,
                moodConfigs,
                streamingSounds,
                bundledSounds
            }
        });
    }

    private updateMoodInWebview(mood: Mood): void {
        if (this._view) {
            const config = this.moodManager?.getMoodConfig(mood);
            this._view.webview.postMessage({
                type: 'moodUpdated',
                data: { mood, config }
            });
        }
    }

    private updateStreakInWebview(data: StreakData): void {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'streakUpdated',
                data
            });
        }
    }

    private updateAnimationInWebview(type: AnimationType, color: string): void {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'animationUpdated',
                data: { type, color }
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'sidebar.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'sidebar.css')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:; media-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
    <link href="${styleUri}" rel="stylesheet">
    <title>CodeVibe</title>
</head>
<body>
    <div class="codevibe-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">
                <span class="logo-icon">🎨</span>
                CodeVibe
            </h1>
            <button class="settings-btn" id="settingsBtn" title="Settings">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.7 1.3-2-.8-.8-2 1.3-.7-.3zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/>
                </svg>
            </button>
        </div>

        <!-- Mood Selection -->
        <div class="section">
            <h2 class="section-title">How are you feeling?</h2>
            <div class="mood-grid" id="moodGrid">
                <!-- Mood cards will be inserted here -->
            </div>
        </div>

        <!-- Sound Controls -->
        <div class="section">
            <div class="sound-controls">
                <div class="sound-header">
                    <span class="sound-icon" id="soundIcon">🔊</span>
                    <span class="sound-label">Ambient Sound</span>
                    <button class="sound-toggle" id="soundToggle">
                        <span class="toggle-track">
                            <span class="toggle-thumb"></span>
                        </span>
                    </button>
                </div>
                <div class="volume-slider-container">
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="50">
                    <span class="volume-value" id="volumeValue">50%</span>
                </div>
            </div>
        </div>

        <!-- Streak Section -->
        <div class="section streak-section">
            <h2 class="section-title">Your Coding Streak 🔥</h2>
            <div class="streak-display">
                <div class="streak-main">
                    <span class="streak-number" id="currentStreak">0</span>
                    <span class="streak-label">day streak</span>
                </div>
                <div class="streak-stats">
                    <div class="stat">
                        <span class="stat-value" id="longestStreak">0</span>
                        <span class="stat-label">Best</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="totalDays">0</span>
                        <span class="stat-label">Total Days</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="todayChars">0</span>
                        <span class="stat-label">Today</span>
                    </div>
                </div>
            </div>
            <div class="streak-calendar" id="streakCalendar">
                <!-- Calendar dots will be inserted here -->
            </div>
        </div>

        <!-- Animation Container -->
        <div class="animation-container" id="animationContainer"></div>

        <!-- Hidden Audio Element -->
        <audio id="ambientAudio" loop preload="auto"></audio>
    </div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
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

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Sound Manager - Handles ambient sound playback
 * Uses HTML5 Audio via webview for cross-platform compatibility
 */
export class SoundManager {
    private static instance: SoundManager;
    private currentSound: string | null = null;
    private volume: number = 50;
    private isPlaying: boolean = false;
    private soundWebviewPanel: vscode.WebviewPanel | null = null;
    private extensionUri: vscode.Uri;

    // Free streaming sound URLs (royalty-free ambient sounds)
    private readonly streamingSounds: Record<string, { url: string; name: string }> = {
        'stream:rain': {
            url: 'https://cdn.freesound.org/previews/531/531947_5765286-lq.mp3',
            name: 'Rain Sounds'
        },
        'stream:forest': {
            url: 'https://cdn.freesound.org/previews/462/462087_9497060-lq.mp3',
            name: 'Forest Ambience'
        },
        'stream:cafe': {
            url: 'https://cdn.freesound.org/previews/443/443916_9159316-lq.mp3',
            name: 'Coffee Shop'
        },
        'stream:ocean': {
            url: 'https://cdn.freesound.org/previews/531/531015_5765286-lq.mp3',
            name: 'Ocean Waves'
        },
        'stream:fire': {
            url: 'https://cdn.freesound.org/previews/499/499757_2524422-lq.mp3',
            name: 'Fireplace'
        },
        'stream:wind': {
            url: 'https://cdn.freesound.org/previews/408/408598_7299548-lq.mp3',
            name: 'Gentle Wind'
        },
        'stream:thunder': {
            url: 'https://cdn.freesound.org/previews/401/401275_7429806-lq.mp3',
            name: 'Distant Thunder'
        },
        'stream:birds': {
            url: 'https://cdn.freesound.org/previews/531/531953_5765286-lq.mp3',
            name: 'Morning Birds'
        }
    };

    // Bundled sound descriptions (actual files would be in media/sounds/)
    private readonly bundledSounds: Record<string, string> = {
        'bundled:focused': 'focused.mp3',
        'bundled:relaxed': 'relaxed.mp3',
        'bundled:energized': 'energized.mp3',
        'bundled:creative': 'creative.mp3',
        'bundled:notfeelingit': 'notfeelingit.mp3'
    };

    private readonly _onSoundStateChanged = new vscode.EventEmitter<{ playing: boolean; sound: string | null }>();
    public readonly onSoundStateChanged = this._onSoundStateChanged.event;

    private constructor(private context: vscode.ExtensionContext) {
        this.extensionUri = context.extensionUri;
        this.volume = vscode.workspace.getConfiguration('codevibe').get<number>('sounds.volume', 50);
    }

    public static getInstance(context?: vscode.ExtensionContext): SoundManager {
        if (!SoundManager.instance) {
            if (!context) {
                throw new Error('SoundManager requires context on first initialization');
            }
            SoundManager.instance = new SoundManager(context);
        }
        return SoundManager.instance;
    }

    /**
     * Play a sound by identifier
     * Supports: bundled:name, stream:name, or file path
     */
    public async playSound(soundIdentifier: string): Promise<void> {
        try {
            // Stop current sound first with fade out
            if (this.isPlaying) {
                await this.stopSound(true);
            }

            let soundUrl: string;

            if (soundIdentifier.startsWith('bundled:')) {
                // Bundled sound
                const filename = this.bundledSounds[soundIdentifier];
                if (!filename) {
                    console.warn(`Unknown bundled sound: ${soundIdentifier}`);
                    return;
                }
                const soundPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'sounds', filename);

                // Check if file exists
                if (!fs.existsSync(soundPath.fsPath)) {
                    console.warn(`Bundled sound file not found: ${soundPath.fsPath}`);
                    // Fall back to a streaming sound
                    const streamingEnabled = vscode.workspace.getConfiguration('codevibe').get<boolean>('sounds.streamingEnabled', true);
                    if (streamingEnabled) {
                        await this.playSound('stream:rain');
                    }
                    return;
                }
                soundUrl = soundPath.toString();
            } else if (soundIdentifier.startsWith('stream:')) {
                // Streaming sound
                const streamingEnabled = vscode.workspace.getConfiguration('codevibe').get<boolean>('sounds.streamingEnabled', true);
                if (!streamingEnabled) {
                    console.log('Streaming sounds disabled');
                    return;
                }

                const streamSound = this.streamingSounds[soundIdentifier];
                if (!streamSound) {
                    console.warn(`Unknown streaming sound: ${soundIdentifier}`);
                    return;
                }
                soundUrl = streamSound.url;
            } else if (soundIdentifier.startsWith('file:')) {
                // Custom file path
                soundUrl = soundIdentifier.replace('file:', '');
            } else {
                // Treat as a file path
                soundUrl = soundIdentifier;
            }

            this.currentSound = soundIdentifier;
            this.isPlaying = true;

            // Send message to sidebar webview to play sound
            this._onSoundStateChanged.fire({ playing: true, sound: soundIdentifier });

            this.sendAudioCommand('play', { url: soundUrl, volume: this.volume / 100, loop: true });

        } catch (error) {
            console.error('Error playing sound:', error);
            this.isPlaying = false;
        }
    }

    /**
     * Stop the current sound
     */
    public async stopSound(fadeOut: boolean = true): Promise<void> {
        if (!this.isPlaying) {
            return;
        }

        this.sendAudioCommand('stop', { fadeOut });

        this.isPlaying = false;
        this.currentSound = null;
        this._onSoundStateChanged.fire({ playing: false, sound: null });
    }

    /**
     * Toggle sound playback
     */
    public async toggleSound(): Promise<void> {
        if (this.isPlaying) {
            await this.stopSound();
        } else if (this.currentSound) {
            await this.playSound(this.currentSound);
        }
    }

    /**
     * Set volume (0-100)
     */
    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(100, volume));
        this.sendAudioCommand('volume', { volume: this.volume / 100 });

        // Save to settings
        vscode.workspace.getConfiguration('codevibe').update('sounds.volume', this.volume, vscode.ConfigurationTarget.Global);
    }

    /**
     * Get current volume
     */
    public getVolume(): number {
        return this.volume;
    }

    /**
     * Check if sound is currently playing
     */
    public getIsPlaying(): boolean {
        return this.isPlaying;
    }

    /**
     * Get current sound identifier
     */
    public getCurrentSound(): string | null {
        return this.currentSound;
    }

    /**
     * Get available streaming sounds
     */
    public getStreamingSounds(): Array<{ id: string; name: string }> {
        return Object.entries(this.streamingSounds).map(([id, data]) => ({
            id,
            name: data.name
        }));
    }

    /**
     * Get available bundled sounds
     */
    public getBundledSounds(): Array<{ id: string; name: string }> {
        return Object.keys(this.bundledSounds).map(id => ({
            id,
            name: id.replace('bundled:', '').charAt(0).toUpperCase() + id.replace('bundled:', '').slice(1)
        }));
    }

    private audioCommandCallback: ((command: string, data: unknown) => void) | null = null;

    public setAudioCommandCallback(callback: (command: string, data: unknown) => void): void {
        this.audioCommandCallback = callback;
    }

    private sendAudioCommand(command: string, data: unknown): void {
        if (this.audioCommandCallback) {
            this.audioCommandCallback(command, data);
        }
    }

    public dispose(): void {
        this.stopSound(false);
        this._onSoundStateChanged.dispose();
        if (this.soundWebviewPanel) {
            this.soundWebviewPanel.dispose();
        }
    }
}

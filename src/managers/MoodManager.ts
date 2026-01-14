import * as vscode from 'vscode';
import { Mood, MoodConfig, DEFAULT_MOOD_CONFIGS, AnimationType } from '../types';
import { ThemeManager } from './ThemeManager';
import { SoundManager } from './SoundManager';
import { AnimationManager } from './AnimationManager';

/**
 * Central mood orchestration manager
 * Coordinates theme, sound, and animation changes based on mood selection
 */
export class MoodManager {
    private static instance: MoodManager;
    private currentMood: Mood | null = null;
    private moodConfigs: Map<Mood, MoodConfig> = new Map();
    private themeManager: ThemeManager;
    private soundManager: SoundManager;
    private animationManager: AnimationManager;
    private debounceTimer: NodeJS.Timeout | null = null;
    private readonly DEBOUNCE_MS = 300;

    private readonly _onMoodChanged = new vscode.EventEmitter<Mood>();
    public readonly onMoodChanged = this._onMoodChanged.event;

    private constructor(
        private context: vscode.ExtensionContext,
        themeManager: ThemeManager,
        soundManager: SoundManager,
        animationManager: AnimationManager
    ) {
        this.themeManager = themeManager;
        this.soundManager = soundManager;
        this.animationManager = animationManager;
        this.initializeMoodConfigs();
        this.restoreLastMood();
    }

    public static getInstance(
        context?: vscode.ExtensionContext,
        themeManager?: ThemeManager,
        soundManager?: SoundManager,
        animationManager?: AnimationManager
    ): MoodManager {
        if (!MoodManager.instance) {
            if (!context || !themeManager || !soundManager || !animationManager) {
                throw new Error('MoodManager requires all dependencies on first initialization');
            }
            MoodManager.instance = new MoodManager(context, themeManager, soundManager, animationManager);
        }
        return MoodManager.instance;
    }

    private initializeMoodConfigs(): void {
        const config = vscode.workspace.getConfiguration('codevibe');

        DEFAULT_MOOD_CONFIGS.forEach(defaultConfig => {
            const customTheme = config.get<string>(`moods.${defaultConfig.id}.theme`);
            const customSound = config.get<string>(`moods.${defaultConfig.id}.sound`);

            this.moodConfigs.set(defaultConfig.id, {
                ...defaultConfig,
                theme: customTheme || defaultConfig.theme,
                sound: customSound || defaultConfig.sound
            });
        });
    }

    private restoreLastMood(): void {
        const lastMood = this.context.globalState.get<Mood>('codevibe.lastMood');
        if (lastMood && Object.values(Mood).includes(lastMood)) {
            // Apply the last mood silently without sound to avoid startup noise
            this.setMood(lastMood, { playSound: false });
        }
    }

    public async setMood(mood: Mood, options: { playSound?: boolean } = {}): Promise<void> {
        const { playSound = true } = options;

        // Debounce rapid mood changes
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        return new Promise((resolve) => {
            this.debounceTimer = setTimeout(async () => {
                try {
                    const moodConfig = this.moodConfigs.get(mood);
                    if (!moodConfig) {
                        vscode.window.showErrorMessage(`Unknown mood: ${mood}`);
                        resolve();
                        return;
                    }

                    this.currentMood = mood;

                    // Save the mood for restoration
                    await this.context.globalState.update('codevibe.lastMood', mood);

                    // Apply theme change
                    await this.themeManager.setTheme(moodConfig.theme);

                    // Handle sound
                    const soundsEnabled = vscode.workspace.getConfiguration('codevibe').get<boolean>('sounds.enabled', true);
                    if (playSound && soundsEnabled) {
                        await this.soundManager.playSound(moodConfig.sound);
                    }

                    // Apply animation
                    const animationsEnabled = vscode.workspace.getConfiguration('codevibe').get<boolean>('animations.enabled', true);
                    if (animationsEnabled && moodConfig.animationType !== AnimationType.None) {
                        this.animationManager.setAnimation(moodConfig.animationType, moodConfig.color);
                    } else {
                        this.animationManager.stopAnimation();
                    }

                    this._onMoodChanged.fire(mood);

                    vscode.window.setStatusBarMessage(`CodeVibe: ${moodConfig.name} mode activated`, 3000);
                } catch (error) {
                    console.error('Error setting mood:', error);
                    vscode.window.showErrorMessage(`Failed to set mood: ${error}`);
                }
                resolve();
            }, this.DEBOUNCE_MS);
        });
    }

    public getCurrentMood(): Mood | null {
        return this.currentMood;
    }

    public getMoodConfig(mood: Mood): MoodConfig | undefined {
        return this.moodConfigs.get(mood);
    }

    public getAllMoodConfigs(): MoodConfig[] {
        return Array.from(this.moodConfigs.values());
    }

    public async updateMoodConfig(mood: Mood, updates: Partial<MoodConfig>): Promise<void> {
        const current = this.moodConfigs.get(mood);
        if (current) {
            this.moodConfigs.set(mood, { ...current, ...updates });

            // If this is the current mood, reapply it
            if (this.currentMood === mood) {
                await this.setMood(mood);
            }
        }
    }

    public refreshConfigs(): void {
        this.initializeMoodConfigs();
    }

    public dispose(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this._onMoodChanged.dispose();
    }
}

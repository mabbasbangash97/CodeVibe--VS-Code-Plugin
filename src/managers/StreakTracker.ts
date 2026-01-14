import * as vscode from 'vscode';
import { StreakData, StreakHistoryEntry, Mood } from '../types';

/**
 * Streak Tracker - Monitors coding activity and tracks daily streaks
 */
export class StreakTracker {
    private static instance: StreakTracker;
    private streakData: StreakData;
    private charCountBuffer: number = 0;
    private flushTimer: NodeJS.Timeout | null = null;
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;
    private minCharsForActivity: number = 10;

    private readonly _onStreakUpdated = new vscode.EventEmitter<StreakData>();
    public readonly onStreakUpdated = this._onStreakUpdated.event;

    private readonly STORAGE_KEY = 'codevibe.streakData';
    private readonly FLUSH_INTERVAL = 5000; // 5 seconds

    private constructor(private context: vscode.ExtensionContext) {
        this.isEnabled = vscode.workspace.getConfiguration('codevibe').get<boolean>('streak.enabled', true);
        this.minCharsForActivity = vscode.workspace.getConfiguration('codevibe').get<number>('streak.minCharsForActivity', 10);

        this.streakData = this.loadStreakData();
        this.checkDayRollover();
        this.setupListeners();
    }

    public static getInstance(context?: vscode.ExtensionContext): StreakTracker {
        if (!StreakTracker.instance) {
            if (!context) {
                throw new Error('StreakTracker requires context on first initialization');
            }
            StreakTracker.instance = new StreakTracker(context);
        }
        return StreakTracker.instance;
    }

    private loadStreakData(): StreakData {
        const stored = this.context.globalState.get<StreakData>(this.STORAGE_KEY);

        if (stored) {
            return stored;
        }

        return {
            currentStreak: 0,
            longestStreak: 0,
            totalCodingDays: 0,
            lastActiveDate: null,
            todayCharCount: 0,
            streakHistory: []
        };
    }

    private async saveStreakData(): Promise<void> {
        await this.context.globalState.update(this.STORAGE_KEY, this.streakData);
    }

    private setupListeners(): void {
        if (!this.isEnabled) {
            return;
        }

        // Listen for text document changes
        const changeListener = vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.uri.scheme === 'file') {
                // Count characters added (not deleted)
                for (const change of event.contentChanges) {
                    if (change.text.length > 0) {
                        this.charCountBuffer += change.text.length;
                    }
                }

                // Debounce the flush
                if (this.flushTimer) {
                    clearTimeout(this.flushTimer);
                }
                this.flushTimer = setTimeout(() => this.flushCharCount(), this.FLUSH_INTERVAL);
            }
        });

        this.disposables.push(changeListener);
    }

    private async flushCharCount(): Promise<void> {
        if (this.charCountBuffer === 0) {
            return;
        }

        const today = this.getTodayString();

        // Check if it's a new day
        if (this.streakData.lastActiveDate !== today) {
            this.checkDayRollover();
        }

        this.streakData.todayCharCount += this.charCountBuffer;
        this.charCountBuffer = 0;

        // Check if we've hit the minimum for activity today
        if (this.streakData.todayCharCount >= this.minCharsForActivity &&
            this.streakData.lastActiveDate !== today) {
            this.recordActiveDay(today);
        }

        await this.saveStreakData();
        this._onStreakUpdated.fire(this.streakData);
    }

    private checkDayRollover(): void {
        const today = this.getTodayString();
        const yesterday = this.getYesterdayString();

        if (this.streakData.lastActiveDate === null) {
            // First time user
            return;
        }

        if (this.streakData.lastActiveDate === today) {
            // Already recorded today
            return;
        }

        if (this.streakData.lastActiveDate !== yesterday &&
            this.streakData.lastActiveDate !== today) {
            // Streak broken - last active was before yesterday
            this.streakData.currentStreak = 0;
        }

        // Reset today's count
        this.streakData.todayCharCount = 0;
    }

    private recordActiveDay(today: string): void {
        this.streakData.lastActiveDate = today;
        this.streakData.currentStreak += 1;
        this.streakData.totalCodingDays += 1;

        if (this.streakData.currentStreak > this.streakData.longestStreak) {
            this.streakData.longestStreak = this.streakData.currentStreak;
        }

        // Add to history (keep last 30 days)
        this.streakData.streakHistory.push({
            date: today,
            charCount: this.streakData.todayCharCount,
            mood: null
        });

        if (this.streakData.streakHistory.length > 30) {
            this.streakData.streakHistory.shift();
        }
    }

    private getTodayString(): string {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    private getYesterdayString(): string {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    /**
     * Get current streak data
     */
    public getStreakData(): StreakData {
        return { ...this.streakData };
    }

    /**
     * Record mood for today's streak entry
     */
    public async recordMood(mood: Mood): Promise<void> {
        const today = this.getTodayString();
        const todayEntry = this.streakData.streakHistory.find(e => e.date === today);

        if (todayEntry) {
            todayEntry.mood = mood;
            await this.saveStreakData();
        }
    }

    /**
     * Enable or disable streak tracking
     */
    public async setEnabled(enabled: boolean): Promise<void> {
        this.isEnabled = enabled;

        if (enabled) {
            this.setupListeners();
        } else {
            this.disposables.forEach(d => d.dispose());
            this.disposables = [];
            if (this.flushTimer) {
                clearTimeout(this.flushTimer);
                this.flushTimer = null;
            }
        }

        await vscode.workspace.getConfiguration('codevibe').update('streak.enabled', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * Reset all streak data
     */
    public async resetStreak(): Promise<void> {
        this.streakData = {
            currentStreak: 0,
            longestStreak: 0,
            totalCodingDays: 0,
            lastActiveDate: null,
            todayCharCount: 0,
            streakHistory: []
        };

        await this.saveStreakData();
        this._onStreakUpdated.fire(this.streakData);
    }

    /**
     * Force flush any pending character count
     */
    public async forceFlush(): Promise<void> {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        await this.flushCharCount();
    }

    public dispose(): void {
        this.forceFlush();
        this.disposables.forEach(d => d.dispose());
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
        }
        this._onStreakUpdated.dispose();
    }
}

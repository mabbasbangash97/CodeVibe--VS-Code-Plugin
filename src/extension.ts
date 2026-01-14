import * as vscode from 'vscode';
import { SidebarProvider } from './webview/SidebarProvider';
import { SettingsProvider } from './webview/SettingsProvider';
import { MoodManager } from './managers/MoodManager';
import { ThemeManager } from './managers/ThemeManager';
import { SoundManager } from './managers/SoundManager';
import { AnimationManager } from './managers/AnimationManager';
import { StreakTracker } from './managers/StreakTracker';
import { Mood, DEFAULT_MOOD_CONFIGS } from './types';

let moodManager: MoodManager;
let themeManager: ThemeManager;
let soundManager: SoundManager;
let animationManager: AnimationManager;
let streakTracker: StreakTracker;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('CodeVibe extension is now active!');

    try {
        // Initialize managers asynchronously
        await initializeManagers(context);

        // Register sidebar provider
        const sidebarProvider = new SidebarProvider(context.extensionUri);
        sidebarProvider.setManagers(moodManager, soundManager, animationManager, streakTracker);

        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider, {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            })
        );

        // Register commands
        registerCommands(context);

        // Listen for configuration changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration('codevibe')) {
                    moodManager.refreshConfigs();
                }
            })
        );

        // Show welcome message on first install
        const hasShownWelcome = context.globalState.get('codevibe.welcomeShown');
        if (!hasShownWelcome) {
            showWelcomeMessage();
            context.globalState.update('codevibe.welcomeShown', true);
        }

    } catch (error) {
        console.error('Failed to activate CodeVibe:', error);
        vscode.window.showErrorMessage(`CodeVibe failed to activate: ${error}`);
    }
}

async function initializeManagers(context: vscode.ExtensionContext): Promise<void> {
    // Initialize in order (some depend on others)
    themeManager = ThemeManager.getInstance(context);
    soundManager = SoundManager.getInstance(context);
    animationManager = AnimationManager.getInstance(context);
    streakTracker = StreakTracker.getInstance(context);
    moodManager = MoodManager.getInstance(context, themeManager, soundManager, animationManager);
}

function registerCommands(context: vscode.ExtensionContext): void {
    // Set Mood command with quick pick
    context.subscriptions.push(
        vscode.commands.registerCommand('codevibe.setMood', async () => {
            const moods = DEFAULT_MOOD_CONFIGS.map(config => ({
                label: `${getMoodEmoji(config.id)} ${config.name}`,
                description: config.description,
                mood: config.id
            }));

            const selected = await vscode.window.showQuickPick(moods, {
                placeHolder: 'How are you feeling?',
                title: 'CodeVibe: Set Your Mood'
            });

            if (selected) {
                await moodManager.setMood(selected.mood);
            }
        })
    );

    // Toggle Sound command
    context.subscriptions.push(
        vscode.commands.registerCommand('codevibe.toggleSound', async () => {
            await soundManager.toggleSound();
            const isPlaying = soundManager.getIsPlaying();
            vscode.window.setStatusBarMessage(
                `CodeVibe: Sound ${isPlaying ? 'enabled' : 'disabled'}`,
                3000
            );
        })
    );

    // Show Streak command
    context.subscriptions.push(
        vscode.commands.registerCommand('codevibe.showStreak', async () => {
            const data = streakTracker.getStreakData();
            const message = `🔥 Current Streak: ${data.currentStreak} days\n` +
                `🏆 Best Streak: ${data.longestStreak} days\n` +
                `📅 Total Coding Days: ${data.totalCodingDays}`;

            vscode.window.showInformationMessage(message, 'View in Sidebar').then(selection => {
                if (selection === 'View in Sidebar') {
                    vscode.commands.executeCommand('codevibe.moodPanel.focus');
                }
            });
        })
    );

    // Open Settings command
    context.subscriptions.push(
        vscode.commands.registerCommand('codevibe.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:codevibe.codevibe');
        })
    );
}

function getMoodEmoji(mood: Mood): string {
    const emojis: Record<Mood, string> = {
        [Mood.Focused]: '🎯',
        [Mood.Relaxed]: '🌿',
        [Mood.Energized]: '⚡',
        [Mood.Creative]: '✨',
        [Mood.NotFeelingIt]: '🌙'
    };
    return emojis[mood] || '🎨';
}

function showWelcomeMessage(): void {
    vscode.window.showInformationMessage(
        '🎨 Welcome to CodeVibe! Click the CodeVibe icon in the sidebar to set your mood.',
        'Open Sidebar',
        'Learn More'
    ).then(selection => {
        if (selection === 'Open Sidebar') {
            vscode.commands.executeCommand('codevibe.moodPanel.focus');
        } else if (selection === 'Learn More') {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/codevibe/codevibe-vscode'));
        }
    });
}

export function deactivate(): void {
    console.log('CodeVibe extension is deactivating...');

    // Cleanup
    soundManager?.dispose();
    animationManager?.dispose();
    streakTracker?.dispose();
    moodManager?.dispose();
    themeManager?.dispose();
}

/**
 * CodeVibe - Mood Types and Interfaces
 */

export enum Mood {
    Focused = 'focused',
    Relaxed = 'relaxed',
    Energized = 'energized',
    Creative = 'creative',
    NotFeelingIt = 'notFeelingIt'
}

export interface MoodConfig {
    id: Mood;
    name: string;
    description: string;
    icon: string;
    theme: string;
    sound: string;
    animationType: AnimationType;
    color: string;
}

export enum AnimationType {
    None = 'none',
    Particles = 'particles',
    Glow = 'glow',
    Waves = 'waves',
    Sparkles = 'sparkles',
    Pulse = 'pulse'
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalCodingDays: number;
    lastActiveDate: string | null;
    todayCharCount: number;
    streakHistory: StreakHistoryEntry[];
}

export interface StreakHistoryEntry {
    date: string;
    charCount: number;
    mood: Mood | null;
}

export interface UserSettings {
    moods: {
        [key in Mood]: {
            theme: string;
            sound: string;
            animationEnabled: boolean;
        };
    };
    sounds: {
        volume: number;
        enabled: boolean;
        streamingEnabled: boolean;
    };
    animations: {
        enabled: boolean;
    };
    streak: {
        enabled: boolean;
        minCharsForActivity: number;
    };
}

export interface SoundSource {
    type: 'bundled' | 'file' | 'stream';
    path: string;
    name: string;
}

export interface StreamingSound {
    id: string;
    name: string;
    url: string;
    duration: number;
    category: string;
}

export const DEFAULT_MOOD_CONFIGS: MoodConfig[] = [
    {
        id: Mood.Focused,
        name: 'Focused',
        description: 'Deep concentration mode',
        icon: 'focused',
        theme: 'One Dark Pro',
        sound: 'bundled:focused',
        animationType: AnimationType.None,
        color: '#61afef'
    },
    {
        id: Mood.Relaxed,
        name: 'Relaxed',
        description: 'Calm and peaceful vibes',
        icon: 'relaxed',
        theme: 'Dracula Soft',
        sound: 'bundled:relaxed',
        animationType: AnimationType.Glow,
        color: '#98c379'
    },
    {
        id: Mood.Energized,
        name: 'Energized',
        description: 'High energy productivity',
        icon: 'energized',
        theme: "Synthwave '84",
        sound: 'bundled:energized',
        animationType: AnimationType.Waves,
        color: '#e5c07b'
    },
    {
        id: Mood.Creative,
        name: 'Creative',
        description: 'Inspire your imagination',
        icon: 'creative',
        theme: 'Night Owl',
        sound: 'bundled:creative',
        animationType: AnimationType.Particles,
        color: '#c678dd'
    },
    {
        id: Mood.NotFeelingIt,
        name: 'Not Feeling It',
        description: 'Low energy, gentle mode',
        icon: 'notfeelingit',
        theme: 'Nord',
        sound: 'bundled:notfeelingit',
        animationType: AnimationType.Pulse,
        color: '#5c6370'
    }
];

export interface WebviewMessage {
    type: string;
    payload?: unknown;
}

export interface MoodChangeMessage extends WebviewMessage {
    type: 'moodChange';
    payload: {
        mood: Mood;
    };
}

export interface VolumeChangeMessage extends WebviewMessage {
    type: 'volumeChange';
    payload: {
        volume: number;
    };
}

export interface ToggleSoundMessage extends WebviewMessage {
    type: 'toggleSound';
    payload: {
        enabled: boolean;
    };
}

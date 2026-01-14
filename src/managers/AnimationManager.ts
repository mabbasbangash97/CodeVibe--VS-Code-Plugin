import * as vscode from 'vscode';
import { AnimationType } from '../types';

/**
 * Animation Manager - Handles mood-specific visual animations
 * Animations are rendered in the sidebar webview using CSS/JS
 */
export class AnimationManager {
    private static instance: AnimationManager;
    private currentAnimation: AnimationType = AnimationType.None;
    private currentColor: string = '#ffffff';
    private animationEnabled: boolean = true;

    private readonly _onAnimationChanged = new vscode.EventEmitter<{ type: AnimationType; color: string }>();
    public readonly onAnimationChanged = this._onAnimationChanged.event;

    private constructor(private context: vscode.ExtensionContext) {
        this.animationEnabled = vscode.workspace.getConfiguration('codevibe').get<boolean>('animations.enabled', true);
    }

    public static getInstance(context?: vscode.ExtensionContext): AnimationManager {
        if (!AnimationManager.instance) {
            if (!context) {
                throw new Error('AnimationManager requires context on first initialization');
            }
            AnimationManager.instance = new AnimationManager(context);
        }
        return AnimationManager.instance;
    }

    /**
     * Set the current animation type
     */
    public setAnimation(type: AnimationType, color: string): void {
        if (!this.animationEnabled) {
            this.currentAnimation = AnimationType.None;
            return;
        }

        this.currentAnimation = type;
        this.currentColor = color;
        this._onAnimationChanged.fire({ type, color });
    }

    /**
     * Stop all animations
     */
    public stopAnimation(): void {
        this.currentAnimation = AnimationType.None;
        this._onAnimationChanged.fire({ type: AnimationType.None, color: this.currentColor });
    }

    /**
     * Get current animation state
     */
    public getCurrentAnimation(): { type: AnimationType; color: string } {
        return {
            type: this.currentAnimation,
            color: this.currentColor
        };
    }

    /**
     * Enable or disable animations globally
     */
    public setEnabled(enabled: boolean): void {
        this.animationEnabled = enabled;
        if (!enabled) {
            this.stopAnimation();
        }
        vscode.workspace.getConfiguration('codevibe').update('animations.enabled', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * Check if animations are enabled
     */
    public isEnabled(): boolean {
        return this.animationEnabled;
    }

    /**
     * Get animation CSS for a specific type
     * This returns the CSS that should be injected into the webview
     */
    public getAnimationCSS(type: AnimationType, color: string): string {
        switch (type) {
            case AnimationType.Particles:
                return this.getParticlesCSS(color);
            case AnimationType.Glow:
                return this.getGlowCSS(color);
            case AnimationType.Waves:
                return this.getWavesCSS(color);
            case AnimationType.Sparkles:
                return this.getSparklesCSS(color);
            case AnimationType.Pulse:
                return this.getPulseCSS(color);
            default:
                return '';
        }
    }

    private getParticlesCSS(color: string): string {
        return `
      .animation-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
      }
      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        opacity: 0.6;
        animation: float 6s ease-in-out infinite;
      }
      @keyframes float {
        0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
      }
    `;
    }

    private getGlowCSS(color: string): string {
        return `
      .animation-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: radial-gradient(ellipse at center, ${color}15 0%, transparent 70%);
        animation: glow 4s ease-in-out infinite;
      }
      @keyframes glow {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
    `;
    }

    private getWavesCSS(color: string): string {
        return `
      .animation-container {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        pointer-events: none;
        overflow: hidden;
      }
      .wave {
        position: absolute;
        bottom: 0;
        width: 200%;
        height: 100%;
        background: linear-gradient(to top, ${color}20, transparent);
        animation: wave 3s ease-in-out infinite;
      }
      .wave:nth-child(2) { animation-delay: -1.5s; opacity: 0.5; }
      @keyframes wave {
        0%, 100% { transform: translateX(0) translateY(0); }
        50% { transform: translateX(-25%) translateY(-10px); }
      }
    `;
    }

    private getSparklesCSS(color: string): string {
        return `
      .animation-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .sparkle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${color};
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        animation: sparkle 2s ease-in-out infinite;
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
      }
    `;
    }

    private getPulseCSS(color: string): string {
        return `
      .animation-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        pointer-events: none;
      }
      .pulse-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border: 2px solid ${color};
        border-radius: 50%;
        opacity: 0;
        animation: pulse 3s ease-out infinite;
      }
      .pulse-ring:nth-child(2) { animation-delay: 1s; }
      .pulse-ring:nth-child(3) { animation-delay: 2s; }
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
      }
    `;
    }

    public dispose(): void {
        this._onAnimationChanged.dispose();
    }
}

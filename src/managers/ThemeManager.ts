import * as vscode from 'vscode';

/**
 * Theme Manager - Handles VS Code theme switching based on mood
 */
export class ThemeManager {
    private static instance: ThemeManager;
    private currentTheme: string | null = null;
    private originalTheme: string | null = null;

    private constructor(private context: vscode.ExtensionContext) {
        // Store the original theme when the extension activates
        this.originalTheme = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme') || null;
    }

    public static getInstance(context?: vscode.ExtensionContext): ThemeManager {
        if (!ThemeManager.instance) {
            if (!context) {
                throw new Error('ThemeManager requires context on first initialization');
            }
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    }

    /**
     * Set the VS Code color theme
     */
    public async setTheme(themeName: string): Promise<boolean> {
        try {
            // Check if the theme is installed
            const extensions = vscode.extensions.all;
            const themeExists = this.isThemeAvailable(themeName, extensions);

            if (!themeExists) {
                // Try to find a similar theme or use a default
                const fallbackTheme = this.findFallbackTheme(themeName);
                if (fallbackTheme) {
                    console.log(`Theme "${themeName}" not found, using fallback: ${fallbackTheme}`);
                    themeName = fallbackTheme;
                } else {
                    vscode.window.showWarningMessage(
                        `Theme "${themeName}" is not installed. Please install it from the marketplace.`,
                        'Open Marketplace'
                    ).then(selection => {
                        if (selection === 'Open Marketplace') {
                            vscode.commands.executeCommand('workbench.extensions.search', themeName);
                        }
                    });
                    return false;
                }
            }

            // Apply the theme
            await vscode.workspace.getConfiguration('workbench').update(
                'colorTheme',
                themeName,
                vscode.ConfigurationTarget.Global
            );

            this.currentTheme = themeName;
            return true;
        } catch (error) {
            console.error('Error setting theme:', error);
            return false;
        }
    }

    /**
     * Check if a theme is available in VS Code
     */
    private isThemeAvailable(themeName: string, extensions: readonly vscode.Extension<unknown>[]): boolean {
        // Check built-in themes
        const builtInThemes = [
            'Default Dark+', 'Default Light+', 'Default Dark Modern', 'Default Light Modern',
            'Visual Studio Dark', 'Visual Studio Light', 'Monokai', 'Monokai Dimmed',
            'Solarized Dark', 'Solarized Light', 'Quiet Light', 'Red', 'Abyss',
            'Kimbie Dark', 'Tomorrow Night Blue', 'High Contrast', 'High Contrast Light'
        ];

        if (builtInThemes.some(t => t.toLowerCase() === themeName.toLowerCase())) {
            return true;
        }

        // Check installed extensions for themes
        for (const extension of extensions) {
            const packageJSON = extension.packageJSON;
            if (packageJSON.contributes?.themes) {
                for (const theme of packageJSON.contributes.themes) {
                    if (theme.label?.toLowerCase() === themeName.toLowerCase() ||
                        theme.id?.toLowerCase() === themeName.toLowerCase()) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Find a fallback theme if the requested one isn't available
     */
    private findFallbackTheme(requestedTheme: string): string | null {
        const fallbackMap: Record<string, string[]> = {
            'one dark pro': ['One Dark Pro', 'Atom One Dark', 'Default Dark+'],
            'dracula soft': ['Dracula', 'Dracula Soft', 'Default Dark+'],
            "synthwave '84": ["SynthWave '84", 'Synthwave', 'Default Dark+'],
            'night owl': ['Night Owl', 'Default Dark+'],
            'nord': ['Nord', 'Arctic', 'Default Dark+']
        };

        const key = requestedTheme.toLowerCase();
        const fallbacks = fallbackMap[key] || ['Default Dark+'];

        for (const fallback of fallbacks) {
            if (this.isThemeAvailable(fallback, vscode.extensions.all)) {
                return fallback;
            }
        }

        return 'Default Dark+';
    }

    /**
     * Get the currently applied theme
     */
    public getCurrentTheme(): string | null {
        return this.currentTheme || vscode.workspace.getConfiguration('workbench').get<string>('colorTheme') || null;
    }

    /**
     * Restore the original theme (when extension deactivates)
     */
    public async restoreOriginalTheme(): Promise<void> {
        if (this.originalTheme) {
            await this.setTheme(this.originalTheme);
        }
    }

    /**
     * Get list of available themes
     */
    public getAvailableThemes(): string[] {
        const themes: string[] = [
            'Default Dark+', 'Default Light+', 'Default Dark Modern', 'Default Light Modern',
            'Monokai', 'Solarized Dark', 'Solarized Light'
        ];

        for (const extension of vscode.extensions.all) {
            const packageJSON = extension.packageJSON;
            if (packageJSON.contributes?.themes) {
                for (const theme of packageJSON.contributes.themes) {
                    if (theme.label) {
                        themes.push(theme.label);
                    }
                }
            }
        }

        return [...new Set(themes)].sort();
    }

    public dispose(): void {
        // Nothing to dispose
    }
}

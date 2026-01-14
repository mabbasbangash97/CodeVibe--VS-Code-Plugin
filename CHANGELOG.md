# Changelog

All notable changes to CodeVibe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-15

### Added
- **Mood Selection Interface** — Sidebar webview with 5 moods (Focused, Relaxed, Energized, Creative, Not Feeling It)
- **Dynamic Theme Switching** — Automatic theme changes based on selected mood with fallback handling
- **Ambient Sound System** — Bundled sounds and streaming from Freesound with volume control and fade transitions
- **Mood Animations** — Subtle CSS-based visual effects (particles, glow, waves, sparkles, pulse)
- **Coding Streak Tracker** — Daily activity tracking with streaks, history, and visual calendar
- **Settings & Customization** — Mood-to-theme mappings, custom sounds, animation and streak toggles
- **Command Palette Integration** — Quick access to mood setting, sound toggle, and streak viewing
- **Welcome Experience** — First-time user guidance

### Technical
- TypeScript implementation with strict mode
- esbuild bundling for fast builds
- WebView UI with Content Security Policy
- Efficient event listeners with debouncing
- Persistent state storage using VS Code global state

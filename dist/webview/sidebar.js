// CodeVibe Sidebar JavaScript
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    // State
    let state = {
        currentMood: null,
        streakData: null,
        volume: 50,
        isPlaying: false,
        animationsEnabled: true,
        moodConfigs: [],
        animationType: 'none',
        animationColor: '#ffffff'
    };

    // Mood icons mapping
    const moodIcons = {
        focused: '🎯',
        relaxed: '🌿',
        energized: '⚡',
        creative: '✨',
        notFeelingIt: '🌙'
    };

    // DOM Elements
    const moodGrid = document.getElementById('moodGrid');
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const settingsBtn = document.getElementById('settingsBtn');
    const currentStreakEl = document.getElementById('currentStreak');
    const longestStreakEl = document.getElementById('longestStreak');
    const totalDaysEl = document.getElementById('totalDays');
    const todayCharsEl = document.getElementById('todayChars');
    const streakCalendar = document.getElementById('streakCalendar');
    const animationContainer = document.getElementById('animationContainer');
    const ambientAudio = document.getElementById('ambientAudio');

    // Initialize
    function init() {
        setupEventListeners();
        vscode.postMessage({ type: 'ready' });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Sound toggle
        soundToggle?.addEventListener('click', () => {
            vscode.postMessage({ type: 'toggleSound' });
        });

        // Volume slider
        volumeSlider?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            state.volume = volume;
            updateVolumeDisplay(volume);
            vscode.postMessage({ type: 'volumeChange', volume });

            // Update audio element volume
            if (ambientAudio) {
                ambientAudio.volume = volume / 100;
            }
        });

        // Settings button
        settingsBtn?.addEventListener('click', () => {
            vscode.postMessage({ type: 'openSettings' });
        });
    }

    // Render mood cards
    function renderMoodCards() {
        if (!moodGrid || !state.moodConfigs.length) return;

        moodGrid.innerHTML = '';

        state.moodConfigs.forEach((config) => {
            const card = document.createElement('div');
            card.className = `mood-card ${state.currentMood === config.id ? 'active' : ''}`;
            card.style.setProperty('--mood-color', config.color);
            card.dataset.mood = config.id;

            card.innerHTML = `
        <span class="mood-icon">${moodIcons[config.id] || '🎨'}</span>
        <div class="mood-name">${config.name}</div>
        <div class="mood-desc">${config.description}</div>
      `;

            card.addEventListener('click', () => selectMood(config.id));
            moodGrid.appendChild(card);
        });
    }

    // Select mood
    function selectMood(moodId) {
        // Update UI immediately for responsiveness
        document.querySelectorAll('.mood-card').forEach(card => {
            card.classList.toggle('active', card.dataset.mood === moodId);
        });

        state.currentMood = moodId;
        vscode.postMessage({ type: 'moodChange', mood: moodId });
    }

    // Update volume display
    function updateVolumeDisplay(volume) {
        if (volumeValue) {
            volumeValue.textContent = `${volume}%`;
        }
        if (volumeSlider) {
            volumeSlider.value = volume;
        }
    }

    // Update sound toggle state
    function updateSoundToggle(isPlaying) {
        state.isPlaying = isPlaying;
        if (soundToggle) {
            soundToggle.classList.toggle('active', isPlaying);
        }
        if (soundIcon) {
            soundIcon.textContent = isPlaying ? '🔊' : '🔇';
        }
    }

    // Update streak display
    function updateStreakDisplay(data) {
        if (!data) return;

        state.streakData = data;

        if (currentStreakEl) {
            currentStreakEl.textContent = data.currentStreak || 0;
            // Add animation when streak updates
            currentStreakEl.classList.remove('streak-update');
            void currentStreakEl.offsetWidth; // Trigger reflow
            currentStreakEl.classList.add('streak-update');
        }

        if (longestStreakEl) {
            longestStreakEl.textContent = data.longestStreak || 0;
        }

        if (totalDaysEl) {
            totalDaysEl.textContent = data.totalCodingDays || 0;
        }

        if (todayCharsEl) {
            todayCharsEl.textContent = formatNumber(data.todayCharCount || 0);
        }

        // Render calendar
        renderStreakCalendar(data);
    }

    // Format large numbers
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Render streak calendar (last 28 days)
    function renderStreakCalendar(data) {
        if (!streakCalendar) return;

        streakCalendar.innerHTML = '';

        const today = new Date();
        const history = data.streakHistory || [];

        // Create dots for last 28 days (4 weeks)
        for (let i = 27; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dot = document.createElement('div');
            dot.className = 'calendar-dot';

            // Check if this date has activity
            const hasActivity = history.some(entry => entry.date === dateStr);
            if (hasActivity) {
                dot.classList.add('active');
            }

            // Mark today
            if (i === 0) {
                dot.classList.add('today');
            }

            dot.title = dateStr;
            streakCalendar.appendChild(dot);
        }
    }

    // Animation system
    function updateAnimation(type, color) {
        if (!animationContainer) return;

        state.animationType = type;
        state.animationColor = color;

        // Clear existing animation
        animationContainer.innerHTML = '';

        if (type === 'none' || !state.animationsEnabled) {
            return;
        }

        switch (type) {
            case 'particles':
                createParticleAnimation(color);
                break;
            case 'glow':
                createGlowAnimation(color);
                break;
            case 'waves':
                createWavesAnimation(color);
                break;
            case 'sparkles':
                createSparklesAnimation(color);
                break;
            case 'pulse':
                createPulseAnimation(color);
                break;
        }
    }

    // Particle animation
    function createParticleAnimation(color) {
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.background = color;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${4 + Math.random() * 4}s`;
            particle.style.animationDelay = `${Math.random() * 4}s`;
            particle.style.animation = `float ${4 + Math.random() * 4}s ease-in-out infinite`;
            particle.style.animationDelay = `${Math.random() * 4}s`;
            animationContainer.appendChild(particle);
        }

        // Add float keyframes if not exists
        if (!document.getElementById('particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'particle-keyframes';
            style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // Glow animation
    function createGlowAnimation(color) {
        animationContainer.style.background = `radial-gradient(ellipse at center, ${color}15 0%, transparent 70%)`;
        animationContainer.style.animation = 'glow 4s ease-in-out infinite';

        if (!document.getElementById('glow-keyframes')) {
            const style = document.createElement('style');
            style.id = 'glow-keyframes';
            style.textContent = `
        @keyframes glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // Waves animation
    function createWavesAnimation(color) {
        animationContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      pointer-events: none;
      overflow: hidden;
    `;

        for (let i = 0; i < 2; i++) {
            const wave = document.createElement('div');
            wave.className = 'wave';
            wave.style.cssText = `
        position: absolute;
        bottom: 0;
        width: 200%;
        height: 100%;
        background: linear-gradient(to top, ${color}20, transparent);
        animation: wave 3s ease-in-out infinite;
        animation-delay: ${i * -1.5}s;
        opacity: ${1 - i * 0.5};
      `;
            animationContainer.appendChild(wave);
        }

        if (!document.getElementById('wave-keyframes')) {
            const style = document.createElement('style');
            style.id = 'wave-keyframes';
            style.textContent = `
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25%) translateY(-10px); }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // Sparkles animation
    function createSparklesAnimation(color) {
        const sparkleCount = 10;

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${color};
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: sparkle 2s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
            animationContainer.appendChild(sparkle);
        }

        if (!document.getElementById('sparkle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'sparkle-keyframes';
            style.textContent = `
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // Pulse animation
    function createPulseAnimation(color) {
        animationContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      pointer-events: none;
    `;

        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.className = 'pulse-ring';
            ring.style.cssText = `
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
        animation-delay: ${i}s;
      `;
            animationContainer.appendChild(ring);
        }

        if (!document.getElementById('pulse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'pulse-keyframes';
            style.textContent = `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // Audio playback control
    function handleAudioCommand(command, data) {
        if (!ambientAudio) return;

        switch (command) {
            case 'play':
                ambientAudio.src = data.url;
                ambientAudio.volume = data.volume || 0.5;
                ambientAudio.loop = data.loop !== false;
                ambientAudio.play().catch(err => {
                    console.log('Audio playback failed:', err);
                });
                updateSoundToggle(true);
                break;
            case 'stop':
                if (data.fadeOut) {
                    fadeOutAudio();
                } else {
                    ambientAudio.pause();
                    ambientAudio.currentTime = 0;
                }
                updateSoundToggle(false);
                break;
            case 'volume':
                ambientAudio.volume = data.volume;
                break;
        }
    }

    // Fade out audio
    function fadeOutAudio() {
        const fadeInterval = setInterval(() => {
            if (ambientAudio.volume > 0.05) {
                ambientAudio.volume = Math.max(0, ambientAudio.volume - 0.05);
            } else {
                clearInterval(fadeInterval);
                ambientAudio.pause();
                ambientAudio.currentTime = 0;
                ambientAudio.volume = state.volume / 100;
            }
        }, 50);
    }

    // Handle messages from extension
    window.addEventListener('message', (event) => {
        const message = event.data;

        switch (message.type) {
            case 'init':
                state = {
                    ...state,
                    ...message.data
                };
                renderMoodCards();
                updateVolumeDisplay(state.volume);
                updateSoundToggle(state.isPlaying);
                updateStreakDisplay(state.streakData);
                if (state.animationState) {
                    updateAnimation(state.animationState.type, state.animationState.color);
                }
                break;

            case 'moodUpdated':
                state.currentMood = message.data.mood;
                document.querySelectorAll('.mood-card').forEach(card => {
                    card.classList.toggle('active', card.dataset.mood === message.data.mood);
                });
                break;

            case 'streakUpdated':
                updateStreakDisplay(message.data);
                break;

            case 'animationUpdated':
                updateAnimation(message.data.type, message.data.color);
                break;

            case 'audio':
                handleAudioCommand(message.command, message.data);
                break;
        }
    });

    // Start app
    init();
})();

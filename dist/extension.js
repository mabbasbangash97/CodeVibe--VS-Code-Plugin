"use strict";var L=Object.create;var k=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames;var I=Object.getPrototypeOf,$=Object.prototype.hasOwnProperty;var V=(i,e)=>{for(var t in e)k(i,t,{get:e[t],enumerable:!0})},P=(i,e,t,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of F(e))!$.call(i,a)&&a!==t&&k(i,a,{get:()=>e[a],enumerable:!(o=O(e,a))||o.enumerable});return i};var g=(i,e,t)=>(t=i!=null?L(I(i)):{},P(e||!i||!i.__esModule?k(t,"default",{value:i,enumerable:!0}):t,i)),z=i=>P(k({},"__esModule",{value:!0}),i);var J={};V(J,{activate:()=>R,deactivate:()=>j});module.exports=z(J);var s=g(require("vscode"));var v=g(require("vscode"));var S=(n=>(n.Focused="focused",n.Relaxed="relaxed",n.Energized="energized",n.Creative="creative",n.NotFeelingIt="notFeelingIt",n))(S||{});var h=[{id:"focused",name:"Focused",description:"Deep concentration mode",icon:"focused",theme:"One Dark Pro",sound:"bundled:focused",animationType:"none",color:"#61afef"},{id:"relaxed",name:"Relaxed",description:"Calm and peaceful vibes",icon:"relaxed",theme:"Dracula Soft",sound:"bundled:relaxed",animationType:"glow",color:"#98c379"},{id:"energized",name:"Energized",description:"High energy productivity",icon:"energized",theme:"Synthwave '84",sound:"bundled:energized",animationType:"waves",color:"#e5c07b"},{id:"creative",name:"Creative",description:"Inspire your imagination",icon:"creative",theme:"Night Owl",sound:"bundled:creative",animationType:"particles",color:"#c678dd"},{id:"notFeelingIt",name:"Not Feeling It",description:"Low energy, gentle mode",icon:"notfeelingit",theme:"Nord",sound:"bundled:notfeelingit",animationType:"pulse",color:"#5c6370"}];var f=class{constructor(e){this._extensionUri=e}static{this.viewType="codevibe.moodPanel"}setManagers(e,t,o,a){this.moodManager=e,this.soundManager=t,this.animationManager=o,this.streakTracker=a,this.soundManager.setAudioCommandCallback((n,l)=>{this._view&&this._view.webview.postMessage({type:"audio",command:n,data:l})}),this.moodManager.onMoodChanged(n=>{this.updateMoodInWebview(n)}),this.streakTracker.onStreakUpdated(n=>{this.updateStreakInWebview(n)}),this.animationManager.onAnimationChanged(({type:n,color:l})=>{this.updateAnimationInWebview(n,l)})}resolveWebviewView(e,t,o){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},e.webview.html=this._getHtmlForWebview(e.webview),e.webview.onDidReceiveMessage(async a=>{switch(a.type){case"moodChange":this.moodManager&&(await this.moodManager.setMood(a.mood),this.streakTracker&&await this.streakTracker.recordMood(a.mood));break;case"volumeChange":this.soundManager&&this.soundManager.setVolume(a.volume);break;case"toggleSound":this.soundManager&&await this.soundManager.toggleSound();break;case"toggleAnimations":this.animationManager&&this.animationManager.setEnabled(a.enabled);break;case"openSettings":v.commands.executeCommand("codevibe.openSettings");break;case"ready":this.sendInitialState();break}})}sendInitialState(){if(!this._view)return;let e=this.moodManager?.getCurrentMood(),t=this.streakTracker?.getStreakData(),o=this.soundManager?.getVolume()||50,a=this.soundManager?.getIsPlaying()||!1,n=this.animationManager?.getCurrentAnimation(),l=this.animationManager?.isEnabled()||!0,E=this.moodManager?.getAllMoodConfigs()||h,W=this.soundManager?.getStreamingSounds()||[],_=this.soundManager?.getBundledSounds()||[];this._view.webview.postMessage({type:"init",data:{currentMood:e,streakData:t,volume:o,isPlaying:a,animationState:n,animationsEnabled:l,moodConfigs:E,streamingSounds:W,bundledSounds:_}})}updateMoodInWebview(e){if(this._view){let t=this.moodManager?.getMoodConfig(e);this._view.webview.postMessage({type:"moodUpdated",data:{mood:e,config:t}})}}updateStreakInWebview(e){this._view&&this._view.webview.postMessage({type:"streakUpdated",data:e})}updateAnimationInWebview(e,t){this._view&&this._view.webview.postMessage({type:"animationUpdated",data:{type:e,color:t}})}_getHtmlForWebview(e){let t=e.asWebviewUri(v.Uri.joinPath(this._extensionUri,"dist","webview","sidebar.js")),o=e.asWebviewUri(v.Uri.joinPath(this._extensionUri,"dist","webview","sidebar.css")),a=H();return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${e.cspSource} 'unsafe-inline'; script-src 'nonce-${a}'; img-src ${e.cspSource} https: data:; media-src ${e.cspSource} https:; font-src ${e.cspSource};">
    <link href="${o}" rel="stylesheet">
    <title>CodeVibe</title>
</head>
<body>
    <div class="codevibe-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">
                <span class="logo-icon">\u{1F3A8}</span>
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
                    <span class="sound-icon" id="soundIcon">\u{1F50A}</span>
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
            <h2 class="section-title">Your Coding Streak \u{1F525}</h2>
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
    <script nonce="${a}" src="${t}"></script>
</body>
</html>`}};function H(){let i="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)i+=e.charAt(Math.floor(Math.random()*e.length));return i}var c=g(require("vscode"));var w=class i{constructor(e,t,o,a){this.context=e;this.currentMood=null;this.moodConfigs=new Map;this.debounceTimer=null;this.DEBOUNCE_MS=300;this._onMoodChanged=new c.EventEmitter;this.onMoodChanged=this._onMoodChanged.event;this.themeManager=t,this.soundManager=o,this.animationManager=a,this.initializeMoodConfigs(),this.restoreLastMood()}static getInstance(e,t,o,a){if(!i.instance){if(!e||!t||!o||!a)throw new Error("MoodManager requires all dependencies on first initialization");i.instance=new i(e,t,o,a)}return i.instance}initializeMoodConfigs(){let e=c.workspace.getConfiguration("codevibe");h.forEach(t=>{let o=e.get(`moods.${t.id}.theme`),a=e.get(`moods.${t.id}.sound`);this.moodConfigs.set(t.id,{...t,theme:o||t.theme,sound:a||t.sound})})}restoreLastMood(){let e=this.context.globalState.get("codevibe.lastMood");e&&Object.values(S).includes(e)&&this.setMood(e,{playSound:!1})}async setMood(e,t={}){let{playSound:o=!0}=t;return this.debounceTimer&&clearTimeout(this.debounceTimer),new Promise(a=>{this.debounceTimer=setTimeout(async()=>{try{let n=this.moodConfigs.get(e);if(!n){c.window.showErrorMessage(`Unknown mood: ${e}`),a();return}this.currentMood=e,await this.context.globalState.update("codevibe.lastMood",e),await this.themeManager.setTheme(n.theme);let l=c.workspace.getConfiguration("codevibe").get("sounds.enabled",!0);o&&l&&await this.soundManager.playSound(n.sound),c.workspace.getConfiguration("codevibe").get("animations.enabled",!0)&&n.animationType!=="none"?this.animationManager.setAnimation(n.animationType,n.color):this.animationManager.stopAnimation(),this._onMoodChanged.fire(e),c.window.setStatusBarMessage(`CodeVibe: ${n.name} mode activated`,3e3)}catch(n){console.error("Error setting mood:",n),c.window.showErrorMessage(`Failed to set mood: ${n}`)}a()},this.DEBOUNCE_MS)})}getCurrentMood(){return this.currentMood}getMoodConfig(e){return this.moodConfigs.get(e)}getAllMoodConfigs(){return Array.from(this.moodConfigs.values())}async updateMoodConfig(e,t){let o=this.moodConfigs.get(e);o&&(this.moodConfigs.set(e,{...o,...t}),this.currentMood===e&&await this.setMood(e))}refreshConfigs(){this.initializeMoodConfigs()}dispose(){this.debounceTimer&&clearTimeout(this.debounceTimer),this._onMoodChanged.dispose()}};var r=g(require("vscode")),C=class i{constructor(e){this.context=e;this.currentTheme=null;this.originalTheme=null;this.originalTheme=r.workspace.getConfiguration("workbench").get("colorTheme")||null}static getInstance(e){if(!i.instance){if(!e)throw new Error("ThemeManager requires context on first initialization");i.instance=new i(e)}return i.instance}async setTheme(e){try{let t=r.extensions.all;if(!this.isThemeAvailable(e,t)){let a=this.findFallbackTheme(e);if(a)console.log(`Theme "${e}" not found, using fallback: ${a}`),e=a;else return r.window.showWarningMessage(`Theme "${e}" is not installed. Please install it from the marketplace.`,"Open Marketplace").then(n=>{n==="Open Marketplace"&&r.commands.executeCommand("workbench.extensions.search",e)}),!1}return await r.workspace.getConfiguration("workbench").update("colorTheme",e,r.ConfigurationTarget.Global),this.currentTheme=e,!0}catch(t){return console.error("Error setting theme:",t),!1}}isThemeAvailable(e,t){if(["Default Dark+","Default Light+","Default Dark Modern","Default Light Modern","Visual Studio Dark","Visual Studio Light","Monokai","Monokai Dimmed","Solarized Dark","Solarized Light","Quiet Light","Red","Abyss","Kimbie Dark","Tomorrow Night Blue","High Contrast","High Contrast Light"].some(a=>a.toLowerCase()===e.toLowerCase()))return!0;for(let a of t){let n=a.packageJSON;if(n.contributes?.themes){for(let l of n.contributes.themes)if(l.label?.toLowerCase()===e.toLowerCase()||l.id?.toLowerCase()===e.toLowerCase())return!0}}return!1}findFallbackTheme(e){let t={"one dark pro":["One Dark Pro","Atom One Dark","Default Dark+"],"dracula soft":["Dracula","Dracula Soft","Default Dark+"],"synthwave '84":["SynthWave '84","Synthwave","Default Dark+"],"night owl":["Night Owl","Default Dark+"],nord:["Nord","Arctic","Default Dark+"]},o=e.toLowerCase(),a=t[o]||["Default Dark+"];for(let n of a)if(this.isThemeAvailable(n,r.extensions.all))return n;return"Default Dark+"}getCurrentTheme(){return this.currentTheme||r.workspace.getConfiguration("workbench").get("colorTheme")||null}async restoreOriginalTheme(){this.originalTheme&&await this.setTheme(this.originalTheme)}getAvailableThemes(){let e=["Default Dark+","Default Light+","Default Dark Modern","Default Light Modern","Monokai","Solarized Dark","Solarized Light"];for(let t of r.extensions.all){let o=t.packageJSON;if(o.contributes?.themes)for(let a of o.contributes.themes)a.label&&e.push(a.label)}return[...new Set(e)].sort()}dispose(){}};var d=g(require("vscode")),U=g(require("fs")),y=class i{constructor(e){this.context=e;this.currentSound=null;this.volume=50;this.isPlaying=!1;this.soundWebviewPanel=null;this.streamingSounds={"stream:rain":{url:"https://cdn.freesound.org/previews/531/531947_5765286-lq.mp3",name:"Rain Sounds"},"stream:forest":{url:"https://cdn.freesound.org/previews/462/462087_9497060-lq.mp3",name:"Forest Ambience"},"stream:cafe":{url:"https://cdn.freesound.org/previews/443/443916_9159316-lq.mp3",name:"Coffee Shop"},"stream:ocean":{url:"https://cdn.freesound.org/previews/531/531015_5765286-lq.mp3",name:"Ocean Waves"},"stream:fire":{url:"https://cdn.freesound.org/previews/499/499757_2524422-lq.mp3",name:"Fireplace"},"stream:wind":{url:"https://cdn.freesound.org/previews/408/408598_7299548-lq.mp3",name:"Gentle Wind"},"stream:thunder":{url:"https://cdn.freesound.org/previews/401/401275_7429806-lq.mp3",name:"Distant Thunder"},"stream:birds":{url:"https://cdn.freesound.org/previews/531/531953_5765286-lq.mp3",name:"Morning Birds"}};this.bundledSounds={"bundled:focused":"focused.mp3","bundled:relaxed":"relaxed.mp3","bundled:energized":"energized.mp3","bundled:creative":"creative.mp3","bundled:notfeelingit":"notfeelingit.mp3"};this._onSoundStateChanged=new d.EventEmitter;this.onSoundStateChanged=this._onSoundStateChanged.event;this.audioCommandCallback=null;this.extensionUri=e.extensionUri,this.volume=d.workspace.getConfiguration("codevibe").get("sounds.volume",50)}static getInstance(e){if(!i.instance){if(!e)throw new Error("SoundManager requires context on first initialization");i.instance=new i(e)}return i.instance}async playSound(e){try{this.isPlaying&&await this.stopSound(!0);let t;if(e.startsWith("bundled:")){let o=this.bundledSounds[e];if(!o){console.warn(`Unknown bundled sound: ${e}`);return}let a=d.Uri.joinPath(this.extensionUri,"media","sounds",o);if(!U.existsSync(a.fsPath)){console.warn(`Bundled sound file not found: ${a.fsPath}`),d.workspace.getConfiguration("codevibe").get("sounds.streamingEnabled",!0)&&await this.playSound("stream:rain");return}t=a.toString()}else if(e.startsWith("stream:")){if(!d.workspace.getConfiguration("codevibe").get("sounds.streamingEnabled",!0)){console.log("Streaming sounds disabled");return}let a=this.streamingSounds[e];if(!a){console.warn(`Unknown streaming sound: ${e}`);return}t=a.url}else e.startsWith("file:")?t=e.replace("file:",""):t=e;this.currentSound=e,this.isPlaying=!0,this._onSoundStateChanged.fire({playing:!0,sound:e}),this.sendAudioCommand("play",{url:t,volume:this.volume/100,loop:!0})}catch(t){console.error("Error playing sound:",t),this.isPlaying=!1}}async stopSound(e=!0){this.isPlaying&&(this.sendAudioCommand("stop",{fadeOut:e}),this.isPlaying=!1,this.currentSound=null,this._onSoundStateChanged.fire({playing:!1,sound:null}))}async toggleSound(){this.isPlaying?await this.stopSound():this.currentSound&&await this.playSound(this.currentSound)}setVolume(e){this.volume=Math.max(0,Math.min(100,e)),this.sendAudioCommand("volume",{volume:this.volume/100}),d.workspace.getConfiguration("codevibe").update("sounds.volume",this.volume,d.ConfigurationTarget.Global)}getVolume(){return this.volume}getIsPlaying(){return this.isPlaying}getCurrentSound(){return this.currentSound}getStreamingSounds(){return Object.entries(this.streamingSounds).map(([e,t])=>({id:e,name:t.name}))}getBundledSounds(){return Object.keys(this.bundledSounds).map(e=>({id:e,name:e.replace("bundled:","").charAt(0).toUpperCase()+e.replace("bundled:","").slice(1)}))}setAudioCommandCallback(e){this.audioCommandCallback=e}sendAudioCommand(e,t){this.audioCommandCallback&&this.audioCommandCallback(e,t)}dispose(){this.stopSound(!1),this._onSoundStateChanged.dispose(),this.soundWebviewPanel&&this.soundWebviewPanel.dispose()}};var m=g(require("vscode"));var M=class i{constructor(e){this.context=e;this.currentAnimation="none";this.currentColor="#ffffff";this.animationEnabled=!0;this._onAnimationChanged=new m.EventEmitter;this.onAnimationChanged=this._onAnimationChanged.event;this.animationEnabled=m.workspace.getConfiguration("codevibe").get("animations.enabled",!0)}static getInstance(e){if(!i.instance){if(!e)throw new Error("AnimationManager requires context on first initialization");i.instance=new i(e)}return i.instance}setAnimation(e,t){if(!this.animationEnabled){this.currentAnimation="none";return}this.currentAnimation=e,this.currentColor=t,this._onAnimationChanged.fire({type:e,color:t})}stopAnimation(){this.currentAnimation="none",this._onAnimationChanged.fire({type:"none",color:this.currentColor})}getCurrentAnimation(){return{type:this.currentAnimation,color:this.currentColor}}setEnabled(e){this.animationEnabled=e,e||this.stopAnimation(),m.workspace.getConfiguration("codevibe").update("animations.enabled",e,m.ConfigurationTarget.Global)}isEnabled(){return this.animationEnabled}getAnimationCSS(e,t){switch(e){case"particles":return this.getParticlesCSS(t);case"glow":return this.getGlowCSS(t);case"waves":return this.getWavesCSS(t);case"sparkles":return this.getSparklesCSS(t);case"pulse":return this.getPulseCSS(t);default:return""}}getParticlesCSS(e){return`
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
        background: ${e};
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
    `}getGlowCSS(e){return`
      .animation-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: radial-gradient(ellipse at center, ${e}15 0%, transparent 70%);
        animation: glow 4s ease-in-out infinite;
      }
      @keyframes glow {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
    `}getWavesCSS(e){return`
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
        background: linear-gradient(to top, ${e}20, transparent);
        animation: wave 3s ease-in-out infinite;
      }
      .wave:nth-child(2) { animation-delay: -1.5s; opacity: 0.5; }
      @keyframes wave {
        0%, 100% { transform: translateX(0) translateY(0); }
        50% { transform: translateX(-25%) translateY(-10px); }
      }
    `}getSparklesCSS(e){return`
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
        background: ${e};
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        animation: sparkle 2s ease-in-out infinite;
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
      }
    `}getPulseCSS(e){return`
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
        border: 2px solid ${e};
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
    `}dispose(){this._onAnimationChanged.dispose()}};var u=g(require("vscode")),D=class i{constructor(e){this.context=e;this.charCountBuffer=0;this.flushTimer=null;this.disposables=[];this.isEnabled=!0;this.minCharsForActivity=10;this._onStreakUpdated=new u.EventEmitter;this.onStreakUpdated=this._onStreakUpdated.event;this.STORAGE_KEY="codevibe.streakData";this.FLUSH_INTERVAL=5e3;this.isEnabled=u.workspace.getConfiguration("codevibe").get("streak.enabled",!0),this.minCharsForActivity=u.workspace.getConfiguration("codevibe").get("streak.minCharsForActivity",10),this.streakData=this.loadStreakData(),this.checkDayRollover(),this.setupListeners()}static getInstance(e){if(!i.instance){if(!e)throw new Error("StreakTracker requires context on first initialization");i.instance=new i(e)}return i.instance}loadStreakData(){let e=this.context.globalState.get(this.STORAGE_KEY);return e||{currentStreak:0,longestStreak:0,totalCodingDays:0,lastActiveDate:null,todayCharCount:0,streakHistory:[]}}async saveStreakData(){await this.context.globalState.update(this.STORAGE_KEY,this.streakData)}setupListeners(){if(!this.isEnabled)return;let e=u.workspace.onDidChangeTextDocument(t=>{if(t.document.uri.scheme==="file"){for(let o of t.contentChanges)o.text.length>0&&(this.charCountBuffer+=o.text.length);this.flushTimer&&clearTimeout(this.flushTimer),this.flushTimer=setTimeout(()=>this.flushCharCount(),this.FLUSH_INTERVAL)}});this.disposables.push(e)}async flushCharCount(){if(this.charCountBuffer===0)return;let e=this.getTodayString();this.streakData.lastActiveDate!==e&&this.checkDayRollover(),this.streakData.todayCharCount+=this.charCountBuffer,this.charCountBuffer=0,this.streakData.todayCharCount>=this.minCharsForActivity&&this.streakData.lastActiveDate!==e&&this.recordActiveDay(e),await this.saveStreakData(),this._onStreakUpdated.fire(this.streakData)}checkDayRollover(){let e=this.getTodayString(),t=this.getYesterdayString();this.streakData.lastActiveDate!==null&&this.streakData.lastActiveDate!==e&&(this.streakData.lastActiveDate!==t&&this.streakData.lastActiveDate!==e&&(this.streakData.currentStreak=0),this.streakData.todayCharCount=0)}recordActiveDay(e){this.streakData.lastActiveDate=e,this.streakData.currentStreak+=1,this.streakData.totalCodingDays+=1,this.streakData.currentStreak>this.streakData.longestStreak&&(this.streakData.longestStreak=this.streakData.currentStreak),this.streakData.streakHistory.push({date:e,charCount:this.streakData.todayCharCount,mood:null}),this.streakData.streakHistory.length>30&&this.streakData.streakHistory.shift()}getTodayString(){return new Date().toISOString().split("T")[0]}getYesterdayString(){let e=new Date;return e.setDate(e.getDate()-1),e.toISOString().split("T")[0]}getStreakData(){return{...this.streakData}}async recordMood(e){let t=this.getTodayString(),o=this.streakData.streakHistory.find(a=>a.date===t);o&&(o.mood=e,await this.saveStreakData())}async setEnabled(e){this.isEnabled=e,e?this.setupListeners():(this.disposables.forEach(t=>t.dispose()),this.disposables=[],this.flushTimer&&(clearTimeout(this.flushTimer),this.flushTimer=null)),await u.workspace.getConfiguration("codevibe").update("streak.enabled",e,u.ConfigurationTarget.Global)}async resetStreak(){this.streakData={currentStreak:0,longestStreak:0,totalCodingDays:0,lastActiveDate:null,todayCharCount:0,streakHistory:[]},await this.saveStreakData(),this._onStreakUpdated.fire(this.streakData)}async forceFlush(){this.flushTimer&&(clearTimeout(this.flushTimer),this.flushTimer=null),await this.flushCharCount()}dispose(){this.forceFlush(),this.disposables.forEach(e=>e.dispose()),this.flushTimer&&clearTimeout(this.flushTimer),this._onStreakUpdated.dispose()}};var b,A,p,T,x;async function R(i){console.log("CodeVibe extension is now active!");try{await B(i);let e=new f(i.extensionUri);e.setManagers(b,p,T,x),i.subscriptions.push(s.window.registerWebviewViewProvider(f.viewType,e,{webviewOptions:{retainContextWhenHidden:!0}})),G(i),i.subscriptions.push(s.workspace.onDidChangeConfiguration(o=>{o.affectsConfiguration("codevibe")&&b.refreshConfigs()})),i.globalState.get("codevibe.welcomeShown")||(Y(),i.globalState.update("codevibe.welcomeShown",!0))}catch(e){console.error("Failed to activate CodeVibe:",e),s.window.showErrorMessage(`CodeVibe failed to activate: ${e}`)}}async function B(i){A=C.getInstance(i),p=y.getInstance(i),T=M.getInstance(i),x=D.getInstance(i),b=w.getInstance(i,A,p,T)}function G(i){i.subscriptions.push(s.commands.registerCommand("codevibe.setMood",async()=>{let e=h.map(o=>({label:`${q(o.id)} ${o.name}`,description:o.description,mood:o.id})),t=await s.window.showQuickPick(e,{placeHolder:"How are you feeling?",title:"CodeVibe: Set Your Mood"});t&&await b.setMood(t.mood)})),i.subscriptions.push(s.commands.registerCommand("codevibe.toggleSound",async()=>{await p.toggleSound();let e=p.getIsPlaying();s.window.setStatusBarMessage(`CodeVibe: Sound ${e?"enabled":"disabled"}`,3e3)})),i.subscriptions.push(s.commands.registerCommand("codevibe.showStreak",async()=>{let e=x.getStreakData(),t=`\u{1F525} Current Streak: ${e.currentStreak} days
\u{1F3C6} Best Streak: ${e.longestStreak} days
\u{1F4C5} Total Coding Days: ${e.totalCodingDays}`;s.window.showInformationMessage(t,"View in Sidebar").then(o=>{o==="View in Sidebar"&&s.commands.executeCommand("codevibe.moodPanel.focus")})})),i.subscriptions.push(s.commands.registerCommand("codevibe.openSettings",()=>{s.commands.executeCommand("workbench.action.openSettings","@ext:codevibe.codevibe")}))}function q(i){return{focused:"\u{1F3AF}",relaxed:"\u{1F33F}",energized:"\u26A1",creative:"\u2728",notFeelingIt:"\u{1F319}"}[i]||"\u{1F3A8}"}function Y(){s.window.showInformationMessage("\u{1F3A8} Welcome to CodeVibe! Click the CodeVibe icon in the sidebar to set your mood.","Open Sidebar","Learn More").then(i=>{i==="Open Sidebar"?s.commands.executeCommand("codevibe.moodPanel.focus"):i==="Learn More"&&s.env.openExternal(s.Uri.parse("https://github.com/codevibe/codevibe-vscode"))})}function j(){console.log("CodeVibe extension is deactivating..."),p?.dispose(),T?.dispose(),x?.dispose(),b?.dispose(),A?.dispose()}0&&(module.exports={activate,deactivate});

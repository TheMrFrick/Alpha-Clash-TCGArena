/**
 * Alpha Clash TCG - Custom Scripts
 * Version: 1.0.0
 * Custom JavaScript for Alpha Clash on TCGArena platform
 */

(function() {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        cardZoomDelay: 500,
        animationDuration: 300,
        tokenStackLimit: 99,
        autoSaveInterval: 30000,
        soundEnabled: true,
        debug: false
    };

    // ========================================
    // Utility Functions
    // ========================================
    const Utils = {
        /**
         * Log debug messages if debug mode is enabled
         */
        debug: function(...args) {
            if (CONFIG.debug) {
                console.log('[Alpha Clash]', ...args);
            }
        },

        /**
         * Generate a unique ID
         */
        generateId: function() {
            return 'ac-' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Throttle function calls
         */
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Debounce function calls
         */
        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        /**
         * Check if element is in viewport
         */
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    };

    // ========================================
    // Card Zoom Handler
    // ========================================
    const CardZoom = {
        zoomOverlay: null,
        zoomTimeout: null,

        init: function() {
            this.zoomOverlay = document.getElementById('card-zoom-overlay');
            if (!this.zoomOverlay) return;

            // Close zoom on click
            this.zoomOverlay.addEventListener('click', () => this.hide());

            // Close zoom on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.hide();
            });

            Utils.debug('CardZoom initialized');
        },

        show: function(card) {
            if (!this.zoomOverlay || !card) return;

            const imageEl = this.zoomOverlay.querySelector('#zoomed-card-image');
            const nameEl = this.zoomOverlay.querySelector('.card-name');
            const typeEl = this.zoomOverlay.querySelector('.card-type');
            const statsEl = this.zoomOverlay.querySelector('.card-stats');
            const textEl = this.zoomOverlay.querySelector('.card-text');

            // Get card data from data attributes
            const cardData = card.dataset;

            if (imageEl) {
                imageEl.src = card.querySelector('img')?.src || '';
                imageEl.alt = cardData.name || 'Card';
            }

            if (nameEl) nameEl.textContent = cardData.name || 'Unknown Card';
            if (typeEl) typeEl.textContent = cardData.type || '';

            if (statsEl) {
                const attack = cardData.attack;
                const defense = cardData.defense;
                const cost = cardData.cost;

                let statsText = '';
                if (cost !== undefined) statsText += `Cost: ${cost}`;
                if (attack !== undefined) statsText += ` | ATK: ${attack}`;
                if (defense !== undefined) statsText += ` | DEF: ${defense}`;
                statsEl.textContent = statsText;
            }

            if (textEl) textEl.textContent = cardData.text || '';

            this.zoomOverlay.classList.remove('hidden');
        },

        hide: function() {
            if (this.zoomOverlay) {
                this.zoomOverlay.classList.add('hidden');
            }
        },

        scheduleShow: function(card) {
            this.cancelSchedule();
            this.zoomTimeout = setTimeout(() => this.show(card), CONFIG.cardZoomDelay);
        },

        cancelSchedule: function() {
            if (this.zoomTimeout) {
                clearTimeout(this.zoomTimeout);
                this.zoomTimeout = null;
            }
        }
    };

    // ========================================
    // Context Menu Handler
    // ========================================
    const ContextMenu = {
        menuElement: null,
        currentCard: null,

        init: function() {
            this.menuElement = document.getElementById('context-menu');
            if (!this.menuElement) return;

            // Close menu on click outside
            document.addEventListener('click', (e) => {
                if (!this.menuElement.contains(e.target)) {
                    this.hide();
                }
            });

            // Close menu on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.hide();
            });

            Utils.debug('ContextMenu initialized');
        },

        show: function(card, x, y) {
            if (!this.menuElement || !card) return;

            this.currentCard = card;
            this.menuElement.style.left = `${x}px`;
            this.menuElement.style.top = `${y}px`;
            this.menuElement.classList.remove('hidden');

            // Adjust position if menu goes off screen
            const rect = this.menuElement.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                this.menuElement.style.left = `${x - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                this.menuElement.style.top = `${y - rect.height}px`;
            }
        },

        hide: function() {
            if (this.menuElement) {
                this.menuElement.classList.add('hidden');
            }
            this.currentCard = null;
        },

        executeAction: function(action, params = {}) {
            if (!this.currentCard) return;

            Utils.debug('Executing action:', action, params);

            switch (action) {
                case 'tap':
                    this.currentCard.classList.toggle('tapped');
                    break;
                case 'flipFaceDown':
                    this.currentCard.classList.add('face-down');
                    break;
                case 'flipFaceUp':
                    this.currentCard.classList.remove('face-down');
                    break;
                case 'viewCard':
                    CardZoom.show(this.currentCard);
                    break;
                case 'moveToSection':
                    // This would integrate with TCGArena's move system
                    this.emitEvent('card-move', {
                        card: this.currentCard,
                        targetSection: params.targetSection,
                        faceDown: params.faceDown || false,
                        position: params.position || 'default'
                    });
                    break;
                case 'addToken':
                    TokenManager.addToken(this.currentCard, params.tokenId);
                    break;
                case 'removeToken':
                    TokenManager.removeToken(this.currentCard, params.tokenId);
                    break;
                case 'clearTokens':
                    TokenManager.clearTokens(this.currentCard);
                    break;
            }

            this.hide();
        },

        emitEvent: function(eventName, detail) {
            document.dispatchEvent(new CustomEvent(`alphaclash:${eventName}`, { detail }));
        }
    };

    // ========================================
    // Token Manager
    // ========================================
    const TokenManager = {
        tokens: new Map(),

        init: function() {
            this.setupDragAndDrop();
            Utils.debug('TokenManager initialized');
        },

        setupDragAndDrop: function() {
            const tokenItems = document.querySelectorAll('#token-tray .token-item');

            tokenItems.forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('token-id', item.dataset.token);
                    e.dataTransfer.effectAllowed = 'copy';
                });
            });

            // Allow dropping on cards
            document.addEventListener('dragover', (e) => {
                if (e.target.closest('.card')) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                }
            });

            document.addEventListener('drop', (e) => {
                const card = e.target.closest('.card');
                if (card) {
                    const tokenId = e.dataTransfer.getData('token-id');
                    if (tokenId) {
                        e.preventDefault();
                        this.addToken(card, tokenId);
                    }
                }
            });
        },

        addToken: function(card, tokenId) {
            if (!card || !tokenId) return;

            const cardId = card.id || (card.id = Utils.generateId());

            if (!this.tokens.has(cardId)) {
                this.tokens.set(cardId, {});
            }

            const cardTokens = this.tokens.get(cardId);
            cardTokens[tokenId] = (cardTokens[tokenId] || 0) + 1;

            if (cardTokens[tokenId] > CONFIG.tokenStackLimit) {
                cardTokens[tokenId] = CONFIG.tokenStackLimit;
            }

            this.renderTokens(card);
            Utils.debug('Added token', tokenId, 'to card', cardId);
        },

        removeToken: function(card, tokenId) {
            if (!card || !tokenId) return;

            const cardId = card.id;
            if (!cardId || !this.tokens.has(cardId)) return;

            const cardTokens = this.tokens.get(cardId);
            if (cardTokens[tokenId] && cardTokens[tokenId] > 0) {
                cardTokens[tokenId]--;
                if (cardTokens[tokenId] === 0) {
                    delete cardTokens[tokenId];
                }
            }

            this.renderTokens(card);
            Utils.debug('Removed token', tokenId, 'from card', cardId);
        },

        clearTokens: function(card) {
            if (!card) return;

            const cardId = card.id;
            if (cardId && this.tokens.has(cardId)) {
                this.tokens.delete(cardId);
            }

            this.renderTokens(card);
            Utils.debug('Cleared all tokens from card', cardId);
        },

        renderTokens: function(card) {
            // Remove existing token display
            const existingTokens = card.querySelector('.card-tokens');
            if (existingTokens) {
                existingTokens.remove();
            }

            const cardId = card.id;
            if (!cardId || !this.tokens.has(cardId)) return;

            const cardTokens = this.tokens.get(cardId);
            const tokenTypes = Object.keys(cardTokens);

            if (tokenTypes.length === 0) return;

            // Create token container
            const container = document.createElement('div');
            container.className = 'card-tokens';
            container.style.cssText = `
                position: absolute;
                bottom: 5px;
                right: 5px;
                display: flex;
                gap: 3px;
                flex-wrap: wrap;
                justify-content: flex-end;
            `;

            tokenTypes.forEach(tokenId => {
                const count = cardTokens[tokenId];
                if (count <= 0) return;

                const token = document.createElement('div');
                token.className = `token ${tokenId.replace('-counter', '')}`;
                token.textContent = count > 1 ? count : '';
                token.style.cssText = `
                    position: relative;
                    width: 18px;
                    height: 18px;
                    font-size: 10px;
                `;
                container.appendChild(token);
            });

            card.style.position = 'relative';
            card.appendChild(container);
        }
    };

    // ========================================
    // Life Counter
    // ========================================
    const LifeCounter = {
        playerLife: 20,
        opponentLife: 20,

        init: function() {
            this.bindEvents();
            Utils.debug('LifeCounter initialized');
        },

        bindEvents: function() {
            // Listen for life change events
            document.addEventListener('alphaclash:life-change', (e) => {
                const { player, amount } = e.detail;
                this.changeLife(player, amount);
            });
        },

        changeLife: function(player, amount) {
            if (player === 'self') {
                this.playerLife = Math.max(0, this.playerLife + amount);
                this.updateDisplay('player', this.playerLife);
            } else if (player === 'opponent') {
                this.opponentLife = Math.max(0, this.opponentLife + amount);
                this.updateDisplay('opponent', this.opponentLife);
            }

            // Check for win condition
            if (this.playerLife <= 0 || this.opponentLife <= 0) {
                this.checkWinCondition();
            }
        },

        updateDisplay: function(player, life) {
            const selector = player === 'player' ? '#player-contender' : '#opponent-contender';
            const contender = document.querySelector(selector);
            if (!contender) return;

            const lifeDisplay = contender.querySelector('.life-value');
            if (lifeDisplay) {
                lifeDisplay.textContent = life;

                // Animate the change
                const lifeContainer = lifeDisplay.closest('.life-display');
                if (lifeContainer) {
                    lifeContainer.classList.add('changing');
                    setTimeout(() => lifeContainer.classList.remove('changing'), 400);
                }
            }
        },

        checkWinCondition: function() {
            const modal = document.getElementById('game-over-modal');
            if (!modal) return;

            const titleEl = modal.querySelector('.result-title');
            const messageEl = modal.querySelector('.result-message');

            if (this.opponentLife <= 0) {
                titleEl.textContent = 'Victory!';
                titleEl.className = 'result-title victory';
                messageEl.textContent = 'You have defeated your opponent!';
            } else if (this.playerLife <= 0) {
                titleEl.textContent = 'Defeat';
                titleEl.className = 'result-title defeat';
                messageEl.textContent = 'Your Contender has been defeated.';
            }

            modal.classList.remove('hidden');
        },

        reset: function() {
            this.playerLife = 20;
            this.opponentLife = 20;
            this.updateDisplay('player', this.playerLife);
            this.updateDisplay('opponent', this.opponentLife);
        }
    };

    // ========================================
    // Turn Manager
    // ========================================
    const TurnManager = {
        currentTurn: 1,
        currentPhase: 'main',
        isPlayerTurn: true,
        phases: ['start', 'untap', 'draw', 'resource', 'main', 'clash', 'main2', 'end'],

        init: function() {
            this.bindEvents();
            Utils.debug('TurnManager initialized');
        },

        bindEvents: function() {
            const endTurnBtn = document.getElementById('btn-end-turn');
            if (endTurnBtn) {
                endTurnBtn.addEventListener('click', () => this.endTurn());
            }
        },

        nextPhase: function() {
            const currentIndex = this.phases.indexOf(this.currentPhase);
            if (currentIndex < this.phases.length - 1) {
                this.currentPhase = this.phases[currentIndex + 1];
            } else {
                this.endTurn();
                return;
            }
            this.updateDisplay();
            this.emitPhaseChange();
        },

        endTurn: function() {
            this.currentTurn++;
            this.isPlayerTurn = !this.isPlayerTurn;
            this.currentPhase = this.phases[0];
            this.updateDisplay();
            this.emitTurnChange();
        },

        updateDisplay: function() {
            const turnNumber = document.querySelector('#turn-indicator .turn-number');
            const phaseName = document.querySelector('#turn-indicator .phase-name');

            if (turnNumber) turnNumber.textContent = this.currentTurn;
            if (phaseName) {
                const phaseDisplay = this.currentPhase.charAt(0).toUpperCase() +
                                    this.currentPhase.slice(1) + ' Phase';
                phaseName.textContent = phaseDisplay;
            }
        },

        emitPhaseChange: function() {
            document.dispatchEvent(new CustomEvent('alphaclash:phase-change', {
                detail: { phase: this.currentPhase, turn: this.currentTurn }
            }));
        },

        emitTurnChange: function() {
            document.dispatchEvent(new CustomEvent('alphaclash:turn-change', {
                detail: { turn: this.currentTurn, isPlayerTurn: this.isPlayerTurn }
            }));
        }
    };

    // ========================================
    // Sound Manager (Web Audio API - Procedural Sounds)
    // ========================================
    const SoundManager = {
        audioContext: null,
        enabled: CONFIG.soundEnabled,

        init: function() {
            // Initialize AudioContext on first user interaction
            const initAudio = () => {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                document.removeEventListener('click', initAudio);
                document.removeEventListener('keydown', initAudio);
            };
            document.addEventListener('click', initAudio);
            document.addEventListener('keydown', initAudio);

            Utils.debug('SoundManager initialized (Web Audio API)');
        },

        play: function(name) {
            if (!this.enabled) return;

            // Initialize context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            try {
                switch(name) {
                    case 'card-draw':
                        this.playCardDraw();
                        break;
                    case 'card-play':
                        this.playCardPlay();
                        break;
                    case 'attack':
                        this.playAttack();
                        break;
                    case 'damage':
                        this.playDamage();
                        break;
                    case 'victory':
                        this.playVictory();
                        break;
                    case 'defeat':
                        this.playDefeat();
                        break;
                    case 'turn-start':
                        this.playTurnStart();
                        break;
                    case 'shuffle':
                        this.playShuffle();
                        break;
                    default:
                        this.playGeneric();
                }
            } catch (e) {
                Utils.debug('Sound playback failed:', e);
            }
        },

        // Card draw - quick swoosh
        playCardDraw: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        },

        // Card play - thud with resonance
        playCardPlay: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        },

        // Attack - aggressive hit
        playAttack: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            // Impact
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(200, now);
            osc1.frequency.exponentialRampToValueAtTime(80, now + 0.1);
            gain1.gain.setValueAtTime(0.25, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.15);

            // Swoosh
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 1000;
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(1500, now);
            osc2.frequency.exponentialRampToValueAtTime(300, now + 0.08);
            gain2.gain.setValueAtTime(0.1, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc2.connect(filter);
            filter.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now);
            osc2.stop(now + 0.08);
        },

        // Damage - low thump
        playDamage: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);
        },

        // Victory - triumphant fanfare
        playVictory: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, now + i * 0.15);
                gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.4);
            });
        },

        // Defeat - descending tones
        playDefeat: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const notes = [392, 349, 294, 262]; // G4, F4, D4, C4

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, now + i * 0.2);
                gain.gain.linearRampToValueAtTime(0.12, now + i * 0.2 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.2);
                osc.stop(now + i * 0.2 + 0.5);
            });
        },

        // Turn start - chime
        playTurnStart: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = 1320;
            gain2.gain.setValueAtTime(0, now + 0.1);
            gain2.gain.linearRampToValueAtTime(0.1, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.4);
        },

        // Shuffle - rapid noise burst
        playShuffle: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            for (let i = 0; i < 5; i++) {
                const bufferSize = ctx.sampleRate * 0.05;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let j = 0; j < bufferSize; j++) {
                    data[j] = (Math.random() * 2 - 1) * 0.3;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 2000;
                gain.gain.setValueAtTime(0.08, now + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.05);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                noise.start(now + i * 0.06);
            }
        },

        // Generic click
        playGeneric: function() {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        },

        toggle: function() {
            this.enabled = !this.enabled;
            return this.enabled;
        }
    };

    // ========================================
    // Drag and Drop Manager
    // ========================================
    const DragDropManager = {
        draggedCard: null,
        draggedFrom: null,

        init: function() {
            this.bindEvents();
            Utils.debug('DragDropManager initialized');
        },

        bindEvents: function() {
            document.addEventListener('dragstart', (e) => this.handleDragStart(e));
            document.addEventListener('dragend', (e) => this.handleDragEnd(e));
            document.addEventListener('dragover', (e) => this.handleDragOver(e));
            document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            document.addEventListener('drop', (e) => this.handleDrop(e));
        },

        handleDragStart: function(e) {
            const card = e.target.closest('.card');
            if (!card) return;

            this.draggedCard = card;
            this.draggedFrom = card.closest('.zone');

            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.id || '');
        },

        handleDragEnd: function(e) {
            const card = e.target.closest('.card');
            if (card) {
                card.classList.remove('dragging');
            }

            // Remove all drag-over highlights
            document.querySelectorAll('.zone.drag-over').forEach(zone => {
                zone.classList.remove('drag-over');
            });

            this.draggedCard = null;
            this.draggedFrom = null;
        },

        handleDragOver: function(e) {
            const zone = e.target.closest('.zone');
            if (!zone || !this.draggedCard) return;

            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drag-over');
        },

        handleDragLeave: function(e) {
            const zone = e.target.closest('.zone');
            if (zone) {
                zone.classList.remove('drag-over');
            }
        },

        handleDrop: function(e) {
            const zone = e.target.closest('.zone');
            if (!zone || !this.draggedCard) return;

            e.preventDefault();
            zone.classList.remove('drag-over');

            // Only handle if dropping in a different zone
            if (zone !== this.draggedFrom) {
                this.moveCard(this.draggedCard, zone);
            }
        },

        moveCard: function(card, targetZone) {
            // Animation
            card.classList.add('playing');

            // Emit event for TCGArena integration
            document.dispatchEvent(new CustomEvent('alphaclash:card-move', {
                detail: {
                    card: card,
                    from: this.draggedFrom?.dataset.zone,
                    to: targetZone.dataset.zone
                }
            }));

            // Actually move the card (in standalone mode)
            targetZone.appendChild(card);

            setTimeout(() => card.classList.remove('playing'), CONFIG.animationDuration);

            SoundManager.play('card-play');
            Utils.debug('Moved card to', targetZone.dataset.zone);
        }
    };

    // ========================================
    // Keyboard Shortcuts
    // ========================================
    const KeyboardManager = {
        shortcuts: {
            't': 'tap',
            'f': 'flip',
            'v': 'view',
            'd': 'discard',
            'r': 'resource',
            'e': 'end-turn',
            ' ': 'next-phase',
            'Escape': 'cancel'
        },

        init: function() {
            document.addEventListener('keydown', (e) => this.handleKeypress(e));
            Utils.debug('KeyboardManager initialized');
        },

        handleKeypress: function(e) {
            // Ignore if typing in an input
            if (e.target.matches('input, textarea')) return;

            const action = this.shortcuts[e.key];
            if (!action) return;

            e.preventDefault();

            switch (action) {
                case 'tap':
                    this.tapSelectedCard();
                    break;
                case 'flip':
                    this.flipSelectedCard();
                    break;
                case 'view':
                    this.viewSelectedCard();
                    break;
                case 'end-turn':
                    TurnManager.endTurn();
                    break;
                case 'next-phase':
                    TurnManager.nextPhase();
                    break;
                case 'cancel':
                    CardZoom.hide();
                    ContextMenu.hide();
                    break;
            }
        },

        getSelectedCard: function() {
            return document.querySelector('.card.selected');
        },

        tapSelectedCard: function() {
            const card = this.getSelectedCard();
            if (card) card.classList.toggle('tapped');
        },

        flipSelectedCard: function() {
            const card = this.getSelectedCard();
            if (card) card.classList.toggle('face-down');
        },

        viewSelectedCard: function() {
            const card = this.getSelectedCard();
            if (card) CardZoom.show(card);
        }
    };

    // ========================================
    // Card Selection
    // ========================================
    const SelectionManager = {
        selectedCards: new Set(),

        init: function() {
            document.addEventListener('click', (e) => this.handleClick(e));
            Utils.debug('SelectionManager initialized');
        },

        handleClick: function(e) {
            const card = e.target.closest('.card');

            // Deselect all if clicking outside cards
            if (!card) {
                this.deselectAll();
                return;
            }

            // Handle card click
            if (e.ctrlKey || e.metaKey) {
                // Multi-select
                this.toggleSelection(card);
            } else {
                // Single select
                this.selectOnly(card);
            }
        },

        toggleSelection: function(card) {
            if (this.selectedCards.has(card)) {
                card.classList.remove('selected');
                this.selectedCards.delete(card);
            } else {
                card.classList.add('selected');
                this.selectedCards.add(card);
            }
        },

        selectOnly: function(card) {
            this.deselectAll();
            card.classList.add('selected');
            this.selectedCards.add(card);
        },

        deselectAll: function() {
            this.selectedCards.forEach(card => {
                card.classList.remove('selected');
            });
            this.selectedCards.clear();
        }
    };

    // ========================================
    // Initialize Application
    // ========================================
    function init() {
        Utils.debug('Initializing Alpha Clash...');

        // Initialize all managers
        CardZoom.init();
        ContextMenu.init();
        TokenManager.init();
        LifeCounter.init();
        TurnManager.init();
        SoundManager.init();
        DragDropManager.init();
        KeyboardManager.init();
        SelectionManager.init();

        // Set up card context menu listeners
        document.addEventListener('contextmenu', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                e.preventDefault();
                ContextMenu.show(card, e.clientX, e.clientY);
            }
        });

        // Set up card hover zoom
        document.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.card:not(.face-down)');
            if (card) {
                CardZoom.scheduleShow(card);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                CardZoom.cancelSchedule();
            }
        }, true);

        // Make cards draggable
        document.querySelectorAll('.card').forEach(card => {
            card.draggable = true;
        });

        Utils.debug('Alpha Clash initialized successfully!');
    }

    // ========================================
    // TCGArena Integration Hooks
    // ========================================
    window.AlphaClash = {
        // API for TCGArena integration
        version: '1.0.0',

        // Life management
        setLife: function(player, amount) {
            if (player === 'self') {
                LifeCounter.playerLife = amount;
            } else {
                LifeCounter.opponentLife = amount;
            }
            LifeCounter.updateDisplay(player === 'self' ? 'player' : 'opponent', amount);
        },

        changeLife: function(player, delta) {
            LifeCounter.changeLife(player, delta);
        },

        // Turn management
        setTurn: function(turnNumber) {
            TurnManager.currentTurn = turnNumber;
            TurnManager.updateDisplay();
        },

        setPhase: function(phase) {
            TurnManager.currentPhase = phase;
            TurnManager.updateDisplay();
        },

        // Token management
        addToken: function(cardElement, tokenId) {
            TokenManager.addToken(cardElement, tokenId);
        },

        removeToken: function(cardElement, tokenId) {
            TokenManager.removeToken(cardElement, tokenId);
        },

        // Sound management
        playSound: function(soundName) {
            SoundManager.play(soundName);
        },

        toggleSound: function() {
            return SoundManager.toggle();
        },

        // Card zoom
        showCard: function(cardElement) {
            CardZoom.show(cardElement);
        },

        // Debug mode
        enableDebug: function() {
            CONFIG.debug = true;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Text-to-Speech Module cho ứng dụng học tiếng Nhật
class JapaneseTTS {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;
        this.isPlaying = false;
        this.currentUtterance = null;
        
        // Settings mặc định
        this.settings = {
            rate: 0.8,        // Tốc độ nói (0.1 - 10)
            pitch: 1.0,       // Cao độ giọng (0 - 2)
            volume: 0.8,      // Âm lượng (0 - 1)
            voice: null,      // Giọng được chọn
            autoPlay: false   // Tự động phát khi lật thẻ
        };
        
        this.loadSettings();
        this.initVoices();
    }

    // Khởi tạo danh sách giọng
    initVoices() {
        if (!this.isSupported) {
            console.warn('Speech Synthesis không được hỗ trợ trên trình duyệt này');
            return;
        }

        // Đợi voices load xong
        if (this.synth.getVoices().length === 0) {
            this.synth.addEventListener('voiceschanged', () => {
                this.setupVoices();
            });
        } else {
            this.setupVoices();
        }
    }

    // Thiết lập danh sách giọng
    setupVoices() {
        const voices = this.synth.getVoices();
        
        // Tìm giọng tiếng Nhật tốt nhất
        const japaneseVoices = voices.filter(voice => 
            voice.lang.startsWith('ja') || 
            voice.name.includes('Japanese') ||
            voice.name.includes('ja-JP')
        );

        // Ưu tiên giọng chất lượng cao
        const preferredVoices = [
            'ja-JP-Standard-A',    // Google Chrome
            'ja-JP-Standard-B',    // Google Chrome
            'Kyoko',                // macOS
            'Otoya',               // macOS
            'ja-JP-Wavenet-A',     // Google Cloud
            'ja-JP-Wavenet-B'      // Google Cloud
        ];

        for (const preferredName of preferredVoices) {
            const voice = japaneseVoices.find(v => v.name.includes(preferredName));
            if (voice) {
                this.settings.voice = voice;
                break;
            }
        }

        // Nếu không tìm thấy giọng ưa thích, dùng giọng đầu tiên
        if (!this.settings.voice && japaneseVoices.length > 0) {
            this.settings.voice = japaneseVoices[0];
        }

        console.log('TTS Voices loaded:', {
            total: voices.length,
            japanese: japaneseVoices.length,
            selected: this.settings.voice?.name || 'Default'
        });
    }

    // Phát âm từ tiếng Nhật
    speakJapanese(text, options = {}) {
        if (!this.isSupported) {
            this.showUnsupportedMessage();
            return Promise.reject('TTS không được hỗ trợ');
        }

        // Dừng phát âm hiện tại nếu có
        this.stop();

        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Áp dụng settings
                utterance.rate = options.rate || this.settings.rate;
                utterance.pitch = options.pitch || this.settings.pitch;
                utterance.volume = options.volume || this.settings.volume;
                utterance.voice = this.settings.voice;
                utterance.lang = 'ja-JP';

                // Event handlers
                utterance.onstart = () => {
                    this.isPlaying = true;
                    this.currentUtterance = utterance;
                    this.onPlayStart?.(text);
                };

                utterance.onend = () => {
                    this.isPlaying = false;
                    this.currentUtterance = null;
                    this.onPlayEnd?.(text);
                    resolve(text);
                };

                utterance.onerror = (event) => {
                    this.isPlaying = false;
                    this.currentUtterance = null;
                    console.error('TTS Error:', event.error);
                    this.onPlayError?.(event.error);
                    reject(event.error);
                };

                // Phát âm
                this.synth.speak(utterance);

            } catch (error) {
                console.error('TTS Speak Error:', error);
                reject(error);
            }
        });
    }

    // Phát âm từ vựng (tiếng Nhật + nghĩa tiếng Việt)
    speakVocabulary(vocabItem, options = {}) {
        const promises = [];
        
        // Phát âm tiếng Nhật
        if (vocabItem.japanese) {
            promises.push(this.speakJapanese(vocabItem.japanese, options));
        }

        // Phát âm nghĩa tiếng Việt (nếu có)
        if (options.includeVietnamese && vocabItem.vietnamese) {
            promises.push(this.speakVietnamese(vocabItem.vietnamese, options));
        }

        return Promise.all(promises);
    }

    // Phát âm tiếng Việt
    speakVietnamese(text, options = {}) {
        if (!this.isSupported) {
            return Promise.reject('TTS không được hỗ trợ');
        }

        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                
                utterance.rate = options.rate || this.settings.rate;
                utterance.pitch = options.pitch || this.settings.pitch;
                utterance.volume = options.volume || this.settings.volume;
                utterance.lang = 'vi-VN'; // Tiếng Việt

                utterance.onend = () => resolve(text);
                utterance.onerror = (event) => reject(event.error);

                this.synth.speak(utterance);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Dừng phát âm
    stop() {
        if (this.isPlaying) {
            this.synth.cancel();
            this.isPlaying = false;
            this.currentUtterance = null;
        }
    }

    // Kiểm tra trạng thái phát âm
    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    // Cập nhật settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    // Lưu settings vào localStorage
    saveSettings() {
        try {
            localStorage.setItem('japaneseTTS_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Không thể lưu TTS settings:', error);
        }
    }

    // Load settings từ localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('japaneseTTS_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.warn('Không thể load TTS settings:', error);
        }
    }

    // Lấy danh sách giọng tiếng Nhật
    getJapaneseVoices() {
        if (!this.isSupported) return [];
        
        const voices = this.synth.getVoices();
        return voices.filter(voice => 
            voice.lang.startsWith('ja') || 
            voice.name.includes('Japanese') ||
            voice.name.includes('ja-JP')
        );
    }

    // Thay đổi giọng
    setVoice(voiceName) {
        const voices = this.getJapaneseVoices();
        const voice = voices.find(v => v.name === voiceName);
        
        if (voice) {
            this.settings.voice = voice;
            this.saveSettings();
            return true;
        }
        return false;
    }

    // Tạo UI controls cho TTS
    createTTSControls(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const controlsHTML = `
            <div class="tts-controls bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-800 flex items-center">
                        <span class="mr-2">🔊</span>
                        Phát âm
                    </h4>
                    <div class="flex items-center space-x-2">
                        <label class="flex items-center text-sm">
                            <input type="checkbox" id="tts-auto-play" class="mr-1">
                            Tự động phát
                        </label>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tốc độ</label>
                        <input type="range" id="tts-rate" min="0.5" max="1.5" step="0.1" 
                               value="${this.settings.rate}" 
                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <div class="text-xs text-gray-500 mt-1">
                            <span id="tts-rate-value">${this.settings.rate}</span>x
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cao độ</label>
                        <input type="range" id="tts-pitch" min="0.5" max="1.5" step="0.1" 
                               value="${this.settings.pitch}" 
                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <div class="text-xs text-gray-500 mt-1">
                            <span id="tts-pitch-value">${this.settings.pitch}</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Âm lượng</label>
                        <input type="range" id="tts-volume" min="0.1" max="1.0" step="0.1" 
                               value="${this.settings.volume}" 
                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <div class="text-xs text-gray-500 mt-1">
                            <span id="tts-volume-value">${Math.round(this.settings.volume * 100)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Giọng</label>
                    <select id="tts-voice" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Đang tải giọng...</option>
                    </select>
                </div>
                
                <div class="flex space-x-2">
                    <button id="tts-play-btn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center">
                        <span class="mr-2">▶️</span>
                        Phát âm
                    </button>
                    <button id="tts-stop-btn" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                        ⏹️
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = controlsHTML;
        this.setupTTSControls(options);
    }

    // Thiết lập event listeners cho TTS controls
    setupTTSControls(options = {}) {
        // Auto-play checkbox
        const autoPlayCheckbox = document.getElementById('tts-auto-play');
        if (autoPlayCheckbox) {
            autoPlayCheckbox.checked = this.settings.autoPlay;
            autoPlayCheckbox.addEventListener('change', (e) => {
                this.updateSettings({ autoPlay: e.target.checked });
            });
        }

        // Rate slider
        const rateSlider = document.getElementById('tts-rate');
        const rateValue = document.getElementById('tts-rate-value');
        if (rateSlider && rateValue) {
            rateSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                rateValue.textContent = value;
                this.updateSettings({ rate: value });
            });
        }

        // Pitch slider
        const pitchSlider = document.getElementById('tts-pitch');
        const pitchValue = document.getElementById('tts-pitch-value');
        if (pitchSlider && pitchValue) {
            pitchSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                pitchValue.textContent = value;
                this.updateSettings({ pitch: value });
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('tts-volume');
        const volumeValue = document.getElementById('tts-volume-value');
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                volumeValue.textContent = Math.round(value * 100) + '%';
                this.updateSettings({ volume: value });
            });
        }

        // Voice selector
        const voiceSelect = document.getElementById('tts-voice');
        if (voiceSelect) {
            this.populateVoiceSelector(voiceSelect);
            voiceSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.setVoice(e.target.value);
                }
            });
        }

        // Play button
        const playBtn = document.getElementById('tts-play-btn');
        if (playBtn && options.onPlay) {
            playBtn.addEventListener('click', options.onPlay);
        }

        // Stop button
        const stopBtn = document.getElementById('tts-stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }
    }

    // Populate voice selector
    populateVoiceSelector(selectElement) {
        const voices = this.getJapaneseVoices();
        
        if (voices.length === 0) {
            selectElement.innerHTML = '<option value="">Không có giọng tiếng Nhật</option>';
            return;
        }

        selectElement.innerHTML = voices.map(voice => 
            `<option value="${voice.name}" ${voice.name === this.settings.voice?.name ? 'selected' : ''}>
                ${voice.name} (${voice.lang})
            </option>`
        ).join('');
    }

    // Hiển thị thông báo không hỗ trợ
    showUnsupportedMessage() {
        // Tạo toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">⚠️</span>
                <span>Trình duyệt không hỗ trợ Text-to-Speech</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Tạo nút phát âm đơn giản
    createSimplePlayButton(text, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const button = document.createElement('button');
        button.className = 'tts-play-btn bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center';
        button.innerHTML = `
            <span class="mr-1">🔊</span>
            Phát âm
        `;
        
        button.addEventListener('click', async () => {
            try {
                button.disabled = true;
                button.innerHTML = '<span class="mr-1">⏳</span>Đang phát...';
                
                await this.speakJapanese(text, options);
                
                button.innerHTML = '<span class="mr-1">✅</span>Hoàn thành';
                setTimeout(() => {
                    button.innerHTML = '<span class="mr-1">🔊</span>Phát âm';
                    button.disabled = false;
                }, 1000);
                
            } catch (error) {
                button.innerHTML = '<span class="mr-1">❌</span>Lỗi';
                setTimeout(() => {
                    button.innerHTML = '<span class="mr-1">🔊</span>Phát âm';
                    button.disabled = false;
                }, 2000);
            }
        });

        container.appendChild(button);
        return button;
    }
}

// Export cho sử dụng global
window.JapaneseTTS = JapaneseTTS;

// Ứng dụng Flashcard tiếng Nhật
class FlashcardApp {
    constructor() {
        this.vocabularyData = [];
        this.currentLessonData = [];
        this.originalLessonData = []; // Lưu danh sách gốc để có thể reset
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.currentLesson = 0;
        this.displayMode = 'jp-vn'; // 'jp-vn' hoặc 'vn-jp'
        this.isShuffled = false; // Theo dõi trạng thái shuffle
        this.userProgress = this.loadProgress();
        
        this.init();
    }

    async init() {
        await this.loadVocabularyData();
        this.setupEventListeners();
        
        // Kiểm tra xem có dữ liệu từ lessons page không
        if (!this.loadCurrentLessonData()) {
            this.renderLessons();
        }
    }

    // Load dữ liệu từ vựng từ localStorage hoặc fetch từ server
    async loadVocabularyData() {
        const lessons = [
            'introduction_vocabulary.json',
            'lesson_1_vocabulary.json',
            'lesson_2_vocabulary.json',
            'lesson_3_vocabulary.json',
            'lesson_4_vocabulary.json',
            'lesson_5_vocabulary.json',
            'lesson_6_vocabulary.json',
            'lesson_7_vocabulary.json',
            'lesson_8_vocabulary.json',
            'lesson_9_vocabulary.json',
            'lesson_10_vocabulary.json',
            'lesson_11_vocabulary.json',
            'lesson_12_vocabulary.json',
            'lesson_13_vocabulary.json',
            'lesson_14_vocabulary.json',
            'lesson_15_vocabulary.json',
            'lesson_16_vocabulary.json',
            'lesson_17_vocabulary.json',
            'lesson_18_vocabulary.json',
            'lesson_19_vocabulary.json',
            'lesson_20_vocabulary.json',
            'lesson_21_vocabulary.json',
            'lesson_22_vocabulary.json'
        ];

        // Kiểm tra localStorage trước
        const cachedData = localStorage.getItem('japaneseVocabData');
        if (cachedData) {
            try {
                this.vocabularyData = JSON.parse(cachedData);
                console.log('Loaded vocabulary data from localStorage (flashcard)');
                return;
            } catch (error) {
                console.warn('Error parsing cached data, fetching from server:', error);
                localStorage.removeItem('japaneseVocabData');
            }
        }

        // Nếu không có trong localStorage, fetch từ server
        console.log('Fetching vocabulary data from server (flashcard)...');
        for (let i = 0; i < lessons.length; i++) {
            try {
                const response = await fetch(`data/${lessons[i]}`);
                const data = await response.json();
                
                this.vocabularyData.push({
                    lesson: i === 0 ? 'Introduction' : `Lesson ${i}`,
                    lessonNumber: i,
                    words: data,
                    totalWords: data.length
                });
            } catch (error) {
                console.error(`Lỗi khi tải ${lessons[i]}:`, error);
            }
        }

        // Lưu vào localStorage để lần sau load nhanh hơn
        this.saveVocabularyDataToCache();
    }

    // Lưu dữ liệu từ vựng vào localStorage
    saveVocabularyDataToCache() {
        try {
            localStorage.setItem('japaneseVocabData', JSON.stringify(this.vocabularyData));
            console.log('Vocabulary data saved to localStorage cache (flashcard)');
        } catch (error) {
            console.warn('Could not save vocabulary data to localStorage:', error);
        }
    }

    setupEventListeners() {
        // Flashcard controls
        document.getElementById('flashcard')?.addEventListener('click', () => this.flipCard());
        document.getElementById('difficult-btn')?.addEventListener('click', () => this.markDifficult());
        document.getElementById('normal-btn')?.addEventListener('click', () => this.markNormal());
        document.getElementById('easy-btn')?.addEventListener('click', () => this.markEasy());
        document.getElementById('next-card-btn')?.addEventListener('click', () => this.nextCard());
        document.getElementById('prev-card-btn')?.addEventListener('click', () => this.prevCard());
        document.getElementById('shuffle-btn')?.addEventListener('click', () => this.shuffleWords());
        
        // Back button
        const backButton = document.querySelector('.back-btn');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextCard();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevCard();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.flipCard();
                    break;
                case '1':
                    e.preventDefault();
                    this.markDifficult();
                    break;
                case '2':
                    e.preventDefault();
                    this.markNormal();
                    break;
                case '3':
                    e.preventDefault();
                    this.markEasy();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.shuffleWords();
                    break;
            }
        });

        // Mode selector
        document.getElementById('jp-vn-mode')?.addEventListener('click', () => this.setDisplayMode('jp-vn'));
        document.getElementById('vn-jp-mode')?.addEventListener('click', () => this.setDisplayMode('vn-jp'));

        // Lesson selection
        document.addEventListener('click', (e) => {
            const lessonItem = e.target.closest('.lesson-item');
            if (lessonItem) {
                e.preventDefault();
                const lessonNumber = parseInt(lessonItem.dataset.lesson);
                this.selectLesson(lessonNumber);
            }
        });
    }

    // Render danh sách bài học
    renderLessons() {
        const container = document.getElementById('lessons-container');
        if (!container) return;

        container.innerHTML = this.vocabularyData.map((lesson, index) => `
            <div class="lesson-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border-l-4 border-blue-500" data-lesson="${index}">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-800">${lesson.lesson}</h3>
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        ${lesson.totalWords} từ
                    </span>
                </div>
                <p class="text-gray-600 text-sm mb-3">${lesson.totalWords} từ vựng</p>
                <div class="flex items-center text-blue-600 text-sm font-medium">
                    <span class="mr-1">📚</span>
                    Bắt đầu học
                </div>
            </div>
        `).join('');
    }

    // Thiết lập chế độ hiển thị
    setDisplayMode(mode) {
        this.displayMode = mode;
        
        // Cập nhật UI buttons
        const jpVnBtn = document.getElementById('jp-vn-mode');
        const vnJpBtn = document.getElementById('vn-jp-mode');
        
        if (jpVnBtn && vnJpBtn) {
            if (mode === 'jp-vn') {
                jpVnBtn.classList.add('active');
                vnJpBtn.classList.remove('active');
            } else {
                vnJpBtn.classList.add('active');
                jpVnBtn.classList.remove('active');
            }
        }
        
        // Reload flashcard với mode mới
        this.loadFlashcard();
        
        // Lưu preference
        this.saveDisplayModePreference(mode);
    }

    // Chọn bài học
    selectLesson(lessonNumber) {
        this.currentLesson = lessonNumber;
        this.originalLessonData = [...this.vocabularyData[lessonNumber].words]; // Lưu bản sao gốc
        this.currentLessonData = [...this.originalLessonData]; // Tạo bản sao để làm việc
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.isShuffled = false; // Reset trạng thái shuffle
        
        // Load display mode preference
        this.loadDisplayModePreference();
        
        // Ẩn lesson selection và hiện flashcard interface
        document.getElementById('lesson-selection').classList.add('hidden');
        document.getElementById('flashcard-interface').classList.remove('hidden');
        
        // Cập nhật thông tin bài học
        document.getElementById('lesson-title').textContent = this.vocabularyData[lessonNumber].lesson;
        
        this.updateShuffleButtonText();
        this.loadFlashcard();
    }

    // Load dữ liệu từ localStorage nếu có (từ lessons page)
    loadCurrentLessonData() {
        const savedData = localStorage.getItem('currentLessonData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentLesson = data.lessonId;
            this.originalLessonData = [...data.words]; // Lưu bản sao gốc
            this.currentLessonData = [...this.originalLessonData]; // Tạo bản sao để làm việc
            this.currentCardIndex = 0;
            this.isCardFlipped = false;
            this.isShuffled = false; // Reset trạng thái shuffle
            
            // Load display mode preference
            this.loadDisplayModePreference();
            
            // Ẩn lesson selection và hiện flashcard interface
            document.getElementById('lesson-selection').classList.add('hidden');
            document.getElementById('flashcard-interface').classList.remove('hidden');
            
            // Cập nhật thông tin bài học
            document.getElementById('lesson-title').textContent = data.lessonName;
            
            this.updateShuffleButtonText();
            this.loadFlashcard();
            
            // Xóa dữ liệu tạm thời
            localStorage.removeItem('currentLessonData');
            return true;
        }
        return false;
    }

    // Load thẻ flashcard hiện tại
    loadFlashcard() {
        if (this.currentLessonData.length === 0) return;
        
        const word = this.currentLessonData[this.currentCardIndex];
        const progress = `${this.currentCardIndex + 1}/${this.currentLessonData.length}`;
        
        // Cập nhật tiến độ
        document.getElementById('card-progress').textContent = progress;
        
        // Reset card state
        this.isCardFlipped = false;
        const card = document.getElementById('flashcard');
        if (card) card.classList.remove('flipped');
        
        // Cập nhật nội dung thẻ dựa trên display mode
        if (this.displayMode === 'jp-vn') {
            // Mặt trước: Tiếng Nhật, Mặt sau: Tiếng Việt
            this.loadJapaneseVietnameseMode(word);
        } else {
            // Mặt trước: Tiếng Việt, Mặt sau: Tiếng Nhật
            this.loadVietnameseJapaneseMode(word);
        }
    }

    // Load mode Nhật-Việt (mặt trước tiếng Nhật)
    loadJapaneseVietnameseMode(word) {
        // Mặt trước: Tiếng Nhật + Kanji
        document.getElementById('japanese-word').textContent = word.japanese || '';
        
        // Show Kanji on front if available
        const kanjiTextEl = document.getElementById('kanji-text');
        if (kanjiTextEl) {
            const hasKanji = typeof word.kanji === 'string' && word.kanji.trim().length > 0;
            kanjiTextEl.textContent = hasKanji ? word.kanji : '';
            kanjiTextEl.classList.toggle('hidden', !hasKanji);
        }

        // Mặt sau: Tiếng Việt + thông tin bổ sung
        document.getElementById('vietnamese-meaning').textContent = word.vietnamese || '';
        document.getElementById('romanji-text').textContent = word.romanji || '';
        document.getElementById('usage-note').textContent = word.example || '';

        // Cập nhật hướng dẫn cho mặt trước và sau
        this.updateCardInstructions('Nhấn Enter hoặc click để xem nghĩa', 'Nhấn để xem lại tiếng Nhật');

        // Show Hán-Việt meanings on back if available
        const hvSection = document.getElementById('hanviet-section');
        const hvList = document.getElementById('hanviet-list');
        if (hvSection && hvList) {
            const list = Array.isArray(word.kanji_search_results) ? word.kanji_search_results.slice(0, 5) : [];
            if (list.length) {
                hvList.innerHTML = list.map(r => `
                    <div class=\"text-sm text-gray-700\"><span class=\"japanese-text mr-2\">${r.kanji}</span><span class=\"text-gray-600\">${r.mean}</span></div>
                `).join('');
                hvSection.classList.remove('hidden');
            } else {
                hvList.innerHTML = '';
                hvSection.classList.add('hidden');
            }
        }
    }

    // Load mode Việt-Nhật (mặt trước tiếng Việt)
    loadVietnameseJapaneseMode(word) {
        // Mặt trước: Tiếng Việt
        document.getElementById('japanese-word').textContent = word.vietnamese || '';
        
        // Ẩn kanji trên mặt trước khi mode Việt-Nhật
        const kanjiTextEl = document.getElementById('kanji-text');
        if (kanjiTextEl) {
            kanjiTextEl.textContent = '';
            kanjiTextEl.classList.add('hidden');
        }

        // Mặt sau: Tiếng Nhật + thông tin bổ sung
        const japaneseText = word.japanese || '';
        const kanjiText = (typeof word.kanji === 'string' && word.kanji.trim().length > 0) ? 
                         ` (${word.kanji})` : '';
        document.getElementById('vietnamese-meaning').textContent = japaneseText + kanjiText;
        
        document.getElementById('romanji-text').textContent = word.romanji || '';
        document.getElementById('usage-note').textContent = word.example || '';

        // Cập nhật hướng dẫn cho mặt trước và sau (ngược lại so với jp-vn)
        this.updateCardInstructions('Nhấn Enter hoặc click để xem từ tiếng Nhật', 'Nhấn để xem lại nghĩa tiếng Việt');

        // Show Hán-Việt meanings on back if available
        const hvSection = document.getElementById('hanviet-section');
        const hvList = document.getElementById('hanviet-list');
        if (hvSection && hvList) {
            const list = Array.isArray(word.kanji_search_results) ? word.kanji_search_results.slice(0, 5) : [];
            if (list.length) {
                hvList.innerHTML = list.map(r => `
                    <div class=\"text-sm text-gray-700\"><span class=\"japanese-text mr-2\">${r.kanji}</span><span class=\"text-gray-600\">${r.mean}</span></div>
                `).join('');
                hvSection.classList.remove('hidden');
            } else {
                hvList.innerHTML = '';
                hvSection.classList.add('hidden');
            }
        }
    }

    // Cập nhật text hướng dẫn cho mặt trước và sau
    updateCardInstructions(frontInstruction, backInstruction) {
        // Tìm và cập nhật text hướng dẫn mặt trước
        const frontInstructionEl = document.getElementById('front-instruction');
        if (frontInstructionEl) {
            frontInstructionEl.textContent = frontInstruction;
        }
        
        // Tìm và cập nhật text hướng dẫn mặt sau
        const backInstructionEl = document.getElementById('back-instruction');
        if (backInstructionEl) {
            backInstructionEl.textContent = backInstruction;
        }
    }

    // Lật thẻ
    flipCard() {
        const card = document.getElementById('flashcard');
        if (!card) return;
        this.isCardFlipped = !this.isCardFlipped;
        if (this.isCardFlipped) {
            card.classList.add('flipped');
        } else {
            card.classList.remove('flipped');
        }
    }

    // Chuyển sang thẻ tiếp theo
    nextCard() {
        this.currentCardIndex = (this.currentCardIndex + 1) % this.currentLessonData.length;
        this.loadFlashcard();
        
        // Cập nhật tiến độ học
        this.updateStudyProgress();
    }

    // Chuyển về thẻ trước đó
    prevCard() {
        this.currentCardIndex = this.currentCardIndex === 0 ? 
            this.currentLessonData.length - 1 : 
            this.currentCardIndex - 1;
        this.loadFlashcard();
    }

    // Đánh dấu từ khó
    markDifficult() {
        this.recordWordDifficulty('difficult');
        this.nextCard();
    }

    // Đánh dấu từ bình thường
    markNormal() {
        this.recordWordDifficulty('normal');
        this.nextCard();
    }

    // Đánh dấu từ dễ
    markEasy() {
        this.recordWordDifficulty('easy');
        this.nextCard();
    }

    // Ghi nhận độ khó của từ
    recordWordDifficulty(difficulty) {
        const word = this.currentLessonData[this.currentCardIndex];
        const wordId = `${word.japanese}-${word.vietnamese}`;
        
        if (!this.userProgress.studiedWords.includes(wordId)) {
            this.userProgress.studiedWords.push(wordId);
            this.userProgress.totalWordsStudied++;
        }
        
        // Cập nhật độ khó
        this.userProgress.wordDifficulties[wordId] = difficulty;
        
        // Lưu tiến độ
        this.saveProgress();
    }

    // Cập nhật tiến độ học
    updateStudyProgress() {
        const studiedWords = this.userProgress.studiedWords.length;
        const totalWords = this.vocabularyData.reduce((total, lesson) => total + lesson.totalWords, 0);
        
        // Có thể thêm logic cập nhật UI tiến độ ở đây
        console.log(`Đã học: ${studiedWords}/${totalWords} từ`);
    }

    // Load tiến độ từ localStorage
    loadProgress() {
        const saved = localStorage.getItem('japaneseVocabProgress');
        return saved ? JSON.parse(saved) : {
            studiedWords: [],
            totalWordsStudied: 0,
            wordDifficulties: {},
            completedLessons: []
        };
    }

    // Lưu tiến độ vào localStorage
    saveProgress() {
        localStorage.setItem('japaneseVocabProgress', JSON.stringify(this.userProgress));
    }

    // Lưu display mode preference
    saveDisplayModePreference(mode) {
        try {
            localStorage.setItem('flashcardDisplayMode', mode);
        } catch (error) {
            console.warn('Could not save display mode preference:', error);
        }
    }

    // Load display mode preference
    loadDisplayModePreference() {
        try {
            const savedMode = localStorage.getItem('flashcardDisplayMode');
            if (savedMode && (savedMode === 'jp-vn' || savedMode === 'vn-jp')) {
                this.displayMode = savedMode;
                
                // Cập nhật UI buttons
                const jpVnBtn = document.getElementById('jp-vn-mode');
                const vnJpBtn = document.getElementById('vn-jp-mode');
                
                if (jpVnBtn && vnJpBtn) {
                    if (savedMode === 'jp-vn') {
                        jpVnBtn.classList.add('active');
                        vnJpBtn.classList.remove('active');
                    } else {
                        vnJpBtn.classList.add('active');
                        jpVnBtn.classList.remove('active');
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load display mode preference:', error);
            this.displayMode = 'jp-vn'; // Default fallback
        }
    }

    // Xáo trộn danh sách từ
    shuffleWords() {
        if (this.originalLessonData.length === 0) return;
        
        if (this.isShuffled) {
            // Nếu đang shuffle, reset về thứ tự gốc
            this.resetToOriginalOrder();
        } else {
            // Nếu chưa shuffle, thực hiện shuffle
            this.performShuffle();
        }
        
        this.updateShuffleButtonText();
        this.showShuffleNotification();
    }

    // Thực hiện shuffle với Fisher-Yates algorithm
    performShuffle() {
        // Tạo bản sao mới từ danh sách gốc
        this.currentLessonData = [...this.originalLessonData];
        
        // Fisher-Yates shuffle algorithm
        for (let i = this.currentLessonData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentLessonData[i], this.currentLessonData[j]] = 
            [this.currentLessonData[j], this.currentLessonData[i]];
        }
        
        this.currentCardIndex = 0; // Reset về thẻ đầu tiên
        this.isShuffled = true;
        this.loadFlashcard();
    }

    // Reset về thứ tự gốc
    resetToOriginalOrder() {
        this.currentLessonData = [...this.originalLessonData];
        this.currentCardIndex = 0; // Reset về thẻ đầu tiên
        this.isShuffled = false;
        this.loadFlashcard();
    }

    // Cập nhật text của nút shuffle
    updateShuffleButtonText() {
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            if (this.isShuffled) {
                shuffleBtn.innerHTML = '↺ Thứ tự gốc';
                shuffleBtn.className = 'bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 font-medium';
            } else {
                shuffleBtn.innerHTML = '🔀 Xáo trộn';
                shuffleBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 font-medium';
            }
        }
    }

    // Hiển thị thông báo shuffle/reset
    showShuffleNotification() {
        const message = this.isShuffled ? 
            '🔀 Đã xáo trộn danh sách từ!' : 
            '↺ Đã khôi phục thứ tự gốc!';
        
        // Tạo thông báo tạm thời
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-full';
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        // Hiển thị thông báo
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Ẩn thông báo sau 2.5 giây
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }

    // Quay về chọn bài học
    backToLessons() {
        document.getElementById('lesson-selection').classList.remove('hidden');
        document.getElementById('flashcard-interface').classList.add('hidden');
    }
}

// Disable double-click globally
document.addEventListener('dblclick', (event) => {
    event.preventDefault();
    return false;
}, false);

// Disable double-tap zoom globally for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new FlashcardApp();
});

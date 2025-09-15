// Ứng dụng Flashcard tiếng Nhật
class FlashcardApp {
    constructor() {
        this.vocabularyData = [];
        this.currentLessonData = [];
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.currentLesson = 0;
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
            }
        });

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

    // Chọn bài học
    selectLesson(lessonNumber) {
        this.currentLesson = lessonNumber;
        this.currentLessonData = this.vocabularyData[lessonNumber].words;
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        
        // Ẩn lesson selection và hiện flashcard interface
        document.getElementById('lesson-selection').classList.add('hidden');
        document.getElementById('flashcard-interface').classList.remove('hidden');
        
        // Cập nhật thông tin bài học
        document.getElementById('lesson-title').textContent = this.vocabularyData[lessonNumber].lesson;
        
        this.loadFlashcard();
    }

    // Load dữ liệu từ localStorage nếu có (từ lessons page)
    loadCurrentLessonData() {
        const savedData = localStorage.getItem('currentLessonData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentLesson = data.lessonId;
            this.currentLessonData = data.words;
            this.currentCardIndex = 0;
            this.isCardFlipped = false;
            
            // Ẩn lesson selection và hiện flashcard interface
            document.getElementById('lesson-selection').classList.add('hidden');
            document.getElementById('flashcard-interface').classList.remove('hidden');
            
            // Cập nhật thông tin bài học
            document.getElementById('lesson-title').textContent = data.lessonName;
            
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
        
        // Cập nhật nội dung thẻ
        document.getElementById('japanese-word').textContent = word.japanese || '';
        document.getElementById('vietnamese-meaning').textContent = word.vietnamese || '';
        document.getElementById('romanji-text').textContent = word.romanji || '';
        document.getElementById('usage-note').textContent = word.example || '';

        // Show Kanji on front if available
        const kanjiTextEl = document.getElementById('kanji-text');
        if (kanjiTextEl) {
            const hasKanji = typeof word.kanji === 'string' && word.kanji.trim().length > 0;
            kanjiTextEl.textContent = hasKanji ? word.kanji : '';
            kanjiTextEl.classList.toggle('hidden', !hasKanji);
        }

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

    // Quay về chọn bài học
    backToLessons() {
        document.getElementById('lesson-selection').classList.remove('hidden');
        document.getElementById('flashcard-interface').classList.add('hidden');
    }
}

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new FlashcardApp();
});

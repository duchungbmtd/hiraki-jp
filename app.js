// Ứng dụng học từ vựng tiếng Nhật - Main App (Cleaned)
class JapaneseVocabApp {
    constructor() {
        this.vocabularyData = [];
        this.currentLessonData = [];
        this.currentLesson = 0;
        this.userProgress = this.loadProgress();
        this.filteredVocabulary = [];
        
        this.init();
    }

    async init() {
        await this.loadVocabularyData();
        this.setupEventListeners();
        this.showDashboard();
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
                console.log('Loaded vocabulary data from localStorage (index)');
                return;
            } catch (error) {
                console.warn('Error parsing cached data, fetching from server:', error);
                localStorage.removeItem('japaneseVocabData');
            }
        }

        // Nếu không có trong localStorage, fetch từ server
        console.log('Fetching vocabulary data from server (index)...');
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
            console.log('Vocabulary data saved to localStorage cache (index)');
        } catch (error) {
            console.warn('Could not save vocabulary data to localStorage:', error);
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('lessons-btn')?.addEventListener('click', () => this.showLessons());
        document.getElementById('flashcard-btn')?.addEventListener('click', () => this.showFlashcard());
        document.getElementById('quiz-btn')?.addEventListener('click', () => this.showQuiz());
        document.getElementById('verb-conjugation-btn')?.addEventListener('click', () => this.showVerbConjugation());
        
        // Reload data button
        document.getElementById('reload-data-btn')?.addEventListener('click', () => this.reloadData());
        
        // Vocabulary list controls removed - now handled in separate pages
    }

    // Hiển thị Dashboard
    showDashboard() {
        this.hideAllViews();
        document.getElementById('dashboard').classList.remove('hidden');
        this.updateDashboardStats();
    }

    // Hiển thị danh sách bài học (redirect to separate page)
    showLessons() {
        window.location.href = 'lessons.html';
    }

    // Lessons methods removed - now handled in lessons.js

    // Hiển thị Flashcard (redirect to separate page)
    showFlashcard() {
        window.location.href = 'flashcard.html';
    }

    // Hiển thị Quiz (redirect to separate page)
    showQuiz() {
        window.location.href = 'quiz.html';
    }

    // Hiển thị trang chia động từ (redirect to separate page)
    showVerbConjugation() {
        window.location.href = 'verb_conjugation.html';
    }

    // Cập nhật thống kê dashboard
    updateDashboardStats() {
        if (!this.vocabularyData || this.vocabularyData.length === 0) {
            console.warn('Vocabulary data not loaded yet');
            return;
        }
        
        if (!this.userProgress) {
            this.userProgress = this.loadProgress();
        }
        
        const totalWords = this.vocabularyData.reduce((total, lesson) => total + lesson.totalWords, 0);
        const studiedWords = this.userProgress.studiedWords ? this.userProgress.studiedWords.length : 0;
        const completedLessons = this.userProgress.completedLessons ? this.userProgress.completedLessons.length : 0;
        
        document.getElementById('words-studied').textContent = studiedWords;
        document.getElementById('accuracy-rate').textContent = 
            studiedWords > 0 ? `${Math.round((studiedWords / totalWords) * 100)}%` : '0%';
        document.getElementById('streak-days').textContent = this.userProgress.streakDays || 0;
        
        // Cập nhật số lượng bài học trong card
        const totalLessons = this.vocabularyData.length;
        document.getElementById('total-lessons-text').textContent = `${totalLessons} bài từ cơ bản đến nâng cao`;
    }

    // Cập nhật tiến độ học
    updateStudyProgress() {
        if (!this.userProgress || !this.userProgress.studiedWords) {
            console.warn('User progress not initialized');
            return;
        }
        
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
            completedLessons: [],
            streakDays: 0,
            lastStudyDate: null
        };
    }

    // Lưu tiến độ vào localStorage
    saveProgress() {
        localStorage.setItem('japaneseVocabProgress', JSON.stringify(this.userProgress));
    }


    // Xóa localStorage và reload trang
    reloadData() {
        // Xóa tất cả dữ liệu liên quan đến ứng dụng
        localStorage.removeItem('japaneseVocabProgress');
        localStorage.removeItem('japaneseVocabData'); // Cache dữ liệu từ vựng
        localStorage.removeItem('currentLessonData');
        localStorage.removeItem('currentQuizData');
        localStorage.removeItem('flashcardProgress');
        localStorage.removeItem('quizProgress');
        
        // Reload trang để đảm bảo tất cả dữ liệu được refresh
        window.location.reload();
    }

    // Ẩn tất cả các view
    hideAllViews() {
        const views = ['dashboard'];
        views.forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }
}

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JapaneseVocabApp();
});

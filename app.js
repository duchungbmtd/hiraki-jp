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
        this.updateProgressDisplay();
    }

    // Load dữ liệu từ vựng từ tất cả các file JSON
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
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('lessons-btn')?.addEventListener('click', () => this.showLessons());
        document.getElementById('flashcard-btn')?.addEventListener('click', () => this.showFlashcard());
        document.getElementById('quiz-btn')?.addEventListener('click', () => this.showQuiz());
        document.getElementById('dashboard-btn')?.addEventListener('click', () => this.showDashboard());
        document.getElementById('verb-conjugation-btn')?.addEventListener('click', () => this.showVerbConjugation());
        
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
        const totalWords = this.vocabularyData.reduce((total, lesson) => total + lesson.totalWords, 0);
        const studiedWords = this.userProgress.studiedWords.length;
        const completedLessons = this.userProgress.completedLessons.length;
        
        document.getElementById('words-studied').textContent = studiedWords;
        document.getElementById('accuracy-rate').textContent = 
            studiedWords > 0 ? `${Math.round((studiedWords / totalWords) * 100)}%` : '0%';
        document.getElementById('streak-days').textContent = this.userProgress.streakDays || 0;
        
        // Cập nhật tiến độ bài học
        document.getElementById('lessons-progress').textContent = `${completedLessons}/${this.vocabularyData.length} bài`;
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
            completedLessons: [],
            streakDays: 0,
            lastStudyDate: null
        };
    }

    // Lưu tiến độ vào localStorage
    saveProgress() {
        localStorage.setItem('japaneseVocabProgress', JSON.stringify(this.userProgress));
    }

    // Cập nhật hiển thị tiến độ
    updateProgressDisplay() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = (this.userProgress.completedLessons.length / this.vocabularyData.length) * 100;
            progressBar.style.width = progress + '%';
        }
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

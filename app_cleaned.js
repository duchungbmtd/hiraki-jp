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
        
        // Vocabulary list controls
        document.getElementById('start-flashcard-btn')?.addEventListener('click', () => this.showFlashcard());
        document.getElementById('start-quiz-btn')?.addEventListener('click', () => this.showQuiz());
        document.getElementById('vocab-search')?.addEventListener('input', (e) => this.filterVocabulary());
        document.getElementById('category-filter')?.addEventListener('change', (e) => this.filterVocabulary());
        document.getElementById('difficulty-filter')?.addEventListener('change', (e) => this.filterVocabulary());
        
        // Lesson selection
        document.addEventListener('click', (e) => {
            const lessonItem = e.target.closest('.lesson-item');
            if (lessonItem) {
                e.preventDefault();
                e.stopPropagation();
                const lessonId = parseInt(lessonItem.dataset.lesson);
                if (!isNaN(lessonId)) {
                    this.showVocabularyList(lessonId);
                }
            }
        });
    }

    // Hiển thị Dashboard
    showDashboard() {
        this.hideAllViews();
        document.getElementById('dashboard').classList.remove('hidden');
        this.updateDashboardStats();
    }

    // Hiển thị danh sách bài học
    showLessons() {
        this.hideAllViews();
        document.getElementById('lessons-view').classList.remove('hidden');
        this.renderLessons();
    }

    // Render danh sách bài học
    renderLessons() {
        const container = document.getElementById('lessons-container');
        if (!container) return;

        container.innerHTML = this.vocabularyData.map((lesson, index) => {
            const isCompleted = this.userProgress.completedLessons.includes(index);
            const studiedWords = this.userProgress.studiedWords.length;
            const totalWords = lesson.totalWords;
            
            return `
                <div class="lesson-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border-l-4 ${isCompleted ? 'border-green-500' : 'border-blue-500'}" data-lesson="${index}">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-800">${lesson.lesson}</h3>
                        <div class="flex items-center space-x-2">
                            ${isCompleted ? '<span class="text-green-600 text-lg">✓</span>' : ''}
                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                ${totalWords} từ
                            </span>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm mb-3">${totalWords} từ vựng</p>
                    <div class="flex items-center text-blue-600 text-sm font-medium">
                        <span class="mr-1">📚</span>
                        Xem từ vựng
                    </div>
                </div>
            `;
        }).join('');
    }

    // Hiển thị danh sách từ vựng của bài học
    showVocabularyList(lessonId) {
        this.currentLesson = lessonId;
        this.currentLessonData = this.vocabularyData[lessonId].words;
        this.filteredVocabulary = [...this.currentLessonData];
        
        this.hideAllViews();
        document.getElementById('vocabulary-list-view').classList.remove('hidden');
        
        // Cập nhật thông tin bài học
        const lesson = this.vocabularyData[lessonId];
        document.getElementById('vocab-lesson-title').textContent = `Từ vựng ${lesson.lesson}`;
        document.getElementById('vocab-lesson-subtitle').textContent = `Tổng cộng: ${lesson.totalWords} từ`;
        document.getElementById('vocab-count').textContent = lesson.totalWords;
        
        this.renderVocabularyList();
        this.populateFilters();
    }

    // Render danh sách từ vựng
    renderVocabularyList() {
        const container = document.getElementById('vocabulary-grid');
        if (!container) return;

        container.innerHTML = this.filteredVocabulary.map(word => `
            <div class="vocab-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="japanese-text text-2xl font-medium text-gray-800 mb-2">${word.japanese}</div>
                        ${word.kanji ? `<div class="japanese-text text-lg text-gray-600 mb-1">${word.kanji}</div>` : ''}
                        <div class="text-gray-700 font-medium mb-1">${word.vietnamese}</div>
                        ${word.romanji ? `<div class="text-sm text-gray-500 mb-2">${word.romanji}</div>` : ''}
                        ${word.category ? `<span class="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${word.category}</span>` : ''}
                    </div>
                    <div class="flex-shrink-0 ml-4">
                        ${word.example ? `<div class="text-sm text-gray-500 italic">"${word.example}"</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Populate filter options
    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        
        // Get unique categories
        const categories = [...new Set(this.currentLessonData.map(word => word.category))].filter(Boolean);
        categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        // Difficulty filter is already populated in HTML
    }

    // Filter vocabulary based on search and filters
    filterVocabulary() {
        const searchTerm = document.getElementById('vocab-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        
        this.filteredVocabulary = this.currentLessonData.filter(word => {
            const matchesSearch = !searchTerm || 
                word.japanese.toLowerCase().includes(searchTerm) ||
                word.kanji?.toLowerCase().includes(searchTerm) ||
                word.vietnamese.toLowerCase().includes(searchTerm) ||
                word.romanji?.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || word.category === categoryFilter;
            const matchesDifficulty = !difficultyFilter || word.difficulty === difficultyFilter;
            
            return matchesSearch && matchesCategory && matchesDifficulty;
        });
        
        this.renderVocabularyList();
    }

    // Hiển thị Flashcard (redirect to separate page)
    showFlashcard() {
        window.open('flashcard.html', '_blank');
    }

    // Hiển thị Quiz (redirect to separate page)
    showQuiz() {
        window.open('quiz.html', '_blank');
    }

    // Hiển thị trang chia động từ (redirect to separate page)
    showVerbConjugation() {
        window.open('verb_conjugation.html', '_blank');
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
        const views = ['dashboard', 'lessons-view', 'vocabulary-list-view'];
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

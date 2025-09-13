// Ứng dụng Bài Học tiếng Nhật
class LessonsApp {
    constructor() {
        this.vocabularyData = [];
        this.currentLessonData = [];
        this.currentLesson = 0;
        this.userProgress = this.loadProgress();
        this.filteredVocabulary = [];
        
        this.init();
    }

    async init() {
        console.log('LessonsApp initializing...');
        await this.loadVocabularyData();
        console.log(`Loaded ${this.vocabularyData.length} lessons`);
        this.setupEventListeners();
        this.showLessonsList();
        console.log('LessonsApp initialized successfully');
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
                console.log('Loaded vocabulary data from localStorage');
                return;
            } catch (error) {
                console.warn('Error parsing cached data, fetching from server:', error);
                localStorage.removeItem('japaneseVocabData');
            }
        }

        // Nếu không có trong localStorage, fetch từ server
        console.log('Fetching vocabulary data from server...');
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
            console.log('Vocabulary data saved to localStorage cache');
        } catch (error) {
            console.warn('Could not save vocabulary data to localStorage:', error);
        }
    }

    setupEventListeners() {
        // Lesson selection
        document.addEventListener('click', (e) => {
            const lessonItem = e.target.closest('.lesson-item');
            if (lessonItem) {
                e.preventDefault();
                const lessonId = parseInt(lessonItem.dataset.lesson);
                this.showVocabularyList(lessonId);
            }
        });

        // Vocabulary list controls
        const flashcardBtn = document.getElementById('start-flashcard-btn');
        const quizBtn = document.getElementById('start-quiz-btn');
        const backBtn = document.getElementById('back-to-lessons-btn');
        const searchInput = document.getElementById('vocab-search');
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        
        if (flashcardBtn) flashcardBtn.addEventListener('click', () => this.startFlashcard());
        if (quizBtn) quizBtn.addEventListener('click', () => this.startQuiz());
        if (backBtn) backBtn.addEventListener('click', () => this.showLessonsList());
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterVocabulary());
        if (categoryFilter) categoryFilter.addEventListener('change', (e) => this.filterVocabulary());
        if (difficultyFilter) difficultyFilter.addEventListener('change', (e) => this.filterVocabulary());
        
        // Back button
        const backButton = document.querySelector('.back-btn');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    }

    // Hiển thị danh sách bài học
    showLessonsList() {
        this.hideAllViews();
        const lessonsView = document.getElementById('lessons-list-view');
        if (lessonsView) {
            lessonsView.classList.remove('hidden');
        }
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
        const vocabView = document.getElementById('vocabulary-list-view');
        if (vocabView) {
            vocabView.classList.remove('hidden');
        }
        
        // Sử dụng setTimeout để đảm bảo DOM đã được render
        setTimeout(() => {
            this.updateVocabularyInfo(lessonId);
        this.renderVocabularyList();
        this.populateFilters();
        this.updateFilterCount();
        }, 10);
    }

    // Cập nhật thông tin bài học
    updateVocabularyInfo(lessonId) {
        const lesson = this.vocabularyData[lessonId];
        
        const titleElement = document.getElementById('vocab-lesson-title');
        const subtitleElement = document.getElementById('vocab-lesson-subtitle');
        const countElement = document.getElementById('vocab-count');
        
        if (titleElement) {
            titleElement.textContent = `Từ vựng ${lesson.lesson}`;
        } else {
            console.warn('vocab-lesson-title element not found');
        }
        
        if (subtitleElement) {
            subtitleElement.textContent = `Tổng cộng: ${lesson.totalWords} từ`;
        } else {
            console.warn('vocab-lesson-subtitle element not found');
        }
        
        if (countElement) {
            countElement.textContent = lesson.totalWords;
        } else {
            console.warn('vocab-count element not found');
        }
    }

    // Render danh sách từ vựng
    renderVocabularyList() {
        const container = document.getElementById('vocabulary-grid');
        if (!container) {
            console.warn('vocabulary-grid container not found');
            return;
        }

        container.innerHTML = this.filteredVocabulary.map(word => `
            <div class="vocab-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-300">
                <!-- Header: Japanese & Kanji -->
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                        <div class="japanese-text text-xl md:text-2xl font-medium text-gray-800 mb-1 break-all">${word.japanese}</div>
                        ${word.kanji ? `<div class="japanese-text text-lg md:text-xl text-gray-600 mb-2 break-all">${word.kanji}</div>` : ''}
                    </div>
                    <div class="flex-shrink-0 ml-3">
                        ${word.category ? `<span class="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">${word.category}</span>` : ''}
                    </div>
                </div>
                
                <!-- Vietnamese Meaning -->
                <div class="text-gray-700 font-medium mb-2 text-base md:text-lg">${word.vietnamese}</div>
                
                <!-- Romanji -->
                ${word.romanji ? `<div class="text-sm text-gray-500 mb-3 italic">${word.romanji}</div>` : ''}
                
                <!-- Example -->
                ${word.example ? `
                    <div class="mt-3 pt-3 border-t border-gray-100">
                        <div class="text-xs text-gray-400 mb-1">Ví dụ:</div>
                        <div class="japanese-text text-sm text-gray-600 italic">"${word.example}"</div>
                    </div>
                ` : ''}
                
                <!-- Difficulty Badge -->
                ${word.difficulty ? `
                    <div class="mt-3 flex justify-end">
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            word.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            word.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }">
                            ${word.difficulty === 'beginner' ? 'Cơ bản' :
                              word.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                        </span>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Populate filter options
    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        
        if (!categoryFilter) {
            console.warn('category-filter not found');
            return;
        }
        
        // Get unique categories
        const categories = [...new Set(this.currentLessonData.map(word => word.category))].filter(Boolean);
        categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        // Difficulty filter is already populated in HTML
    }

    // Filter vocabulary based on search and filters
    filterVocabulary() {
        const searchInput = document.getElementById('vocab-search');
        const categorySelect = document.getElementById('category-filter');
        const difficultySelect = document.getElementById('difficulty-filter');
        
        if (!searchInput || !categorySelect || !difficultySelect) {
            console.warn('Filter elements not found');
            return;
        }
        
        const searchTerm = searchInput.value.toLowerCase();
        const categoryFilter = categorySelect.value;
        const difficultyFilter = difficultySelect.value;
        
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
        this.updateFilterCount();
    }

    // Cập nhật số lượng từ vựng hiển thị
    updateFilterCount() {
        const subtitleElement = document.getElementById('vocab-lesson-subtitle');
        if (subtitleElement && this.vocabularyData.length > 0) {
            const totalWords = this.vocabularyData[this.currentLesson].totalWords;
            const displayedWords = this.filteredVocabulary.length;
            
            if (displayedWords === totalWords) {
                subtitleElement.textContent = `Tổng cộng: ${totalWords} từ`;
            } else {
                subtitleElement.textContent = `Hiển thị: ${displayedWords}/${totalWords} từ`;
            }
        }
    }

    // Bắt đầu flashcard với dữ liệu bài học hiện tại
    startFlashcard() {
        // Lưu dữ liệu bài học hiện tại vào localStorage để flashcard app có thể sử dụng
        localStorage.setItem('currentLessonData', JSON.stringify({
            lessonId: this.currentLesson,
            lessonName: this.vocabularyData[this.currentLesson].lesson,
            words: this.currentLessonData
        }));
        
        window.location.href = 'flashcard.html';
    }

    // Bắt đầu quiz với dữ liệu bài học hiện tại
    startQuiz() {
        // Lưu dữ liệu bài học hiện tại vào localStorage để quiz app có thể sử dụng
        localStorage.setItem('currentLessonData', JSON.stringify({
            lessonId: this.currentLesson,
            lessonName: this.vocabularyData[this.currentLesson].lesson,
            words: this.currentLessonData
        }));
        
        window.location.href = 'quiz.html';
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

    // Ẩn tất cả các view
    hideAllViews() {
        const views = ['lessons-list-view', 'vocabulary-list-view'];
        views.forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) {
                element.classList.add('hidden');
            } else {
                console.warn(`Element with id '${viewId}' not found`);
            }
        });
    }
}

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing LessonsApp...');
    window.lessonsApp = new LessonsApp();
});

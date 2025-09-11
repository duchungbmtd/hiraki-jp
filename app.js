// Ứng dụng học từ vựng tiếng Nhật
class JapaneseVocabApp {
    constructor() {
        this.vocabularyData = [];
        this.currentLessonData = [];
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.currentLesson = 0;
        this.userProgress = this.loadProgress();
        this.quizData = [];
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizTimer = null;
        this.quizTimeLeft = 0;
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
            'lesson_14_vocabulary.json'
        ];

        try {
            for (let i = 0; i < lessons.length; i++) {
                const response = await fetch(`./data/${lessons[i]}`);
                const data = await response.json();
                this.vocabularyData.push({
                    lesson: i,
                    name: i === 0 ? 'Giới thiệu' : `Bài ${i}`,
                    words: data,
                    completed: this.userProgress.completedLessons.includes(i)
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            // Fallback với dữ liệu mẫu nếu không load được
            this.vocabularyData = [{
                lesson: 0,
                name: 'Bài mẫu',
                words: [
                    {
                        japanese: "おはよう ございます",
                        vietnamese: "Chào buổi sáng",
                        romanji: "ohayou gozaimasu",
                        category: "greeting",
                        example: "おはようございます。"
                    }
                ],
                completed: false
            }];
        }
    }

    // Load tiến độ học tập từ localStorage
    loadProgress() {
        const saved = localStorage.getItem('japaneseVocabProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            completedLessons: [],
            studiedWords: [],
            quizScores: {},
            streakDays: 0,
            totalWordsStudied: 0,
            accuracy: 0,
            lastStudyDate: null
        };
    }

    // Lưu tiến độ học tập
    saveProgress() {
        localStorage.setItem('japaneseVocabProgress', JSON.stringify(this.userProgress));
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('lessons-btn')?.addEventListener('click', () => this.showLessons());
        document.getElementById('flashcard-btn')?.addEventListener('click', () => this.showFlashcard());
        document.getElementById('quiz-btn')?.addEventListener('click', () => this.showQuiz());
        document.getElementById('dashboard-btn')?.addEventListener('click', () => this.showDashboard());

        // Flashcard controls
        document.getElementById('flashcard')?.addEventListener('click', () => this.flipCard());
        document.getElementById('difficult-btn')?.addEventListener('click', () => this.markDifficult());
        document.getElementById('normal-btn')?.addEventListener('click', () => this.markNormal());
        document.getElementById('easy-btn')?.addEventListener('click', () => this.markEasy());
        document.getElementById('next-card-btn')?.addEventListener('click', () => this.nextCard());
        document.getElementById('prev-card-btn')?.addEventListener('click', () => this.prevCard());

        // Quiz controls
        document.getElementById('submit-answer')?.addEventListener('click', () => this.submitAnswer());
        
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

        // Keyboard support for lesson selection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const lessonItem = e.target.closest('.lesson-item');
                if (lessonItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    const lessonId = parseInt(lessonItem.dataset.lesson);
                    if (!isNaN(lessonId)) {
                        this.showVocabularyList(lessonId);
                    }
                }
            }
        });

        // Keyboard support for flashcard navigation
        document.addEventListener('keydown', (e) => {
            const flashcardView = document.getElementById('flashcard-view');
            if (flashcardView && !flashcardView.classList.contains('hidden')) {
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
        this.renderLessonList();
    }

    // Render danh sách bài học
    renderLessonList() {
        const container = document.getElementById('lessons-container');
        if (!container) return;

        container.innerHTML = this.vocabularyData.map((lesson, index) => `
            <div class="lesson-item bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer ${lesson.completed ? 'border-l-4 border-green-500' : ''}" 
                 data-lesson="${index}"
                 role="button"
                 tabindex="0"
                 aria-label="Chọn bài học ${lesson.name}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 ${lesson.completed ? 'bg-green-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center">
                            <span class="text-2xl">${lesson.completed ? '✅' : '📚'}</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-800">${lesson.name}</h3>
                            <p class="text-sm text-gray-600">${lesson.words.length} từ vựng</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium ${lesson.completed ? 'text-green-600' : 'text-gray-500'}">
                            ${lesson.completed ? 'Hoàn thành' : 'Chưa học'}
                        </div>
                        <div class="text-xs text-gray-400">
                            ${this.getCategoryStats(lesson.words)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Lấy thống kê category của bài học
    getCategoryStats(words) {
        const categories = {};
        words.forEach(word => {
            categories[word.category] = (categories[word.category] || 0) + 1;
        });
        const topCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat, count]) => `${cat} (${count})`)
            .join(', ');
        return topCategories;
    }

    // Hiển thị danh sách từ vựng của bài học
    showVocabularyList(lessonId) {
        this.currentLesson = lessonId;
        this.currentLessonData = this.vocabularyData[lessonId].words;
        this.filteredVocabulary = [...this.currentLessonData];
        
        this.hideAllViews();
        document.getElementById('vocabulary-list-view').classList.remove('hidden');
        
        // Cập nhật tiêu đề
        document.getElementById('vocab-lesson-title').textContent = 
            `Từ vựng ${this.vocabularyData[lessonId].name}`;
        document.getElementById('vocab-count').textContent = this.currentLessonData.length;
        
        // Tạo filter categories
        this.setupCategoryFilter();
        
        // Render vocabulary
        this.renderVocabularyGrid();
    }

    // Setup category filter options
    setupCategoryFilter() {
        const categories = [...new Set(this.currentLessonData.map(word => word.category))];
        const categoryFilter = document.getElementById('category-filter');
        
        // Clear existing options except "Tất cả danh mục"
        categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = this.getCategoryDisplayName(category);
            categoryFilter.appendChild(option);
        });
    }

    // Get display name for category
    getCategoryDisplayName(category) {
        const categoryNames = {
            'greeting': 'Chào hỏi',
            'number': 'Số đếm',
            'time': 'Thời gian',
            'food': 'Thực phẩm',
            'drink': 'Đồ uống',
            'occupation': 'Nghề nghiệp',
            'place': 'Địa điểm',
            'pronoun': 'Đại từ',
            'stationery': 'Văn phòng phẩm',
            'electronics': 'Điện tử',
            'object': 'Đồ vật',
            'country': 'Quốc gia',
            'vehicle': 'Phương tiện',
            'instruction': 'Hướng dẫn',
            'question': 'Câu hỏi',
            'response': 'Trả lời',
            'grammar': 'Ngữ pháp'
        };
        return categoryNames[category] || category;
    }

    // Filter vocabulary based on search and filters
    filterVocabulary() {
        const searchTerm = document.getElementById('vocab-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const difficultyFilter = document.getElementById('difficulty-filter').value;

        this.filteredVocabulary = this.currentLessonData.filter(word => {
            const matchesSearch = !searchTerm || 
                word.japanese.toLowerCase().includes(searchTerm) ||
                word.vietnamese.toLowerCase().includes(searchTerm) ||
                (word.romanji && word.romanji.toLowerCase().includes(searchTerm));
            
            const matchesCategory = !categoryFilter || word.category === categoryFilter;
            const matchesDifficulty = !difficultyFilter || word.difficulty === difficultyFilter;
            
            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        this.renderVocabularyGrid();
    }

    // Render vocabulary grid - Horizontal Layout
    renderVocabularyGrid() {
        const container = document.getElementById('vocabulary-grid');
        if (!container) return;

        container.innerHTML = this.filteredVocabulary.map((word, index) => `
            <div class="vocab-card bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 border-l-4 ${this.getCategoryColor(word.category)}">
                <div class="flex items-center justify-between">
                    <!-- Left side: Japanese and Vietnamese -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-4 mb-2">
                            <div class="japanese-text text-2xl font-medium text-gray-800 flex-shrink-0">
                                ${word.japanese}
                            </div>
                            <div class="text-gray-700 font-medium flex-1">
                                ${word.vietnamese}
                            </div>
                        </div>
                        
                        ${word.romanji ? `
                            <div class="text-gray-500 text-sm italic mb-2">
                                ${word.romanji}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Right side: Category, Difficulty, and Example button -->
                    <div class="flex items-center space-x-3 flex-shrink-0">
                        <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            ${this.getCategoryDisplayName(word.category)}
                        </span>
                        <span class="text-xs px-2 py-1 rounded-full ${this.getDifficultyColor(word.difficulty)}">
                            ${word.difficulty || 'beginner'}
                        </span>
                        ${word.example ? `
                            <button onclick="app.showWordExample('${word.example.replace(/'/g, "\\'")}', '${word.japanese}')" 
                                    class="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                                📝 Ví dụ
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Update count
        document.getElementById('vocab-count').textContent = this.filteredVocabulary.length;
    }

    // Get category color class
    getCategoryColor(category) {
        const colors = {
            'greeting': 'border-pink-400',
            'number': 'border-blue-400',
            'time': 'border-purple-400',
            'food': 'border-orange-400',
            'drink': 'border-cyan-400',
            'occupation': 'border-green-400',
            'place': 'border-red-400',
            'pronoun': 'border-yellow-400',
            'stationery': 'border-gray-400',
            'electronics': 'border-indigo-400'
        };
        return colors[category] || 'border-gray-400';
    }

    // Get difficulty color class
    getDifficultyColor(difficulty) {
        const colors = {
            'beginner': 'bg-green-100 text-green-800',
            'intermediate': 'bg-yellow-100 text-yellow-800',
            'advanced': 'bg-red-100 text-red-800'
        };
        return colors[difficulty] || 'bg-green-100 text-green-800';
    }

    // Show word example
    showWordExample(example, japanese) {
        alert(`Ví dụ cho "${japanese}":\n${example}`);
    }

    // Chọn bài học (legacy method for flashcard)
    selectLesson(lessonId) {
        this.currentLesson = lessonId;
        this.currentLessonData = this.vocabularyData[lessonId].words;
        this.currentCardIndex = 0;
        this.showFlashcard();
    }

    // Hiển thị Flashcard
    showFlashcard() {
        if (this.currentLessonData.length === 0) {
            this.currentLesson = 0;
            this.currentLessonData = this.vocabularyData[0].words;
        }
        
        this.hideAllViews();
        document.getElementById('flashcard-view').classList.remove('hidden');
        this.loadFlashcard();
    }

    // Load flashcard hiện tại
    loadFlashcard() {
        const card = this.currentLessonData[this.currentCardIndex];
        if (!card) return;

        document.getElementById('japanese-word').textContent = card.japanese;
        document.getElementById('vietnamese-meaning').textContent = card.vietnamese;
        document.getElementById('romanji-text').textContent = card.romanji || '';
        document.getElementById('usage-note').textContent = card.example || '';
        document.getElementById('card-progress').textContent = 
            `${this.currentCardIndex + 1}/${this.currentLessonData.length}`;
        document.getElementById('lesson-title').textContent = 
            this.vocabularyData[this.currentLesson]?.name || 'Bài học';
        
        // Reset card state
        document.getElementById('card-front').classList.remove('hidden');
        document.getElementById('card-back').classList.add('hidden');
        this.isCardFlipped = false;
    }

    // Lật thẻ
    flipCard() {
        if (!this.isCardFlipped) {
            document.getElementById('card-front').classList.add('hidden');
            document.getElementById('card-back').classList.remove('hidden');
            this.isCardFlipped = true;
        }
    }

    // Chuyển sang thẻ tiếp theo
    nextCard() {
        this.currentCardIndex = (this.currentCardIndex + 1) % this.currentLessonData.length;
        this.loadFlashcard();
        
        // Cập nhật tiến độ
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
        
        // Lưu độ khó vào localStorage riêng
        const difficulties = JSON.parse(localStorage.getItem('wordDifficulties') || '{}');
        difficulties[wordId] = {
            difficulty: difficulty,
            lastStudied: new Date().toISOString(),
            reviewCount: (difficulties[wordId]?.reviewCount || 0) + 1
        };
        localStorage.setItem('wordDifficulties', JSON.stringify(difficulties));
        
        this.saveProgress();
    }

    // Hiển thị Quiz
    showQuiz() {
        this.hideAllViews();
        document.getElementById('quiz-view').classList.remove('hidden');
        this.generateQuiz();
    }

    // Tạo quiz từ dữ liệu hiện tại
    generateQuiz() {
        const allWords = this.currentLessonData.length > 0 ? 
            this.currentLessonData : 
            this.vocabularyData.flatMap(lesson => lesson.words);
        
        // Chọn ngẫu nhiên 10 từ
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        this.quizData = shuffled.slice(0, Math.min(10, shuffled.length));
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizTimeLeft = 300; // 5 phút
        
        this.startQuizTimer();
        this.loadQuizQuestion();
    }

    // Bắt đầu đếm thời gian quiz
    startQuizTimer() {
        this.quizTimer = setInterval(() => {
            this.quizTimeLeft--;
            this.updateQuizTimer();
            
            if (this.quizTimeLeft <= 0) {
                this.endQuiz();
            }
        }, 1000);
    }

    // Cập nhật hiển thị thời gian
    updateQuizTimer() {
        const minutes = Math.floor(this.quizTimeLeft / 60);
        const seconds = this.quizTimeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Load câu hỏi quiz
    loadQuizQuestion() {
        if (this.currentQuizIndex >= this.quizData.length) {
            this.endQuiz();
            return;
        }

        const currentWord = this.quizData[this.currentQuizIndex];
        const questionTypes = ['meaning', 'japanese', 'romanji'];
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        // Tạo các lựa chọn sai
        const allWords = this.vocabularyData.flatMap(lesson => lesson.words);
        const wrongOptions = allWords
            .filter(w => w.japanese !== currentWord.japanese)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        let question, correctAnswer, options;
        
        if (questionType === 'meaning') {
            question = `"${currentWord.vietnamese}" trong tiếng Nhật là:`;
            correctAnswer = currentWord.japanese;
            options = [correctAnswer, ...wrongOptions.map(w => w.japanese)];
        } else if (questionType === 'japanese') {
            question = `"${currentWord.japanese}" có nghĩa là:`;
            correctAnswer = currentWord.vietnamese;
            options = [correctAnswer, ...wrongOptions.map(w => w.vietnamese)];
        } else {
            question = `Cách đọc của "${currentWord.japanese}" là:`;
            correctAnswer = currentWord.romanji || currentWord.japanese;
            options = [correctAnswer, ...wrongOptions.map(w => w.romanji || w.japanese)];
        }

        // Trộn các lựa chọn
        options.sort(() => 0.5 - Math.random());
        
        // Hiển thị câu hỏi
        document.getElementById('question-text').textContent = question;
        document.getElementById('question-number').textContent = this.currentQuizIndex + 1;
        
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = options.map((option, index) => `
            <label class="flex items-center space-x-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                <input type="radio" name="answer" value="${option}" class="text-blue-600">
                <span class="japanese-text">${option}</span>
            </label>
        `).join('');
        
        this.correctAnswer = correctAnswer;
    }

    // Gửi câu trả lời
    submitAnswer() {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            alert('Vui lòng chọn một đáp án!');
            return;
        }

        const isCorrect = selectedAnswer.value === this.correctAnswer;
        if (isCorrect) {
            this.quizScore++;
            this.showFeedback('Chính xác! 🎉', 'success');
        } else {
            this.showFeedback(`Sai rồi. Đáp án đúng là: ${this.correctAnswer}`, 'error');
        }

        setTimeout(() => {
            this.currentQuizIndex++;
            this.loadQuizQuestion();
        }, 2000);
    }

    // Hiển thị feedback
    showFeedback(message, type) {
        const feedbackEl = document.getElementById('quiz-feedback');
        if (feedbackEl) {
            feedbackEl.textContent = message;
            feedbackEl.className = `mt-4 p-3 rounded-lg text-center ${
                type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`;
        }
    }

    // Kết thúc quiz
    endQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }

        const accuracy = Math.round((this.quizScore / this.quizData.length) * 100);
        this.userProgress.quizScores[this.currentLesson] = accuracy;
        this.userProgress.accuracy = this.calculateOverallAccuracy();
        this.saveProgress();

        alert(`Quiz hoàn thành!\nĐiểm: ${this.quizScore}/${this.quizData.length}\nĐộ chính xác: ${accuracy}%`);
        this.showDashboard();
    }

    // Tính độ chính xác tổng thể
    calculateOverallAccuracy() {
        const scores = Object.values(this.userProgress.quizScores);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    // Cập nhật tiến độ học tập
    updateStudyProgress() {
        const today = new Date().toDateString();
        if (this.userProgress.lastStudyDate !== today) {
            this.userProgress.streakDays++;
            this.userProgress.lastStudyDate = today;
            this.saveProgress();
        }
    }

    // Cập nhật hiển thị Dashboard
    updateDashboardStats() {
        document.getElementById('words-studied').textContent = this.userProgress.totalWordsStudied;
        document.getElementById('accuracy-rate').textContent = this.userProgress.accuracy + '%';
        document.getElementById('streak-days').textContent = this.userProgress.streakDays;
        document.getElementById('lessons-progress').textContent = 
            `${this.userProgress.completedLessons.length}/${this.vocabularyData.length}`;
        
        // Hiển thị từ vựng gần đây
        this.displayRecentWords();
    }

    // Hiển thị từ vựng gần đây
    displayRecentWords() {
        const recentContainer = document.getElementById('recent-words');
        if (!recentContainer) return;

        const recentWords = this.userProgress.studiedWords.slice(-4).map(wordId => {
            const [japanese, vietnamese] = wordId.split('-');
            return { japanese, vietnamese };
        });

        recentContainer.innerHTML = recentWords.map(word => `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="japanese-text text-xl font-medium text-gray-800 mb-2">${word.japanese}</div>
                <div class="text-gray-600">${word.vietnamese}</div>
            </div>
        `).join('');
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
        const views = ['dashboard', 'lessons-view', 'flashcard-view', 'quiz-view', 'vocabulary-list-view'];
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

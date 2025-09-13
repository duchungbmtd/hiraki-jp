// Ứng dụng Quiz tiếng Nhật
class QuizApp {
    constructor() {
        this.vocabularyData = [];
        this.currentLessonData = [];
        this.quizData = [];
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizTimer = null;
        this.quizTimeLeft = 0;
        this.startTime = null;
        this.correctAnswer = '';
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
        // Quiz controls
        document.getElementById('submit-answer')?.addEventListener('click', () => this.submitAnswer());
        document.getElementById('retry-quiz')?.addEventListener('click', () => this.retryQuiz());
        document.getElementById('back-to-lessons')?.addEventListener('click', () => this.backToLessons());
        
        // Back button
        const backButton = document.querySelector('.back-btn');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }

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
            <div class="lesson-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border-l-4 border-purple-500" data-lesson="${index}">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-800">${lesson.lesson}</h3>
                    <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        ${lesson.totalWords} từ
                    </span>
                </div>
                <p class="text-gray-600 text-sm mb-3">${lesson.totalWords} từ vựng</p>
                <div class="flex items-center text-purple-600 text-sm font-medium">
                    <span class="mr-1">🎯</span>
                    Bắt đầu quiz
                </div>
            </div>
        `).join('');
    }

    // Chọn bài học
    selectLesson(lessonNumber) {
        this.currentLessonData = this.vocabularyData[lessonNumber].words;
        
        // Ẩn lesson selection và hiện quiz interface
        document.getElementById('lesson-selection').classList.add('hidden');
        document.getElementById('quiz-interface').classList.remove('hidden');
        
        this.generateQuiz();
    }

    // Load dữ liệu từ localStorage nếu có (từ lessons page)
    loadCurrentLessonData() {
        const savedData = localStorage.getItem('currentLessonData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentLessonData = data.words;
            
            // Ẩn lesson selection và hiện quiz interface
            document.getElementById('lesson-selection').classList.add('hidden');
            document.getElementById('quiz-interface').classList.remove('hidden');
            
            this.generateQuiz();
            
            // Xóa dữ liệu tạm thời
            localStorage.removeItem('currentLessonData');
            return true;
        }
        return false;
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
        this.startTime = Date.now();
        
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
        
        // Cập nhật progress ring
        const totalTime = 300;
        const progress = ((totalTime - this.quizTimeLeft) / totalTime) * 100;
        const circumference = 2 * Math.PI * 20;
        const offset = circumference - (progress / 100) * circumference;
        
        const progressCircle = document.getElementById('progress-circle');
        const progressText = document.getElementById('progress-text');
        
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }
        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }
    }

    // Load câu hỏi quiz
    loadQuizQuestion() {
        if (this.currentQuizIndex >= this.quizData.length) {
            this.endQuiz();
            return;
        }

        const word = this.quizData[this.currentQuizIndex];
        const questionNumber = this.currentQuizIndex + 1;
        
        // Cập nhật số câu hỏi
        document.getElementById('question-number').textContent = questionNumber;
        
        // Tạo câu hỏi ngẫu nhiên
        const questionType = Math.random() < 0.5 ? 'japanese' : 'vietnamese';
        
        if (questionType === 'japanese') {
            // Hỏi nghĩa tiếng Việt
            document.getElementById('question-text').innerHTML = 
                `Từ "<span class="japanese-text text-xl font-bold text-blue-600">${word.japanese}</span>" có nghĩa là gì?`;
            this.correctAnswer = word.vietnamese;
        } else {
            // Hỏi từ tiếng Nhật
            document.getElementById('question-text').innerHTML = 
                `Từ tiếng Nhật của "<span class="text-xl font-bold text-blue-600">${word.vietnamese}</span>" là gì?`;
            this.correctAnswer = word.japanese;
        }
        
        // Tạo các lựa chọn
        this.generateQuizOptions(word, questionType);
        
        
        // Reset selected answer
        document.querySelectorAll('input[name="answer"]').forEach(input => {
            input.checked = false;
        });
        
        // Reset option styles
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('correct', 'incorrect', 'selected');
        });
        
        // Enable submit button
        document.getElementById('submit-answer').disabled = false;
    }

    // Tạo các lựa chọn cho quiz
    generateQuizOptions(correctWord, questionType) {
        const allWords = this.vocabularyData.flatMap(lesson => lesson.words);
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        
        // Chọn 3 từ sai ngẫu nhiên
        const wrongOptions = shuffled
            .filter(word => word !== correctWord)
            .slice(0, 3)
            .map(word => questionType === 'japanese' ? word.vietnamese : word.japanese);
        
        // Tạo danh sách 4 lựa chọn
        const options = [this.correctAnswer, ...wrongOptions];
        const shuffledOptions = options.sort(() => 0.5 - Math.random());
        
        // Render options
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = shuffledOptions.map((option, index) => `
            <div class="quiz-option flex items-center bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all relative">
                <input type="radio" name="answer" value="${option}" id="option-${index}" class="sr-only">
                <label for="option-${index}" class="flex items-center w-full cursor-pointer">
                    <div class="w-5 h-5 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center option-indicator">
                        <div class="w-2 h-2 bg-blue-500 rounded-full option-dot hidden"></div>
                    </div>
                    <span class="text-gray-800 text-base">${option}</span>
                </label>
            </div>
        `).join('');
    }

    // Submit câu trả lời
    submitAnswer() {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            this.showNotification('Vui lòng chọn một đáp án!', 'warning');
            return;
        }

        const isCorrect = selectedAnswer.value === this.correctAnswer;
        
        // Highlight correct and incorrect answers
        this.highlightAnswers(selectedAnswer, isCorrect);
        
        if (isCorrect) {
            this.quizScore++;
        }

        // Disable submit button
        document.getElementById('submit-answer').disabled = true;

        setTimeout(() => {
            this.currentQuizIndex++;
            this.loadQuizQuestion();
        }, 1000);
    }

    // Highlight correct and incorrect answers
    highlightAnswers(selectedAnswer, isCorrect) {
        const options = document.querySelectorAll('.quiz-option');
        
        options.forEach(option => {
            const input = option.querySelector('input[name="answer"]');
            const label = option.querySelector('label');
            
            if (input.value === this.correctAnswer) {
                option.classList.add('correct');
            } else if (input === selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
    }

    // Show notification
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : ''
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }


    // Kết thúc quiz
    endQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }
        
        const endTime = Date.now();
        const completionTime = Math.floor((endTime - this.startTime) / 1000);
        const minutes = Math.floor(completionTime / 60);
        const seconds = completionTime % 60;
        
        // Ẩn quiz interface và hiện results
        document.getElementById('quiz-interface').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');
        
        // Hiển thị kết quả
        document.getElementById('final-score').textContent = `${this.quizScore}/${this.quizData.length}`;
        document.getElementById('score-percentage').textContent = 
            `${Math.round((this.quizScore / this.quizData.length) * 100)}%`;
        document.getElementById('completion-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Lưu kết quả
        this.saveQuizResult(this.quizScore, this.quizData.length, completionTime);
    }

    // Làm lại quiz
    retryQuiz() {
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('quiz-interface').classList.remove('hidden');
        this.generateQuiz();
    }

    // Quay về chọn bài học
    backToLessons() {
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('quiz-interface').classList.add('hidden');
        document.getElementById('lesson-selection').classList.remove('hidden');
        
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }
    }

    // Lưu kết quả quiz
    saveQuizResult(score, total, time) {
        const result = {
            score,
            total,
            percentage: Math.round((score / total) * 100),
            time,
            date: new Date().toISOString()
        };
        
        if (!this.userProgress.quizResults) {
            this.userProgress.quizResults = [];
        }
        
        this.userProgress.quizResults.push(result);
        this.saveProgress();
    }

    // Load tiến độ từ localStorage
    loadProgress() {
        const saved = localStorage.getItem('japaneseVocabProgress');
        return saved ? JSON.parse(saved) : {
            quizResults: []
        };
    }

    // Lưu tiến độ vào localStorage
    saveProgress() {
        localStorage.setItem('japaneseVocabProgress', JSON.stringify(this.userProgress));
    }
}

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});

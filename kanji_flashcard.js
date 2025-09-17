// Ứng dụng Kanji Flashcard tiếng Nhật
class KanjiFlashcardApp {
    constructor() {
        this.kanjiData = [];
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.userProgress = this.loadProgress();
        
        this.init();
    }

    async init() {
        await this.loadKanjiData();
        this.setupEventListeners();
        this.loadKanjiCard();
    }

    // Load dữ liệu kanji từ file JSON
    async loadKanjiData() {
        try {
            const response = await fetch('data/raw/kanji.json');
            const data = await response.json();
            this.kanjiData = data.filter(entry => entry.word && entry.word.trim().length > 0);
            console.log(`Loaded ${this.kanjiData.length} kanji entries`);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu kanji:', error);
            this.kanjiData = [];
        }
    }

    setupEventListeners() {
        // Kanji flashcard controls
        document.getElementById('kanji-flashcard')?.addEventListener('click', () => this.flipCard());
        document.getElementById('kanji-difficult-btn')?.addEventListener('click', () => this.markDifficult());
        document.getElementById('kanji-normal-btn')?.addEventListener('click', () => this.markNormal());
        document.getElementById('kanji-easy-btn')?.addEventListener('click', () => this.markEasy());
        document.getElementById('kanji-next-card-btn')?.addEventListener('click', () => this.nextCard());
        document.getElementById('kanji-prev-card-btn')?.addEventListener('click', () => this.prevCard());
        document.getElementById('kanji-shuffle-btn')?.addEventListener('click', () => this.shuffleCards());
        
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
                    this.shuffleCards();
                    break;
            }
        });
    }

    // Load thẻ kanji hiện tại
    loadKanjiCard() {
        if (this.kanjiData.length === 0) return;
        
        const entry = this.kanjiData[this.currentCardIndex];
        const progress = `${this.currentCardIndex + 1}/${this.kanjiData.length}`;
        
        // Cập nhật tiến độ
        document.getElementById('card-progress').textContent = progress;
        
        // Reset card state
        this.isCardFlipped = false;
        const card = document.getElementById('kanji-flashcard');
        if (card) card.classList.remove('flipped');
        
        // Cập nhật nội dung thẻ mặt trước (chỉ kanji)
        document.getElementById('kanji-word').textContent = entry.word || '';
        
        // Cập nhật nội dung thẻ mặt sau
        document.getElementById('kanji-phonetic').textContent = entry.phonetic || '';
        document.getElementById('kanji-romaji').textContent = entry.romaji || '';
        document.getElementById('kanji-meaning').textContent = entry.short_mean || '';

        // Hiển thị Hán Việt nếu có
        const hvSection = document.getElementById('kanji-hanviet-section');
        const hvList = document.getElementById('kanji-hanviet-list');
        if (hvSection && hvList) {
            const list = Array.isArray(entry.kanji_search_results) ? entry.kanji_search_results.slice(0, 5) : [];
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
        const card = document.getElementById('kanji-flashcard');
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
        this.currentCardIndex = (this.currentCardIndex + 1) % this.kanjiData.length;
        this.loadKanjiCard();
        
        // Cập nhật tiến độ học
        this.updateStudyProgress();
    }

    // Chuyển về thẻ trước đó
    prevCard() {
        this.currentCardIndex = this.currentCardIndex === 0 ? 
            this.kanjiData.length - 1 : 
            this.currentCardIndex - 1;
        this.loadKanjiCard();
    }

    // Xáo trộn thứ tự các thẻ kanji
    shuffleCards() {
        if (this.kanjiData.length === 0) return;
        
        // Fisher-Yates shuffle algorithm
        for (let i = this.kanjiData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.kanjiData[i], this.kanjiData[j]] = [this.kanjiData[j], this.kanjiData[i]];
        }
        
        // Reset về thẻ đầu tiên sau khi xáo trộn
        this.currentCardIndex = 0;
        this.loadKanjiCard();
        
        // Hiển thị thông báo xáo trộn thành công
        this.showShuffleNotification();
    }

    // Hiển thị thông báo xáo trộn thành công
    showShuffleNotification() {
        // Tạo thông báo tạm thời
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-full';
        notification.innerHTML = '🔀 Đã xáo trộn thẻ thành công!';
        
        document.body.appendChild(notification);
        
        // Hiển thị thông báo
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Ẩn thông báo sau 2 giây
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Đánh dấu từ khó
    markDifficult() {
        this.recordKanjiDifficulty('difficult');
        this.nextCard();
    }

    // Đánh dấu từ bình thường
    markNormal() {
        this.recordKanjiDifficulty('normal');
        this.nextCard();
    }

    // Đánh dấu từ dễ
    markEasy() {
        this.recordKanjiDifficulty('easy');
        this.nextCard();
    }

    // Ghi nhận độ khó của kanji
    recordKanjiDifficulty(difficulty) {
        const entry = this.kanjiData[this.currentCardIndex];
        const kanjiId = `kanji-${entry.word}`;
        
        if (!this.userProgress.studiedKanji) {
            this.userProgress.studiedKanji = [];
        }
        
        if (!this.userProgress.studiedKanji.includes(kanjiId)) {
            this.userProgress.studiedKanji.push(kanjiId);
        }
        
        // Cập nhật độ khó
        if (!this.userProgress.kanjiDifficulties) {
            this.userProgress.kanjiDifficulties = {};
        }
        this.userProgress.kanjiDifficulties[kanjiId] = difficulty;
        
        // Lưu tiến độ
        this.saveProgress();
    }

    // Cập nhật tiến độ học
    updateStudyProgress() {
        const studiedKanji = this.userProgress.studiedKanji ? this.userProgress.studiedKanji.length : 0;
        const totalKanji = this.kanjiData.length;
        
        console.log(`Đã học: ${studiedKanji}/${totalKanji} kanji`);
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
            lastStudyDate: null,
            studiedKanji: [],
            kanjiDifficulties: {}
        };
    }

    // Lưu tiến độ vào localStorage
    saveProgress() {
        localStorage.setItem('japaneseVocabProgress', JSON.stringify(this.userProgress));
    }
}

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kanjiFlashcardApp = new KanjiFlashcardApp();
});

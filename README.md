# 🌸 JapaneseVocab - Ứng dụng học từ vựng tiếng Nhật

## 📋 Tổng quan dự án

Ứng dụng web học từ vựng tiếng Nhật được thiết kế để giúp bạn học thuộc **1,200+ từ vựng** từ 15 bài học (bao gồm bài giới thiệu) một cách hiệu quả và thú vị.

## 📊 Thống kê dữ liệu

- **Tổng số từ vựng**: 1,200+ từ
- **Số bài học**: 15 bài (từ giới thiệu đến nâng cao)
- **Danh mục chính**: 
  - Chào hỏi & Giao tiếp cơ bản
  - Số đếm & Thời gian
  - Nghề nghiệp & Học tập
  - Thực phẩm & Đồ uống
  - Đồ vật & Điện tử
  - Quốc gia & Địa điểm
  - Và nhiều danh mục khác...

## 🎯 Tính năng chính

### ✨ Đã hoàn thành
- [x] **Hệ thống bài học hoàn chỉnh**: 15 bài học với dữ liệu thực từ JSON
- [x] **Flashcard thông minh**: Lật thẻ với animation, theo dõi độ khó
- [x] **Quiz động**: Tự động tạo câu hỏi từ dữ liệu, đếm thời gian
- [x] **Dashboard theo dõi tiến độ**: Thống kê từ đã học, độ chính xác, streak
- [x] **UI/UX hiện đại**: Thiết kế responsive, màu sắc Nhật Bản
- [x] **Local Storage**: Lưu tiến độ học tập cục bộ
- [x] **Responsive Design**: Tương thích mobile, tablet, desktop

### 🚧 Tính năng nâng cao (có thể phát triển)
- [ ] Hệ thống đăng ký/đăng nhập với backend
- [ ] Spaced Repetition Algorithm (SRS)
- [ ] Text-to-Speech cho phát âm
- [ ] Luyện viết Kanji với canvas
- [ ] Thống kê chi tiết với biểu đồ
- [ ] Progressive Web App (PWA)
- [ ] Chế độ offline
- [ ] Đồng bộ đa thiết bị

## 🛠️ Công nghệ sử dụng

### Frontend
- **HTML5/CSS3**: Cấu trúc và styling với CSS Variables
- **TailwindCSS**: Framework CSS hiện đại với responsive design
- **JavaScript ES6+**: OOP class-based architecture
- **Google Fonts**: Typography (Noto Sans JP + Inter)
- **CSS Animations**: Smooth transitions và micro-interactions

### Dữ liệu & Storage
- **JSON**: 15 file dữ liệu từ vựng có cấu trúc
- **LocalStorage**: Lưu trữ tiến độ học tập cục bộ
- **Fetch API**: Load dữ liệu động từ JSON files

## 📁 Cấu trúc project

```
japanese/
├── index.html                    # Trang chính (UI)
├── app.js                        # JavaScript ứng dụng chính
├── data/                         # Thư mục dữ liệu từ vựng
│   ├── introduction_vocabulary.json
│   ├── lesson_1_vocabulary.json
│   ├── lesson_2_vocabulary.json
│   ├── ...
│   └── lesson_14_vocabulary.json
├── tuvung_content.txt           # Dữ liệu gốc từ PDF
├── tech_solutions.md           # Giải pháp công nghệ
├── ui_design_guide.md          # Hướng dẫn thiết kế UI
├── vocabulary_extraction_prompt.md
└── README.md                   # Tài liệu này
```

## 🚀 Hướng dẫn sử dụng

### 1. Chạy ứng dụng
```bash
# Mở file index.html trong trình duyệt
open index.html

# Hoặc khởi động local server (khuyến nghị)
python3 -m http.server 8000
# Sau đó truy cập: http://localhost:8000
```

### 2. Cách sử dụng
- **Dashboard**: Xem tổng quan tiến độ học tập
- **Bài học**: Chọn bài học từ danh sách 15 bài
- **Flashcard**: Học từ vựng với hệ thống thẻ ghi nhớ
- **Quiz**: Kiểm tra kiến thức với câu hỏi động

### 3. Tính năng chính
- Tiến độ được lưu tự động trong trình duyệt
- Flashcard có 3 mức độ: Khó, Bình thường, Dễ
- Quiz có timer và feedback tức thì
- Responsive design trên mọi thiết bị

## 💡 Giải pháp triển khai

### 🎯 Hiện tại: Static Web App
- **Ưu điểm**: Đơn giản, không cần server, chạy offline
- **Hosting**: GitHub Pages, Netlify, Vercel (miễn phí)
- **Dữ liệu**: JSON files + LocalStorage
- **Chi phí**: $0

### 🚀 Nâng cấp: JAMstack (Khuyến nghị)
- **Frontend**: Next.js + React + TypeScript
- **Backend**: Supabase hoặc Firebase
- **Hosting**: Vercel
- **Chi phí**: $0-20/tháng

### 🔥 Enterprise: Full-stack
- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Redis
- **Hosting**: AWS/GCP/Azure
- **Chi phí**: $50-200/tháng

## 🎨 Thiết kế UI/UX

### Màu sắc chủ đạo
- **Sakura Pink**: #FFB7C5 (Hoa anh đào)
- **Deep Blue**: #003366 (Xanh truyền thống)
- **Warm White**: #FFFEF7 (Trắng ấm)

### Typography
- **Tiếng Nhật**: Noto Sans JP
- **Tiếng Việt**: Inter

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px
- Touch-friendly interface

## 📈 Roadmap phát triển

### ✅ Phase 1: MVP (Hoàn thành)
- [x] Hoàn thiện ứng dụng với dữ liệu thực
- [x] Tích hợp 15 bài học từ JSON
- [x] Hệ thống Flashcard + Quiz hoàn chỉnh
- [x] UI/UX responsive theo design guide

### 🚧 Phase 2: Enhancement (Tùy chọn)
- [ ] Deploy lên hosting (GitHub Pages/Netlify)
- [ ] PWA support (offline mode)
- [ ] Text-to-Speech cho phát âm
- [ ] Spaced Repetition Algorithm
- [ ] Export/Import tiến độ

### 🔮 Phase 3: Advanced Features (Tương lai)
- [ ] User authentication + backend
- [ ] Multiplayer quiz mode
- [ ] AI chatbot luyện hội thoại
- [ ] Mobile app (React Native)
- [ ] Community features

## 🎮 Demo & Screenshots

### Các tính năng chính:
1. **Dashboard**: Theo dõi tiến độ học tập với thống kê trực quan
2. **Lessons**: 15 bài học được sắp xếp từ cơ bản đến nâng cao
3. **Flashcard**: Hệ thống thẻ ghi nhớ với animation mượt mà
4. **Quiz**: Câu hỏi động với timer và feedback tức thì

### Browser Support:
- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🤝 Đóng góp

Ứng dụng này được tạo ra để hỗ trợ việc học tiếng Nhật hiệu quả. Mọi đóng góp và phản hồi đều được hoan nghênh!

### Cách đóng góp:
- Báo lỗi hoặc đề xuất tính năng qua Issues
- Fork và tạo Pull Request
- Chia sẻ feedback về UX/UI
- Đóng góp thêm từ vựng hoặc bài học

---

**Happy Learning! 頑張って！** 🌸✨

*"Học tiếng Nhật mỗi ngày, thành công sẽ đến gần!"*

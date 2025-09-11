# Hướng dẫn thiết kế UI/UX cho trang web học từ vựng

## 🎨 Nguyên tắc thiết kế

### Color Palette (Màu sắc Nhật Bản)
```css
:root {
  --sakura-pink: #FFB7C5;      /* Hoa anh đào */
  --deep-blue: #003366;        /* Xanh đậm truyền thống */
  --warm-white: #FFFEF7;       /* Trắng ấm */
  --red-accent: #E60012;       /* Đỏ Nhật */
  --gray-text: #4A5568;        /* Xám chữ */
  --success: #48BB78;          /* Xanh lá thành công */
  --warning: #ED8936;          /* Cam cảnh báo */
}
```

### Typography
- **Tiêu đề**: Noto Sans JP (hỗ trợ Kanji)
- **Nội dung**: Inter (dễ đọc)
- **Từ vựng Nhật**: Noto Sans JP
- **Size**: 16px base, scale 1.25

## 📱 Layout chính

### 1. Dashboard
```
┌─────────────────────────────────────┐
│ Header: Logo | Progress | Profile   │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Bài học │ │ Flashcard│ │ Quiz    │ │
│ │ 課1-22  │ │ ôn tập   │ │ kiểm tra│ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ Tiến độ học tập (biểu đồ)           │
├─────────────────────────────────────┤
│ Từ vựng gần đây | Từ cần ôn tập    │
└─────────────────────────────────────┘
```

### 2. Flashcard Interface
```
┌─────────────────────────────────────┐
│        [1/50] Bài 1 - Chào hỏi     │
├─────────────────────────────────────┤
│                                     │
│            おはよう                  │
│          ございます                   │
│                                     │
│         [Hiện nghĩa] [🔊]           │
│                                     │
├─────────────────────────────────────┤
│ [😰 Khó] [😐 Bình thường] [😊 Dễ]   │
└─────────────────────────────────────┘
```

### 3. Quiz Interface
```
┌─────────────────────────────────────┐
│ Quiz Bài 1 - Câu 5/20 ⏱️ 02:30    │
├─────────────────────────────────────┤
│ "Chào buổi sáng" trong tiếng Nhật: │
│                                     │
│ ○ A. こんにちは                      │
│ ○ B. おはようございます               │
│ ○ C. こんばんは                      │
│ ○ D. さようなら                      │
│                                     │
│           [Xác nhận]                │
└─────────────────────────────────────┘
```

## 🎯 Micro-interactions

### Feedback tức thì
- ✅ Màu xanh + âm thanh khi đúng
- ❌ Màu đỏ + rung nhẹ khi sai
- 🌟 Animation khi hoàn thành bài

### Loading states
- Skeleton loading cho danh sách từ vựng
- Progress bar cho quiz
- Smooth transition giữa các màn hình

## 📊 Data Visualization

### Progress Tracking
- Circular progress cho từng bài học
- Heatmap calendar (như GitHub)
- Bar chart cho accuracy rate
- Line chart cho learning streak

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Mobile-first approach
- Touch-friendly buttons (44px minimum)
- Swipe gestures cho flashcard
- Bottom navigation
- Pull-to-refresh

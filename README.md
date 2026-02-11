# ⚡ SparkLearn — AI-Powered Learning Companion

SparkLearn is an intelligent study assistant that leverages **Google Gemini AI** to create personalized learning experiences. It helps students break down complex topics, generate revision notes, practice with AI-generated quizzes, and track their progress over time.

Live website : [SparkLearn]()

## 🚀 Key Features

- **📚 AI Topic Eplainer**: Get simple, student-friendly explanations for any concept.
- **📅 Weekly Study Planner**: Generate a personalized 7-day study schedule based on your subjects.
- **📝 Smart Revision Sheets**: Instantly create concise revision notes for exam prep.
- **🧩 Practice Quizzes**: AI-generated MCQs that adapt difficulty based on your performance.
- **💬 Doubt Helper**: A conversational AI tutor to clear your doubts instantly.
- **📊 Progress Tracking**: Visual dashboard with study streaks, total study time, and topic mastery.
- **🔖 Bookmarks**: Save important topics and revision notes for later.
- **🌓 Dark/Light Mode**: Fully responsive UI with theme support.

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Modern CSS Variables & Flexbox/Grid)
- **Backend & Auth**: Firebase (Authentication + Firestore)
- **AI Engine**: Google Gemini 1.5 Flash (via `@google/genai` SDK)
- **Deployment**: Vercel

## 📦 Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- A Firebase project with Authentication & Firestore enabled
- A Google Gemini API key (from Google AI Studio)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yash-8055v/Micro-Learn.git
   cd spark-learn/mircrolearn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   VITE_LLM_API_KEY=your_gemini_api_key
   ```

4. **Run Locally**
   Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🚀 Deployment (Vercel)

This project is optimized for deployment on Vercel.

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Set the **Root Directory** to `mircrolearn`.
4. Add all environment variables from your `.env` file in Vercel's settings.
5. Click **Deploy**.

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, Sidebar, Cards)
├── pages/            # Main application pages
│   ├── Dashboard     # Progress overview
│   ├── TopicLearning # AI explanations
│   ├── WeeklyPlan    # Schedule generator
│   └── ...
├── services/         # API integration
│   ├── firebase.js       # Firebase config
│   ├── firestoreService.js # Database operations
│   └── llmService.js     # Gemini AI integration
├── utils/            # Helper functions & constants
└── App.jsx           # Root component with routing & auth logic
```

## 📄 License

This project is licensed under the MIT License.

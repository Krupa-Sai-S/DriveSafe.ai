# 🛡️ Aura Vision AI
### *Next-Gen Real-Time Driver Monitoring*

**Aura Vision AI** is a state-of-the-art safety application designed to prevent road accidents caused by driver fatigue. Utilizing cutting-edge computer vision and AI, the platform monitors driver alertness in real-time and provides instant interventions.

---

## 🚀 Key Features

*   **Real-Time Drowsiness Detection**: High-precision eye and head position tracking using Google's **MediaPipe Vision**.
*   **Instant Alerts**: Audio-visual warnings triggered the moment fatigue is detected.
*   **Comprehensive Analytics**: Visualized driver performance charts powered by **Recharts**.
*   **Professional Reporting**: Generate and download detailed **PDF and HTML reports** of driving sessions, including safety scores and recommendations.
*   **Modern UI/UX**: A sleek, high-performance interface built with **Tailwind CSS**, **Framer Motion**, and **Radix UI**.
*   **Performance Monitoring**: Integrated with **Vercel Speed Insights** and Analytics for real-time performance tracking.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **AI/ML**: MediaPipe Face Landmarker
- **Reporting**: jsPDF (for PDF generation)
- **Monitoring**: Vercel Speed Insights & Web Analytics
- **Components**: Shadcn UI (Radix UI)

---

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Krupa-Sai-S/DriveSafeVision.ai.git
    cd DriveSafeVision.ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in your browser:**
    Navigate to `http://localhost:3000` to see the application in action.

---

## 📊 How It Works

1.  **Calibration**: The app uses your webcam to establish a baseline for your eye-openness and head position.
2.  **Monitoring**: Real-time analysis calculates the **EAR (Eye Aspect Ratio)** and **MAR (Mouth Aspect Ratio)**.
3.  **Alerting**: If parameters fall below safety thresholds for a specific duration, an alarm is triggered.
4.  **Data Export**: At the end of a session, a safety report is compiled, offering actionable advice for the driver.

---

## 🌐 Deployment

The project is optimized for deployment on **Vercel**. 

- Live URL: [https://drivesafevisionai.vercel.app/](https://drivesafevisionai.vercel.app/)

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Visionary Developer** - [Project Hub](https://aura-vision-ai.vercel.app/)  
**Project Link**: [https://github.com/AuraVisionAI/AuraVision](https://github.com/AuraVisionAI/AuraVision)

---
*Developed with ❤️ to save lives on the road.*

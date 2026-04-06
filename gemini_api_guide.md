# Google Gemini API Configuration Guide

To enable the Aura AI Assistant, you need a Google Gemini API key. Follow these steps:

### 1. Generate Your API Key
1.  Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Click on **"Create API key in new project"** or select an existing project.
3.  Copy the generated API key.

### 2. Configure Environment Variable
1.  In the root of this project, create a new file named **`.env.local`**.
2.  Paste the following line into the file, replacing `YOUR_API_KEY_HERE` with your actual key:
    ```env
    GOOGLE_GENERATIVE_AI_API_KEY=YOUR_API_KEY_HERE
    ```
3.  Save the file.

### 3. Restart the Application
- If your development server is already running, stop it and run `npm run dev` again to load the new environment variable.

---

> [!TIP]
> **Is the API Key Free?**
> Yes, Google offers a generous free tier for Gemini 1.5 Flash, which is perfect for this application. You shouldn't need a billing account for basic usage.

> [!CAUTION]
> **Security Warning**
> Never commit your `.env.local` file to public repositories (like GitHub). The application's `.gitignore` is already set up to protect it, but stay vigilant!

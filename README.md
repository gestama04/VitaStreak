# 💊 VitaStreak

> AI-powered supplement routine manager for Android, built with **React Native**, **Expo**, **TypeScript**, **Supabase**, and **Google Gemini**.

<p align="center">
  <img src="assets/images/vitastreak-logo.png" alt="VitaStreak logo" width="140" />
</p>

<p align="center">
  <a href="https://play.google.com/store/apps/details?id=com.gestama.vitastreak"><strong>Download VitaStreak on Google Play</strong></a>
</p>

---

## 📱 Overview

**VitaStreak** helps users organize supplement routines, schedule reminders, track daily adherence, maintain streaks, and review routine information with AI-assisted tools.

The Android app combines local notifications, cloud synchronization, an Android home-screen widget, label recognition, and a bilingual interface in Portuguese and English.

> **Medical disclaimer:** VitaStreak is an organizational and educational tool. It does not provide diagnosis, prescribe treatment, recommend medical dosages, or replace advice from a qualified healthcare professional.

---

## ✨ Features

### 👤 Account and profile

- Secure authentication with Supabase Auth
- Email verification and password recovery
- User profile management
- Profile photo upload
- Account deletion through a Supabase Edge Function

### 💊 Supplement management

- Add, edit, activate, deactivate, and remove supplements
- Store product images
- Manage brands, dosages, units, ingredients, serving information, and schedules
- View complete supplement details
- Mark individual or all daily doses as completed

### ⏰ Smart reminders

- Multiple reminders per day
- Daily schedules
- Selected weekdays
- Alternate-day routines
- Custom intervals
- Local notifications
- Automatic notification rescheduling when routines change

### 🔥 Progress, streaks, and history

- Daily adherence and progress tracking
- Streak calculation
- Weekly consistency overview
- Last 30 days of history
- Completion status by supplement
- Streak Freeze support

### 📲 Android home-screen widget

- Current streak
- Daily completion percentage
- Completed and total doses
- Seven-day status overview
- Portuguese and English content
- Tap to open the VitaStreak Home screen

### 🤖 VitaStreak AI

VitaStreak uses Google Gemini through Supabase Edge Functions. The API key remains on the server rather than in the mobile application.

AI-assisted features include:

- Supplement label analysis from photographs
- Structured extraction of product and ingredient information
- General supplement routine review
- Identification of possible ingredient duplication
- General timing observations
- Suggested questions to discuss with a healthcare professional
- Routine-aware chat in Portuguese and English

AI output is informational only and is constrained not to diagnose, prescribe treatment, or recommend dosages.

### ☁️ Cloud features

- Supabase Authentication
- PostgreSQL database
- Row Level Security
- Supabase Edge Functions
- Cloudinary image storage

### 🎨 User experience

- Modern Android interface
- Light and dark themes
- Portuguese and English localization
- Fast navigation with Expo Router
- Responsive screen layouts
- First-run setup for notifications, legal acceptance, and widget installation

---

## 🛠️ Tech stack

### Mobile

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- React Native Android Widget

### Backend

- Supabase
- PostgreSQL
- Row Level Security
- Deno Edge Functions

### Artificial intelligence

- Google Gemini API
- `@google/generative-ai`

### Cloud and device services

- Cloudinary
- Expo Notifications
- Expo Image Picker
- Expo Image Manipulator
- Expo File System
- React Native SVG
- AsyncStorage

---

## 📁 Project structure

```text
app/
assets/
components/
contexts/
hooks/
i18n/
services/
supabase/
types/
utils/
widgets/
```

---

## 🚀 Local development

Clone the repository:

```bash
git clone https://github.com/gestama04/VitaStreak.git
cd VitaStreak
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npx expo start
```

Run project checks:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo install --check
```

> The Android widget is a native feature and is not available in Expo Go. Use an Android development, preview, or production build to test it.

---

## 🔐 Environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

The Gemini API key must not be stored in the frontend. Add it to Supabase Secrets:

```bash
npx supabase secrets set GEMINI_API_KEY=your_api_key
```

For remote EAS builds, provide `google-services.json` as a `GOOGLE_SERVICES_JSON` file environment variable in the appropriate EAS environment.

Never commit `.env`, API keys, service-role keys, keystores, or private credentials.

---

## 🧠 AI workflow

1. The user captures or selects a supplement label.
2. The app optimizes the image.
3. The app calls a Supabase Edge Function.
4. The Edge Function sends the image and instructions to Google Gemini.
5. The model returns structured information.
6. The Edge Function validates and normalizes the response.
7. The user reviews the information before saving it.

Routine review and chat follow the same server-side model, using active supplement data and the selected application language.

---

## 📦 Android builds

Preview APK:

```bash
npx eas-cli@latest build -p android --profile preview
```

Production Android App Bundle:

```bash
npx eas-cli@latest build -p android --profile production
```

Current Android configuration:

- Package: `com.gestama.vitastreak`
- Minimum Android API: 24
- Target Android API: 36
- Expo SDK: 57
- Published version: **1.1.0**
- Version code: **10**

---

## 📸 Screenshots

Current Google Play screenshots showcase:

- Home dashboard
- AI-assisted label recognition
- AI-generated supplement summary
- Today's routine
- Supplement list

See the published listing on [Google Play](https://play.google.com/store/apps/details?id=com.gestama.vitastreak).

---

## ⚠️ Project status

VitaStreak **1.1.0 is published on Google Play**.

The repository is maintained as an active product and portfolio project. Running the complete application locally requires configuration of its external cloud services.

Planned future improvements include expanded AI document understanding, voice input, refined Streak Freeze rewards, and additional localization based on user demand.

---

## ⚕️ Medical disclaimer

VitaStreak helps users organize supplement routines and provides general AI-generated information.

The application:

- does **not** diagnose diseases
- does **not** prescribe treatments
- does **not** recommend medical dosages
- does **not** replace professional medical advice

Always consult a qualified healthcare professional before making decisions regarding supplements or medication.

---

## 📄 License

This project is available for portfolio and educational purposes. No permission is granted to redistribute it as a competing commercial product without authorization.

---

## 👨‍💻 Author

**Bernardo Silva**

Software Engineer / Mobile Developer / Web Lead

- GitHub: https://github.com/gestama04
- LinkedIn: https://www.linkedin.com/in/eng-bernardo-silva

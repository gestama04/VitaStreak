# 💊 VitaStreak

> AI-assisted supplement routine manager for Android, built with React Native, Expo, TypeScript, Supabase, PostgreSQL, and Google Gemini.

<p align="center">
  <img src="assets/images/vitastreak-logo.png" alt="VitaStreak logo" width="140" />
</p>

<p align="center">
  <a href="https://play.google.com/store/apps/details?id=com.gestama.vitastreak">
    <strong>Download on Google Play</strong>
  </a>
  ·
  <a href="https://github.com/gestama04/VitaStreak">
    <strong>View source code</strong>
  </a>
</p>

---

## Overview

VitaStreak helps users organize supplement routines, schedule reminders, track daily adherence, maintain streaks, and review routine information through AI-assisted workflows.

The application combines:

- Secure authentication
- Flexible supplement schedules
- Local notifications
- Adherence and streak tracking
- AI-assisted label extraction
- Supabase Edge Functions
- PostgreSQL with Row Level Security
- Cloudinary image storage
- Native Android home-screen widget
- Portuguese and English localization

> **Medical disclaimer:** VitaStreak is an organizational and educational tool. It does not diagnose diseases, prescribe treatments, recommend dosages, or replace advice from a qualified healthcare professional.

---

## Features

### 👤 Authentication and profiles

- Supabase Auth authentication
- Email verification
- Password recovery
- User profile management
- Profile image uploads
- Account deletion through a protected Edge Function

### 💊 Supplement management

- Add, edit, activate, deactivate, and remove supplements
- Store product images
- Manage brands, ingredients, serving information, units, and dosages
- Configure individual supplement routines
- Mark individual or all daily doses as completed

### ⏰ Flexible reminders

- Multiple reminders per day
- Daily schedules
- Selected weekdays
- Alternate-day routines
- Custom intervals
- Local notifications
- Automatic notification rescheduling when routines change

### 🔥 Progress and adherence

- Daily completion tracking
- Streak calculation
- Weekly consistency overview
- Last 30 days of history
- Completion status by supplement
- Streak Freeze support

### 📲 Android home-screen widget

The native widget displays:

- Current streak
- Daily completion percentage
- Completed and total doses
- Seven-day status overview
- Portuguese and English content
- Direct navigation to the VitaStreak home screen

> The widget requires an Android development, preview, or production build. It is not available in Expo Go.

---

## AI-assisted workflows

VitaStreak uses Google Gemini through Supabase Edge Functions. The Gemini API key remains server-side and is never exposed in the mobile application.

### Label extraction

The label workflow:

1. The user captures or selects a supplement label.
2. The image is optimized on the device.
3. The application calls a Supabase Edge Function.
4. The Edge Function sends the image and instructions to Google Gemini.
5. Gemini returns structured product and ingredient information.
6. The response is validated and normalized.
7. The user reviews the information before saving it.

### Routine review and chat

The application also supports AI-assisted routine reviews and contextual chat using the user's active supplement data and selected application language.

AI-assisted features may include:

- Product and ingredient extraction
- Possible ingredient duplication identification
- General timing observations
- Routine summaries
- Suggested questions for discussion with a healthcare professional
- Portuguese and English routine-aware chat

AI output is informational only and does not provide diagnosis, treatment, or dosage recommendations.

---

## Cloud architecture

- **Authentication:** Supabase Auth
- **Database:** PostgreSQL
- **Authorization:** Row Level Security
- **Server-side workflows:** Supabase Edge Functions
- **AI integration:** Google Gemini API
- **Image storage:** Cloudinary
- **Notifications:** Expo Notifications
- **Mobile application:** React Native and Expo

---

## Tech stack

### Mobile

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- React Native Android Widget

### Backend and data

- Supabase
- PostgreSQL
- Row Level Security
- Deno Edge Functions

### Artificial intelligence

- Google Gemini API
- `@google/generative-ai`
- Structured extraction workflows
- Server-side API integration
- Response validation and normalization

### Device and cloud services

- Cloudinary
- Expo Notifications
- Expo Image Picker
- Expo Image Manipulator
- Expo File System
- React Native SVG
- AsyncStorage

---

## Project structure

```text
app/             Application routes and screens
assets/          Images, icons, and static assets
components/      Reusable interface components
contexts/        Application state providers
hooks/           Reusable React hooks
i18n/            Portuguese and English translations
services/        API and application services
supabase/        Database and Edge Function configuration
types/           Shared TypeScript types
utils/            Shared utility functions
widgets/         Native Android widget implementation
```

---

## Local development

### Requirements

- Node.js
- npm
- Android development environment or Expo-compatible device
- Supabase project
- Cloudinary account
- Google Gemini API access

### Installation

```bash
git clone https://github.com/gestama04/VitaStreak.git
cd VitaStreak
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

> Native Android features, including the home-screen widget, require a development, preview, or production build.

---

## Environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Configure the Gemini API key as a Supabase secret:

```bash
npx supabase secrets set GEMINI_API_KEY=your_api_key
```

For remote EAS builds, provide `google-services.json` through the appropriate EAS environment configuration.

Never commit:

- `.env` files
- API keys
- Supabase service-role keys
- Android keystores
- Private credentials
- Production secrets

---

## Android builds

Preview APK:

```bash
npx eas-cli@latest build -p android --profile preview
```

Production Android App Bundle:

```bash
npx eas-cli@latest build -p android --profile production
```

### Current Android configuration

- **Package:** `com.gestama.vitastreak`
- **Minimum Android API:** 24
- **Target Android API:** 36
- **Expo SDK:** 57
- **Published version:** `1.1.2`
- **Version code:** `10`

---

## Screenshots and release

The current Google Play listing includes screenshots of:

- Home dashboard
- AI-assisted label recognition
- AI-generated supplement summaries
- Daily supplement routines
- Supplement management

[View VitaStreak on Google Play](https://play.google.com/store/apps/details?id=com.gestama.vitastreak)

---

## Project status

VitaStreak **1.1.2 is published on Google Play**.

The repository is actively maintained as a product and portfolio project. Running the complete application locally requires configuration of Supabase, Cloudinary, Google Gemini, Android tooling, and other external services.

Possible future improvements include:

- Expanded AI document understanding
- Voice input
- Refined Streak Freeze rewards
- Additional localization
- Further accessibility improvements
- More detailed routine analytics

---

## Medical disclaimer

VitaStreak provides organizational functionality and general AI-generated information.

The application:

- Does **not** diagnose diseases
- Does **not** prescribe treatments
- Does **not** recommend medical dosages
- Does **not** replace professional medical advice

Always consult a qualified healthcare professional before making decisions about supplements or medication.

---

## License

This project is available for portfolio and educational purposes.

No permission is granted to redistribute or commercially exploit the project as a competing product without prior authorization.

---

## Author

**Bernardo Silva**

Software Engineer · React Native · TypeScript · Frontend

- **GitHub:** [github.com/gestama04](https://github.com/gestama04)
- **LinkedIn:** [linkedin.com/in/eng-bernardo-silva](https://www.linkedin.com/in/eng-bernardo-silva)
- **Portfolio:** [gestama04.github.io/CURRICULO-DIGITAL](https://gestama04.github.io/CURRICULO-DIGITAL/)
- **Google Play:** [VitaStreak](https://play.google.com/store/apps/details?id=com.gestama.vitastreak)

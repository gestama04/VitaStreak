# 💊 VitaStreak

> AI-powered supplement management application built with **React Native**, **Expo** and **TypeScript**, helping users organize supplement routines, track adherence, receive intelligent insights and build healthier daily habits.

<p align="center">
  <img src="assets/images/logo.png" alt="VitaStreak Logo" width="140"/>
</p>

---

## 📱 Overview

**VitaStreak** is a mobile application developed with **React Native + Expo** to simplify supplement and vitamin management.

The application allows users to create personalized supplement routines, receive reminders, track daily consistency through streaks, analyse supplement labels using **Artificial Intelligence**, and obtain an overall review of their routine.

The project combines modern mobile development with cloud technologies and AI to provide a complete supplement management experience.

> **Medical Disclaimer:** VitaStreak is an organizational tool and does not replace professional medical advice, diagnosis or treatment.

---

# ✨ Features

## 👤 Account & Profile

* Secure authentication with Supabase Auth
* Email verification
* Password recovery
* User profile management
* Profile photo upload
* Account deletion through Supabase Edge Functions

---

## 💊 Supplement Management

* Add, edit and remove supplements
* Product image storage
* Brand, dosage and ingredient management
* Active ingredient tracking
* AI-generated supplement insights
* Active / inactive supplements
* Detailed supplement information

---

## ⏰ Smart Reminders

Create flexible supplement schedules with support for:

* Multiple daily reminders
* Daily schedules
* Specific weekdays
* Alternate-day routines
* Custom intervals
* Local notifications
* Automatic reminder rescheduling

Users can also mark all daily supplements as completed with a single action.

---

## 🔥 Streak & History

* Daily adherence tracking
* Streak calculation
* Weekly consistency widget
* Last 30 days history
* Supplement completion status
* Daily progress tracking

---

## 🤖 Artificial Intelligence

VitaStreak integrates **Google Gemini AI** to analyse supplement labels directly from photographs.

The AI automatically extracts:

* Supplement name
* Brand
* Main ingredient
* Dosage
* Units
* Serving size
* Package quantity
* Label instructions
* Active ingredients
* General benefits
* Safety notes

The application also includes:

* AI-powered supplement routine review
* Local AI coach suggesting schedule improvements and identifying possible duplicate supplements.

---

## ☁️ Cloud Features

* Supabase Authentication
* PostgreSQL Database
* Row Level Security
* Edge Functions
* Cloudinary image storage

---

## 📲 Notifications

Built using **Expo Notifications**, allowing users to receive reminders according to their personalized supplement schedule.

Notifications are automatically updated whenever routines change.

---

## 🎨 User Experience

* Modern mobile interface
* Light & Dark themes
* Fast navigation
* Responsive design
* Optimized user experience

---

# 🛠️ Tech Stack

## Mobile

* React Native
* Expo SDK 54
* Expo Router
* TypeScript

## Backend

* Supabase
* PostgreSQL
* Edge Functions
* Row Level Security

## Artificial Intelligence

* Google Gemini API

## Cloud Services

* Cloudinary

## Other Technologies

* Expo Notifications
* Expo Image Picker
* Expo Image Manipulator
* Expo File System
* React Native SVG
* AsyncStorage

---

# 📁 Project Structure

```text
app/
components/
hooks/
services/
supabase/
types/
utils/
assets/
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/gestama04/VitaStreak.git
```

Install dependencies:

```bash
npm install
```

If dependency conflicts occur:

```bash
npm install --legacy-peer-deps
```

Start the development server:

```bash
npx expo start
```

Useful commands:

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run test
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Gemini API keys should never be stored in the frontend.

Use Supabase Secrets instead:

```bash
npx supabase secrets set GEMINI_API_KEY=your_api_key
```

Never commit API keys, service role keys or private credentials.

---

# 📸 Screenshots

Screenshots will be added soon.

Suggested screenshots:

* Welcome
* Login
* Home
* Supplements
* AI Label Recognition
* AI Routine Review
* History
* Profile
* Settings

---

# 🧠 Artificial Intelligence Workflow

1. User selects or captures a supplement label.
2. The image is optimized.
3. The application calls a Supabase Edge Function.
4. The Edge Function sends the image to Google Gemini.
5. Structured supplement information is returned to the application.
6. Users can review and save the generated data.

---

# 📦 Android Build

Production build:

```bash
eas build -p android --profile production
```

Preview APK:

```bash
eas build -p android --profile preview
```

Current configuration:

* Android Package: `com.gestama.vitastreak`
* iOS Bundle Identifier: `com.gestama.vitastreak`
* Version: **1.0.0**

---

# ⚠️ Current Status

This repository is maintained for portfolio purposes.

The project is fully implemented and demonstrates the complete architecture of the application.

Some cloud services may require additional configuration before running the application locally.

---

# ⚕️ Medical Disclaimer

VitaStreak helps users organize supplement routines and provides general AI-generated information.

The application:

* does **not** diagnose diseases
* does **not** prescribe treatments
* does **not** recommend medical dosages
* does **not** replace professional medical advice

Always consult a qualified healthcare professional before making decisions regarding supplements or medication.

---

# 📄 License

This project is available for portfolio and educational purposes.

---

# 👨‍💻 Author

**Bernardo Silva**

Software Engineer / Mobile Developer / Web Lead

GitHub: https://github.com/gestama04

LinkedIn: https://www.linkedin.com/in/eng-bernardo-silva

# FitTrack: Social Fitness & Habit Tracker

FitTrack is a premium, full-stack web application designed for fitness enthusiasts who want to track their progress, optimize their training, and engage with a community. It combines deep analytics (1RM, Volume, Muscle Balance) with social interactions and smart habit reminders.

## 🚀 Key Features

### 🏋️ Training & Workouts
- **Guided Workout Sessions**: Log sets, reps, and weight in real-time with a sleek, responsive interface.
- **1RM Calculator**: Automatically estimates your One-Rep Max using multiple scientific formulas (Epley, Brzycki, etc.).
- **Rest Timer**: Integrated countdown timer that auto-starts after logging a set. Features sound/visual alerts and customizable durations.
- **Workout Templates**: Save your favorite routines as templates to start future workouts with a single tap.
- **Exercise History**: View detailed history and PR progression for every exercise.

### 📊 Advanced Analytics
- **Volume Tracking**: Interactive line and bar charts showing training volume (Weight × Reps) over time.
- **Muscle Group Balance**: A sophisticated Radar Chart that visualizes your training distribution across major muscle groups.
- **Progressive Charts**: Real-time visualization of 1RM trends and personal records.
- **Personal Records (PRs)**: Automated detection and "PR" badge alerts when you hit a new high.

### 👥 Community & Social
- **Community Feed**: A dynamic social forum where users can share their workouts and progress.
- **Social Interaction**: Like and comment on posts to encourage fellow athletes.
- **Profile Customization**: Personalize your profile with photos and privacy controls (control who sees your PRs or profile picture).

### 💧 Habits & Reminders
- **Hydration Tracking**: Log daily water intake with a visual progress ring.
- **Telegram Reminders**: Receive smart hydration reminders via Telegram.
- **DND (Do Not Disturb)**: Configure quiet hours so you aren't disturbed at night.
- **Reminders Frequency**: Fully customizable notification intervals (15m to 2h).

---

## 🛡️ Admin Features
FitTrack includes a robust Admin Dashboard for platform management:
- **User Management**: View all registered users and manage their account status (active/deactivated).
- **Telegram Configuration**: Securely update the global Telegram Bot Token.
- **Emergency Password Reset**: Admins can force-reset user passwords if access is lost.
- **Platform Oversight**: Monitor community activity and system health.

---

## 🛠️ Technology Stack
- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion, Chart.js, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose).
- **Integrations**: Telegram Bot API, Web Audio API (for rest timer).

---

## 📖 How to Use

### For Users
1. **Sign Up**: Create an account and set your training goals.
2. **Set Up Telegram**: Go to your Profile, find your Chat ID via @userinfobot, and enter it to start receiving hydration reminders.
3. **Start a Workout**: Use the Quick Start or select a saved Template.
4. **Track Progress**: Visit the Analytics tab to see your Muscle Group balance and 1RM trends.

### For Admins
1. **Access Dashboard**: Admins have a dedicated "Admin Dashboard" link in the navbar.
2. **Bot Setup**: Enter your Telegram Bot Token in the "Bot Settings" section to enable platform-wide reminders.
3. **User Support**: Use the User Management tab to help users with account issues.

---

*Built with passion for the FitTrack Community.*

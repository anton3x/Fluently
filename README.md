# Fluently

Fluently is a mobile language-learning app built with Expo and React Native. It helps users build a language habit by practicing one question at a time.

The app currently includes:

- Guided onboarding with app-language selection.
- A learn dashboard with practice progress.
- Question-based language practice with answer feedback.
- Local question importing from JSON files.
- Voice selection and speech support.
- Daily practice reminders.
- English, Portuguese, Spanish, French, German, and Italian translations.
- Light and dark themes using HeroUI Native.
- Local data storage using Expo SQLite and Drizzle ORM.

## Getting Started

Install dependencies with Bun:

```bash
bun install
```

Start the Expo development server:

```bash
bun run start
```

From the Expo CLI, press `a` for Android, `i` for iOS on macOS, or scan the QR code with Expo Go.

The package scripts are also available directly:

```bash
bun run android
bun run ios
```

## Development Checks

```bash
bun run typecheck
bun run lint
bun run format:check
bun run db:check
```

Format the project with:

```bash
bun run format
```

Generate Drizzle migrations with:

```bash
bun run db:generate
```

## Native Development Builds

Use these commands when you need a local native build instead of Expo Go:

```bash
bunx expo run:android
bunx expo run:ios
```

Android builds require Android Studio. iOS builds require macOS and Xcode.

## Production Builds

The project is configured as an Expo app, but EAS has not been initialized yet. Install and authenticate with EAS, then initialize the project:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

Before creating store builds, add unique identifiers to `app.json`:

```json
{
  "ios": {
    "bundleIdentifier": "com.example.fluently"
  },
  "android": {
    "package": "com.example.fluently"
  }
}
```

Build for Android or iOS with EAS:

```bash
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

Build both platforms:

```bash
npx eas-cli@latest build --profile production
```

Submit a production build to the stores:

```bash
npx eas-cli@latest build --platform android --profile production --submit
npx eas-cli@latest build --platform ios --profile production --submit
```

Store submissions require the appropriate Google Play Console and Apple Developer accounts.

## Project Structure

```text
src/
  app/                       Expo Router routes
    (onboarding)/            Welcome and setup flow
    (main)/                  Learn and settings screens
  components/                Shared UI components
  db/                        Database schema and access
  features/
    questions/               Practice, import, and question data
    notifications/           Daily reminder service
  i18n/                      Translation resources
  stores/                    Persisted application settings
```

## Main Technologies

- Expo SDK 57
- React Native 0.86
- Expo Router
- HeroUI Native
- Uniwind and Tailwind CSS
- TanStack Query
- Zustand
- Drizzle ORM and Expo SQLite
- i18next and React i18next
- Expo Notifications and Expo Speech

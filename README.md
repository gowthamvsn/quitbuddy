# ReBoot: AI Nicotine Quit Coach

ReBoot is a browser-based coaching app that helps teens quit nicotine through voice conversation with an animated AI avatar. It combines speech recognition, a talking avatar, and a language model to walk users through cravings, track streaks, and reinforce healthy replacement habits.

## Features

- **Voice conversation**: users speak to the app and hear responses from a synthesized avatar, powered by Azure Speech (speech-to-text, text-to-speech, and avatar video).
- **Coaching logic**: a small dialogue state machine tracks where the user is (intro, craving, lapse, win) and adjusts the avatar's responses accordingly.
- **Grounded responses**: a lightweight retrieval layer pulls short, factual coping tips into the model's replies instead of relying on the model alone.
- **Safety redirect**: messages that touch on self-harm, medication, or therapy are intercepted and redirected to a fixed safety message rather than passed to the model.
- **Craving drills** — a guided box-breathing exercise appears automatically when the app detects a craving.
- **Streaks and progress** — successful check-ins build a visible day streak, with a confetti celebration on milestones.
- **Accounts and history** — users register and log in, with conversation history and preferences (avatar, speech speed) persisted per user.

## Tech stack

- React 18 + TypeScript, built with Vite
- Tailwind CSS
- Azure Cognitive Services Speech SDK (speech recognition, text-to-speech, and avatar rendering)
- Azure OpenAI (chat completions)
- MongoDB Atlas (user accounts, conversation history, preferences)

## Getting started

### Prerequisites

- Node.js 18 or later
- An Azure Speech resource (for the talking avatar and voice)
- An Azure OpenAI resource with a deployed chat model
- A MongoDB connection string (Atlas or self-hosted)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root with the following variables:

| Variable | Description |
|---|---|
| `VITE_AOAI_API_KEY` | Azure OpenAI API key |
| `VITE_AOAI_API_BASE` | Azure OpenAI resource endpoint |
| `VITE_AZURE_OPENAI_DEPLOYMENT` | Name of the deployed chat model |
| `VITE_AZURE_OPENAI_API_VERSION` | Azure OpenAI API version |
| `VITE_AOAI_EMBED_DEPLOYMENT` | Name of the deployed embedding model (if used) |
| `VITE_SPEECH_KEY` | Azure Speech resource key |
| `VITE_SPEECH_REGION` | Azure Speech resource region |
| `VITE_MONGO_URI` | MongoDB connection string |

`.env` is excluded from version control. Do not commit real credentials.

### Running locally

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default. A microphone is required to use voice input, and the Azure Speech and OpenAI keys must be set for the avatar and chat features to function.

### Other scripts

```bash
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint        # run ESLint
npm run typecheck   # run the TypeScript compiler in check-only mode
```

## Project structure

```
src/
  App.tsx              main application shell, auth views, and session flow
  brain/
    dsm.ts              dialogue state machine (intro / craving / lapse / win)
    rag.ts               local knowledge base of coping facts
    qa.ts                 lightweight retrieval and scoring over the knowledge base
    safety.ts            keyword-based safety filter and redirect message
    schema.ts            JSON schema the model's responses are constrained to
  components/
    Drill.tsx             guided box-breathing exercise
  lib/
    api.ts                 account and conversation persistence calls
    mongodb.ts             MongoDB Atlas client
```

## Current limitations

- Account creation and login run in an offline mock mode by default (`OFFLINE = true` in `src/lib/api.ts`); no backend server is included in this repository. Set that flag to `false` once a matching API server is available.
- The safety filter is keyword-based and intended as a basic guardrail, not a substitute for clinical oversight.
- This project follows WHO guidance on tobacco cessation content but is not a certified medical device. It directs users to contact a healthcare provider or emergency services when appropriate, and should not be used as a sole intervention for at-risk users.

## License

No license has been assigned yet. Treat this repository as private until one is added.

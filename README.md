# Qwintly — AI-Powered Web App Generator

Qwintly is an advanced, production-ready AI application generator. Describe what you want to build in plain English, chat with the AI to refine your requirements, and watch as Qwintly automatically architectures, builds, and deploys fully functional Next.js/Tailwind web applications.

---

## ✨ Features

- **💬 Natural Language Chat Interface**: Discuss and refine your app requirements dynamically with a conversational LLM.
- **⚡ Real-time Code Generation**: Generates clean, responsive, and modern source code, components, and page layouts.
- **🛠️ Integrated Code Editor**: Tweak and customize the generated code directly within the web app before exporting.
- **🚀 One-Click GitHub Export**: Instantly export your fully functional codebase directly to your own GitHub repository.
- **🌐 Direct Preview & Cloud Deployment**: Deploy your generated application to a live public URL with a single click.
- **🔑 Bring Your Own Key (BYOK)**: Connect your own LLM providers (e.g., Google Gemini) to power the application building.

---

## 🛠️ Technology Stack

Qwintly is built with a state-of-the-art serverless architecture:

### Frontend & App Framework
- **Next.js 15 (App Router)** & **React 19**
- **TypeScript** for robust type safety
- **TailwindCSS** for responsive styling and layout systems
- **Redux Toolkit** for smooth client-side state management

### AI & Agentic Workflow
- **Google Gemini APIs** (via `@google/genai` and `@langchain/google-genai`)
- **LangGraph** & **LangChain** for orchestrating complex agent planning, tool calling, and code generation steps
- **Tiktoken** for precise token count estimation

### Database & Authentication
- **Supabase** for secure user authentication, database management, and session handling

### Infrastructure & Queue Systems
- **Upstash Redis** & **BullMQ** for real-time code generation queues and event streaming
- **GCP Pub/Sub** for asynchronous application building and deployment pipelines
- **Google Cloud Run** for hosting generated previews and production workloads

---

## 🚀 Local Development Setup

To run Qwintly locally, follow these steps:

### Prerequisites
- Node.js 18+ and npm
- A GCP project with Pub/Sub enabled
- A Supabase project
- An Upstash Redis database

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/qwintly.git
cd qwintly
npm install
```

### 2. Environment Variables Setup
Create a `.env.local` file in the root directory and configure the following:

```env
# Gemini API Key (for code generation)
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL_GEN_EVENTS=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN_GEN_EVENTS=your_upstash_redis_token

# Google Cloud Platform Configurations
GCP_PROJECT_ID=your_gcp_project_id
PUBSUB_TOPIC_WEB_GEN=webgen-topic-dev
PUBSUB_TOPIC_WEB_DEPLOY=webdeploy-topic-dev

# Security & Captcha
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_key
WORKER_PUBLISH_SECRET=your_publish_secret
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to start developing.

---

## 🐳 Deployment

Qwintly is containerized and ready for cloud deployment.

### Docker Build
Build the optimized production container using the build-time environment arguments:
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-url" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-key" \
  --build-arg NEXT_PUBLIC_GA_ID="your-ga-id" \
  --build-arg NEXT_PUBLIC_SITE_URL="https://qwintly.com" \
  -t qwintly:latest .
```

### CI/CD Pipelines
The project includes pre-configured GitHub Action workflows under `.github/workflows/`:
- `ci-dev.yaml`: Automatic builds and deployments to the staging environment (`dev.qwintly.com`).
- `release-prod.yaml`: Triggers on semantic tag releases (`v*.*.*`) to deploy to the production environment (`qwintly.com`) on Google Cloud Run.

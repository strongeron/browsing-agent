# Stagehand & Mastra Integration

A powerful integration that combines the capabilities of [Browserbase's Stagehand](https://stagehand.dev) with [Mastra](https://mastra.ai/) for advanced web automation, scraping, and AI-powered web interactions.

## Overview

This project enables AI agents to interact with web pages through the Mastra framework using Stagehand's browser automation capabilities. It provides tools for web navigation, element observation, data extraction, and action execution, all orchestrated through Mastra's agent system.

## Features

- **Web Navigation**: Navigate to websites programmatically
- **Element Observation**: Identify and locate elements on web pages
- **Action Execution**: Perform actions like clicking buttons or filling forms
- **Data Extraction**: Extract structured data from web pages
- **Session Management**: Smart session handling with automatic timeouts and reconnection
- **AI-Powered Interactions**: Leverage OpenAI models for intelligent web interactions

## Installation

### Prerequisites

- Node.js (v22.13.0 or higher)
- pnpm (install with `npm install -g pnpm`)
- Browserbase account ([sign up here](https://www.browserbase.com/))
- API access for at least one model provider (OpenAI, Anthropic, Google, Groq, etc.)

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/mastra-ai/template-browsing-agent.git
   cd template-browsing-agent
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Create a `.env` file with your API keys:
   
   You can copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your actual API keys:
   ```
   # Required: Browserbase credentials
   BROWSERBASE_PROJECT_ID=your_project_id
   BROWSERBASE_API_KEY=your_api_key
   
   # Required: Model API key (use the one for your chosen model provider)
   # For OpenAI models (default):
   OPENAI_API_KEY=your_openai_key
   
   # For Anthropic models:
   # ANTHROPIC_API_KEY=your_anthropic_key
   
   # For Google models:
   # GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
   
   # For Groq models:
   # GROQ_API_KEY=your_groq_key
   
   # Optional: Override default model
   # MODEL=openai/gpt-4o
   ```

## Model Configuration

This template supports any AI model provider through Mastra's model router. You can use models from:

- **OpenAI**: `openai/gpt-4o-mini`, `openai/gpt-4o`
- **Anthropic**: `anthropic/claude-sonnet-4-5-20250929`, `anthropic/claude-haiku-4-5-20250929`
- **Google**: `google/gemini-2.5-pro`, `google/gemini-2.0-flash-exp`
- **Groq**: `groq/llama-3.3-70b-versatile`, `groq/llama-3.1-8b-instant`
- **Cerebras**: `cerebras/llama-3.3-70b`
- **Mistral**: `mistral/mistral-medium-2508`

Set the `MODEL` environment variable in your `.env` file to your preferred model.

## Usage

### Running the development server

```
pnpm run dev
```

This will start the Mastra development server, giving you access to the integrated web agent.

### Verifying Your Setup

After starting the dev server, you should see:
- Mastra server running (typically on `http://localhost:3000`)
- Access to the web agent through the Mastra UI
- Console logs indicating successful initialization

## Deployment to Mastra Cloud

This project is configured for deployment to [Mastra Cloud](https://cloud.mastra.ai/), which provides:
- **Agent Studio**: Test and interact with your agents directly in the cloud
- **Automatic deployments**: Continuous integration from GitHub
- **Built-in observability**: Traces stored in Mastra Cloud storage
- **Production-ready infrastructure**: Managed hosting for your Mastra applications

### Prerequisites

- A Mastra Cloud account ([Sign up here](https://cloud.mastra.ai/))
- Your project pushed to a GitHub repository
- Environment variables configured in Mastra Cloud dashboard

### Deployment Steps

1. **Sign in to Mastra Cloud**
   - Visit [https://cloud.mastra.ai/](https://cloud.mastra.ai/)
   - Sign in with your GitHub or Google account

2. **Install Mastra GitHub App**
   - When prompted, install the Mastra GitHub app
   - This enables automatic deployments from your repository

3. **Create a New Project**
   - Click "Create new project" in the dashboard
   - Search for and select your GitHub repository (`strongeron/browsing-agent`)
   - Click "Import"

4. **Configure Deployment Settings**
   - **Project Name**: `browsing-agent` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Project Root**: `/` (root directory)
   - **Mastra Directory**: `src/mastra` (auto-detected)
   - **Install Command**: `pnpm install`
   - **Port**: Auto-detected (typically `4113`)

5. **Set Environment Variables**
   Add the following environment variables in the Mastra Cloud dashboard:
   ```
   BROWSERBASE_PROJECT_ID=your_project_id
   BROWSERBASE_API_KEY=your_api_key
   OPENAI_API_KEY=your_openai_key
   MODEL=openai/gpt-4o
   
   # Optional: Langfuse observability
   LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
   LANGFUSE_SECRET_KEY=your_langfuse_secret_key
   LANGFUSE_BASE_URL=https://cloud.langfuse.com
   
   # Optional: OTLP endpoint (for local development only)
   # OTLP_ENDPOINT=http://localhost:58551/api/integrations/v1/traces
   # OTLP_TOKEN=your_token
   ```

6. **Deploy the Project**
   - Click "Deploy Project"
   - Mastra Cloud will build and deploy your application
   - Wait for the deployment to complete (usually 2-5 minutes)

7. **Access Agent Studio**
   - After deployment, navigate to your project dashboard
   - Click on "Agents" section
   - Select `web-agent` to open Agent Studio
   - Use the chat interface to interact with your agent

### Observability Configuration

The project is configured with environment-aware observability:

- **Local Development**: Uses `local` config with Console, Default, Langfuse, and OTLP exporters
- **Mastra Cloud**: Uses `cloud` config with Default (Agent Studio) and Langfuse exporters

The configuration automatically switches based on:
- `MASTRA_CLOUD=true` environment variable (set by Mastra Cloud)
- `NODE_ENV=production` (production deployments)

### Continuous Deployment

Once configured, any push to the `main` branch will automatically trigger a new deployment on Mastra Cloud. You can monitor deployments in the project dashboard.

### Monitoring and Logs

- **Logs**: View application logs in the Mastra Cloud dashboard
- **Traces**: Access traces through Agent Studio or Langfuse dashboard
- **Metrics**: Monitor performance and usage in the project overview

## Troubleshooting

### Common Issues

**Environment variables not loading:**
- Ensure your `.env` file is in the project root directory
- Check that variable names match exactly (case-sensitive)
- Restart the dev server after changing `.env` values

**Browserbase connection errors:**
- Verify your `BROWSERBASE_PROJECT_ID` and `BROWSERBASE_API_KEY` are correct
- Check your Browserbase account status and billing
- Ensure you have an active Browserbase project

**Model API errors:**
- Verify your API key is valid for the model provider you're using
- Check that you've set the correct environment variable for your chosen model
- Ensure your API key has sufficient credits/quota
- **OpenAI API Key Issues:**
  - If you see "Incorrect API key provided" error:
    1. Verify your key at https://platform.openai.com/account/api-keys
    2. Ensure the key starts with `sk-` (personal keys) or `sk-proj-` (project keys)
    3. Check that there are no extra spaces, quotes, or newlines in your `.env` file
    4. Regenerate the key if it's been revoked or expired
    5. Restart the dev server after updating the `.env` file
    6. Ensure your OpenAI account has billing enabled and sufficient credits

**Node.js version issues:**
- This project requires Node.js v22.13.0 or higher
- Check your version with `node --version`
- Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions if needed

**pnpm not found:**
- Install pnpm globally: `npm install -g pnpm`
- Or use npm/yarn if preferred (though pnpm is recommended)

## Architecture

### Core Components

1. **Stagehand Session Manager**
   - Handles browser session initialization and management
   - Implements automatic session timeouts
   - Provides error recovery and reconnection logic

2. **Mastra Tools**
   - `stagehandActTool`: Performs actions on web pages
   - `stagehandObserveTool`: Identifies elements on web pages
   - `stagehandExtractTool`: Extracts data from web pages

3. **Web Agent**
   - AI-powered agent using OpenAI's model
   - Provides natural language interface to web automation
   - Integrates all tools into a unified experience

### Flow Diagram

```
User Query → Mastra Agent → Stagehand Tools → Browser Interaction → Web Page → Data/Results → Agent Response
```

## Configuration

The project can be configured through the `.env` file and by modifying the agent instructions in `src/mastra/agents/web-agent.ts`.

## Credits

This project is built with:

- [Mastra](https://mastra.ai) - AI Agent framework
- [Stagehand by Browserbase](https:/stagehand.dev) - Browser automation
- [OpenAI](https://openai.com/) - AI models

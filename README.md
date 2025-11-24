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

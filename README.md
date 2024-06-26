# GPT-3 Powered Learning Tool

This repository contains the source code for the implementation of my bachelor thesis project, the GPT-3 Powered Learning Tool. The project aims to create a learning support tool that uses the GPT-3 model to provide explanatory texts, practice test questions, or flashcards based on the context provided by the user's study materials.

# Installation

First, clone the repository:

```bash
git clone git@github.com:ploca14/bachelor-project.git
```

Then, install the dependencies:

```bash
pnpm install
```

# Application configuration

Then you need to create a `.env` file in the `/app` directory based on the `.env.example` file.
In the `/app/.env` file, you need to fill in the following variables:

- NUXT_PUBLIC_SUPABASE_KEY: The public key of your Supabase project.
- NUXT_SUPABASE_SERVICE_KEY: The service key of your Supabase project.
- OPENAI_API_KEY: The secret OpenAI API key.

# Running Supabase locally

First you need to create a `.env` file in the root directory based on the `.env.example` file.
In the `.env` file, you need to fill in the following variables:

- SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: The client ID of your Google OAuth application.
- SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: The secret of your Google OAuth application.

You can create a new OAuth application in the Google Cloud Console. See the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2#1.-obtain-oauth-2.0-credentials-from-the-dynamic_data.setvar.console_name-.) for more information.

To run Supabase locally, you need to have Docker installed on your machine. Then, you can run the following command in the root directory of the project:

```bash
pnpm dlx supabase start
```

This will start the Supabase Docker container. You can access the Supabase dashboard at `http://localhost:54321`.
Once the container starts it will print the public and service keys to the console as `anon_key` and `service_role_key` respectively. You can use these keys to fill in the `.env` file in the `/app` directory.

# Running the application

To run the application, you can use the following command in the `/app` directory:

```bash
pnpm dev
```

This will start the application in development mode. You can access the application at `http://localhost:3000`.

# Running the tests

To run the tests, you can use the following command in the `/app` directory:

```bash
pnpm test
```

This will run the Vitest test suite.

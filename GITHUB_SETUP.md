# GitHub Actions Setup

## Setting the OpenAI API Key

To enable the daily refresh workflow, you need to add your OpenAI API key as a GitHub secret:

1. Go to your GitHub repository: `https://github.com/point-onefive/dagestani_mma`
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OPENAI_API_KEY`
5. Value: Your OpenAI API key
6. Click **Add secret**

## Testing the Workflow

The workflow runs automatically daily at 6 AM UTC, but you can test it manually:

1. Go to **Actions** tab in GitHub
2. Select **Daily Data Refresh** workflow
3. Click **Run workflow** → **Run workflow**

## What the Workflow Does

- Checks out the code
- Installs dependencies
- Runs `npm run refresh` to update data
- Commits and pushes any changes to data/*.json files
- Runs daily at 6 AM UTC (1 AM EST / 10 PM PST)

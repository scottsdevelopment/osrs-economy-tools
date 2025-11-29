---
description: how to deploy the application to GitHub Pages
---

# Deploying to GitHub Pages

This application is configured for static export and automatic deployment to GitHub Pages.

## Automatic Deployment

The application automatically deploys to GitHub Pages when you push to the `main` branch.

### Setup Steps:

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Build and deployment", select "GitHub Actions" as the source

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor deployment**:
   - Go to the "Actions" tab in your GitHub repository
   - Watch the deployment workflow progress
   - Once complete, your site will be available at: `https://<username>.github.io/<repository-name>/`

## Manual Build

To build the static export locally:

// turbo
```bash
npm run build
```

The static files will be output to the `out/` directory.

## Base Path Configuration

If your repository is not at the root of your GitHub Pages (e.g., `username.github.io/repo-name`), you'll need to update the `basePath` in `next.config.ts` to match your repository name.

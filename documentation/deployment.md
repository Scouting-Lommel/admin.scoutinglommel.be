# Deployment

## Table of contents

- [Resource providers](#resource-providers)
  - [DNS](#dns)
  - [Frontend hosting](#frontend-hosting)
  - [Backend hosting](#backend-hosting)
  - [Error tracking](#error-tracking)
  - [E-mail setup](#e-mail-setup)
- [Environments](#environments)

## Resource providers

| Resource       | Provider                                                  | Comments                                                                         |
| :------------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------- |
| DNS            | [Cloudflare](https://cloudflare.com/) DNS management      | DNS management DDoS protection.                                                  |
| Frontend app   | Hosting on [Vercel](https://www.vercel.app)               | Dynamic hosting with CI/CD capabilities for FE app.                              |
| Backend CMS    | Hosting on [Coolify](https://coolify.io)                   | Self-hosted Docker deployment with CI/CD capabilities.                           |
| Database       | MySQL database hosted on [Vimexx](https://www.vimexx.be/) | Both the development and production environments have a separate MySQL database. |
| Error tracking | [Sentry](https://www.sentry.com)                          | Error tracking in a Sentry dashboard.                                            |
| E-mail setup   | To be determined                                          | Check out the [e-mail setup docs](/documentation/e-mail-setup.md).               |

### DNS

DNS records are managed by [Cloudflare](https://www.cloudflare.com/). Cloudflare also offers a layer of securities like DDoS protection.

### Frontend hosting

The website's frontend is a NextJS application and is hosted on [Vercel](https://www.vercel.com). A CI/CD pipeline has been set up for automatic deployment when pushing changes and/or features to the `main` and `development` branches.

### Backend hosting

The website's backend CMS is a [Strapi](https://www.strapi.io) instance and is hosted on [Coolify](https://coolify.io). The deployment is containerized using Docker and automatically deploys when changes are pushed to the `main` branch.

#### Docker setup

The project uses a multi-stage Dockerfile:

- **Builder stage**: Installs dependencies using `pnpm` and builds the Strapi admin panel
- **Runner stage**: Copies the built application and runs it in production mode

Base image: `node:22-alpine` (required for pnpm 11.5.0 compatibility)

### Error tracking

Errors will be collected in a [Sentry](https://www.sentry.com) dashboard.

### E-mail setup

To be determined.

## CI/CD Pipeline

A GitHub Actions workflow is configured in `.github/workflows/ci.yml` to run on every push to `main` and on every pull request.

**Build steps:**
1. Check out the repository
2. Install pnpm 11.5.0
3. Set up Node.js 22
4. Install dependencies (`pnpm install --frozen-lockfile`)
5. Build the project (`pnpm build`)

**Required build secrets:**
The CI pipeline requires environment variables for the build. See the workflow file for the exact list.

## Docker & Build Configuration

### pnpm Workspace

The project uses `pnpm-workspace.yaml` to configure pnpm-specific settings:

- **allowBuilds**: Allows postinstall builds for native dependencies like `@swc/core`, `sharp`, `esbuild`
- **overrides**: Pins specific dependency versions for compatibility

This file must be included in the Docker build context alongside `package.json` and `pnpm-lock.yaml`.

### Security Headers (CSP)

The application configures custom Content Security Policy headers in `config/middlewares.js` to support:

- [Cloudinary](https://cloudinary.com) for image uploads
- [Google Maps](https://maps.google.com) for the maps plugin
- [Strapi](https://strapi.io) market assets

## Environments

This project consists of different environments, all of which having a different purpose.

| Environment | Branch        | Purpose               |
| :---------- | :------------ | :-------------------- |
| Production  | `main`        | Public website        |
| Development | `development` | Development & testing |

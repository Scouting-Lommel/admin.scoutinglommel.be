# Scouting Lommel Backend

Backend to the new and refreshed [Scouting Lommel website](https://www.scoutinglommel.be).

## Table of contents

- [Tech stack](#tech-stack)
- [Glossary](#glossary)
- [Installation](#installation)
- [Running locally](#running-locally)
- [Deployment](#deployment)

## Tech stack

- [Strapi](https://www.strapi.io) instance (= headless CMS)
- [MySQL](https://www.mysql.com) database
- [E-mail provider](/documentation/e-mail-setup.md) (to be determined)

## Glossary

> Glossary: an alphabetical list of words relating to a specific subject, text, or dialect, with explanations; a brief dictionary.

Don't understand a word or term? Look it up in the [glossary](/documentation/glossary.md).

## Installation

```bash
pnpm install
```

For detailed instructions and requirements, check out the [getting started docs](/documentation/getting-started.md).

## Running locally

```bash
pnpm dev
```

For detailed instructions, check out the [getting started docs](/documentation/getting-started.md#running-locally).

## Deployment

| Resource       | Provider                                                 | Comments                                                  |
| :------------- | :------------------------------------------------------- | :-------------------------------------------------------- |
| DNS            | [Cloudflare](https://www.cloudflare.com/) DNS management | DNS management with Cloudflare routing & DDoS protection. |
| Frontend app   | Hosting on [Vercel](https://www.vercel.com)              | Dynamic hosting with CI/CD capabilities for FE app.       |
| Backend CMS    | Hosting on [Coolify](https://coolify.io)                 | Self-hosted Docker deployment with CI/CD.               |
| Error tracking | [Sentry](https://www.sentry.com)                         | Error tracking in a Sentry dashboard.                     |

For a detailed view and instructions, check out the [deployment docs](/documentation/deployment.md).

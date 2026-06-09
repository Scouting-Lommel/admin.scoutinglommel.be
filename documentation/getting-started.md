# Getting started

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Running locally](#running-locally)
- [Building the project](#building-the-project)
  - [Local build](#local-build)
  - [Production build](#production-build)
- [Development](#development)
  - [Trunk-based development](#trunk-based-development)
- [Endpoints](#endpoints)

## Requirements

- [Node.js](https://nodejs.org) (>=20.0.0 <=24.x.x)
- [pnpm](https://pnpm.io) (v11.5.0 or compatible)
- [NVM](https://github.com/nvm-sh/nvm) (optional but recommended)
- [MySQL](https://www.mysql.com) database (hosted, local or [Docker](https://www.docker.com/))

## Installation

1. Clone this repo onto your machine and navigate to the local repo

   ```bash
   git clone https://github.com/Scouting-Lommel/admin.scoutinglommel.be.git
   cd admin.scoutinglommel.be
   ```

2. Copy the example environment file

   ```bash
   cp .env.example .env
   ```

3. Fill in `.env`. For environment values, contact repo owner.

4. Set the `Node.js` version (optional but recommended)

   ```bash
   nvm use
   ```

5. Install dependencies

   ```bash
   pnpm install
   ```

## Running locally

1. [Clone and install](#installation) this repo
2. Start the development server using

   ```bash
   pnpm dev
   ```

3. You can now visit the CMS admin panel on [port 1337](http://localhost:1337).

## Building the project

### Local build

1. [Clone and install](#installation) this repo
2. Produce a production build using `pnpm`

   ```bash
   pnpm build
   ```

### Production build

It is not necessary to build for production manually. A CI/CD pipeline has been set up for automatic deployment when pushing changes and/or features to the `main` branch.

For more info, check out the [deployment docs](/documentation/deployment.md).

## Development

### Trunk based development

> Trunk based development: a source-control branching model, where developers collaborate on code in a single branch called ‘trunk’, resist any pressure to create other long-lived development branches by employing documented techniques. They therefore avoid merge hell, do not break the build, and live happily ever after.

Instead of the traditional git-flow, this project is based on the [trunk based development](https://trunkbaseddevelopment.com/) principle.

## Endpoints

| Name                   | Description                                    | Endpoint                                                       |
| :--------------------- | :--------------------------------------------- | :------------------------------------------------------------- |
| Frontend (production)  | Production environment for the public website  | [phantomdev.be](https://www.phantomdev.be) (to be changed)     |
| Frontend (development) | Development environment for the public website | [development.phantomdev.be](https://development.phantomdev.be) (to be changed) |
| CMS                    | CMS admin panel                                | [cms.phantomdev.be](https://cms.phantomdev.be) (to be changed) |

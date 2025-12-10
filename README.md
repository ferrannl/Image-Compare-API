# Image-Compare-API

Node.js REST API that compares the similarity between images using the [Imagga](https://imagga.com/) image recognition service.

This project was originally built as a **Cloud Services** assignment and showcases:

- Third-party API integration  
- Authentication & authorization  
- MongoDB persistence  
- File uploads  
- XML/JSON content negotiation  
- Automated tests  
- Dockerized deployment  

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Database Seeding](#database-seeding)
  - [Running the API](#running-the-api)
  - [Running Tests](#running-tests)
- [API Overview](#api-overview)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Targets](#targets)
  - [Submissions & Image Comparison](#submissions--image-comparison)
  - [Nearby Targets](#nearby-targets)
  - [Response Format (JSON vs XML)](#response-format-json-vs-xml)
- [Docker](#docker)
- [Development Notes](#development-notes)
- [License](#license)

---

## Overview

**Image-Compare-API** exposes REST endpoints that:

- Accept images via multipart upload  
- Compare a user-submitted image with a stored target image through the **Imagga** similarity API  
- Return a similarity score and related metadata  
- Track “targets”, “submissions” and user achievements in MongoDB  
- Restrict access via JWT-based authentication and role-based authorization  

---

## Features

- **Imagga integration** for image-to-image similarity  
- **JWT authentication** with roles (`user`, `admin`)  
- **Image uploads** using `multer` (stored under `public/images`)  
- **MongoDB persistence** for users, targets, submissions and votes  
- **Achievements** based on submission scores  
- **Reputation / voting** system on targets  
- **Nearby target lookup** based on simple distance calculation  
- **JSON or XML responses** controlled via a request header  
- **Automated tests** using Mocha, Chai, Supertest and NYC  
- **Dockerfile** included for containerized deployment  

---

## Tech Stack

- **Runtime:** Node.js  
- **Web framework:** Express  
- **Database:** MongoDB (via Mongoose)  
- **Auth:** JWT (JSON Web Tokens)  
- **File uploads:** Multer  
- **HTTP client:** `got` (for Imagga API calls)  
- **Testing:** Mocha, Chai, Chai-HTTP, Supertest, NYC  
- **Containerization:** Docker  
- **Format conversion:** `xml-js` (JSON → XML)  

---

## Project Structure

```text
bin/                 # Helper / start scripts
config/              # App configuration (port, MongoDB, host, secrets)
controller/          # Controllers for users, targets, uploads, results, etc.
middleware/          # Authentication / authorization (JWT)
model/               # Mongoose models (User, Role, Target, Submission, ...)
public/
  images/            # Uploaded images
resources/           # Assignment documents, PDFs, reference material
routes/              # Express route definitions (/, /users, /targets, ...)
seed/
  seed.js            # Database drop + seeding entry point
  seedData.js        # Seed data for roles/users/targets
test/                # Automated tests

app.js               # Main Express application
Dockerfile           # Docker build instructions
package.json         # NPM metadata, dependencies & scripts
README.md            # This file
```

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)  
- npm (bundled with Node)  
- MongoDB running and reachable from the app  
- Imagga API credentials (API key + secret)  

> ⚠️ The repository currently contains hard-coded Imagga credentials in `controller/target.js`.  
> For real use, move these into environment variables.

---

### Installation
```bash
git clone https://github.com/ferrannl/Image-Compare-API.git
cd Image-Compare-API
npm install
```

---

### Configuration
Handled in `config/config.js` and environment variables.

Example `.env`:
```env
PORT=5000
PASSWORD_KEY=some_super_secret
MONGO_CONNECTION_STRING=mongodb://localhost:27017/webs5_end
HOST=http://localhost:5000
IMAGGA_API_KEY=...
IMAGGA_API_SECRET=...
```

---

### Database Seeding
```bash
node seed/seed.js
```

This drops the database and loads seed data from `seed/seedData.js`.

---

### Running the API
```bash
npm run build-dev   # Seed + run
npm start           # Run without reseeding
```

Default server: `http://localhost:5000`

---

### Running Tests
```bash
npm test
```

Runs Mocha + NYC test suite with coverage.

---

## API Overview

### Authentication
- **POST /signup** – create user  
- **POST /login** – login, returns JWT  
- **GET /achievements** – list user submissions with achieved flag  

### Users (admin only)
- **GET /users** – list users  
- **GET /users/:id** – get user  
- **PUT /users/:id** – update user  
- **DELETE /users/:id** – delete user  

### Targets
- **GET /targets** – list targets  
- **POST /targets** – create target (multipart form with image)  
- **PUT /targets/:id** – update target  
- **DELETE /targets/:id** – delete target  
- **GET /targets/:id/submissions** – list submissions for target  

### Submissions & Image Comparison
- **POST /targets/:id/submissions** – upload image, compare with target via Imagga, store score  
- **GET /targets/submissions/:id** – get submission  
- **DELETE /targets/submissions/:id** – delete submission (admin)  
- **PUT /targets/:id/vote** – vote on target  

### Nearby Targets
- **GET /targets/nearby/:lon/:lat** – return targets within threshold distance  

### Response Format
Default: JSON  
Set header `format: xml` → XML response  

---

## Docker

```bash
docker build -t image-compare-api .
docker run --rm \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_CONNECTION_STRING="mongodb://host.docker.internal:27017/webs5_end" \
  -e HOST="http://localhost:5000" \
  image-compare-api
```

---

## Development Notes

- Hard-coded Imagga credentials should be moved to environment variables  
- Seeding script drops the database – use only in development  
- Role management is simple: `/signup` → user role, admins seeded manually  

---

## License

This project uses the **ISC License** (see `package.json`).  
**Authors:** Ferran Hendriks, Nick van Hoesel
```

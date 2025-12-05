# Image-Compare-API

NodeJS ReST API to compare similarity between images using the [Imagga](https://imagga.com/) image recognition service.

This project was originally created as part of a *Cloud Services* assignment and demonstrates how to build a small but complete REST API with authentication, authorization, testing and third-party API integration.

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
- [Imagga Integration](#imagga-integration)
- [Development Notes](#development-notes)
- [License](#license)

---

## Overview

**Image-Compare-API** exposes REST endpoints that:

- Accept two images (usually as URLs or uploaded files).
- Send them to the **Imagga** API.
- Return a similarity score and related metadata.

It is designed as a simple backend service that can be used by web or mobile frontends which need “are these images the same or similar?” functionality.

---

## Features

- 🔗 **Third-party API integration** – Uses Imagga for image recognition and similarity.
- 🧪 **Automated testing** – Test suite for core functionality.
- 🔐 **Authentication & authorization** – Protected endpoints that require valid credentials.
- 🗂️ **MongoDB persistence** – For users, sessions and/or comparison history.
- 🌐 **RESTful design** – Clear separation into controllers, models, routes and middleware.
- 🐳 **Docker support** – Dockerfile to containerize the service.

---

## Tech Stack

- **Runtime:** Node.js
- **Web framework:** Express (via `app.js`)
- **Database:** MongoDB
- **Testing:** Node test tooling (see `test/` folder)
- **Containerization:** Docker (`Dockerfile`)
- **External service:** Imagga Image Recognition API

---

## Project Structure

High-level structure of the repository:

```text
bin/           # Server start / helper scripts
config/        # Configuration (DB, Imagga, environment)
controller/    # Route controllers (image comparison logic, auth logic, etc.)
middleware/    # Authentication / authorization / validation middleware
model/         # Mongoose (or similar) models for MongoDB
public/images/ # Public image assets for docs / examples
resources/     # Assignment docs, Postman collections or reference material
routes/        # Express route definitions
seed/          # Database seed scripts (e.g. demo users, sample data)
test/          # Automated tests
app.js         # Main Express application
Dockerfile     # Docker build instructions
README.md      # You are here :)

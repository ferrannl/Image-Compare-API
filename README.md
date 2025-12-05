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

- Accept images via multipart upload.
- Compare a user-submitted image with a stored target image through the **Imagga** similarity API.
- Return a similarity score and related metadata.
- Track “targets”, “submissions” and user achievements in MongoDB.
- Restrict access via JWT-based authentication and role-based authorization.

The API is suitable as a backend for web or mobile apps that need to answer questions such as:

> “How similar is this user’s photo to the reference image?”  
> “Which targets nearby can I submit a photo for?”

---

## Features

- **Imagga integration** for image-to-image similarity.
- **JWT authentication** with roles (`user`, `admin`).
- **Image uploads** using `multer` (stored under `public/images`).
- **MongoDB persistence** for users, targets, submissions and votes.
- **Achievements** based on submission scores.
- **Reputation / voting** system on targets.
- **Nearby target lookup** based on simple distance calculation.
- **JSON or XML responses** controlled via a request header.
- **Automated tests** using Mocha, Chai, Supertest and NYC.
- **Dockerfile** included for containerized deployment.

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

High-level structure of the repository:

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
  seedData.js        # Seed data for roles/users/targets (imported by seed.js)
test/                # Automated tests

app.js               # Main Express application
Dockerfile           # Docker build instructions
package.json         # NPM metadata, dependencies & scripts
README.md            # This file
```

---

Getting Started

Prerequisites

Node.js (LTS version recommended)

npm (bundled with Node)

MongoDB running and reachable from the app

Imagga API credentials (API key + API secret)


> ⚠️ The repository currently contains hard-coded Imagga credentials inside controller/target.js.
For real use, move these into environment variables and do not commit your own keys.




---

Installation

Clone the repository and install dependencies:

git clone https://github.com/ferrannl/Image-Compare-API.git
cd Image-Compare-API
npm install


---

Configuration

Configuration is handled in config/config.js and environment variables.

Available configuration keys (with defaults):

PORT / process.env.PORT → default: 5000

PASSWORD_KEY / process.env.PASSWORD_KEY → JWT secret

MONGO_ADDRESS / process.env.MONGO_ADDRESS → default: localhost

MONGO_PORT / process.env.MONGO_PORT → default: 27017

MONGO_DATABASE / process.env.MONGO_DATABASE → default: webs5_end

MONGO_USER / process.env.MONGO_USER

MONGO_PASSWORD / process.env.MONGO_PASSWORD

MONGO_CONNECTION_STRING / process.env.MONGO_CONNECTION_STRING
(overrides the address/port/db settings if provided)

HOST / process.env.HOST → default: http://localhost:5000
(used to build URLs for uploaded images when calling Imagga)


Example .env:

PORT=5000
PASSWORD_KEY=some_super_secret
MONGO_CONNECTION_STRING=mongodb://localhost:27017/webs5_end
HOST=http://localhost:5000
# IMAGGA_API_KEY=...
# IMAGGA_API_SECRET=...

> Note: The current code reads Imagga credentials directly from target.js.
You can refactor that to use process.env.IMAGGA_API_KEY / IMAGGA_API_SECRET if you like.




---

Database Seeding

The project includes a seeding script that:

Connects to MongoDB,

Drops the database,

Loads seed data from seed/seedData.js.


Run:

node seed/seed.js

Or use the npm build-dev script (see below) which seeds and then starts the API.


---

Running the API

From package.json:

"scripts": {
  "build-dev": "node seed/seed.js && node app.js",
  "release": "heroku container:push web -a cloud-services-webs-5 && heroku container:release web -a cloud-services-webs-5",
  "test": "nyc mocha --timeout 10000",
  "start": "node app.js"
}

Option 1: Seed + run (dev)

npm run build-dev

This will:

1. Drop & seed the MongoDB database (node seed/seed.js),


2. Start the Express app (node app.js).



Option 2: Run without reseeding

npm start
# or
node app.js

The server will start (by default) on http://localhost:5000.


---

Running Tests

Tests are located in the test/ directory and run via Mocha + NYC.

npm test

This will execute the test suite and collect coverage.


---

API Overview

The API is defined mainly in:

routes/index.js

routes/users.js

routes/targets.js

controller/*.js


All protected routes expect a JWT token in the x-access-token header.

Authentication

Signup

POST /signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret"
}

Creates a new user with role user.


Login

POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret"
}

Returns:

{
  "token": "<JWT_TOKEN>"
}

Use this token in subsequent requests:

x-access-token: <JWT_TOKEN>

Welcome

GET /

Simple JSON: { "welcome": "Welcome to api" }

Achievements

GET /achievements
x-access-token: <JWT_TOKEN>

Returns a list of submissions for the current user, with an achieved flag (true if the score meets the defined threshold).


---

Users

Defined in routes/users.js (all routes require admin role):

GET /users
List users with optional pagination & filters:

page, limit query params

email filter

role filter


GET /users/:id
Get a single user (including targets).

PUT /users/:id
Update email and/or role.

DELETE /users/:id
Delete a user and related targets/submissions.

GET /users/:id/targets/:tname/votes/:vote
Fetch votes on a specific target (tname) with a particular vote value for that user.


All of these expect:

x-access-token: <ADMIN_JWT_TOKEN>


---

Targets

Defined in routes/targets.js.
These routes require an authenticated user or admin (except where noted).

List targets

GET /targets
x-access-token: <JWT_TOKEN>

Query params:

page, limit

name – filter by target name

submissions – filter targets by number of submissions (0 for none, N>0 to require at least N submissions)


Get a single target

GET /targets/:id
x-access-token: <JWT_TOKEN>

Create a target

POST /targets
x-access-token: <JWT_TOKEN>
Content-Type: multipart/form-data

Fields:
  name   (string, required)
  lon    (number, longitude)
  lat    (number, latitude)
  radius (number)
  image  (file, .png/.jpg/.jpeg)

Internally:

The image is stored under public/images/....

The target is linked to the current user.

The user’s targets array is updated.


Update a target

PUT /targets/:id
x-access-token: <JWT_TOKEN>
Content-Type: application/json

{
  "name": "New name",
  "lon": 5.1234,
  "lat": 52.1234,
  "radius": 10,
  "description": "Optional description"
}

Only the owner of the target or an admin can update it.


Delete a target

DELETE /targets/:id
x-access-token: <ADMIN_JWT_TOKEN>

Deletes the target and its submissions.

Removes the target reference from the associated user.


List submissions for a target

GET /targets/:id/submissions
x-access-token: <JWT_TOKEN>

Returns a summary of submissions for that target, including scores and user info.

Get a single submission

GET /targets/submissions/:id
x-access-token: <JWT_TOKEN>

Delete a submission (admin)

DELETE /targets/submissions/:id
x-access-token: <ADMIN_JWT_TOKEN>


---

Submissions & Image Comparison

The core image comparison logic lives in controller/target.js.

Create a submission

POST /targets/:id/submissions
x-access-token: <JWT_TOKEN>
Content-Type: multipart/form-data

Fields:
  image  (file, .png/.jpg/.jpeg)

Flow:

1. The uploaded image is saved to public/images.


2. The API builds two URLs:

The new submission image URL.

The existing target image URL.



3. Both URLs are sent to the Imagga images-similarity endpoint.


4. The Imagga distance is transformed into a score stored on the submission.


5. The submission is linked to the target and the user.



> In local development (HOST containing localhost), the code uses two sample Amazon product images instead of the uploaded/target images.
This is part of the original assignment setup.



The stored score is roughly:

Higher score → more similar images.

Lower score → less similar.


You can use the score to decide if a user “matched” a target.

Vote / reputation

PUT /targets/:id/vote
x-access-token: <JWT_TOKEN>
Content-Type: application/json

{
  "vote": 1   // or -1, etc.
}

Adds a vote object ({ user, vote }) to the target’s votes array.


---

Nearby Targets

GET /targets/nearby/:lon/:lat
x-access-token: <JWT_TOKEN>

Loads all targets.

Computes a simple distance between the given point and each target.

Returns those that fall within a small threshold (see getNearby in controller/target.js).


This is a lightweight approximation suitable for the assignment, not a full geospatial query.


---

Response Format (JSON vs XML)

The controller result.js wraps all responses.

Default: JSON

If you set the request header:


format: xml

the response body will be returned as XML (converted from JSON using xml-js).

This is applied in most controllers via:

resultController.getResult(data, req);


---

Docker

A Dockerfile is provided for running the service in a container.

Typical flow:

# Build image
docker build -t image-compare-api .

# Run container
docker run --rm \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_CONNECTION_STRING="mongodb://host.docker.internal:27017/webs5_end" \
  -e HOST="http://localhost:5000" \
  image-compare-api

Adjust MongoDB connection string and host settings for your environment.


---

Development Notes

Hard-coded Imagga credentials in controller/target.js are part of the original assignment setup.
For any serious use, move those into environment variables and keep them out of source control.

The seeding script drops the entire database. Use it only in development or when you’re OK with losing data.

Role management is simple:

Users created via /signup are given the user role.

Admins can be seeded via seed/seedData.js or manually created.




---

License

This project uses the ISC license (see package.json) and is authored by:

Ferran Hendriks

Nick van Hoesel


0

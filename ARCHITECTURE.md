# Scent Lab Architecture

## Overview

Scent Lab is currently a mobile-first fragrance recommendation app built for an in-store shopping experience.

The current system has three main parts:

1. `apps/client`
   The Expo React Native mobile app used by shoppers or store associates.

2. `apps/server`
   A lightweight Express API that exposes fragrance catalog data and recommendation logic.

3. `packages/shared`
   Shared TypeScript contracts used by both the client and server so the data model stays consistent across the stack.

At this stage, the app is intentionally simple:

- the mobile app collects survey inputs
- the API returns recommendations
- the fragrance catalog is seeded in server code
- there is no persistent database yet

That choice was deliberate because this is still MVP-level product discovery, and recommendation logic is changing faster than persistence requirements.

## Why This Backend Design

The backend was designed around three product realities:

1. The user experience must feel fast in-store.
   A shopper standing near a fragrance shelf should not wait on a heavy backend workflow. A lightweight API with in-memory recommendation logic keeps response times low.

2. The recommendation model is still evolving.
   The quiz, scoring rules, and merchandising logic are still product decisions in motion. Hardening a full database schema too early would slow iteration.

3. The mobile client should stay thin.
   Recommendation logic belongs on the server, not inside the mobile UI, so the business rules can evolve without shipping a full app rebuild every time.

Because of that, the current backend is:

- simple
- typed
- deterministic
- easy to refactor into a database-backed service later

## Current System Components

### Client Layer

Location:

- [App.tsx](/Users/winniebrendawaiya/Documents/Playground/apps/client/App.tsx)
- [api.ts](/Users/winniebrendawaiya/Documents/Playground/apps/client/src/api.ts)

Responsibilities:

- render the mobile experience
- collect user survey answers
- fetch the fragrance catalog
- submit the recommendation request
- display recommendation results

The client currently stores survey inputs in React state. That means the mobile app holds the shopper profile only for the current session unless we later add persistence.

### API Layer

Location:

- [index.ts](/Users/winniebrendawaiya/Documents/Playground/apps/server/src/index.ts)

Responsibilities:

- validate request payloads
- expose the fragrance catalog
- run recommendation logic
- return typed JSON responses

Current endpoints:

- `GET /api/health`
- `GET /api/fragrances`
- `POST /api/recommendation`
- `POST /api/mix/simulate`

### Recommendation Engine

Location:

- [recommendation.ts](/Users/winniebrendawaiya/Documents/Playground/apps/server/src/engine/recommendation.ts)

Responsibilities:

- score fragrances against the shopper profile
- generate a profile label and explanation
- simulate accord mixes for exploratory scent blending

This is pure business logic with no database dependency, which makes it easy to test and evolve.

### Shared Contracts

Location:

- [index.ts](/Users/winniebrendawaiya/Documents/Playground/packages/shared/src/index.ts)

Responsibilities:

- define allowed quiz values
- define fragrance data structure
- define request and response payloads

This shared package prevents drift between what the mobile app sends and what the API expects.

## Current Schema

There is no relational database schema yet.

What exists today is a TypeScript domain schema.

### Fragrance Schema

The main product entity is `Fragrance`.

Current fields:

- `id`
- `brand`
- `name`
- `tagline`
- `family`
- `notes`
- `imageUrl`
- `productUrl`
- `bestFor`
- `longevity`
- `sillage`
- `refillable`
- `sustainabilityScore`
- `accordLevels`

`bestFor` acts like a lightweight recommendation index. It maps a fragrance to the user attributes it is best suited for:

- lifestyles
- personalities
- climates
- moods

`accordLevels` acts like a simplified scent profile for scoring and future simulator use.

### Shopper Profile Schema

The main request entity is `QuizSubmission`.

Current fields:

- `name`
- `lifestyle`
- `personality`
- `climate`
- `mood`
- `intensity`
- `refillPreference`

This is the shape of the data captured from the survey screens in the app.

### Recommendation Schema

Returned by the API:

- `profileLabel`
- `summary`
- `recommendations[]`

Each recommendation includes:

- `fragrance`
- `score`
- `whyItFits[]`

## Do We Have a Real Database?

No.

Right now the app does **not** use a persistent database.

Current state:

- fragrance data is hardcoded in [fragrances.ts](/Users/winniebrendawaiya/Documents/Playground/apps/server/src/data/fragrances.ts)
- survey answers live in React state inside the mobile app
- recommendation results are computed in memory on the server
- nothing is saved permanently after the request finishes

So the current system is:

- local UI state on the client
- in-memory catalog on the server
- in-memory recommendation computation

This is enough for an MVP demo and in-store prototype, but it is not yet an inventory system or customer data platform.

## How Data Moves Through the App

### 1. Shopper Starts the Flow

The user enters the mobile experience and moves into the survey flow.

The app stores the answers in React state.

This is currently happening in:

- [App.tsx](/Users/winniebrendawaiya/Documents/Playground/apps/client/App.tsx)

### 2. Client Sends the Survey Payload

When the user taps the recommendation CTA, the mobile app sends a `POST` request to:

- `POST /api/recommendation`

This happens through:

- [api.ts](/Users/winniebrendawaiya/Documents/Playground/apps/client/src/api.ts)

The payload matches `QuizSubmission`.

### 3. API Validates the Payload

The Express server checks that:

- the request is an object
- all enum values are allowed
- the intensity is valid
- the refill preference is boolean

This happens in request guards in:

- [index.ts](/Users/winniebrendawaiya/Documents/Playground/apps/server/src/index.ts)

### 4. Recommendation Engine Scores Fragrances

The backend loops through the seeded fragrance catalog and scores each fragrance based on:

- lifestyle match
- personality match
- climate match
- mood match
- refill preference
- intensity fit
- sustainability score

This happens in:

- [recommendation.ts](/Users/winniebrendawaiya/Documents/Playground/apps/server/src/engine/recommendation.ts)

### 5. API Returns Recommendations

The top matches are returned to the client as JSON.

The mobile app then renders those recommendations with:

- bottle image
- name and brand
- fit explanation
- score

## Why This Works For The Current User Experience

For an in-store assistant flow, the current architecture is useful because:

- it is fast
- it is easy to demo
- it is easy to change recommendation logic
- it does not require customer accounts
- it does not create privacy overhead yet

That makes it a good fit for:

- store pilot testing
- UX iteration
- recommendation tuning
- visual merchandising experiments

## Current Limitations

Because there is no real database yet, the system cannot currently:

- save customer profiles
- remember prior recommendations
- track in-store inventory by location
- sync with POS or ecommerce inventory
- log analytics in a structured persistent way
- store associate-assisted sessions

This is the main boundary between the current prototype and a production retail platform.

## Recommended Future Database Design

When the product is ready for persistence, I would recommend PostgreSQL.

### Why PostgreSQL

PostgreSQL is a strong next step because it gives us:

- relational integrity for products, stores, and sessions
- flexible querying for recommendation and reporting
- strong support for JSON fields where useful
- a mature ecosystem for Node backends

### Recommended Core Tables

#### `fragrances`

Stores the canonical fragrance catalog.

Suggested columns:

- `id`
- `brand`
- `name`
- `tagline`
- `family`
- `image_url`
- `product_url`
- `longevity`
- `sillage`
- `refillable`
- `sustainability_score`
- `created_at`
- `updated_at`

#### `fragrance_notes`

Stores notes as normalized rows.

Suggested columns:

- `id`
- `fragrance_id`
- `note_name`
- `note_type`

#### `fragrance_targets`

Stores the recommendation affinity values.

Suggested columns:

- `id`
- `fragrance_id`
- `dimension_type`
- `dimension_value`
- `weight`

This table would replace the current `bestFor` arrays with a more queryable structure.

#### `fragrance_accords`

Stores simplified accord weights.

Suggested columns:

- `fragrance_id`
- `citrus`
- `floral`
- `woods`
- `musk`
- `spice`
- `green`

#### `survey_sessions`

Stores each in-store recommendation attempt.

Suggested columns:

- `id`
- `store_id`
- `customer_name`
- `lifestyle`
- `personality`
- `climate`
- `mood`
- `intensity`
- `refill_preference`
- `created_at`

#### `survey_recommendations`

Stores which fragrances were returned for a given session.

Suggested columns:

- `id`
- `survey_session_id`
- `fragrance_id`
- `score`
- `position`

#### `stores`

If the app becomes inventory-aware, this table would represent physical store locations.

Suggested columns:

- `id`
- `name`
- `city`
- `region`

#### `store_inventory`

Tracks fragrance availability per store.

Suggested columns:

- `id`
- `store_id`
- `fragrance_id`
- `is_available`
- `tester_available`
- `stock_level`

## Recommended Future API Layer

If we evolve this toward production, the API should likely keep Express or move to Fastify/Nest depending on team preference.

### Suggested Production API Capabilities

- `GET /api/fragrances`
- `GET /api/fragrances/:id`
- `GET /api/stores/:storeId/inventory`
- `POST /api/surveys`
- `GET /api/surveys/:id/recommendations`
- `POST /api/recommendations`
- `POST /api/analytics/events`

### Why Keep The Recommendation Logic Server-Side

The recommendation rules should stay on the backend because:

- scoring logic can change without redeploying mobile
- it is easier to test and audit
- it keeps the client lighter
- it protects proprietary recommendation logic

## How Data Would Move Into A Real Database

In a future persisted version, the flow would be:

1. User completes the survey on mobile.
2. Client sends the survey payload to `POST /api/surveys` or `POST /api/recommendations`.
3. API validates the payload.
4. API writes a `survey_sessions` row to PostgreSQL.
5. API runs recommendation logic using catalog and targeting data from the database.
6. API writes the chosen recommendations to `survey_recommendations`.
7. API returns the results to the mobile client.

This would create a durable record of:

- what the shopper answered
- what the system recommended
- what the store surfaced

That record becomes useful for:

- analytics
- personalization
- replenishment planning
- associate workflows

## Summary

Today, Scent Lab is a typed mobile client plus lightweight API with in-memory catalog and recommendation logic.

That means:

- the current schema is a TypeScript domain schema, not a database schema
- the current data persistence model is local client state plus in-memory server data
- there is no permanent database yet

This was the right decision for the MVP because it prioritizes:

- speed
- product iteration
- UX testing
- in-store demo reliability

The next natural step, once the recommendation flow stabilizes, is to add PostgreSQL-backed persistence for catalog, survey sessions, and store inventory.

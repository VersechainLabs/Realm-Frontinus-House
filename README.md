<div align="center">
  <p align="center">
    <a href="https://prop.house/" target="blank"><img src="https://i.imgur.com/tPLjLwA.png" width="200" alt="Prop House Logo" /></a>
  </p>
  <h1>Prop House</h1>
  <p>A public infrastructure project by <a href="https://nouns.wtf/" target="blank">Nouns DAO</a></p>
</div>

## About

Prop House offers a novel mechanism for communities to deploy capital within their ecosystems: asset auctions where the bids placed are proposals. At the end of each auction, members of corresponding communities vote on which proposals get funded. Learn more by reading the [FAQs](https://prop.house/faq) or joining the [Discord](https://discord.gg/SKPzM8GHts).

## Packages

### prop-house-backend

The [prop house backend](https://github.com/cryptoseneca/prop-house/tree/master/packages/prop-house-backend) is implemented using Nestjs and handles CRUD actions for storing prop house data. It provides a [GraphQL interface](https://prod.backend.prop.house/graphql) for querying data.

### prop-house-wrapper

The [prop house wrapper](https://github.com/cryptoseneca/prop-house/tree/master/packages/prop-house-wrapper) is a convenience class that wraps the HTTP interaction with a prop house backend and performs the signing of payloads. It also provides types for the response and input objects. The package also includes examples for creating proposals, uploading files, and voting.

### prop-house-webapp

The [prop house webapp](https://github.com/cryptoseneca/prop-house/tree/master/packages/prop-house-webapp) is the frontend for interacting with houses as hosted at [prop.house](https://prop.house).

### @prophouse/communities

The [prop house communities](https://github.com/cryptoseneca/prop-house/tree/master/packages/@prophouse/communities) package contains the logic to fetch voting data for individuals within the scope of their own communities.

## Quick Start

From the monorepo root:

### Install dependencies

```
yarn
```

### Build packages

```
yarn build
```

### Start up backend

```sh
# switch to prop-house-backend
cd packages/prop-house-backend
# start up containers
docker-compose up -d
## Run migrations
yarn migration:run
# Copy example environment file
cp .env.example .env
# build and run
yarn start:dev
```

### Start up frontend

```sh
# switch to prop-house-webapp
cd packages/prop-house-webapp
# Copy example environment file
cp .env.example .env
# Start local development
yarn start
```

# Qdrant Data Connector



This repository contains the source code for a prototype [data connector agent](https://github.com/hasura/graphql-engine/blob/master/dc-agents/README.md) for Qdrant to be able to use it with Hasura.

This is based on [Weaviate connector](https://github.com/hasura/weaviate_gdc)

This repository also contains a Dockerfile to be able to build an image in your own architecture and contains a docker-compose.yaml to try out the connector with Hasura.

To use the Qdrant connector with Hasura:
- Deploy the connector somewhere that is accessible to Hasura
- In the Hasura console, add a new data connector called "qdrant" pointing it to your deployed agent.
- Add a new database in the console, where you should now see "qdrant" as a database type.
- Add your qdrant configuration:
  - host: Qdrant host URL
  - scheme: http

Please note that this is only a prototype and may contain bugs, reliability, and performance issues.

## For dev

```
yarn 

yarn start
```
---
For docker
```
docker compose build
docker compose up -d
```
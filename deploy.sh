#!/bin/bash
npm run build:production && npm test && gcloud app deploy
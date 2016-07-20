#!/bin/bash
export NODE_ENV=production
export DOCUMENT_CENTER_PORT=4000

grunt deploy
node app.js

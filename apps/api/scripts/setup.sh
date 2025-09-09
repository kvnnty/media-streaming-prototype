#!/bin/bash
set -e

# Load environment variables
source ../.env

# Step 1: Create the database (if it doesn't exist)
psql -h $PGHOST -p $PGPORT -U $PGUSER -d postgres -c "CREATE DATABASE $PGDATABASE;" || echo "Database already exists."

# Step 2: Run schema.sql on the new database
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f ../src/models/schema.sql

echo "Database setup complete."


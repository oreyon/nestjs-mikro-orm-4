#!/bin/sh

echo "Waiting for MySQL to be available..."

while ! mysqladmin ping -h"$DB_HOST" --silent; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Connection to MySQL established"

#echo "MySQL is up - applying migrations..."


# Run migrations
#npx mikro-orm migration:list
#npx mikro-orm migration:check
#npx mikro-orm migration:fresh
#npx mikro-orm schema:update --run

# Start the application
exec "$@"

#!/bin/bash

# Check for required environment variables
: "${BASE_URL:?BASE_URL is required}"
: "${API_BASE_URL:?API_BASE_URL is required}"
: "${LOGIN_EMAIL:?LOGIN_EMAIL is required}"
: "${LOGIN_PHONE:?LOGIN_PHONE is required}"
: "${LOGIN_CODE:?LOGIN_CODE is required}"

# Notify that tests are starting

echo "Running Selenium Tests..."

# Run all Selenium tests and capture exit status
echo "Starting CRM CRUD E2E Tests"
npx jest web-app/tests/selenium/crm-crud.e2e.js

# Capture the exit status
EXIT_STATUS=$?

# Report result
if [ $EXIT_STATUS -eq 0 ]; then
  echo "Selenium tests completed successfully."
else
  echo "Some Selenium tests failed. Check the logs above for details."
fi

exit $EXIT_STATUS

#!/bin/bash

# Start the backend server
cd backend
npm start &

# Wait for a moment to ensure the backend starts
sleep 5

# Start the frontend server
cd ../frontend
npm run serve &

# Wait for both processes to finish
wait
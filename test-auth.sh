#!/bin/bash

echo "🔐 Testing authentication flow..."

# Step 1: Sign in
echo "1. Signing in..."
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=password&csrfToken=test" \
  -c cookies.txt \
  -L -s

echo -e "\n\n2. Getting session cookie..."
curl -X GET http://localhost:3000/api/auth/session \
  -b cookies.txt \
  -c cookies.txt \
  -s

echo -e "\n\n3. Testing AI endpoint with authentication..."
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, say hi back"}],"model":"deepseek/deepseek-r1:free"}' \
  -b cookies.txt \
  -c cookies.txt \
  -s

echo -e "\n\n✅ Test complete!"
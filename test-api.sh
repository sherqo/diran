#!/bin/bash

echo "🧪 Testing Diran AI Backend API"
echo "================================"

API_URL="http://localhost:3000"

echo ""
echo "1️⃣ Testing Health Check..."
curl -s "$API_URL/api/health" | python3 -m json.tool
echo ""

echo "2️⃣ Creating a test user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "$SIGNUP_RESPONSE" | python3 -m json.tool
echo ""

echo "3️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract token from login response
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', 'NO_TOKEN'))" 2>/dev/null)

echo ""
echo "4️⃣ Getting user profile (with token)..."
if [ "$TOKEN" != "NO_TOKEN" ] && [ -n "$TOKEN" ]; then
  curl -s -X GET "$API_URL/api/auth/profile" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
else
  echo "❌ No token received, cannot test protected route"
fi

echo ""
echo "✅ API testing complete!"
echo ""
echo "💡 If you see JSON responses above, your API is working!"
echo "💡 If you see errors, check your server is running with 'npm run dev'"
#!/bin/bash

# Test authentication flow with cookie persistence

BASE_URL="http://localhost:4003/v1"
COOKIE_FILE="/tmp/test-cookies.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testing Diran AI Authentication Flow ===${NC}\n"

# Clean up old cookies
rm -f "$COOKIE_FILE"

# Test 1: Login
echo -e "${YELLOW}1. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -b "$COOKIE_FILE" \
  -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sharqawycs@gmail.com",
    "password": "your-password-here"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "$LOGIN_RESPONSE" | jq '.'
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "\n${YELLOW}Cookies stored:${NC}"
cat "$COOKIE_FILE"

# Test 2: Get Profile with cookies
echo -e "\n${YELLOW}2. Testing Get Profile (with cookies)...${NC}"
PROFILE_RESPONSE=$(curl -s -b "$COOKIE_FILE" \
  -X GET "$BASE_URL/user/profile" \
  -H "Content-Type: application/json")

if echo "$PROFILE_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Profile fetched successfully${NC}"
  echo "$PROFILE_RESPONSE" | jq '.'
else
  echo -e "${RED}✗ Profile fetch failed${NC}"
  echo "$PROFILE_RESPONSE" | jq '.'
fi

# Test 3: Refresh Token
echo -e "\n${YELLOW}3. Testing Refresh Token...${NC}"
REFRESH_RESPONSE=$(curl -s -c "$COOKIE_FILE" -b "$COOKIE_FILE" \
  -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json")

if echo "$REFRESH_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Token refresh successful${NC}"
  echo "$REFRESH_RESPONSE" | jq '.'
else
  echo -e "${RED}✗ Token refresh failed${NC}"
  echo "$REFRESH_RESPONSE" | jq '.'
fi

# Test 4: Get Profile again with refreshed token
echo -e "\n${YELLOW}4. Testing Get Profile (after refresh)...${NC}"
PROFILE_RESPONSE2=$(curl -s -b "$COOKIE_FILE" \
  -X GET "$BASE_URL/user/profile" \
  -H "Content-Type: application/json")

if echo "$PROFILE_RESPONSE2" | grep -q "success"; then
  echo -e "${GREEN}✓ Profile fetched successfully with refreshed token${NC}"
  echo "$PROFILE_RESPONSE2" | jq '.'
else
  echo -e "${RED}✗ Profile fetch failed${NC}"
  echo "$PROFILE_RESPONSE2" | jq '.'
fi

# Clean up
rm -f "$COOKIE_FILE"

echo -e "\n${GREEN}=== Test Complete ===${NC}"

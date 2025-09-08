# NoteGuard Authentication API Test Commands

## Test Registration Endpoint

curl -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d "{
\"username\": \"testuser\",
\"email\": \"test@example.com\",
\"password\": \"password123\"
}"

## Test Login Endpoint

curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d "{
\"emailOrUsername\": \"testuser\",
\"password\": \"password123\"
}"

## Test with Email Login

curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d "{
\"emailOrUsername\": \"test@example.com\",
\"password\": \"password123\"
}"

## Test Health Endpoint

curl http://localhost:8080/api/auth/health

# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Tokens are automatically refreshed by the frontend when they expire.

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Validation Rules:**
- `username`: 3-30 characters, alphanumeric + underscores only
- `email`: Valid email format
- `password`: Minimum 6 characters

**Error (400):**
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Get new access and refresh tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

### Logout

**POST** `/api/auth/logout` 🔒 Protected

Invalidate refresh token.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Get Current User

**GET** `/api/auth/me` 🔒 Protected

Get authenticated user's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Usage Log Endpoints

### Create Usage Entry

**POST** `/api/usage` 🔒 Protected

Create a new usage log entry. Prevents duplicates for same user/app/date.

**Request Body:**
```json
{
  "appName": "Instagram",
  "minutesSpent": 120.5,
  "date": "2024-01-15"
}
```

**Notes:**
- `date` is optional (defaults to today)
- Date format: ISO 8601 (YYYY-MM-DD)
- `minutesSpent`: 0-1440 (validates max 24 hours)

**Response (201):**
```json
{
  "success": true,
  "message": "Usage log created successfully",
  "data": {
    "usageLog": {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "appName": "Instagram",
      "minutesSpent": 120.5,
      "date": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Usage entry for Instagram already exists for this date. You can update it instead."
}
```

---

### Get Usage Logs

**GET** `/api/usage` 🔒 Protected

Get all usage logs for authenticated user with optional filters.

**Query Parameters:**
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `appName` (optional): Filter by app name (case-insensitive partial match)
- `limit` (optional): Max number of results (default: 100)

**Example:**
```
GET /api/usage?startDate=2024-01-01&endDate=2024-01-31&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "user": "507f1f77bcf86cd799439011",
        "appName": "Instagram",
        "minutesSpent": 120.5,
        "date": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### Get Usage Log by ID

**GET** `/api/usage/:id` 🔒 Protected

Get a specific usage log entry.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usageLog": {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "appName": "Instagram",
      "minutesSpent": 120.5,
      "date": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Usage log not found"
}
```

---

### Update Usage Log

**PUT** `/api/usage/:id` 🔒 Protected

Update an existing usage log entry.

**Request Body:**
```json
{
  "appName": "Instagram",
  "minutesSpent": 150,
  "date": "2024-01-15"
}
```

All fields are optional. Only provided fields will be updated.

**Response (200):**
```json
{
  "success": true,
  "message": "Usage log updated successfully",
  "data": {
    "usageLog": {
      "_id": "507f1f77bcf86cd799439012",
      "appName": "Instagram",
      "minutesSpent": 150,
      "date": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

---

### Delete Usage Log

**DELETE** `/api/usage/:id` 🔒 Protected

Delete a usage log entry.

**Response (200):**
```json
{
  "success": true,
  "message": "Usage log deleted successfully"
}
```

---

## Analytics Endpoints

### Get Dashboard Data

**GET** `/api/analytics/dashboard` 🔒 Protected

Get comprehensive dashboard analytics including stats, risk score, recommendations, and chart data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "daily": {
      "totalMinutes": 180.5,
      "averageMinutes": 90.25,
      "appCount": 2,
      "apps": [
        { "name": "Instagram", "minutes": 120.5 },
        { "name": "TikTok", "minutes": 60 }
      ]
    },
    "weekly": {
      "totalMinutes": 840.5,
      "averageDailyMinutes": 120.07,
      "daysActive": 7,
      "trend": "increasing"
    },
    "monthly": {
      "totalMinutes": 3600,
      "averageDailyMinutes": 120,
      "daysActive": 30
    },
    "riskScore": {
      "score": 65,
      "category": "Moderate",
      "level": "moderate",
      "message": "You're maintaining moderate engagement. Continue being mindful of your patterns."
    },
    "topApps": [
      { "name": "Instagram", "minutes": 450 },
      { "name": "TikTok", "minutes": 300 }
    ],
    "recommendations": [
      {
        "type": "balance",
        "priority": "medium",
        "title": "Maintain Healthy Balance",
        "message": "Your usage is moderate. Consider maintaining awareness...",
        "actionable": true
      }
    ],
    "charts": {
      "daily": [
        { "date": "2024-01-15", "minutes": 120 },
        { "date": "2024-01-16", "minutes": 150 }
      ],
      "weekly": [
        { "date": "2024-01-08", "minutes": 840 }
      ]
    }
  }
}
```

---

### Get Custom Statistics

**GET** `/api/analytics/stats` 🔒 Protected

Get statistics for a custom date range.

**Query Parameters:**
- `startDate` (required): ISO 8601 date string
- `endDate` (required): ISO 8601 date string
- `period` (optional): `daily`, `weekly`, or `monthly` (default: `daily`)

**Example:**
```
GET /api/analytics/stats?startDate=2024-01-01&endDate=2024-01-31&period=weekly
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalMinutes": 3600,
      "averageDailyMinutes": 120,
      "daysActive": 30
    },
    "timeSeries": [
      { "date": "2024-01-01", "minutes": 120 },
      { "date": "2024-01-08", "minutes": 840 }
    ],
    "period": "weekly"
  }
}
```

---

### Get Risk Score

**GET** `/api/analytics/risk-score` 🔒 Protected

Get current behavioral risk indicator score.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "riskScore": {
      "score": 65,
      "category": "Moderate",
      "level": "moderate",
      "message": "You're maintaining moderate engagement. Continue being mindful of your patterns."
    }
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **404** - Not Found
- **500** - Internal Server Error

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### Token Expired (401)
```json
{
  "success": false,
  "message": "Token has expired. Please refresh your session.",
  "code": "TOKEN_EXPIRED"
}
```

---

## Rate Limiting

The API includes rate limiting to prevent abuse. Default limits:
- Auth endpoints: 5 requests per 15 minutes per IP
- Other endpoints: 100 requests per 15 minutes per IP

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD or full ISO string)
- Timezone: All dates are stored in UTC
- Pagination: Currently limited to 100 results per query
- Duplicate prevention: Only one entry per user/app/date combination

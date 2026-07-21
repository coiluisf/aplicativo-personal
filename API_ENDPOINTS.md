# TrainApp API Endpoints

Complete REST API documentation for the TrainApp SaaS platform.

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:
```
Authorization: Bearer <access_token>
```

Access tokens expire in **15 minutes**. Use the refresh token endpoint to obtain new tokens.

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Authentication Endpoints (`/auth`)

### Register
**POST** `/auth/register`

Create a new trainer account and workspace.

**Request:**
```json
{
  "email": "trainer@example.com",
  "password": "securePassword123",
  "name": "João Silva",
  "workspaceName": "Silva Personal Training"
}
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "trainer@example.com",
    "name": "João Silva",
    "workspaceId": "workspace_123"
  }
}
```

**Errors:**
- `400`: Missing required fields
- `400`: User already exists

---

### Login
**POST** `/auth/login`

Authenticate with email and password.

**Request:**
```json
{
  "email": "trainer@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "trainer@example.com",
    "name": "João Silva",
    "workspaceId": "workspace_123"
  }
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Invalid email or password
- `401`: Workspace is not active

---

### Refresh Token
**POST** `/auth/refresh-token`

Get a new access token using the refresh token.

**Headers:**
```
Cookie: refreshToken=<refresh_token>
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "trainer@example.com",
    "name": "João Silva",
    "workspaceId": "workspace_123"
  }
}
```

**Errors:**
- `401`: Refresh token not found
- `401`: Invalid or expired refresh token

---

### Logout
**POST** `/auth/logout`

Logout and invalidate the refresh token.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Workspace Endpoints (`/workspaces`) 🔒

All workspace endpoints require authentication.

### Get Workspace Info
**GET** `/workspaces/`

Get current workspace details and user list.

**Response:** `200 OK`
```json
{
  "id": "workspace_123",
  "name": "Silva Personal Training",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "users": [
    {
      "id": "user_123",
      "email": "trainer@example.com",
      "name": "João Silva",
      "role": "TRAINER",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "_count": {
    "students": 15,
    "sessions": 42,
    "subscriptions": 12
  }
}
```

---

### Get Workspace Statistics
**GET** `/workspaces/stats`

Get analytics and statistics for the workspace.

**Response:** `200 OK`
```json
{
  "workspace": { ... },
  "stats": {
    "totalStudents": 15,
    "activeStudents": 12,
    "totalSessions": 42,
    "completedSessions": 38,
    "upcomingSessions": 5,
    "activeSubscriptions": 10,
    "totalRevenue": 4500.50
  }
}
```

---

### Update Workspace
**PATCH** `/workspaces/`

Update workspace information.

**Request:**
```json
{
  "name": "Silva Personal Training - Updated",
  "description": "Professional training studio"
}
```

**Response:** `200 OK`
```json
{
  "id": "workspace_123",
  "name": "Silva Personal Training - Updated",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Get Workspace Users
**GET** `/workspaces/users`

List all users in the workspace.

**Response:** `200 OK`
```json
[
  {
    "id": "user_123",
    "email": "trainer@example.com",
    "name": "João Silva",
    "role": "TRAINER",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Suspend Workspace
**POST** `/workspaces/suspend`

Temporarily suspend workspace (pause operations).

**Response:** `200 OK`
```json
{
  "id": "workspace_123",
  "name": "Silva Personal Training",
  "status": "SUSPENDED"
}
```

---

### Reactivate Workspace
**POST** `/workspaces/reactivate`

Reactivate a suspended workspace.

**Response:** `200 OK`
```json
{
  "id": "workspace_123",
  "name": "Silva Personal Training",
  "status": "ACTIVE"
}
```

---

### Delete Workspace
**DELETE** `/workspaces/`

Permanently delete the workspace (sets status to CANCELLED).

**Response:** `200 OK`
```json
{
  "id": "workspace_123",
  "name": "Silva Personal Training",
  "status": "CANCELLED"
}
```

---

## Student Endpoints (`/students`) 🔒

All student endpoints require authentication.

### Create Student
**POST** `/students/`

Add a new student to your workspace.

**Request:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+55 11 98765-4321"
}
```

**Response:** `201 Created`
```json
{
  "id": "student_123",
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+55 11 98765-4321",
  "status": "ACTIVE",
  "workspaceId": "workspace_123",
  "createdAt": "2024-01-20T14:00:00Z"
}
```

**Errors:**
- `400`: Missing required fields (name, email)
- `400`: Student already exists in this workspace

---

### List Students
**GET** `/students/`

Get paginated list of students.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:** `200 OK`
```json
{
  "students": [
    {
      "id": "student_123",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "phone": "+55 11 98765-4321",
      "status": "ACTIVE",
      "workspaceId": "workspace_123",
      "createdAt": "2024-01-20T14:00:00Z",
      "studentPlans": [
        {
          "id": "plan_123",
          "status": "ACTIVE",
          "subscription": { ... }
        }
      ],
      "sessions": [
        { ... }
      ]
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### Search Students
**GET** `/students/search?q=<query>`

Search students by name or email.

**Query Parameters:**
- `q` (required): Search query (min 1 character)

**Response:** `200 OK`
```json
[
  {
    "id": "student_123",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "+55 11 98765-4321",
    "status": "ACTIVE"
  }
]
```

---

### Get Student Details
**GET** `/students/:id`

Get detailed information about a specific student.

**Response:** `200 OK`
```json
{
  "id": "student_123",
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+55 11 98765-4321",
  "status": "ACTIVE",
  "workspaceId": "workspace_123",
  "createdAt": "2024-01-20T14:00:00Z",
  "studentPlans": [
    {
      "id": "plan_123",
      "status": "ACTIVE",
      "subscription": {
        "id": "sub_123",
        "plan": "PROFESSIONAL",
        "status": "ACTIVE"
      }
    }
  ],
  "sessions": [
    { ... }
  ]
}
```

**Errors:**
- `404`: Student not found

---

### Update Student
**PATCH** `/students/:id`

Update student information.

**Request:**
```json
{
  "name": "Maria Santos Silva",
  "email": "maria.silva@example.com",
  "phone": "+55 11 99999-8888"
}
```

**Response:** `200 OK`
```json
{
  "id": "student_123",
  "name": "Maria Santos Silva",
  "email": "maria.silva@example.com",
  "phone": "+55 11 99999-8888",
  "status": "ACTIVE"
}
```

**Errors:**
- `404`: Student not found
- `400`: Email already in use

---

### Delete Student
**DELETE** `/students/:id`

Deactivate a student (soft delete).

**Response:** `200 OK`
```json
{
  "message": "Student deactivated successfully"
}
```

**Errors:**
- `404`: Student not found

---

## Session Endpoints (`/sessions`) 🔒

All session endpoints require authentication.

### Create Session (Schedule Training)
**POST** `/sessions/`

Schedule a new training session with a student.

**Request:**
```json
{
  "studentId": "student_123",
  "startTime": "2024-02-10T06:00:00Z",
  "endTime": "2024-02-10T07:00:00Z",
  "notes": "Focus on chest and triceps"
}
```

**Response:** `201 Created`
```json
{
  "id": "session_123",
  "studentId": "student_123",
  "startTime": "2024-02-10T06:00:00Z",
  "endTime": "2024-02-10T07:00:00Z",
  "notes": "Focus on chest and triceps",
  "status": "SCHEDULED",
  "workspaceId": "workspace_123",
  "createdAt": "2024-01-25T10:00:00Z",
  "student": {
    "id": "student_123",
    "name": "Maria Santos"
  }
}
```

**Errors:**
- `400`: Missing required fields
- `404`: Student not found
- `400`: Time slot already booked

---

### List Sessions
**GET** `/sessions/`

Get paginated list of sessions with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): SCHEDULED, COMPLETED, CANCELLED
- `studentId` (optional): Filter by student
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Response:** `200 OK`
```json
{
  "sessions": [
    {
      "id": "session_123",
      "studentId": "student_123",
      "startTime": "2024-02-10T06:00:00Z",
      "endTime": "2024-02-10T07:00:00Z",
      "status": "SCHEDULED",
      "student": {
        "id": "student_123",
        "name": "Maria Santos"
      }
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### Get Upcoming Sessions
**GET** `/sessions/upcoming?days=7`

Get upcoming scheduled sessions for the next N days.

**Query Parameters:**
- `days` (default: 7): Number of days to look ahead

**Response:** `200 OK`
```json
[
  {
    "id": "session_123",
    "studentId": "student_123",
    "startTime": "2024-02-10T06:00:00Z",
    "endTime": "2024-02-10T07:00:00Z",
    "status": "SCHEDULED",
    "student": {
      "id": "student_123",
      "name": "Maria Santos"
    }
  }
]
```

---

### Get Session Details
**GET** `/sessions/:id`

Get detailed information about a specific session.

**Response:** `200 OK`
```json
{
  "id": "session_123",
  "studentId": "student_123",
  "startTime": "2024-02-10T06:00:00Z",
  "endTime": "2024-02-10T07:00:00Z",
  "notes": "Focus on chest and triceps",
  "status": "SCHEDULED",
  "workspaceId": "workspace_123",
  "createdAt": "2024-01-25T10:00:00Z",
  "student": {
    "id": "student_123",
    "name": "Maria Santos"
  },
  "exerciseLogs": []
}
```

**Errors:**
- `404`: Session not found

---

### Update Session
**PATCH** `/sessions/:id`

Update session information.

**Request:**
```json
{
  "status": "COMPLETED",
  "startTime": "2024-02-10T07:00:00Z",
  "endTime": "2024-02-10T08:00:00Z",
  "notes": "Completed successfully, good performance"
}
```

**Response:** `200 OK`
```json
{
  "id": "session_123",
  "studentId": "student_123",
  "startTime": "2024-02-10T07:00:00Z",
  "endTime": "2024-02-10T08:00:00Z",
  "notes": "Completed successfully, good performance",
  "status": "COMPLETED",
  "student": {
    "id": "student_123",
    "name": "Maria Santos"
  }
}
```

**Errors:**
- `404`: Session not found
- `400`: Time slot already booked

---

### Cancel Session
**DELETE** `/sessions/:id`

Cancel a scheduled session.

**Response:** `200 OK`
```json
{
  "id": "session_123",
  "studentId": "student_123",
  "startTime": "2024-02-10T06:00:00Z",
  "endTime": "2024-02-10T07:00:00Z",
  "status": "CANCELLED",
  "student": {
    "id": "student_123",
    "name": "Maria Santos"
  }
}
```

**Errors:**
- `404`: Session not found

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (workspace access denied) |
| 404 | Not Found |
| 500 | Server Error |

---

## Date Format

All timestamps use ISO 8601 format:
```
2024-02-10T06:00:00Z
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Examples

### Complete Login → Create Session Flow

1. **Register**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "securePassword123",
    "name": "João Silva",
    "workspaceName": "Silva Personal Training"
  }'
```

2. **Create Student**
```bash
curl -X POST http://localhost:3001/api/students \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "+55 11 98765-4321"
  }'
```

3. **Schedule Session**
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student_123",
    "startTime": "2024-02-10T06:00:00Z",
    "endTime": "2024-02-10T07:00:00Z",
    "notes": "First training session"
  }'
```

---

## WebSocket Events (Real-time)

Connect to WebSocket at: `ws://localhost:3001`

**Auth:**
```json
{
  "token": "<access_token>",
  "workspaceId": "<workspace_id>"
}
```

**Events:**
- `session:updated` - Session changed
- `student:created` - New student added
- `payment:received` - Payment processed

---

🔒 = Requires authentication

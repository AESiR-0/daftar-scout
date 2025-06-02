# Datar Scout API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Founder Features](#founder-features)
4. [Investor Features](#investor-features)
5. [Common Features](#common-features)
6. [Analytics](#analytics)

## Authentication

### Login
- **Endpoint**: `/api/auth/[...nextauth]`
- **Method**: POST
- **Description**: Authenticate user and create session
- **Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Session token and user information
- **Status Codes**: 200, 401, 500

### Sign Up
- **Endpoint**: `/api/endpoints/users`
- **Method**: POST
- **Description**: Register new user
- **Payload**:
  ```json
  {
    "name": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "countryCode": "string",
    "gender": "string",
    "dob": "string",
    "location": "string",
    "role": "string",
    "languages": ["string"]
  }
  ```
- **Response**: Created user information
- **Status Codes**: 201, 400, 500

## User Management

### Get User Profile
- **Endpoint**: `/api/endpoints/me`
- **Method**: GET
- **Description**: Get current user's profile information
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
  ```
- **Status Codes**: 200, 401, 404

### Update User Profile
- **Endpoint**: `/api/endpoints/users`
- **Method**: PATCH
- **Description**: Update user profile information
- **Payload**:
  ```json
  {
    "formData": {
      "name": "string",
      "lastName": "string",
      "phoneNumber": "string",
      "countryCode": "string",
      "gender": "string",
      "dob": "string",
      "location": "string",
      "role": "string",
      "languages": ["string"]
    }
  }
  ```
- **Response**: Updated user information
- **Status Codes**: 200, 400, 401, 404

### Delete User Account
- **Endpoint**: `/api/endpoints/users/delete`
- **Method**: POST
- **Description**: Archive user account
- **Response**:
  ```json
  {
    "message": "User account archived successfully",
    "data": {
      "id": "string",
      "email": "string",
      "isActive": boolean,
      "isArchived": boolean,
      "archivedOn": "string"
    }
  }
  ```
- **Status Codes**: 200, 401, 404, 500

## Founder Features

### Get Pitches List
- **Endpoint**: `/api/endpoints/pitch`
- **Method**: GET
- **Description**: Get all pitches for the founder
- **Response**:
  ```json
  [{
    "id": "string",
    "pitchName": "string",
    "location": "string",
    "scoutId": "string",
    "demoLink": "string",
    "stage": "string",
    "askForInvestor": "string",
    "createdAt": "string",
    "status": "string",
    "isCompleted": boolean,
    "teamSize": number,
    "isPaid": boolean
  }]
  ```
- **Status Codes**: 200, 401, 500

### Create/Update Pitch
- **Endpoint**: `/api/endpoints/pitch`
- **Method**: POST/PUT
- **Description**: Create or update a pitch
- **Payload**:
  ```json
  {
    "pitchName": "string",
    "location": "string",
    "demoLink": "string",
    "stage": "string",
    "askForInvestor": "string",
    "teamSize": number
  }
  ```
- **Response**: Created/Updated pitch information
- **Status Codes**: 201/200, 400, 401, 500

### Get Deal Board Statistics
- **Endpoint**: `/api/endpoints/stats/stage`
- **Method**: GET
- **Description**: Get pitch statistics by stage
- **Response**:
  ```json
  {
    "frequency": [{
      "stage": "string",
      "count": number,
      "category": "string"
    }],
    "successFailure": [{
      "stage": "string",
      "successful": number,
      "failed": number
    }]
  }
  ```
- **Status Codes**: 200, 401, 500

## Investor Features

### Get Scout Information
- **Endpoint**: `/api/endpoints/scout`
- **Method**: GET
- **Description**: Get scout information and statistics
- **Response**: Scout details and performance metrics
- **Status Codes**: 200, 401, 404

### Manage Premium Features
- **Endpoint**: `/api/endpoints/users/premium`
- **Method**: GET/POST
- **Description**: Handle premium features and subscriptions
- **Response**: Premium feature status and details
- **Status Codes**: 200, 401, 400

## Common Features

### Calendar Management
- **Endpoint**: `/api/endpoints/schedule`
- **Method**: GET
- **Description**: Get scheduled meetings
- **Response**:
  ```json
  {
    "events": [{
      "id": "string",
      "summary": "string",
      "start": "string",
      "end": "string",
      "attendees": ["string"],
      "meetLink": "string"
    }]
  }
  ```
- **Status Codes**: 200, 401, 500

### Support Requests
- **Endpoint**: `/api/endpoints/support`
- **Method**: POST
- **Description**: Submit support request
- **Payload**:
  ```json
  {
    "supportName": "string",
    "description": "string"
  }
  ```
- **Response**: Created support request information
- **Status Codes**: 201, 400, 401, 500

### Feature Requests
- **Endpoint**: `/api/endpoints/feature-request`
- **Method**: POST
- **Description**: Submit feature request
- **Payload**:
  ```json
  {
    "featureName": "string",
    "description": "string"
  }
  ```
- **Response**: Created feature request information
- **Status Codes**: 201, 400, 401, 500

### Reports
- **Endpoint**: `/api/endpoints/reports`
- **Method**: POST
- **Description**: Submit report
- **Payload**:
  ```json
  {
    "reportedBy": "string",
    "pitchId": "string",
    "reportDescription": "string",
    "scoutId": "string"
  }
  ```
- **Response**: Created report information
- **Status Codes**: 201, 400, 401, 500

## Analytics

### User Demographics
- **Endpoint**: `/api/endpoints/users/registered/gender`
- **Method**: GET
- **Description**: Get gender distribution
- **Response**:
  ```json
  {
    "male": number,
    "female": number,
    "trans": number,
    "others": number
  }
  ```
- **Status Codes**: 200, 401, 500

- **Endpoint**: `/api/endpoints/users/registered/age`
- **Method**: GET
- **Description**: Get age distribution
- **Response**: Age distribution statistics
- **Status Codes**: 200, 401, 500

### Feature Tracking
- **Endpoint**: `/api/endpoints/feature-tracking`
- **Method**: GET
- **Description**: Get feature tracking statistics
- **Response**:
  ```json
  {
    "statusCount": [{
      "status": "string",
      "count": number
    }],
    "avgDevTime": number,
    "avgCSAT": number,
    "complexityCount": [{
      "complexity": "string",
      "count": number
    }]
  }
  ```
- **Status Codes**: 200, 401, 500

## General Information

### Authentication
- Most endpoints require authentication using NextAuth.js
- Include session token in request headers
- Unauthorized requests return 401 status code

### Error Handling
- All endpoints return appropriate HTTP status codes
- Error responses include descriptive messages
- Common status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 404: Not Found
  - 500: Server Error

### Response Format
- All responses are in JSON format
- Successful responses include data object
- Error responses include error message
- Example error response:
  ```json
  {
    "error": "Error message description"
  }
  ```

### Security
- All sensitive endpoints require authentication
- Input validation on all endpoints
- Data sanitization implemented
- Rate limiting recommended for production

### Best Practices
1. Always handle errors appropriately
2. Implement proper validation
3. Use appropriate HTTP methods
4. Follow RESTful conventions
5. Implement proper security measures
6. Monitor API usage
7. Document any changes to the API 
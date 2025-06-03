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

### Get All Users
- **Endpoint**: `/api/endpoints/users`
- **Method**: GET
- **Description**: Get list of all users
- **Response**: Array of user objects
- **Status Codes**: 200, 401, 500

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

### Get Pitch Details
- **Endpoint**: `/api/endpoints/pitch`
- **Method**: GET
- **Description**: Get pitch information by ID
- **Response**: Pitch details
- **Status Codes**: 200, 404, 500

### Pitch Management
- **Endpoint**: `/api/endpoints/pitch`
- **Method**: GET/POST/PUT
- **Description**: Manage pitch information
- **Response**: Pitch details
- **Status Codes**: 200, 201, 400, 401, 404, 500

### Pitch Documents
- **Endpoint**: `/api/endpoints/pitch/documents`
- **Method**: GET/POST
- **Description**: Manage pitch-related documents
- **Response**: Document information
- **Status Codes**: 200, 201, 400, 401, 404, 500

### Founder Pitch
- **Endpoint**: `/api/endpoints/pitch/founder`
- **Method**: GET/POST
- **Description**: Manage founder-specific pitch information
- **Response**: Founder pitch details
- **Status Codes**: 200, 201, 400, 401, 404, 500

### Investor Pitch
- **Endpoint**: `/api/endpoints/pitch/investor`
- **Method**: GET/POST
- **Description**: Manage investor-specific pitch information
- **Response**: Investor pitch details
- **Status Codes**: 200, 201, 400, 401, 404, 500

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

### Focus Sectors
- **Endpoint**: `/api/endpoints/focus-sectors`
- **Method**: GET
- **Description**: Get list of focus sectors
- **Response**: Array of sector objects
- **Status Codes**: 200, 401, 500

### Calendar Management
- **Endpoint**: `/api/endpoints/calendar`
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

### Notifications
- **Endpoint**: `/api/endpoints/notifications`
- **Method**: GET
- **Description**: Get user notifications
- **Response**: Array of notification objects
- **Status Codes**: 200, 401, 500

### Status
- **Endpoint**: `/api/endpoints/status`
- **Method**: GET
- **Description**: Get system status information
- **Response**: Status information
- **Status Codes**: 200, 401, 500

### Store Location
- **Endpoint**: `/api/endpoints/storeLocation`
- **Method**: POST
- **Description**: Store user location information
- **Response**: Location storage confirmation
- **Status Codes**: 200, 400, 401, 500

### Statistics
- **Endpoint**: `/api/endpoints/stats`
- **Method**: GET
- **Description**: Get system statistics
- **Response**: Statistical data
- **Status Codes**: 200, 401, 500

### Scout Details
- **Endpoint**: `/api/endpoints/scoutDetails`
- **Method**: GET
- **Description**: Get detailed scout information
- **Response**: Scout details
- **Status Codes**: 200, 401, 404, 500

### Mapping
- **Endpoint**: `/api/endpoints/mapping`
- **Method**: GET
- **Description**: Get mapping information
- **Response**: Mapping data
- **Status Codes**: 200, 401, 500

### Languages
- **Endpoint**: `/api/endpoints/getAllLanguages`
- **Method**: GET
- **Description**: Get list of supported languages
- **Response**: Array of language objects
- **Status Codes**: 200, 401, 500

### Journal
- **Endpoint**: `/api/endpoints/journal`
- **Method**: GET/POST
- **Description**: Manage journal entries
- **Response**: Journal entries
- **Status Codes**: 200, 201, 400, 401, 500

### Listing Time
- **Endpoint**: `/api/endpoints/listing-time`
- **Method**: GET
- **Description**: Get listing time information
- **Response**: Listing time data
- **Status Codes**: 200, 401, 500

### Compress
- **Endpoint**: `/api/endpoints/compress`
- **Method**: POST
- **Description**: Compress data/files
- **Response**: Compressed data
- **Status Codes**: 200, 400, 401, 500

### Daftar
- **Endpoint**: `/api/endpoints/daftar`
- **Method**: POST
- **Description**: Register new entry
- **Response**: Registration confirmation
- **Status Codes**: 201, 400, 401, 500

### Structure
- **Endpoint**: `/api/endpoints/structrure`
- **Method**: GET
- **Description**: Get system structure information
- **Response**: Structure data
- **Status Codes**: 200, 401, 500

### Offers
- **Endpoint**: `/api/endpoints/offers`
- **Method**: GET
- **Description**: Get offer information
- **Response**: Offer details
- **Status Codes**: 200, 401, 500

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
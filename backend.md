# API Documentation

## Base URL
All endpoints are prefixed with `/api/v1`. For example, the login endpoint would be `/api/v1/auth/login`.

## Authentication

### Login
- **POST** `/auth/login`
  - **Request Body**:
    ```json
    {
      "token": "string",  // Google OAuth token
      "user_type": "founder" | "investor"
    }
    ```
  - **Response**:
    ```json
    {
      "access_token": "string",
      "token_type": "bearer",
      "user_type": "founder" | "investor",
      "email": "string",
      "name": "string",
      "picture": "string | null"
    }
    ```

## Founder Endpoints

### Profile
- **GET** `/founder/profile/{founder_id}`
  - **Path Parameter**: `founder_id` (integer)
  - **Response**:
    ```json
    {
      "id": 1,
      "first_name": "string",
      "last_name": "string",
      "gender": "string",
      "phone": "string",
      "email": "string",
      "designation": "string | null",
      "location": "string | null",
      "created_at": "datetime",
      "is_active": true
    }
    ```

### Pitches
- **GET** `/founder/{founder_id}/pitches`
  - **Path Parameter**: `founder_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "pitch_name": "string",
        "scout_id": 1,
        "founder_language": "string | null",
        "ask_for_investor": true,
        "has_confirmed": false,
        "status_founder": "string",
        "created_at": "datetime",
        "demo_link": "string | null"
      }
    ]
    ```

### Questions & Answers
- **GET** `/founder/{founder_id}/pitches/{pitch_id}/questions`
  - **Path Parameters**: `founder_id` (integer), `pitch_id` (integer)
  - **Response**:
    ```json
    [
      {
        "question_id": 1,
        "question_text": "string",
        "answer_video_url": "string | null",
        "answer_text": "string | null",
        "answered_at": "datetime | null"
      }
    ]
    ```

- **GET** `/founder/{founder_id}/questions/unanswered`
  - **Path Parameter**: `founder_id` (integer)
  - **Response**:
    ```json
    [
      {
        "question_id": 1,
        "question_text": "string",
        "answer_video_url": null,
        "answer_text": null,
        "answered_at": null
      }
    ]
    ```

### Documents
- **POST** `/founder/{founder_id}/pitches/{pitch_id}/documents`
  - **Path Parameters**: `founder_id` (integer), `pitch_id` (integer)
  - **Request Body**:
    ```json
    {
      "document_url": "string",
      "document_type": "string",
      "title": "string",
      "description": "string | null",
      "is_private": true
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "document_url": "string",
      "document_type": "string",
      "title": "string",
      "description": "string | null",
      "is_private": true,
      "uploaded_by_type": "founder",
      "uploaded_by_id": 1,
      "uploaded_at": "datetime"
    }
    ```

- **GET** `/founder/{founder_id}/pitches/{pitch_id}/documents`
  - **Path Parameters**: `founder_id` (integer), `pitch_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "document_url": "string",
        "document_type": "string",
        "title": "string",
        "description": "string | null",
        "is_private": true,
        "uploaded_by_type": "founder",
        "uploaded_by_id": 1,
        "uploaded_at": "datetime"
      }
    ]
    ```

### Team Invites
- **POST** `/founder/{founder_id}/team/invite`
  - **Path Parameter**: `founder_id` (integer)
  - **Request Body**:
    ```json
    {
      "invited_email": "string",
      "first_name": "string",
      "last_name": "string",
      "designation": "string",
      "role": "string",
      "pitch_id": 1
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "pitch_id": 1,
      "invited_email": "string",
      "first_name": "string",
      "last_name": "string",
      "designation": "string",
      "status": "pending",
      "role": "string",
      "created_at": "datetime",
      "accepted_at": "datetime | null"
    }
    ```

### Offers
- **GET** `/founder/{founder_id}/pitches/{pitch_id}/offers`
  - **Path Parameters**: `founder_id` (integer), `pitch_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "pitch_id": 1,
        "investor_id": 1,
        "offer_desc": "string",
        "status": "pending",
        "offer_sent_at": "datetime",
        "created_at": "datetime"
      }
    ]
    ```

- **POST** `/founder/offers/{offer_id}/action`
  - **Path Parameter**: `offer_id` (integer)
  - **Request Body**:
    ```json
    {
      "action": "accepted" | "rejected",
      "notes": "string | null"
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "Offer action taken successfully"
    }
    ```

### Bills
- **GET** `/founder/{founder_id}/pitches/{pitch_id}/bills`
  - **Path Parameters**: `founder_id` (integer), `pitch_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "pitch_id": 1,
        "amount": 100.00,
        "description": "string",
        "due_date": "datetime",
        "payment_link": "string | null",
        "is_paid": false,
        "created_at": "datetime",
        "paid_at": "datetime | null"
      }
    ]
    ```

## Investor Endpoints

### Profile
- **GET** `/investor/investor/profile/{investor_id}`
  - **Path Parameter**: `investor_id` (integer)
  - **Response**:
    ```json
    {
      "id": 1,
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "created_at": "datetime",
      "is_active": true
    }
    ```

### Daftar Management
- **GET** `/investor/daftar/profile/{daftar_id}`
  - **Path Parameter**: `daftar_id` (integer)
  - **Response**:
    ```json
    {
      "id": 1,
      "name": "string",
      "description": "string | null",
      "created_at": "datetime",
      "is_active": true
    }
    ```

- **GET** `/investor/daftars/{daftar_id}/investors`
  - **Path Parameter**: `daftar_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "investor_id": 1,
        "first_name": "string",
        "last_name": "string",
        "role": "string",
        "joined_at": "datetime",
        "is_active": true
      }
    ]
    ```

- **POST** `/investor/daftars/{daftar_id}/investors`
  - **Path Parameter**: `daftar_id` (integer)
  - **Request Body**:
    ```json
    {
      "investor_id": 1,
      "role": "member"
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "investor_id": 1,
      "first_name": "string",
      "last_name": "string",
      "role": "member",
      "joined_at": "datetime",
      "is_active": true
    }
    ```

- **POST** `/investor/daftars/{daftar_id}/invite`
  - **Path Parameter**: `daftar_id` (integer)
  - **Request Body**:
    ```json
    {
      "invited_email": "string",
      "role": "member"
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "daftar_id": 1,
      "invited_email": "string",
      "status": "pending",
      "role": "member",
      "created_at": "datetime",
      "accepted_at": "datetime | null"
    }
    ```

### Questions
- **GET** `/investor/scouts/{scout_id}/sample-questions`
  - **Path Parameter**: `scout_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "scout_id": 1,
        "question_text": "string",
        "video_url": "string | null"
      }
    ]
    ```

- **POST** `/investor/scouts/{scout_id}/custom-questions`
  - **Path Parameter**: `scout_id` (integer)
  - **Request Body**:
    ```json
    {
      "question_text": "string"
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "scout_id": 1,
      "question_text": "string",
      "created_at": "datetime"
    }
    ```

- **GET** `/investor/scouts/{scout_id}/custom-questions`
  - **Path Parameter**: `scout_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "scout_id": 1,
        "question_text": "string",
        "created_at": "datetime"
      }
    ]
    ```

### Documents
- **POST** `/investor/pitches/{pitch_id}/documents`
  - **Path Parameter**: `pitch_id` (integer)
  - **Request Body**:
    ```json
    {
      "document_url": "string",
      "document_type": "string",
      "title": "string",
      "description": "string | null",
      "is_private": true
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "document_url": "string",
      "document_type": "string",
      "title": "string",
      "description": "string | null",
      "is_private": true,
      "uploaded_by_type": "investor",
      "uploaded_by_id": 1,
      "uploaded_at": "datetime"
    }
    ```

- **GET** `/investor/pitches/{pitch_id}/documents`
  - **Path Parameter**: `pitch_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "document_url": "string",
        "document_type": "string",
        "title": "string",
        "description": "string | null",
        "is_private": true,
        "uploaded_by_type": "investor",
        "uploaded_by_id": 1,
        "uploaded_at": "datetime"
      }
    ]
    ```

### Offers
- **POST** `/investor/pitches/{pitch_id}/offers`
  - **Path Parameter**: `pitch_id` (integer)
  - **Request Body**:
    ```json
    {
      "offer_desc": "string"
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "pitch_id": 1,
      "investor_id": 1,
      "offer_desc": "string",
      "status": "pending",
      "offer_sent_at": "datetime",
      "created_at": "datetime"
    }
    ```

- **GET** `/investor/pitches/{pitch_id}/offers`
  - **Path Parameter**: `pitch_id` (integer)
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "pitch_id": 1,
        "investor_id": 1,
        "offer_desc": "string",
        "status": "pending",
        "offer_sent_at": "datetime",
        "created_at": "datetime"
      }
    ]
    ```

- **POST** `/investor/offers/{offer_id}/action`
  - **Path Parameter**: `offer_id` (integer)
  - **Request Body**:
    ```json
    {
      "action": "withdrawn",
      "notes": "string | null"
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "Offer withdrawn successfully"
    }
    ```

### Bills
- **POST** `/investor/pitches/{pitch_id}/bills`
  - **Path Parameter**: `pitch_id` (integer)
  - **Request Body**:
    ```json
    {
      "amount": 100.00,
      "description": "string",
      "due_date": "datetime",
      "payment_link": "string | null"
    }
    ```
  - **Response**:
    ```json
    {
      "id": 1,
      "pitch_id": 1,
      "amount": 100.00,
      "description": "string",
      "due_date": "datetime",
      "payment_link": "string | null",
      "is_paid": false,
      "created_at": "datetime",
      "paid_at": "datetime | null"
    }
    ```

## Models

### Document
- Pitch
- Scout
- Investor
- Founder
- Daftar

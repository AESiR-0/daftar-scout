# Datar Scout

A platform connecting founders and investors, facilitating pitch management, deal tracking, and investment opportunities.

## 🚀 Features

### For Founders
- Create and manage pitch decks
- Track pitch status and investor interest
- Schedule meetings with potential investors
- Access deal board analytics
- Manage team and pitch information

### For Investors
- Scout and discover promising startups
- Track pitch progress and deal stages
- Manage premium features
- Schedule and manage meetings
- Access comprehensive analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM 
- **Authentication**: NextAuth.js
- **Calendar Integration**: Google Calendar API
- **File Storage**: AWS S3
- **Deployment**: AWS EC2

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (Package Manager)
- PostgreSQL
- AWS Account (for S3 and deployment)
- Google Cloud Account (for Calendar API)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/datar-scout.git
   cd datar-scout
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL=your_database_url

   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # AWS
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_bucket_name

   # Google Calendar
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Set up the database**
   ```bash
   pnpm drizzle-kit push:pg
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

```
datar-scout/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── founder/           # Founder-specific pages
│   ├── investor/          # Investor-specific pages
│   └── ...
├── backend/               # Backend utilities and models
├── components/            # Reusable components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🔧 Configuration

### Database
The project uses PostgreSQL with Drizzle ORM. Database schema is defined in `backend/drizzle/models/`.

### Authentication
Authentication is handled by NextAuth.js with email/password and Google OAuth providers.

### Adapters
The project uses several adapters for different functionalities:

- **Database Adapter**: Drizzle ORM adapter for PostgreSQL
- **Authentication Adapter**: NextAuth.js adapter for session management
- **Storage Adapter**: AWS S3 adapter for file storage
- **Calendar Adapter**: Google Calendar API adapter for meeting management
- **Email Adapter**: SMTP adapter for email notifications

### File Upload
File uploads are handled through AWS S3 integration.

## 🚀 Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Deploy to AWS Elastic Beanstalk**
   ```bash
   eb deploy
   ```

## 📚 API Documentation

For detailed API documentation, please refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Drizzle ORM for the database toolkit
- All our contributors and supporters

### Comprehensive Risk Assessment

#### 1. API & Data Security Risks
- **Authentication Risks**
  - Session-based authentication without proper session expiration handling
  - No rate limiting on authentication endpoints
  - Potential session hijacking vulnerabilities

- **Data Validation Risks**
  - Some API endpoints lack comprehensive input validation
  - Potential SQL injection vulnerabilities in raw SQL queries
  - Missing sanitization for user inputs in some routes

#### 2. Infrastructure Risks
- **Database Risks**
  - Missing database backup strategy
  - No visible database migration strategy
  - Potential connection leaks in error scenarios

- **Third-party Service Risks**
  - Google Analytics dependency without fallback
  - No circuit breaker pattern for external service calls
  - Missing retry mechanisms for failed external calls

#### 3. Performance Risks
- **API Performance**
  - No caching strategy implemented
  - Potential N+1 query problems in some routes
  - Missing pagination in list endpoints
  - No request timeout handling

- **Resource Management**
  - No visible memory leak prevention
  - Missing file upload size limits
  - No rate limiting on resource-intensive endpoints

#### 4. Error Handling & Monitoring Risks
- **Error Management**
  - Inconsistent error handling across routes
  - Missing global error boundary
  - Insufficient error logging
  - No structured error tracking

- **Monitoring**
  - Basic console logging without proper log management
  - Missing performance monitoring
  - No real-time error tracking
  - Insufficient API usage metrics

#### 5. Business Logic Risks
- **Data Integrity**
  - Missing transaction handling in critical operations
  - No data validation at the database level
  - Potential race conditions in concurrent operations

- **Feature Risks**
  - No feature flag system
  - Missing A/B testing infrastructure
  - No rollback mechanism for failed deployments

#### 6. Security Risks
- **Authorization**
  - Incomplete role-based access control
  - Missing IP-based restrictions
  - No API key rotation mechanism

- **Data Protection**
  - Missing data encryption at rest
  - No visible PII handling strategy
  - Insufficient audit logging

#### 7. Scalability Risks
- **Architecture**
  - No visible horizontal scaling strategy
  - Missing load balancing configuration
  - No CDN implementation for static assets

- **Database**
  - No visible database sharding strategy
  - Missing read/write splitting
  - No database replication configuration

#### 8. Compliance Risks
- **Audit**
  - Insufficient audit logging
  - Missing compliance reporting
  - No data access logging

#### 9. Integration Risks
- **API Integration**
  - No API versioning strategy
  - Missing API documentation
  - No API deprecation policy

- **Third-party Services**
  - No fallback mechanisms for external services
  - Missing service health checks
  - No circuit breaker implementation

#### 10. Deployment Risks
- **Release Management**
  - No visible rollback strategy
  - Missing deployment verification
  - No blue-green deployment configuration

- **Environment**
  - No visible environment-specific configurations
  - Missing configuration management
  - No secrets management strategy

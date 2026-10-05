# DPP Platform — Backend

Backend service for the Digital Product Passport (DPP) Platform built by Monkspaces.

## Tech Stack

- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL (via TypeORM)
- **Authentication:** JWT (access + refresh tokens) + Passport.js
- **Authorization:** RBAC (Role-Based Access Control)
- **API Docs:** Swagger/OpenAPI
- **File Storage:** AWS S3 / Supabase Storage
- **QR Codes:** qrcode npm package
- **Validation:** class-validator + class-transformer

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Health check controller
│   ├── app.service.ts             # App service
│   ├── config/
│   │   └── configuration.service.ts  # Environment config
│   ├── common/
│   │   ├── index.ts               # Barrel exports
│   │   ├── logger.decorator.ts    # Logger injection helper
│   │   ├── services/
│   │   │   └── logger.service.ts  # Logging service
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── helpers/
│   │       ├── qr-generator.helper.ts
│   │       ├── jsonld-builder.helper.ts
│   │       └── audit-helper.helper.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── organizations/
│   ├── users/
│   ├── products/
│   ├── dpps/
│   ├── documents/
│   ├── suppliers/
│   ├── templates/
│   ├── audit/
│   └── export/
├── test/
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm ci
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database setup

- Install PostgreSQL
- Create database: `createdb -U dpp_admin dpp_platform`
- Run migrations (when ready): `npm run migration:run`

### 4. Run development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

Swagger documentation: `http://localhost:3000/api/docs`

### 5. Build for production

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create organization + admin user
- `POST /api/auth/login` — Login, get tokens
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Get current user profile
- `POST /api/auth/logout` — Logout

### Organizations
- `GET /api/orgs` — Get current organization
- `PUT /api/orgs` — Update organization
- `GET /api/orgs/members` — List members
- `POST /api/orgs/members` — Invite member
- `DELETE /api/orgs/members/:id` — Remove member

### Products
- `GET /api/products` — List products
- `POST /api/products` — Create product
- `GET /api/products/:id` — Get product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Archive product
- `POST /api/products/:id/publish` — Publish + generate QR

### DPPs
- `GET /api/dpps` — List DPPs
- `POST /api/dpps` — Create DPP
- `GET /api/dpps/:id` — Get DPP
- `PUT /api/dpps/:id` — Update DPP
- `POST /api/dpps/:id/publish` — Publish DPP
- `GET /api/dpps/:id/history` — Version history
- `GET /api/dpps/product/:productId` — Get DPP for product

### Documents
- `GET /api/documents` — List documents
- `POST /api/documents/upload` — Upload document
- `GET /api/documents/:id` — Get document info
- `GET /api/documents/:id/download` — Download
- `DELETE /api/documents/:id` — Delete

### Suppliers
- `GET /api/supplier-requests` — List requests
- `POST /api/supplier-requests` — Create request
- `PUT /api/supplier-requests/:id` — Update status
- `POST /api/supplier-requests/:id/respond` — Supplier response (public)

### Templates
- `GET /api/templates` — List templates
- `GET /api/templates/industry/:industry` — Get industry template
- `GET /api/templates/:id` — Get template
- `GET /api/templates/:id/schema` — Get schema
- `POST /api/templates` — Create template
- `PUT /api/templates/:id` — Update template

### Audit
- `GET /api/audit` — Query logs
- `GET /api/audit/entity/:entityType/:entityId` — Entity logs

### Export
- `GET /api/export/products/:id/jsonld` — JSON-LD export
- `GET /api/export/dpps/:id/jsonld` — JSON-LD export
- `GET /api/export/products/csv` — CSV export
- `GET /api/export/dpps/csv` — CSV export
- `GET /api/export/:type/:id/report` — PDF report

### Public
- `GET /api/public/dpp/:identifier` — Public DPP page data
- `GET /api/public/jsonld/:identifier` — JSON-LD for QR resolution

## Authentication

All endpoints except `/auth/*`, `/templates/industry/*`, and `/public/*` require a valid JWT token.

Include token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Roles

- **admin:** Full access to all features, can manage users, settings
- **member:** Can create/edit products and DPPs, upload documents
- **viewer:** Read-only access
- **supplier:** Limited access to respond to data requests

## Development

### Running tests
```bash
npm test
npm run test:watch
npm run test:cov
```

### ESLint
```bash
npm run lint
```

## Migration Commands (when TypeORM entities are ready)

```bash
# Generate new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## License

UNLICENSED — Private property of Monkspaces

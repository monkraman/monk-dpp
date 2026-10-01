# DPP Platform Technical Specification v1.0
## Digital Product Passport Platform — Monkspaces

**Prepared:** October 2026  
**Status:** Pre-production  
**Compliance:** EU Battery Regulation 2023/1542, Ecodesign Regulation ESPR 2024/1781

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Data Models](#4-data-models)
5. [API Specifications](#5-api-specifications)
6. [Screen Designs](#6-screen-designs)
7. [Security Implementation](#7-security-implementation)
8. [Data Retention & Migration](#8-data-retention--migration)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Compliance Checklist](#10-compliance-checklist)

---

## 1. System Overview

### 1.1 Purpose
A Digital Product Passport (DPP) platform managing product lifecycle data for battery manufacturers, ensuring EU compliance with 10-year data retention.

### 1.2 Key Features
- Multi-tenant organization management
- Product/DPP entry with 71 required fields
- GS1 Digital Link QR generation
- Tiered data access (Public/Professional/Authority)
- Audit trail for all modifications
- JSON-LD export for EU DPP Registry

### 1.3 Technology Stack

| Layer | Technology | Versions |
|-------|------------|----------|
| Frontend | Angular 17 + Material | TypeScript 5.3 |
| Backend | NestJS (Node.js) | Node 18+, Nest 10.3 |
| Database | PostgreSQL 15 | TypeORM 0.3 |
| Storage | AWS S3 / Supabase | - |
| Auth | JWT + OAuth2 | bcrypt 5.1 |
| CDN | Cloudflare | - |

---

## 2. Technical Architecture

### 2.1 System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ LOGIN    │  │ COMPANY    │  │ PRODUCT  │  │ CREATE DPP   │  │
│  │ SCREEN   │  │ MGMT       │  │ MGMT     │  │ SCREEN       │  │
└──┴──────────┴──┴────────────┴──┴──────────┴──┴──────────────┴──┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  NestJS Application (Port 3000)                             │  │
│  │  ├── Auth Module (JWT/OAuth2)                             │  │
│  │  ├── Organization Module (RBAC)                           │  │
│  │  ├── Users Module (User Management)                       │  │
│  │  ├── Products Module (71 Fields)                          │  │
│  │  ├── DPPs Module (Passports)                              │  │
│  │  ├── Documents Module (S3 integration)                    │  │
│  │  ├── Suppliers Module                                     │  │
│  │  ├── Templates Module                                     │  │
│  │  ├── Audit Module (Immutable Logs)                        │  │
│  │  ├── Export Module (JSON-LD, CSV, PDF)                    │  │
│  │  └── Common Helpers (QR, JSON-LD, Audit)                  │  │
└──┴───────────────────────────────────────────────────────────┴──┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ PostgreSQL   │  │ S3 Storage   │  │ Cloudflare   │           │
│  │ (Audit logs) │  │ (Documents)  │  │ (CDN)        │           │
└──┴──────────────┴──┴──────────────┴──┴──────────────┴───────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EU DPP REGISTRY                               │
│  (GS1 Digital Link + QES authentication)                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
1. User authenticates → JWT access token (15 min) + refresh (7 days)
2. Token stored in HttpOnly cookie + localStorage (fallback)
3. All requests include Authorization: Bearer <token>
4. Role guard checks: admin/org-manager/user role
5. Product/DPP operations logged to audit trail
6. Published DPP → QR code → GS1 Digital Link URI
7. QR scan → Public JSON-LD page (no auth required)
```

---

## 3. User Roles & Permissions

### 3.1 Role Hierarchy

| Role | Privileges | Description |
|------|------------|-------------|
| **Super Admin** | All access | Platform owner, manages all orgs |
| **Org Admin** | Full org access | Manages users, products, DPPs |
| **Product Manager** | CRUD products | Creates/updates product data |
| **Compliance Officer** | View all + Audit | Reviews DPP compliance |
| **Viewer** | Read only | Limited to assigned products |

### 3.2 RBAC Model

```typescript
// Permission Matrix
{
  "resources": {
    "products": ["create", "read", "update", "delete", "publish"],
    "dpps": ["create", "read", "update", "publish", "export"],
    "organizations": ["read"],
    "audit": ["read"]
  },
  "visibility": {
    "public": "No auth required",
    "professional": "User token with role",
    "authority": "QES authenticated"
  }
}
```

---

## 4. Data Models

### 4.1 Organization Entity

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    logo_url TEXT,
    tenant_id UUID UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 User Entity

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    role VARCHAR CHECK (role IN ('super_admin', 'org_admin', 'product_manager', 'compliance', 'viewer')),
    status VARCHAR DEFAULT 'active',
    mfa_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Product Entity (71 Fields)

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    -- Public Fields (EU Battery Regulation Annex VI)
    product_identifier TEXT,           -- GS1 Digital Link URI
    battery_category TEXT,             -- EV/LMT/Industrial
    mass_kg DECIMAL(10,3),
    energy_capacity_wh DECIMAL(10,3),
    chemistry TEXT,                  -- NMC, LFP, etc.
    hazardous_substances TEXT,
    manufacture_date DATE,
    gtin TEXT,
    serial_number TEXT,
    brand_name TEXT,
    model_name TEXT,
    -- Professional Fields (Annex XIII)
    nominal_voltage DECIMAL(6,3),
    max_voltage DECIMAL(6,3),
    original_power_watts DECIMAL(10,3),
    cycle_life_cycles INTEGER,
    round_trip_efficiency DECIMAL(5,2),
    battery_lifetime_years DECIMAL(3,1),
    parts_materials TEXT,
    spare_parts_supplier TEXT,
    -- Authority Fields
    manufacturer_name TEXT,
    manufacturer_plant_location TEXT,
    eu_conformity_docs TEXT[],
    product_life_instructions TEXT,
    -- Metadata
    version INTEGER DEFAULT 1,
    status VARCHAR DEFAULT 'draft',  -- draft/published/archived
    published_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 DPP Entity

```sql
CREATE TABLE dpps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    organization_id UUID REFERENCES organizations(id),
    -- Tiered Data
    public_data JSONB,
    professional_data JSONB,
    authority_data JSONB,
    -- Publication
    qr_code_url TEXT,
    gs1_digital_link TEXT,
    status VARCHAR DEFAULT 'draft',
    published_at TIMESTAMP,
    eidas_signed BOOLEAN DEFAULT false,
    eidas_signature TEXT,
    eidas_timestamp TIMESTAMP,
    -- Versioning
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.5 Audit Log (Immutable)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID,
    entity_type VARCHAR NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR NOT NULL,         -- create/update/delete/publish/view
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Immutability: No UPDATE/DELETE allowed
    CONSTRAINT audit_immutable CHECK (OLD IS NULL)
);
```

---

## 5. API Specifications

### 5.1 Authentication Endpoints

```
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 900
}

---

POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}

Response:
{
  "accessToken": "new-jwt-token",
  "expiresIn": 900
}

---

POST /auth/logout
Headers: Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

### 5.2 Organization Management

```
GET /organizations
Response:
[
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "tenantId": "uuid"
  }
]

POST /organizations
{
  "name": "string",
  "email": "string",
  "logo": null | file
}

GET /organizations/:id/users
Response:
[
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "admin|manager|user",
    "status": "active|inactive"
  }
]

POST /organizations/:id/users
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "product_manager|compliance|viewer"
}
```

### 5.3 Product Management

```
GET /products
Query Params: ?page=1&limit=10&search=string&category=EV

Response:
{
  "data": [{
    "id": "uuid",
    "productIdentifier": "gs1-uri",
    "batteryCategory": "EV",
    "massKg": 12.5,
    "energyCapacityWh": 65,
    "chemistry": "NMC",
    "status": "draft|published",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }],
  "meta": { "total": 100, "page": 1, "limit": 10 }
}

POST /products
{
  "batteryCategory": "EV",
  "massKg": 12.5,
  "energyCapacityWh": 65,
  "chemistry": "NMC",
  "nominalVoltage": 3.7,
  "maxVoltage": 4.2,
  "originalPowerWatts": 250,
  "partsMaterials": "anode: graphite, cathode: NMC",
  "manufacturerName": "string",
  "manufacturerPlantLocation": "string"
}

GET /products/:id
Response includes all 71 fields organized by visibility tier

PUT /products/:id
PATCH /products/:id

DELETE /products/:id
```

### 5.4 DPP Operations

```
POST /dpps
{
  "productId": "uuid",
  "publicData": { "visibleData": {} },
  "professionalData": { "techData": {} },
  "authorityData": { "complianceData": {} },
  "accessLevel": "public|professional|authority"
}

Response:
{
  "id": "uuid",
  "productId": "uuid",
  "qrCodeUrl": "data:image/png;base64,...",
  "gs1DigitalLink": "https://domain/public/dpp/{id}",
  "status": "draft"
}

POST /dpps/:id/publish
Response:
{
  "id": "uuid",
  "status": "published",
  "publishedAt": "ISO date",
  "gs1DigitalLink": "https://domain/public/dpp/{id}"
}

GET /dpps/:id/history
Response:
[
  {
    "version": 1,
    "status": "draft",
    "createdAt": "ISO date",
    "updatedBy": "userId"
  }
]

GET /dpps/:id/jsonld
Response: Complete JSON-LD for EU DPP Registry submission
```

---

## 6. Screen Designs

### 6.1 Login Screen

```
┌─────────────────────────────────────────────────────────┐
│                DIGITAL PRODUCT PASSPORT                 │
│                                                         │
│                                                         │
│    Company Email:  [__________________________]         │
│                                                         │
│    Password:      [__________________________]          │
│                                                         │
│    [ ] Remember me                                    │
│                                                         │
│           [ LOGIN ]      [ Forgot Password? ]          │
│                                                         │
│              ─── OR SIGN IN WITH ───                     │
│                                                         │
│    [ Google ]    [ Microsoft ]    [ LinkedIn ]          │
│                                                         │
│         Don't have an account? Contact admin            │
└─────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Form validation with `FormGroup` and `Validators`
- JWT token stored in HttpOnly cookie (30 days refresh)
- MFA support via `otp` auth strategy
- OAuth2 integration for enterprise SSO

### 6.2 Company Management Screen

```
┌─────────────────────────────────────────────────────────┐
│  Organizations                                      │
│  [ + New Organization ]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Company Name        │ Contact Email    │ Logo   │   │
│  ├───────────────────────────────────────────────────┤   │
│  │  HimSol Technologies │ info@himsols...  │ [Img]  │   │
│  │  EcoBatteries GmbH  │ contact@ecob...  │ [Img]  │   │
│  │  GreenTech Inc      │ support@greent...│ [Img]  │   │
│  └───────────────────────────────────────────────────┘   │
│                                                         │
│                                                         │
│  Pagination: [ 1 ] [ 2 ] [ 3 ] ... [ 10 ] >            │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Tenant switching dropdown
- Search by name/email
- Logo upload (S3 with versioning)
- User count per organization

### 6.3 Product Management Screen

```
┌─────────────────────────────────────────────────────────┐
│  Products                                            │
│  [ + Add Product ]  [ Import CSV ]  [ Export ]        │
├─────────────────────────────────────────────────────────┤
│  Search: [_________________]  Filter: [All]          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │ ID │ Category │ Model │ Capacity │ Date │ Status │   │
│  ├───────────────────────────────────────────────────┤   │
│  │ abc123 │ EV │ PowerPack 500 │ 65Wh │ 2024 │ Draft│   │
│  │ def456 │ LMT │ BatteryPro │ 200Wh │ 2024 │ Pub. │   │
│  └───────────────────────────────────────────────────┘   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Product ID: abc123-def456-ghi789                 │   │
│  │ GTIN: 00123456789012                             │   │
│  │ Manufacturer: EcoBatteries GmbH                  │   │
│  │ Chemistry: NMC (Nickel Manganese Cobalt)         │   │
│  │ Mass: 12.5 kg                                    │   │
│  │ Energy: 65 Wh                                    │   │
│  │ Voltage: 3.7 V (Nominal)                           │   │
│  │ Status: [ Draft ] → [ Publish ]                  │   │
│  │                                                   │   │
│  │ [ Generate QR ]  [ Export JSON-LD ]  [ History ]  │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Data Entry Form (Modal):**

```
Battery Information
┌─────────────────────────────────────────────────────────┐
│ PRODUCT IDENTIFIER (GS1 Digital Link URI)              │
│ https://dpp.himsols.online/id/{GTIN}/{Serial}          │
├─────────────────────────────────────────────────────────┤
│ Battery Category: (●) EV  ( ) LMT  ( ) Industrial        │
│                                                         │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│ │ Mass (kg)   │  │ Energy (Wh) │  │ Voltage (V) │      │
│ │ [12.5]      │  │ [65.0]      │  │ [3.7]       │      │
│ └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                         │
│ Chemistry: [NMC ▼]                                      │
│   Options: NMC, LFP, Li-ion, Lead-acid, NiMH           │
│                                                         │
│ Hazardous Substances: [Cd, Pb ▼]                        │
│                                                         │
│ Manufacturer: [EcoBatteries GmbH]                     │
│ Location: [Munich, Germany]                             │
└─────────────────────────────────────────────────────────┘
```

### 6.4 Create DPP Screen

```
┌─────────────────────────────────────────────────────────┐
│  Create Digital Product Passport                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Select Product                                │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Product: PowerPack 500 EV Battery                 │   │
│  │ GTIN: 00123456789012                             │   │
│  │ Serial: BAT-2024-00123                           │   │
│  │ [ Change Product ]                                │   │
│  └───────────────────────────────────────────────────┘   │
│                                                         │
│  Step 2: Configure Access Levels                        │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  PUBLIC      │  │  PROFESSIONAL│                   │
│  │  (Consumer)  │  │ (Technician) │                   │
│  │ [x] Name     │  │ [x] Voltage  │                   │
│  │ [x] Mass     │  │ [x] Power    │                   │
│  │ [x] Chemistry│  │ [x] CycleLife│                   │
│  │ [x] Recycling│  │ [x] SpareParts│                   │
│  └──────────────┘  └──────────────┘                   │
│                                                         │
│  ┌──────────────┐                                       │
│  │  AUTHORITY   │                                       │
│  │  (Regulator) │                                       │
│  │ [x] Manufacturer data                            │
│  │ [x] Conformity docs                             │
│  │ [x] Plant location                              │
│  │ [ ] QES Signature (requires eIDAS)            │
│  └──────────────┘                                       │
│                                                         │
│  Step 3: Generate & Publish                            │
│  [ Generate QR Code ]  [ Publish to EU Registry ]        │
│                                                         │
│  QR Code Preview:                                       │
│  ┌─────────────────────┐                                │
│  │    ████████████     │  ← Base64 PNG data URL         │
│  │    ████████████     │                                │
│  │    ████████████     │  GS1 Link:                    │
│  │    ████████████     │  https://dpp.../id/0012...    │
│  └─────────────────────┘                                │
└─────────────────────────────────────────────────────────┘
```

**Technical Flow for DPP Creation:**

1. User selects product → Product data loaded
2. System builds JSON-LD with proper `@context` and `@id`
3. GS1 Digital Link URI generated: `https://domain/public/dpp/{productId}`
4. QR code generated via `qrcode` library
5. Data stored in `dpps` table with tiered visibility
6. Audit log entry created
7. Public page served at GS1 URI (no auth required)

---

## 7. Security Implementation

### 7.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT                                                │
│  1. POST /auth/login (email, password)               │
│  2. Receive { accessToken, refreshToken }           │
│  3. Store accessToken in memory, refresh in HttpOnly   │
│     cookie (secure, sameSite=strict)                  │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND                                               │
│  1. bcrypt.compare(password, hash)                     │
│  2. jwt.sign(payload, JWT_SECRET, { expiresIn: 15m })  │
│  3. Audit log: action='login', ipAddress               │
│  4. Return tokens                                    │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│  PROTECTED RESOURCE                                    │
│  1. Extract Bearer token from Authorization header     │
│  2. jwt.verify(token, JWT_SECRET)                      │
│  3. Check role-based access (RolesGuard)             │
│  4. Log access to audit trail                          │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Authorization Matrix

```typescript
// RolesGuard implementation
{
  "super_admin": ["*"],
  "org_admin": ["organizations:read", "users:*", "products:*", "dpps:*", "audit:*"],
  "product_manager": ["products:create", "products:read", "products:update", "products:delete", "dpps:create", "dpps:read", "dpps:update"],
  "compliance": ["products:read", "dpps:read", "audit:*"],
  "viewer": ["products:read", "dpps:read"]
}
```

### 7.3 Data Protection

| Protection | Implementation |
|------------|----------------|
| **Transport** | TLS 1.3 everywhere, HSTS headers |
| **Rest** | PostgreSQL TDE, S3 SSE-S3 encryption |
| **JWT** | HS256, 15-min expiry, refresh token rotation |
| **Passwords** | bcrypt with 12 rounds |
| **Audit** | Immutable append-only tables |
| **CORS** | Whitelist: frontend domain only |
| **Rate Limit** | 10 req/s short, 100/min medium |

---

## 8. Data Retention & Migration

### 8.1 10-Year Retention Strategy

```
YEAR 0-2:  Hot storage (PostgreSQL)
  - All data in primary RDS
  - Daily backups to S3 (versioned)
  - Audit logs: partition by month

YEAR 3-5:  Warm storage
  - Archive inactive products to S3 Glacier
  - Keep metadata in PostgreSQL (foreign key)
  - Restore time: < 24 hours

YEAR 6-10: Cold storage
  - Move to Glacier Deep Archive
  - Metadata in DynamoDB for retrieval
  - Restore time: < 7 days (acceptable for compliance)
```

### 8.2 Migration Script (Conceptual)

```typescript
// data-retention.service.ts
async archiveOldData(olderThan: Date) {
  // 1. Move products with no recent changes to archive table
  // 2. Export JSON-LD + documents to S3 Glacier
  // 3. Mark records as 'archived' in main DB
  // 4. Update audit logs with archive location
}
```

### 8.3 EU DPP Registry Submission

```
API Call: POST /eu-dpp-registry/submit
Headers: 
  Authorization: Bearer <QES-signed-token>
  Content-Type: application/ld+json

Body:
{
  "@context": "https://w3id.org/ppp/context.jsonld",
  "@type": "DigitalProductPassport",
  "@id": "gs1-digital-link-uri",
  "productIdentifier": "gs1-uri",
  "name": "Battery Product",
  "manufacturer": "Company Name",
  // ... all required fields
  "proof": {
    "@type": "DigitalSignature",
    "signature": "QES-signed-hash",
    "verifyingEntity": "https://eidaas.eu/signature"
  }
}
```

---

## 9. Deployment Architecture

### 9.1 Production Environment

```
┌─────────────────────────────────────────────────────────┐
│  INTERNET                                               │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS (443)
               ▼
┌─────────────────────────────────────────────────────────┐
│  Cloudflare (CDN + WAF)                                │
│  - DDoS Protection                                      │
│  - Rate Limiting                                        │
│  - Cache: /public/dpp/* (TTL: 1 hour)                  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│  Load Balancer (AWS ALB / Nginx)                       │
│  - SSL Termination                                      │
│  - Health Checks                                        │
└──────────────┬──────────────────────────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
┌─────────┐        ┌─────────┐
│ App 1   │        │ App 2   │  ← Auto-scaling group
│ NestJS  │        │ NestJS  │
│ Docker  │        │ Docker  │
└────┬────┘        └────┬────┘
     │                  │
     └───────┬──────────┘
             ▼
┌─────────────────────────────────────────────────────────┐
│  Database Cluster                                      │
│  - PostgreSQL Primary (RDS)                             │
│  - PostgreSQL Replica (Read-only)                       │
│  - S3 for documents                                     │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Environment Variables

```bash
# Production (.env.production)
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://dpp.himsols.online

DATABASE_URL=postgresql://dpp_user:password@db-host:5432/dpp_prod
JWT_SECRET=<from-secrets-manager>
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

S3_BUCKET=dpp-platform-production
S3_REGION=ap-south-1
S3_ACCESS_KEY=<from-secrets-manager>
S3_SECRET_KEY=<from-secrets-manager>
S3_ENDPOINT=https://s3.ap-south-1.amazonaws.com

AUDIT_ENABLED=true
```

---

## 10. Compliance Checklist

### EU Battery Regulation 2023/1542

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Product ID** | ✅ | GS1 Digital Link URI |
| **Battery Category** | ✅ | Enum field (EV/LMT/Industrial) |
| **Mass (kg)** | ✅ | Required field |
| **Energy Capacity (Wh)** | ✅ | Required field |
| **Chemistry** | ✅ | Required field |
| **Hazardous Substances** | ✅ | Cd/Pb indicators |
| **Nominal Voltage** | ✅ | Professional tier |
| **Original Power (W)** | ✅ | Professional tier |
| **Cycle Life** | ✅ | Optional field |
| **Parts/Materials** | ✅ | Professional tier |
| **Spare Parts Supplier** | ✅ | GLN/contact |
| **EU Conformity Docs** | ✅ | URL/PDF storage |
| **10-Year Retention** | ✅ | Archive strategy |
| **eIDAS QES** | ⏳ | Integration planned |
| **GS1 Digital Link** | ✅ | URI generation |

### Technical Standards Checklist

| Standard | Status | Notes |
|----------|--------|-------|
| **GS1 Digital Link** | ✅ | URI format: `https://domain/id/{GTIN}/{serial}` |
| **JSON-LD 1.1** | ✅ | Context: `w3id.org/ppp/` |
| **ISO 27001** | 📋 | Security controls implemented |
| **GDPR** | ✅ | Data minimization, consent management |
| **OWASP Top 10** | ✅ | Protected against common attacks |

---

## Appendix A: Environment Setup

### Development Setup

```bash
# 1. Backend
cd backend
cp .env.example .env
# Edit .env with:
# - DATABASE_URL=postgresql://localhost:5432/dpp_dev
# - JWT_SECRET=dev-secret-key (temporary)

npm install
npm run start:dev

# 2. Frontend
cd ../frontend
npm install
ng serve

# 3. Database (PostgreSQL)
createdb dpp_dev
# Run migrations when entities are implemented
```

### Production Deployment

```bash
# Build
cd backend && npm run build
cd ../frontend && npm run build

# Docker deployment
docker build -t dpp-backend .
docker build -t dpp-frontend .

# Kubernetes manifest (conceptual)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dpp-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dpp-backend
  template:
    spec:
      containers:
      - name: backend
        image: dpp-backend:latest
        envFrom:
        - secretRef:
            name: dpp-secrets
        ports:
        - containerPort: 3000
```

---

**Document Version:** 1.0  
**Last Updated:** October 2026  
**Next Review:** January 2027
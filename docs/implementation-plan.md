# DPP Platform – Implementation Plan & Architecture

**Version:** 1.0  
**Date:** September 2026  
**Team:** Monkspaces (Single developer / small team)

---

## 1. Project Overview

### What Are We Building?
A **Digital Product Passport (DPP) Platform** that allows businesses to:
- Create digital passports for their products (starting with batteries)
- Store structured product data (identity, materials, ESG, compliance, lifecycle)
- Generate QR codes that link to public-facing DPP pages
- Manage access tiers: public (consumer), professional (technician), authority (regulator)
- Collect supplier data through requests
- Export data in JSON-LD, CSV, and PDF formats
- Maintain full audit trails

### Current Phase
**Internal Tool First** — Monkspaces will use it for its own pilot products first. Validate workflow, fix issues, then offer to external companies as a SaaS.

### Future Phase (SaaS)
- Multi-tenant: multiple companies onboarded, each with isolated data
- Public DPP pages branded per company
- Supplier portal for data collection
- API for ERP/PIM integration
- Potentially microservices + microfrontends at scale

---

## 2. Scope & Architecture Decision

### Start: Modular Monolith
We start with a **single codebase, modular structure**:
- One NestJS backend (but modules are cleanly separated)
- One Angular frontend (but lazy-loaded feature modules)

**Why:**
- Faster to build than microservices from day 1
- Easier to debug and deploy
- Can split later if needed (modules already decoupled)

### Later (When Needed): Microservices / Microfrontends
- If one client gets huge traffic, we can split the affected module into its own service
- If multiple companies need completely different UIs, microfrontends can serve different experiences
- But **not day 1** — premature optimization kills speed

### Multi-Tenancy Strategy
- Every table has `organization_id` (except system-level tables like templates)
- JWT token contains `organizationId` + `userId` + `role`
- All queries filter by `organization_id` (enforced via middleware/guards)

### Database Schema (PostgreSQL)

```
organizations (1) ──┬── users (N)
                    ├── products (N)
                    ├── dpps (N)
                    ├── documents (N)
                    └── audit_logs (N)

products (1) ───────┬── dpp_data (1)
                    └── documents (N)

users ──────────────► organizations (N-to-1)
users ──────────────► audit_logs (N)
```

#### Core Tables

**organizations**
- id (UUID), name, slug, contact_email, contact_phone, country, industry, plan, timezone, settings (JSONB), created_at, updated_at

**users**
- id, organization_id (FK), email, password_hash, first_name, last_name, role (admin/member/viewer/supplier), phone, active, last_login, created_at, updated_at

**products**
- id, organization_id (FK), name, description, category (enum: ev_battery/lmt_battery/industrial_battery/other), gtin, serial_number, status (draft/published/archived), qr_code_data, qr_code_image (URL), created_by (FK to users), created_at, updated_at, published_at

**dpps**
- id, product_id (FK, unique), organization_id (FK), version, data (JSONB — the actual DPP content), access_level (public/professional/authority), status (draft/submitted/approved/published), created_at, updated_at

**documents**
- id, organization_id (FK), product_id (FK nullable), dpp_id (FK nullable), uploaded_by (FK to users), filename, original_name, file_type (pdf/image/spreadsheet/document), file_size, storage_path, visibility (public/professional/authority), document_type (declaration/certificate/test_report/manual/other), description, created_at

**audit_logs** (immutable — INSERT only)
- id, organization_id (FK), user_id (FK nullable), entity_type (product/dpp/document/user/organization/supplier_request), entity_id (UUID), action (create/update/delete/publish/view/export/login/logout), old_data (JSONB), new_data (JSONB), ip_address, user_agent, created_at

**supplier_requests**
- id, organization_id (FK), product_id (FK), requested_by (FK to users), supplier_email, supplier_name, data_fields (JSONB array of field names), status (pending/sent/responded/completed/expired), due_date, sent_at, responded_at, created_at

**supplier_submissions**
- id, request_id (FK), supplier_user_id (FK nullable — if supplier has account), submitted_data (JSONB), files (JSONB array of file refs), status (submitted/reviewed/approved/rejected), submitted_at

**templates**
- id, organization_id (FK, nullable — null = system template), name, industry, version, schema (JSONB — field definitions), settings (JSONB), is_system, created_by (FK), created_at

**api_keys** (for third-party integrations)
- id, organization_id (FK), name, key_prefix (first 8 chars), key_hash (hashed full key), permissions (JSONB), last_used_at, expires_at, created_by (FK), created_at

---

## 3. Backend (NestJS) – Module Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Health check
│   ├── app.service.ts             # App service
│   │
│   ├── config/
│   │   └── configuration.ts       # Env config
│   │
│   ├── common/
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
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts     # Login, register, refresh, logout
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── organizations/
│   │   ├── organizations.module.ts
│   │   ├── organizations.controller.ts
│   │   ├── organizations.service.ts
│   │   └── dto/
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts   # CRUD + publish
│   │   ├── products.service.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── product-query.dto.ts
│   │   └── entities/
│   │       └── product.entity.ts
│   │
│   ├── dpps/
│   │   ├── dpps.module.ts
│   │   ├── dpps.controller.ts       # CRUD + publish
│   │   ├── dpps.service.ts
│   │   ├── dpp-data.service.ts      # JSON-LD generation, validation
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── documents/
│   │   ├── documents.module.ts
│   │   ├── documents.controller.ts  # Upload, list, download
│   │   ├── documents.service.ts
│   │   └── dto/
│   │
│   ├── suppliers/
│   │   ├── suppliers.module.ts
│   │   ├── supplier-requests.controller.ts  # Create request, list, respond
│   │   ├── supplier-requests.service.ts
│   │   └── dto/
│   │
│   ├── templates/
│   │   ├── templates.module.ts
│   │   ├── templates.controller.ts
│   │   └── templates.service.ts
│   │
│   ├── audit/
│   │   ├── audit.module.ts
│   │   ├── audit.service.ts        # Write-only service (immutable logs)
│   │   └── audit.controller.ts     # Read audit logs (admin)
│   │
│   ├── export/
│   │   ├── export.module.ts
│   │   ├── export.controller.ts    # JSON-LD, CSV, PDF endpoints
│   │   └── export.service.ts
│   │
│   └── database/
│       ├── database.module.ts
│       └── migrations/             # TypeORM migrations
│
├── test/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 4. API Endpoints

### Auth
```
POST   /api/auth/register        # Create org + admin user
POST   /api/auth/login           # Email/password → tokens
POST   /api/auth/refresh         # Refresh token → new access token
POST   /api/auth/logout          # Invalidate refresh token
GET    /api/auth/me              # Current user + org info
```

### Organizations
```
GET    /api/orgs                 # Current org details
PUT    /api/orgs                 # Update org settings
GET    /api/orgs/members         # List org users
POST   /api/orgs/members         # Invite user (admin only)
DELETE /api/orgs/members/:id     # Remove user (admin only)
```

### Products
```
GET    /api/products             # List (paginated, filterable)
POST   /api/products             # Create product
GET    /api/products/:id         # Get product detail
PUT    /api/products/:id         # Update product
DELETE /api/products/:id         # Soft delete (archive)
POST   /api/products/:id/publish # Publish product + generate QR
```

### DPPs
```
GET    /api/dpps                # List DPPs for org
POST   /api/dpps                # Create DPP for product
GET    /api/dpps/:id            # Get DPP (with data)
PUT    /api/dpps/:id            # Update DPP data
POST   /api/dpps/:id/publish    # Publish DPP
GET    /api/dpps/:id/history    # Version history
GET    /api/dpps/public/:id     # Public DPP page (no auth) — for QR
```

### Documents
```
POST   /api/documents/upload     # Multipart upload → returns storage URL
GET    /api/documents            # List org documents
GET    /api/documents/:id        # Get document metadata
GET    /api/documents/:id/download  # Presigned download URL
DELETE /api/documents/:id        # Delete document
```

### Suppliers
```
GET    /api/supplier-requests    # List requests
POST   /api/supplier-requests    # Create request
PUT    /api/supplier-requests/:id   # Update status
POST   /api/supplier-requests/:id/respond  # Supplier response (or public endpoint)
```

### Templates
```
GET    /api/templates            # List available templates (by industry)
GET    /api/templates/:id        # Get template schema
```

### Export
```
GET    /api/export/products/:id/jsonld   # JSON-LD for single product
GET    /api/export/products/csv          # CSV export
GET    /api/export/dpps/:id/jsonld       # DPP JSON-LD
```

### Public DPP Page (no auth, for QR scan)
```
GET    /api/public/dpp/:identifier   # identifier = GS1 Digital Link or product slug
```

---

## 5. Frontend (Angular) – Module Structure

```
frontend/
├── src/
│   ├── main.ts
│   ├── index.html
│   ├── styles.scss                # Global styles, theme
│   ├── polyfills.ts
│   │
│   ├── environments/
│   │   ├── environment.ts         # Dev
│   │   └── environment.prod.ts    # Prod
│   │
│   ├── app/
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts       # Root — layout (sidebar + header)
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   │
│   │   ├── core/
│   │   │   ├── core.module.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── dpp.service.ts
│   │   │   │   ├── document.service.ts
│   │   │   │   ├── supplier.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── models/
│   │   │       └── index.ts       # TypeScript interfaces
│   │   │
│   │   ├── shared/
│   │   │   ├── shared.module.ts
│   │   │   ├── components/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── page-header/
│   │   │   │   ├── file-upload/
│   │   │   │   └── status-badge/
│   │   │   ├── pipes/
│   │   │   │   ├── date.pipe.ts
│   │   │   │   ├── file-size.pipe.ts
│   │   │   │   └── truncate.pipe.ts
│   │   │   └── directives/
│   │   │       └── has-role.directive.ts
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   ├── login.module.ts
│   │       │   │   ├── login.component.ts
│   │       │   │   ├── login.component.html
│   │       │   │   └── login.component.scss
│   │       │   ├── register/
│   │       │   │   ├── register.module.ts
│   │       │   │   ├── register.component.ts
│   │       │   │   ├── register.component.html
│   │       │   │   └── register.component.scss
│   │       │   ├── forgot-password/
│   │       │   └── reset-password/
│   │       │
│   │       ├── dashboard/
│   │       │   ├── dashboard.module.ts
│   │       │   ├── dashboard.component.ts
│   │       │   ├── dashboard.component.html
│   │       │   └── dashboard.component.scss
│   │       │
│   │       ├── products/
│   │       │   ├── products.module.ts
│   │       │   ├── list/
│   │       │   │   ├── product-list.component.ts
│   │       │   │   ├── product-list.component.html
│   │       │   │   └── product-list.component.scss
│   │       │   ├── form/
│   │       │   │   ├── product-form.component.ts
│   │       │   │   ├── product-form.component.html
│   │       │   │   └── product-form.component.scss
│   │       │   └── detail/
│   │       │       ├── product-detail.component.ts
│   │       │       ├── product-detail.component.html
│   │       │       └── product-detail.component.scss
│   │       │
│   │       ├── documents/
│   │       │   ├── documents.module.ts
│   │       │   ├── list/
│   │       │   │   ├── document-list.component.ts
│   │       │   │   ├── document-list.component.html
│   │       │   │   └── document-list.component.scss
│   │       │   └── upload/
│   │       │       ├── document-upload.component.ts
│   │       │       ├── document-upload.component.html
│   │       │       └── document-upload.component.scss
│   │       │
│   │       ├── dpps/
│   │       │   ├── dpps.module.ts
│   │       │   ├── list/
│   │       │   ├── form/              # Multi-step DPP editor
│   │       │   ├── preview/           # Preview public DPP page
│   │       │   └── version-history/
│   │       │
│   │       ├── suppliers/
│   │       │   ├── suppliers.module.ts
│   │       │   ├── request-list/
│   │       │   ├── request-form/
│   │       │   └── respond/           # Supplier response form (public)
│   │       │
│   │       ├── admin/
│   │       │   ├── admin.module.ts
│   │       │   ├── settings/
│   │       │   ├── users/
│   │       │   └── audit/
│   │       │
│   │       └── public/
│   │           └── dpp-view/          # Public DPP page (no login)
│   │
│   └── assets/
│       ├── icons/
│       └── images/
│
├── proxy.conf.json                # Dev proxy to backend
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 6. Screen-by-Screen Plan

### Auth Screens

**Login** (`/login`)
- Email + password form
- "Forgot password?" link (placeholder for now)
- Error messages (invalid credentials)
- Redirect to `/dashboard` on success

**Register** (`/register`)
- Multi-step or single form:
  1. Organization: name, country, industry, contact email/phone
  2. Admin user: first name, last name, email, password
- Success → auto-login → dashboard

**Forgot Password** (`/forgot-password`)
- Email input → send reset link (email service needed — placeholder)

**Reset Password** (`/reset-password/:token`)
- New password + confirm password
- On success → login

### Main App Layout

**App Component** (root)
- Sidebar navigation (role-based menu items)
- Header with user avatar, org name, logout button
- Router outlet for page content

### Dashboard (`/dashboard`)
- Stats cards: Total Products, Published DPPs, Pending Supplier Requests, Total Documents
- Recent activity list (last 10 audit events)
- Quick actions: New Product, New DPP, Upload Document

### Products

**Product List** (`/products`)
- Material table: Name, Category, Status, Created Date, Actions
- Search bar + filter (category, status)
- Pagination
- "New Product" button (admin/member only)
- Row actions: View, Edit, Delete (admin only)

**Product Form** (`/products/new`, `/products/:id/edit`)
- Multi-step form:
  1. **Basic Info:** Name, Description, Category (dropdown: EV/LMT/Industrial/Other)
  2. **Identifiers:** GTIN, Serial Number
  3. **Template Fields:** Dynamic fields based on selected category's template (rendered from template schema)
  4. **Review & Publish:** Summary, Publish button
- Validation on each step
- Back/Next navigation
- Auto-save draft on step change

**Product Detail** (`/products/:id`)
- Full product info display
- Associated DPPs list (with status)
- Documents list (with upload button)
- Audit log for this product (admin only)
- QR code preview
- Edit button → product form

### DPPs

**DPP List** (`/dpps`)
- Table: Product Name, DPP Status, Version, Updated Date, Actions
- Filter by status
- "Create DPP" button (links to product selection or direct creation)

**DPP Editor** (`/dpps/create`, `/dpps/:id/edit`)
- Multi-step dynamic form:
  1. **Select Product** (if creating new)
  2. **Data Entry:** Fields rendered from template schema — each field shows:
     - Field label + description
     - Input type (text, number, date, dropdown, file upload, URL)
     - Visibility badge (public/professional/authority icon)
     - Required indicator (red asterisk)
  3. **Review:** Summary of all entered data
  4. **Publish:** Publish button → generates QR code
- Auto-save (debounced, 2 seconds after last change)
- Validation per field type

**DPP Preview** (`/dpps/:id/preview`)
- Renders exactly how the public DPP page will look
- Shows only public fields (or professional if simulated)
- QR code displayed
- "Edit" button to go back

**DPP Version History** (`/dpps/:id/history`)
- List of versions: version number, date, user, changes summary
- Click to view version snapshot

### Documents

**Document List** (`/documents`)
- Table: Filename, Type, Visibility, Product association, Date, Actions
- Filter by product, type, visibility
- Upload button (admin/member)
- Download button, Delete button (admin only)

**Document Upload** (`/documents/upload`)
- Drag-and-drop area + file picker
- File type validation (PDF, PNG, JPG, etc.)
- File size limit (e.g., 10MB)
- Visibility selector
- Document type selector
- Product association (dropdown)
- Description field

### Suppliers

**Supplier Request List** (`/suppliers/requests`)
- Table: Product, Supplier Email, Status, Due Date, Created Date, Actions
- "New Request" button
- Status badges: Pending, Sent, Responded, Completed, Expired

**Supplier Request Form** (`/suppliers/requests/new`)
- Select product (dropdown)
- Enter supplier email + name
- Select data fields needed (checkboxes from template fields)
- Set due date (date picker)
- Optional message
- Send button → sends email to supplier (email service placeholder)

**Supplier Response** (`/suppliers/respond/:token`) — Public (no login)
- Token-based access (from email link)
- Shows request details
- Form to submit requested data
- File upload for supporting docs
- Submit button

### Admin

**Organization Settings** (`/admin/settings`)
- Org name, contact info, industry, timezone
- Plan info (display only for now)
- Branding (logo upload — future)

**User Management** (`/admin/users`)
- Table: Name, Email, Role, Status, Date Joined, Actions
- Invite user button (email + role selector)
- Change role dropdown
- Deactivate/activate toggle
- Remove user (with confirmation)

**Audit Log** (`/admin/audit`)
- Table: Date, User, Entity Type, Entity ID, Action, Details
- Filters: entity type, action, date range
- Pagination
- Click row to expand details (old/new data diff)

### Public DPP View (No Login)

**Public DPP Page** (`/public/dpp/:id`)
- Product name, image (if available)
- Public fields visible:
  - Category, Mass, Energy Capacity, Chemistry, Hazardous Substance, Recycling Info
- "For Professionals" button (if professional access requested — placeholder for auth)
- "For Authorities" button (placeholder)
- QR code (redundant but helpful)
- JSON-LD in `<script>` tag for machine readability
- Download PDF button (if enabled)

---

## 7. Data Models (TypeScript Interfaces)

```typescript
// models/index.ts

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  industry?: string;
  plan?: string;
  timezone?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member' | 'viewer' | 'supplier';
  phone?: string;
  organization: Organization;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: 'ev_battery' | 'lmt_battery' | 'industrial_battery' | 'other';
  gtin?: string;
  serialNumber?: string;
  status: 'draft' | 'published' | 'archived';
  qrCodeData?: string;
  qrCodeImage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Dpp {
  id: string;
  productId: string;
  organizationId: string;
  version: number;
  data: Record<string, unknown>;
  accessLevel: 'public' | 'professional' | 'authority';
  status: 'draft' | 'submitted' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Document {
  id: string;
  organizationId: string;
  productId?: string;
  dppId?: string;
  uploadedBy: string;
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'image' | 'spreadsheet' | 'document';
  fileSize: number;
  storagePath: string;
  visibility: 'public' | 'professional' | 'authority';
  documentType: 'declaration' | 'certificate' | 'test_report' | 'manual' | 'other';
  description?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SupplierRequest {
  id: string;
  productId: string;
  productName?: string;
  supplierEmail: string;
  supplierName?: string;
  dataFields: string[];
  status: 'pending' | 'sent' | 'responded' | 'completed' | 'expired';
  dueDate?: string;
  createdAt: string;
}
```

---

## 8. Development Phases

### Phase 1 – Foundation (2–3 weeks)
- [ ] Database schema + migrations
- [ ] NestJS project setup + config
- [ ] Auth module: register, login, JWT, refresh token, bcrypt
- [ ] RBAC guards (admin, member, viewer, supplier)
- [ ] Organization CRUD
- [ ] User CRUD (within org)
- [ ] Angular project setup + theme
- [ ] Auth guards (Angular)
- [ ] Login + Register pages
- [ ] App layout (sidebar + header)
- [ ] Dashboard (stats + recent activity)

**Deliverable:** Can sign up, log in, see dashboard. No products yet.

### Phase 2 – Core Product & DPP (3–4 weeks)
- [ ] Product module: CRUD + publish + QR generation
- [ ] Template module: load templates by industry, schema-driven forms
- [ ] DPP module: create, read, update, publish, version history
- [ ] QR code generation (backend) + display (frontend)
- [ ] Public DPP page (no auth endpoint + Angular route)
- [ ] JSON-LD generation for DPPs
- [ ] Audit logging (write side)
- [ ] Product list + form + detail pages (Angular)
- [ ] DPP list + editor + preview pages (Angular)

**Deliverable:** Can create product → fill DPP → publish → see public page with QR.

### Phase 3 – Documents & Suppliers (2 weeks)
- [ ] Document module: upload (S3 or local storage for dev), list, download, delete
- [ ] File upload component (drag-drop + progress)
- [ ] Supplier request module: create request, list, status update
- [ ] Supplier response endpoint (public, token-based)
- [ ] Email service integration (placeholder for now — console log or Mailtrap)
- [ ] Document list + upload pages (Angular)
- [ ] Supplier request list + form + respond pages (Angular)

**Deliverable:** Can upload documents to products, request data from suppliers, suppliers can respond.

### Phase 4 – Admin & Polish (1–2 weeks)
- [ ] Admin settings page
- [ ] User management page (invite, role change, remove)
- [ ] Audit log viewer (admin)
- [ ] Export endpoints (JSON-LD, CSV)
- [ ] Export UI (buttons on product/DPP detail)
- [ ] Error handling + loading states across all pages
- [ ] Form validation refinement
- [ ] Responsive checks

**Deliverable:** Full platform usable internally. Ready for pilot.

### Phase 5 – Deployment & Pilot (1 week)
- [ ] Dockerize backend + frontend
- [ ] Deploy to VPS (Hostinger / DigitalOcean)
- [ ] Set up domain + SSL
- [ ] Configure database backups
- [ ] Onboard pilot user (internal team member)
- [ ] Gather feedback → iterate

---

## 9. Technology Decisions – Final

| Decision | Choice | Why |
|---|---|---|
| Frontend framework | Angular 17+ | Team expertise, form-heavy UI fits Angular |
| UI component library | Angular Material | Built-in components, consistent look, fast dev |
| State management | Services + RxJS (simple) | NgRx overkill for MVP |
| Backend framework | NestJS | TypeScript across stack, modular, REST-ready |
| Database | PostgreSQL | JSONB for flexible DPP data, relational for core entities |
| ORM | TypeORM or Knex | TypeORM for entity decorators, Knex for raw control — pick one |
| Auth | JWT (access 15min + refresh 7day) | Stateless, works for SPA |
| Password hashing | bcrypt (salt rounds 12) | Standard, secure |
| File storage | AWS S3 or Supabase Storage | Cheap, scalable; for MVP can use local filesystem |
| QR codes | qrcode npm package | Simple, reliable |
| Validation | class-validator (backend) + Angular reactive forms (frontend) | Consistent |
| API docs | Swagger/OpenAPI via @nestjs/swagger | Auto-generated, shareable with clients |
| CI/CD | GitHub Actions | Automated test → build → deploy |
| Hosting (MVP) | Single VPS (Hostinger/DigitalOcean) ~₹3-5K/mo | Simple, cheap |
| CDN (prod) | Cloudflare | Free tier, fast global access for DPP pages |

---

## 10. Folder Structure – Final

### Backend
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── helpers/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   └── strategies/
│   ├── organizations/
│   ├── users/
│   ├── products/
│   ├── dpps/
│   ├── documents/
│   ├── suppliers/
│   ├── templates/
│   ├── audit/
│   ├── export/
│   └── database/
├── test/
├── docker/
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/
├── src/
│   ├── main.ts
│   ├── index.html
│   ├── styles.scss
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── app/
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── core/
│   │   │   ├── core.module.ts
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── models/
│   │   ├── shared/
│   │   │   ├── shared.module.ts
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   └── features/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── documents/
│   │       ├── dpps/
│   │       ├── suppliers/
│   │       ├── admin/
│   │       └── public/
│   └── assets/
├── proxy.conf.json
├── angular.json
├── package.json
└── tsconfig.json
```

### Docs
```
docs/
├── images/               # Architecture diagrams, flowcharts
├── screenshots/          # UI screenshots (updated as built)
└── implementation-plan.md   # This file
```

---

## 11. Next Steps – Immediate Actions

1. **Database setup:** Install PostgreSQL locally or use a cloud instance. Create the database. Run migrations (or create tables manually for dev).

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your DB credentials
   npm run start:dev
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   ng serve
   ```

4. **Start coding in this order:**
   - Backend: Auth module first (register, login, JWT)
   - Frontend: Login + Register pages + Auth service
   - Backend: Products module (CRUD)
   - Frontend: Product list + form
   - Backend: DPPs module + QR generation
   - Frontend: DPP editor + preview
   - ... and so on per phase

---

## 12. Scope Boundaries – What's In / Out for MVP

### IN Scope (MVP)
- Multi-tenant auth (org + user + roles)
- Product CRUD with category selection
- DPP data entry with template-driven dynamic forms
- QR code generation on publish
- Public DPP page (read-only, no auth)
- Document upload + management
- Supplier data requests (create + respond)
- Basic audit logging
- JSON-LD + CSV export
- Admin: org settings, user management, audit log view

### OUT Scope (MVP — later)
- Email notifications (use console log / Mailtrap for dev)
- Password reset flow (placeholder link)
- PDF export (can add later)
- Multi-language (i18n) — English only for now
- Blockchain anchoring
- AI data extraction
- ERP/PIM integrations
- Advanced analytics dashboard
- Mobile app
- Branding customization per tenant (future SaaS)
- ISO 27001 compliance (infrastructure + process — separate effort)

---

## 13. Success Criteria for MVP

- [ ] Can register organization + admin user
- [ ] Can log in and see dashboard
- [ ] Can create a product with category, GTIN, serial
- [ ] Can fill DPP data using template-driven form
- [ ] Can publish product + DPP → QR code generated
- [ ] Can scan QR (or open public URL) → see public DPP page
- [ ] Can upload documents to product
- [ ] Can create supplier request → supplier can respond
- [ ] Admin can manage users + view audit log
- [ ] Data persists in PostgreSQL
- [ ] JWT auth works (login → API calls authorized)
- [ ] App is responsive (mobile-friendly for DPP public page)

---

*End of Document*

# 🔬 Low-Level Design (LLD) Document
## Digital Product Passport (DPP) Platform — Monkspaces

| Property | Details |
| :--- | :--- |
| **Document Title** | Low-Level Design (LLD) & Data Model Specification |
| **Database Engine** | PostgreSQL 17 |
| **ORM** | TypeORM 0.3 |
| **Backend Framework** | NestJS 10 (TypeScript 5.3) |
| **Status** | Implemented & Active in `dpp_platform` DB |

---

## 1. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has members"
    ORGANIZATIONS ||--o{ PRODUCTS : "owns products"
    ORGANIZATIONS ||--o{ DPPS : "owns passports"
    USERS ||--o{ PRODUCTS : "creates products"
    USERS ||--o{ DPPS : "publishes passports"
    PRODUCTS ||--o{ DPPS : "has digital passports"
    ORGANIZATIONS ||--o{ AUDIT_LOGS : "logs tenant events"

    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar email UK
        text logo_url
        uuid tenant_id UK
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar role
        varchar status
        boolean mfa_enabled
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCTS {
        uuid id PK
        uuid organization_id FK
        text product_identifier
        text battery_category
        decimal mass_kg
        decimal energy_capacity_wh
        text chemistry
        text hazardous_substances
        date manufacture_date
        text gtin
        text serial_number
        text brand_name
        text model_name
        decimal nominal_voltage
        decimal max_voltage
        decimal original_power_watts
        integer cycle_life_cycles
        decimal round_trip_efficiency
        decimal battery_lifetime_years
        text parts_materials
        text spare_parts_supplier
        text manufacturer_name
        text manufacturer_plant_location
        text_array eu_conformity_docs
        text product_life_instructions
        integer version
        varchar status
        timestamptz published_at
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    DPPS {
        uuid id PK
        uuid product_id FK
        uuid organization_id FK
        jsonb public_data
        jsonb professional_data
        jsonb authority_data
        text qr_code_url
        text gs1_digital_link
        varchar status
        timestamptz published_at
        boolean eidas_signed
        text eidas_signature
        timestamptz eidas_timestamp
        integer version
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid organization_id
        uuid user_id
        varchar entity_type
        uuid entity_id
        varchar action
        jsonb old_data
        jsonb new_data
        inet ip_address
        text user_agent
        jsonb metadata
        timestamptz created_at
    }
```

---

## 2. Table Specifications & Constraints

### 2.1 `organizations`
Stores tenant profiles. Each business operating on the platform has one record here.
- `id` (UUID, Primary Key, generated via `uuid_generate_v4()`).
- `name` (VARCHAR, NOT NULL): Legal business name.
- `email` (VARCHAR, UNIQUE, NOT NULL): Organization primary contact email.
- `tenant_id` (UUID, UNIQUE, NOT NULL): External tenant GUID.
- `logo_url` (TEXT, NULLABLE): Hosted logo URL for branded public passport pages.

### 2.2 `users`
Stores user credentials, profiles, and permissions.
- `organization_id` (UUID, FOREIGN KEY -> `organizations.id` ON DELETE SET NULL).
- `role` (VARCHAR, DEFAULT 'viewer'): CHECK constraint: `['super_admin', 'org_admin', 'product_manager', 'compliance', 'viewer']`.
- `password_hash` (VARCHAR, NOT NULL): 60-character bcrypt hash string.

### 2.3 `products` (71 Regulatory Fields)
Categorized according to EU Battery Regulation Annex VI & XIII:
- **Public Core**:
  - `product_identifier`: GS1 Digital Link standard URI.
  - `battery_category`: `EV` (Electric Vehicle), `LMT` (Light Means of Transport), or `Industrial`.
  - `mass_kg`: Product weight with 3-decimal precision (e.g., `450.250`).
  - `energy_capacity_wh`: Total capacity (e.g., `75000.000` Wh = 75 kWh).
  - `chemistry`: Chemistry taxonomy (e.g., `NMC 811`, `LFP`, `Solid State`).
  - `manufacture_date`: ISO Date (`YYYY-MM-DD`).
  - `gtin` & `serial_number`: Global Trade Item Number (GS1 standard) and serial.
- **Professional Core (Annex XIII)**:
  - `nominal_voltage` & `max_voltage`: Operating electrical thresholds.
  - `original_power_watts`: Rated power output.
  - `cycle_life_cycles`: Minimum guaranteed full charge/discharge cycles.
  - `round_trip_efficiency`: Energy efficiency percentage (e.g., `92.50%`).
  - `parts_materials` & `spare_parts_supplier`: Commercial contact and dismantling details.
- **Authority Core**:
  - `eu_conformity_docs`: Array of S3 URLs to CE certificates & ISO test reports.
  - `manufacturer_plant_location`: Physical manufacturing coordinates/address.

### 2.4 `dpps`
Stores the active Digital Product Passports linked to products:
- `product_id` (UUID, FOREIGN KEY -> `products.id` ON DELETE CASCADE).
- `public_data`, `professional_data`, `authority_data` (JSONB): Pre-computed snapshots of tiered data for fast read-performance.
- `qr_code_url`: Hosted SVG/PNG barcode file.
- `gs1_digital_link`: Full web URI encoded in the QR.
- `status`: `draft` | `published` | `archived`.

### 2.5 `audit_logs`
Immutable record of system activities.
- Immutability enforced in PostgreSQL: No UPDATE or DELETE permitted.
- `old_data` & `new_data` store state diffs for audit reconstitution.

---

## 3. Product & Passport State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft : Product Created by Manager
    Draft --> InReview : Submitted for Verification
    InReview --> Draft : Compliance Rejection (Fix Fields)
    InReview --> Published : Approved by Compliance
    Published --> Updating : Manager Creates Revision
    Updating --> Published : Changes Published (Version +1)
    Published --> Archived : End of Life / Recycled
    Archived --> [*]
```

---

## 4. Backend Class & Injection Architecture

```mermaid
graph TD
    AppModule --> AuthModule
    AppModule --> OrganizationsModule
    AppModule --> ProductsModule
    AppModule --> DppsModule
    AppModule --> AuditModule
    AppModule --> ExportModule
    AppModule --> DatabaseModule

    ProductsModule --> ProductsController
    ProductsController --> ProductsService
    ProductsService --> ProductRepository[(TypeORM Repository)]
    ProductsService --> AuditService
    
    DppsModule --> DppsController
    DppsController --> DppsService
    DppsService --> DppRepository[(TypeORM Repository)]
    DppsService --> QrGeneratorHelper
    DppsService --> AuditService
```

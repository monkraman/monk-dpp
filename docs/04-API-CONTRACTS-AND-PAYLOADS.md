# 📡 API Specifications & Contract Book
## Digital Product Passport (DPP) Platform — Monkspaces

| Property | Details |
| :--- | :--- |
| **Document Title** | API Contracts & Payload Specification |
| **API Architecture** | RESTful JSON API + Swagger 2.0 / OpenAPI 3.0 |
| **Base URL** | `http://localhost:3000/api` (Local) / `https://api.monkspaces.com/api` (Production) |
| **Interactive Swagger Docs**| `/api/docs` |
| **Authentication** | Bearer JWT (Header: `Authorization: Bearer <token>`) |

---

## 1. Global Standards & Error Format

All API errors return a standard JSON object:

```json
{
  "statusCode": 400,
  "message": ["mass_kg must be a positive number", "chemistry cannot be empty"],
  "error": "Bad Request",
  "timestamp": "2026-10-02T21:15:00.000Z",
  "path": "/api/products"
}
```

---

## 2. Authentication Endpoints

### 2.1 Register New Organization & Admin
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "organizationName": "Monk Power Systems GmbH",
  "email": "admin@monkpower.eu",
  "password": "SecurePassword123!",
  "firstName": "Raman",
  "lastName": "Sharma"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "e6a0a2df-9226-444f-b676-466d7adbc79b",
    "email": "admin@monkpower.eu",
    "firstName": "Raman",
    "lastName": "Sharma",
    "role": "org_admin",
    "organization": {
      "id": "7fae294b-bf08-41d3-a5df-d0144d4715f3",
      "name": "Monk Power Systems GmbH",
      "slug": "monk-power-systems-gmbh"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### 2.2 Login User
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@monkpower.eu",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### 2.3 Get Current Authenticated Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Response (200 OK)**:
```json
{
  "id": "e6a0a2df-9226-444f-b676-466d7adbc79b",
  "email": "admin@monkpower.eu",
  "firstName": "Raman",
  "lastName": "Sharma",
  "role": "org_admin",
  "organization": {
    "id": "7fae294b-bf08-41d3-a5df-d0144d4715f3",
    "name": "Monk Power Systems GmbH",
    "slug": "monk-power-systems-gmbh"
  }
}
```

---

## 3. Product Management Endpoints

### 3.1 List All Products for Organization
- **Endpoint**: `GET /api/products`
- **Access**: Authenticated
- **Query Parameters**: `?page=1&limit=20&search=Lithium&status=published`
- **Response (200 OK)**:
```json
{
  "items": [
    {
      "id": "31b2ff63-4416-43b9-aefb-735f4dfd38a0",
      "model_name": "Titan-EV 800",
      "brand_name": "Monk Volt",
      "battery_category": "EV",
      "chemistry": "NMC 811",
      "energy_capacity_wh": 82000.0,
      "mass_kg": 465.5,
      "status": "published",
      "version": 1,
      "created_at": "2026-10-02T19:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### 3.2 Create New Product (71 Regulatory Fields)
- **Endpoint**: `POST /api/products`
- **Access**: Authenticated (`product_manager` or `org_admin`)
- **Request Body**:
```json
{
  "model_name": "Titan-EV 800",
  "brand_name": "Monk Volt",
  "battery_category": "EV",
  "product_identifier": "https://id.monkspaces.com/01/04012345678901/21/SER-2026-001",
  "gtin": "04012345678901",
  "serial_number": "SER-2026-001",
  "chemistry": "NMC 811",
  "mass_kg": 465.500,
  "energy_capacity_wh": 82000.000,
  "nominal_voltage": 380.000,
  "max_voltage": 450.000,
  "original_power_watts": 220000.000,
  "cycle_life_cycles": 1500,
  "round_trip_efficiency": 94.20,
  "battery_lifetime_years": 10.0,
  "manufacture_date": "2026-09-15",
  "manufacturer_name": "Monk Battery Technologies Inc.",
  "manufacturer_plant_location": "Stuttgart, Germany",
  "hazardous_substances": "Cobalt (Co): 8.2%, Nickel (Ni): 62.5%, Lithium (Li): 4.1%"
}
```
- **Response (201 Created)**:
```json
{
  "id": "31b2ff63-4416-43b9-aefb-735f4dfd38a0",
  "status": "draft",
  "version": 1,
  "message": "Product created successfully"
}
```

---

## 4. DPP & QR Code Endpoints

### 4.1 Create / Generate Passport for Product
- **Endpoint**: `POST /api/dpps`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "productId": "31b2ff63-4416-43b9-aefb-735f4dfd38a0"
}
```
- **Response (201 Created)**:
```json
{
  "id": "a978f8cb-520e-4363-9580-ff6baae245df",
  "product_id": "31b2ff63-4416-43b9-aefb-735f4dfd38a0",
  "status": "draft",
  "qr_code_url": "https://storage.monkspaces.com/qrcodes/a978f8cb.png",
  "gs1_digital_link": "https://dpp.monkspaces.com/01/04012345678901/21/SER-2026-001"
}
```

### 4.2 Publish Passport (Lock & Certify)
- **Endpoint**: `PUT /api/dpps/:id/publish`
- **Access**: Authenticated (`compliance` or `org_admin`)
- **Response (200 OK)**:
```json
{
  "id": "a978f8cb-520e-4363-9580-ff6baae245df",
  "status": "published",
  "published_at": "2026-10-02T21:30:00.000Z",
  "version": 1
}
```

---

## 5. Public QR Resolver (Consumer & Inspector)

### 5.1 Scan QR & Resolve Passport
- **Endpoint**: `GET /api/export/public/jsonld/:identifier`
- **Access**: Public / Unauthenticated
- **Headers**:
  - Optional: `Authorization: Bearer <token>` (if professional repairer or authority)
- **Response (200 OK - Public Tier View)**:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Titan-EV 800",
  "brand": { "@type": "Brand", "name": "Monk Volt" },
  "gtin": "04012345678901",
  "category": "EV Battery",
  "weight": { "@type": "QuantitativeValue", "value": 465.5, "unitCode": "KGM" },
  "energyCapacity": { "@type": "QuantitativeValue", "value": 82, "unitCode": "KWH" },
  "chemistry": "NMC 811",
  "recyclingInformation": "Return to authorized EU battery collection centers or vehicle OEM service stations."
}
```

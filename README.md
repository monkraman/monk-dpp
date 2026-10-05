# Monk Spaces — Digital Product Passport (DPP) Platform

[![ESPR Compliant](https://img.shields.io/badge/ESPR-2024%2F1781-blue.svg)](https://commission.europa.eu/)
[![CIRPASS Aligned](https://img.shields.io/badge/CIRPASS-Aligned-green.svg)](https://cirpassproject.eu/)
[![GS1 Digital Link](https://img.shields.io/badge/GS1-Digital%20Link%20Standard-orange.svg)](https://www.gs1.org/standards/gs1-digital-link)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17%20JSONB-336791.svg)](https://www.postgresql.org/)

An enterprise-ready **Digital Product Passport (DPP) Platform** engineered for EU regulatory compliance (**ESPR**, **CIRPASS**, and **EU Battery Regulation 2023/1542**).

---

## 📌 Key Architectural Pillars (Guidelines & Strategy)

1. **Target Audience**:
   - **Asian Exporters to the EU**: Streamlined customs clearance & CBAM alignment.
   - **Textiles & Fashion**: Raw fiber origin, REACH chemical dye certifications, and circularity.
   - **Batteries & Mobility**: 71 mandatory Annex VI & XIII compliance data points.
   - **Packaging & Polymers**: Post-consumer recycled (PCR) content and takeback tracking.

2. **Regulatory Standards**:
   - **ESPR (2024/1781)**: Ecodesign for Sustainable Products Regulation.
   - **CIRPASS 1 & 2**: Semantic web standards (JSON-LD) and W3C Verifiable Credentials.
   - **GS1 Digital Link**: Unique web URIs (`https://domain/01/{GTIN}/21/{SERIAL}`) resolving dynamically.
   - **GDPR 3-Tier Privacy Shield**: Strict segregation between Public, Professional, and Authority data.

3. **Core Modules (Custom Monk Spaces UI)**:
   - 📊 **Operations Hub (`/dashboard`)**: Real-time carbon emissions, passport velocity, and activity feed.
   - 🛂 **Digital Passports (`/product-passports`)**: Passport generation with parent/child Chain of Custody linking.
   - 🏢 **Company Management (`/company-management`)**: Multi-tier supply chain directory ("From" Suppliers & "To" Client Recipients).
   - 📦 **Product Management (`/product-management`)**: Visual product master with photographs, mass/volume specs, and SKU/GTIN codes.
   - 👥 **User Management (`/user-management`)**: Team members, Role-Based Access Control (RBAC), and provisioning.

4. **Monetization Engine**:
   - **Tiered B2B SaaS Subscriptions** (Starter, Growth, Enterprise).
   - **Pay-Per-Passport** micro-transactions for high-volume exporters.
   - **Enterprise ERP Setup** for custom SAP / Oracle integrations.
   - **White-Label Licensing** for compliance agencies and advisors.

---

## 🚀 Quick Start Guide

### 1. Backend (NestJS + PostgreSQL 17)
```bash
cd DPP-Platform/backend
npm install
npm run start:dev
```
- API Base URL: `http://localhost:3000/api`
- Interactive Swagger OpenAPI Docs: `http://localhost:3000/api/docs`

### 2. Frontend (Angular 17 + Material)
```bash
cd DPP-Platform/frontend
npm install
npm start
```
- Web Application: `http://localhost:4200`

### 3. Default Login Credentials
- **Super Administrator**: `admin@monkspaces.com` / `MonkPass2026!`
- **Organization Administrator**: `raman@monkspaces.com` / `MonkPass2026!`

---

## 📚 Technical Documentation Index

- [01-PRD-PRODUCT-REQUIREMENTS.md](docs/01-PRD-PRODUCT-REQUIREMENTS.md) — Product Requirements Document
- [02-HLD-SYSTEM-ARCHITECTURE.md](docs/02-HLD-SYSTEM-ARCHITECTURE.md) — High-Level Architecture
- [03-LLD-DATABASE-AND-CODE-DESIGN.md](docs/03-LLD-DATABASE-AND-CODE-DESIGN.md) — Database & Code Design
- [04-API-CONTRACTS-AND-PAYLOADS.md](docs/04-API-CONTRACTS-AND-PAYLOADS.md) — API Payloads & Contracts
- [07-MONKSPACES-DPP-BUSINESS-FLOW-AND-CUSTOM-UI.md](docs/07-MONKSPACES-DPP-BUSINESS-FLOW-AND-CUSTOM-UI.md) — Custom Supply Chain Flow & UI
- [08-DPP-GUIDELINES-COMPLIANCE-AND-STRATEGY-ROADMAP.md](docs/08-DPP-GUIDELINES-COMPLIANCE-AND-STRATEGY-ROADMAP.md) — Guidelines, CIRPASS, ESPR & Monetization
- [09-CLOUDFLARE-R2-STORAGE-AND-DEPLOYMENT-GUIDE.md](docs/09-CLOUDFLARE-R2-STORAGE-AND-DEPLOYMENT-GUIDE.md) — Cloudflare R2 Object Storage, DMS & Production Deployment Guide
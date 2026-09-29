# Digital Product Passport (DPP) Platform — Monkspaces
### Product Research & Implementation Document

---

## Executive Summary

Monkspaces can build a reusable **Digital Product Passport (DPP) platform** instead of crafting one-off solutions per client. The EU now mandates DPPs for products under the Ecodesign Regulation (ESPR 2024/1781):

- **Batteries** — mandatory from **Feb 18, 2027** (EV, light transport, industrial batteries)
- **Textiles** — delegated act expected Q3–Q4 2027
- **Iron/steel, and other sectors** — 2027–2029

A DPP is a structured digital record of product data — identity, composition, origin, ESG/carbon data, compliance certificates, lifecycle and recycling info — accessible via a data carrier (e.g. QR code). Its core aims: **transparency, sustainability, compliance**.

The EU launched a **DPP Registry** (July 2026) to record unique product IDs and issued harmonised standards for interoperability (CEN-CLC EN 18216–18246).

**Recommendation:** Build an in-house Angular/NestJS/Postgres Platform, aligned with EU standards. Start with **Batteries** (first deadline, well-defined schema). Go-to-market: SaaS (tiered pricing — setup + annual + per-SKU) with pilot client onboard.

---

## 1. Competitor Landscape

| Provider | Focus | DPP Support | Supplier Portal | Documents | Chain-of-Custody | AI Features | API | Blockchain | Pricing (2026) |
|---|---|---|---|---|---|---|---|---|---|
| **Minespider** (Germany) | Miners, OEMs, EVs | Yes (DPP/DBP) | Yes (due diligence) | Yes (PDF, images) | Yes (end-to-end via DLT) | AI data extraction | REST API | Yes (open blockchain) | Enterprise (quote) |
| **Circularise** (Netherlands) | Automotive, batteries, chemicals, textiles | Yes (DPP, Battery) | Yes (multi-tier requests) | Yes (evidence upload) | Yes (mass-balance) | AI supplier validation (OCR) | Integrations | Yes (private DLT) | Enterprise (contact) |
| **Kezzler** (Norway/US) | Global brands (FMCG, apparel) | Yes (DPP/DBP) | No (ERP data focus) | Yes (asset history) | Yes (shipment trace) | QR engagement, analytics | Cloud API | No | Enterprise (quote) |
| **dpp.cloud** (Germany) | Manufacturers/Brands | Yes (DPP) | No | No | No | PIM/ERP sync, auto-QR | ERP connectors | No | Tiered (setup + per-SKU) |
| **WIARA — DigitalProductPassport** (Bulgaria) | Any EU manufacturer | Yes (DPP only) | No | No | No | 24-lang auto pages, audit logs | API-first | No | Freemium (free tier + plans) |
| **Avery ReadyDPP** (US) | Apparel/OEM brands | Yes (DPP) | Limited (labeling) | Yes (via Atma.io) | No | OCR labels, geo-localization | atma.io API | No | Service (engagement) |

**Key takeaways:**
- Enterprise players (Minespider, Circularise, Kezzler, Avery) dominate with full-stack + blockchain + supplier portals — but pricing opaque, long sales cycles.
- Lightweight SaaS (dpp.cloud, WIARA) focus on fast DPP generation, transparent pricing, but no supplier/chain-of-custody.
- **Gap:** A mid-market solution — affordable SaaS with solid compliance, multilingual, supplier data collection, and optional blockchain — is underserved. This is Monkspaces' opportunity.

---

## 2. Industry Focus: Batteries (Phase 1)

The EU Battery Regulation (2023/1542) requires digital battery passports for **EV, light-transport (LMT), and industrial batteries from Feb 18, 2027**. This is the first mandatory DPP category. Textiles follow later (2027+).

**Why batteries first:**
- Closest regulatory deadline
- 71 well-defined data points in the regulation (Annexes VI–XIII)
- EV/battery manufacturers already mobilizing (Ford, Honda pilots, etc.)
- Clear market need — OEMs and recyclers need compliance now

**Decision point:** Support all three battery types (EV, LMT, Industrial) from day one, or start with EV only? — Recommended: **all three**, schema is largely shared.

---

## 3. Battery DPP Data Schema

Based on EU Battery Regulation 2023/1542, Annex VI A, Annex XIII. Visibility tiers per ESPR: **Public** (consumer), **Professional** (technicians/importers), **Authority** (market surveillance — eIDAS authenticated).

| Field | Type | Visibility | Required | Source |
|---|---|---|---|---|
| Product Identifier (GS1 Digital Link URI) | String | Public | Mandatory | GS1 standard (GTIN/Serial) |
| Battery Category (EV/LMT/Industrial) | Enum/String | Public | Mandatory | BR Annex VI A (1)(2) |
| Manufacturer (name & plant location) | String | Authority | Mandatory | BR Annex VI A (3) |
| Manufacture Date (Month/Year) | Date | Authority | Mandatory | BR Annex VI A (4) |
| Mass (kg) | Number | Public | Mandatory | BR Annex VI A (5) |
| Rated Energy Capacity (Wh) | Number | Public | Mandatory | BR Annex VI A (6) |
| Battery Chemistry (e.g. NMC, LFP) | String | Public | Mandatory | BR Annex VI A (7) |
| Hazardous Substance Symbol (Cd/Pb) | String | Public | Mandatory | BR Annex VI A (9) |
| Nominal Voltage (V) | Number | Professional | Mandatory | BR Annex XIII 1(h) |
| Max Voltage (V) | Number | Professional | Mandatory | BR Annex XIII 1(h) |
| Original Power (W) | Number | Professional | Mandatory | BR Annex XIII 1(i) |
| Cycle Life (cycles) | Number | Professional | Optional* | BR Annex XIII 1(j) |
| Round-Trip Efficiency (%) | Number | Professional | Optional* | BR Annex XIII 1(n) |
| Battery Lifetime (years) | Number | Professional | Optional* | BR Annex XIII 1(m) |
| Parts/Materials (anode/cathode, electrolyte) | String | Professional | Mandatory | BR Annex XIII 2(a) |
| Spare Parts Supplier (GLN/contact) | String | Professional | Mandatory | BR Annex XIII 2(b) |
| EU Conformity Docs (URL/PDF) | URL/File | Authority | Mandatory | EU Declaration Art. 13(4) |
| Product Life Instructions (Download) | URL/File | Public | Optional | Deferred (TBD) |

\* Optional for certain categories or if applicable (e.g. warranty data).

**Total: 71 data points** per the EC guidance. All IDs use **GS1 Digital Link** (URI) — so a QR code resolves to the battery's DPP JSON-LD page. Chain-of-custody events (if captured) align with **GS1 EPCIS** conventions.

**Data retention:** Lifecycle + 10 years (EU requirement).

---

## 4. MVP Scope: Features & Effort

### 4.1 Feature Priorities

| Priority | Meaning |
|---|---|
| **Must** | Core — MVP not viable without it |
| **Should** | Important — improves usability/completeness |
| **Can** | Nice-to-have — defer to later |

### 4.2 Feature Breakdown

| Feature | Priority | Effort (Person-Days) | Dependencies |
|---|---|---|---|
| Account/Auth system (RBAC) | Must | 8 | None |
| Organization & user management (CRUD) | Must | 5 | Auth system |
| Database schema & models | Must | 5 | Basic app setup |
| Product/DPP entry UI & API | Must | 10 | Models |
| QR code generation & data link | Must | 3 | Product data |
| Multi-tier DPP pages (public/pro/authority) | Must | 7 | Templates, QR |
| Audit log (change history) | Must | 5 | Models |
| Document upload & storage | Should | 5 | Auth, models |
| Supplier data request module | Should | 7 | Product/DPP & email |
| Export (JSON-LD, CSV) | Should | 3 | Product models |
| REST API for all entities | Should | 10 | Models, auth |
| Admin dashboard & search | Should | 7 | Auth, API |
| UI form validation & UX polish | Should | 5 | Entry forms |
| ERP/PIM integration (import) | Should | 7 | API endpoints |
| AI-assisted data extraction (OCR/LLM) | Can | — | Post-MVP |
| Blockchain anchoring | Can | — | Post-MVP |
| Advanced analytics dashboard | Can | — | Post-MVP |
| Multi-language (beyond base) | Can | — | Post-MVP |
| **Total (core MVP)** | — | **~87 PD** | — |

**Timeline:** ~3–4 months (Sep–Dec 2026) on a 1–2 developer team.

### 4.3 Development Timeline (Gantt)

```
gantt
    title MVP Development Timeline
    dateFormat  YYYY-MM-DD
    section Setup
    Requirements Definition        :done,    a1, 2026-09-15, 1w
    Schema & Design Finalization   :active,  a2, after a1, 2w
    section Development
    Auth & Org Management          :active,  d1, after a2, 2w
    Product/DPP Core Functionality :         d2, after d1, 3w
    Supplier Portal & Docs         :         d3, after d2, 2w
    Multi-tier Pages & QR          :         d4, after d2, 2w
    API Development (REST)         :         d5, after d2, 3w
    Auditing & Logging             :         d6, after d3, 1w
    section Testing & Launch
    Integration & System Testing   :         t1, after d6, 2w
    Security Review & Pen Test     :         t2, after t1, 1w
    Pilot Deployment               :         t3, after t2, 1w
```

**Target:** Working beta deployed in cloud environment by mid-December 2026, ready for pilot.

---

## 5. Infrastructure & Cost Estimates

Assumptions: AWS Mumbai region, ~1–5 clients, ~10–50K pageviews/month, ~5K documents, modest AI usage. Pricing in INR.

| Resource | MVP (per mo / yr) | Production (per mo / yr) | Notes |
|---|---|---|---|
| Compute (VM) | ₹2,000 / ₹24,000 | ₹4,000 / ₹48,000 | 1–2 small instances (2 vCPU, 4–8 GB) |
| Managed Database | ₹1,500 / ₹18,000 | ₹8,000 / ₹96,000 | 20 GB PostgreSQL (MVP) vs 100 GB multi-AZ (prod) |
| Object Storage (S3) | ₹200 / ₹2,400 | ₹800 / ₹9,600 | ~10 GB (MVP) vs 50–100 GB |
| CDN / Traffic | ₹200 / ₹2,400 | ₹500 / ₹6,000 | 10–50K hits/mo, mostly cached |
| Monitoring / Logging | ₹100 / ₹1,200 | ₹500 / ₹6,000 | CloudWatch / Grafana |
| Backups / Security | ₹100 / ₹1,200 | ₹300 / ₹3,600 | Snapshot storage, basic security |
| Email (SES/SMTP) | ₹50 / ₹600 | ₹100 / ₹1,200 | System emails, alerts |
| LLM/AI API calls | — | ₹2,000 / ₹24,000 | Occasional GPT-4 (~$200/mo) — optional |
| **Total** | **₹4,050 / ₹48,600** | **₹15,700 / ₹189,600** | |

**MVP monthly ≈ ₹4–5K (~$50–60)** — one t3.medium EC2 + t3.small RDS + ~10 GB S3.

**Production monthly ≈ ₹15–35K (~$180–420)** — depending on scale (cache, larger DB, more storage, AI use).

**First year estimate (MVP, self-built):** < ₹1 lakh (infrastructure + incidentals).  
**Early commercial launch budget:** ₹1.5–3.5 lakh/year.  
**Scaled:** ₹3–5 lakh/year.

---

## 6. Recommended Tech Stack

Monkspaces team has TypeScript expertise — JavaScript/TypeScript throughout.

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Angular (+ Angular Material) | Rich form-driven UI, team already skilled in Angular 17+/TypeScript |
| **Backend** | NestJS (Node.js) | Modular TypeScript, REST APIs, pairs well with Angular |
| **Database** | PostgreSQL | Robust relational data, JSON fields for flexible schemas, widely used for traceability |
| **File Storage** | AWS S3 (or Supabase Storage) | Documents, static files, certificates |
| **CDN** | Cloudflare or AWS CloudFront | Fast global access to DPP pages |
| **API** | RESTful JSON + OpenAPI docs | GS1 Digital Link (HTTP URIs) for product IDs, JSON-LD for semantic data |
| **Authentication** | JWT/OAuth2 + RBAC | Tiered access (public / professional / authority) |
| **Hosting (MVP)** | Single VPS (Hostinger / DigitalOcean) **or Supabase** | Start simple: ~₹5–8K/month |
| **CI/CD** | GitHub Actions + Docker | Automated tests + deployments |
| **AI/ML (optional)** | Azure OpenAI / AWS OCR | OCR from PDFs, data extraction, text validation — post-MVP |

**Supabase consideration:** Given Monkspaces' experience with Supabase in past projects (zinglabs, myschool, etc.), using Supabase for MVP (managed Postgres + Auth + Storage + Row-Level Security) can speed up initial development significantly. Migration to custom AWS infra possible later if needed.

---

## 7. Compliance & Security

| Requirement | Status / Action |
|---|---|
| **ISO 27001** | Recommended — build trust with enterprise clients. Plan in parallel to dev. |
| **GDPR / Data Protection** | From day one: data minimization, consent, data subject rights. Draft DPA for EU partners. Use EU data centers or adequacy. |
| **TLS encryption** | All in-transit data encrypted. |
| **Encryption at rest** | Keys, personal data encrypted. |
| **RBAC + MFA** | Strong auth for admin accounts. |
| **Penetration testing** | Annual third-party pentest + regular vuln scans. OWASP practices. |
| **EU DPP Registry** | Each passport must be registered (live since July 2026). Requires **qualified electronic seal (QES)** per eIDAS. Procure QES credentials + integrate registry API. |
| **DPP Service Provider Act** | Expected Q3 2027 — likely requires audited processes + standards compliance. Prepare early (ISO, documented DevSecOps). |
| **Data retention** | Battery data: lifecycle + 10 years. Automated backups + secure archival. |
| **Privacy (consumer engagement)** | Privacy-by-design for QR-driven apps. User consent for any tracking. |

---

## 8. Go-to-Market & Business Model

### 8.1 Pricing Model Options

| Model | Description | Example |
|---|---|---|
| **SaaS — Tiered (recommended)** | Setup fee + annual platform fee + per-SKU cost | Like dpp.cloud: €10–17K first year + €0.25–1/SKU |
| **Subscription only** | Monthly/annual per organization | Simpler, but may not capture scale value |
| **Service / consulting** | Implementation + ongoing support | Higher touch, slower growth |
| **Freemium** | Free for small volume, paid for scale | WIARA model — good for adoption |

**Recommendation:** Start with **tiered SaaS** — setup fee covers onboarding, annual fee covers platform access, per-SKU for volume. Add service/consulting upsell for larger clients.

### 8.2 Pilot Strategy

1. **Target:** EV battery OEM or recycler — their real data validates form design and reveals hidden needs.
2. **Alternative:** Monkspaces' existing clients who sell physical products (dharoharstays, emptyspacesframes) — a "DPP-lite" pilot (QR + JSON-LD page, no blockchain) builds portfolio proof quickly.
3. **LOI (Letter of Intent):** Getting a pilot partner on LOI helps shape MVP priorities and gives market credibility.

### 8.3 Partnerships

- **GS1** — standards input, credibility
- **Industry consortia** — battery alliances, recycling bodies
- **Content marketing** — guides, webinars on DPP readiness for manufacturers

---

## 9. Next Steps (Immediate)

1. **Scope confirmation** — Lock battery categories (EV + LMT + Industrial — all three recommended).
2. **Sample data gathering** — Get real battery product data to refine schema.
3. **Tech stack finalization** — Angular vs React confirmed (Angular recommended); cloud provider (Supabase for MVP vs AWS direct).
4. **Security/Legal prep** — Start eIDAS QES procurement process (time lag); draft GDPR/privacy policy; plan ISO 27001 roadmap.
5. **Pilot client** — Identify and approach. LOI preferred.
6. **Pricing model decision** — Tiered SaaS final numbers.
7. **Regulatory watch** — Monitor delegated acts, DPP registry developments.
8. **UX prototyping** — DPP entry forms + public-facing DPP pages.
9. **Hosting + CI setup** — Before development starts.
10. **Build MVP** — ~87 person-days, Sep–Dec 2026 timeline.

---

## 10. Sources

- EU Ecodesign Regulation (ESPR) 2024/1781
- EU Battery Regulation (EU) 2023/1542, Annexes VI–XIII
- EU DPP Registry (launched July 2026)
- CEN-CENELEC standards EN 18216–18246 (DPP interoperability)
- GS1 Digital Link, EPCIS standards
- Competitor websites: Minespider, Circularise, Kezzler, dpp.cloud, WIARA DigitalProductPassport, Avery ReadyDPP
- ABI Research DPP provider analysis

---

*Document version: 1.0 | Prepared for Monkspaces DPP Platform | September 2026*

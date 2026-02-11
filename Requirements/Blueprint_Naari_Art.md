# Naari Arts - Custom Order Management System

## Project Overview

A comprehensive web-based SaaS order management system for fashion/tailoring businesses that handles:
- Customer inquiries and appointment requests
- Detailed order specifications
- Body measurements
- Fabric sourcing
- Work assignments
- Order fulfillment tracking
- GST compliance with split invoicing

---

## Client Information

- **Client:** Sagar Babariya
- **Phone:** +91 7878707014
- **Location:** Surat

---

## Database Schema

### Foundation Layer

#### Table 1: `tenants`
Multi-tenant SaaS foundation - each business is a tenant

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique tenant ID |
| business_name | VARCHAR(255) | NOT NULL | Legal business name |
| display_name | VARCHAR(100) | NOT NULL | Brand/display name |
| subdomain | VARCHAR(50) | UNIQUE, NOT NULL | tenant.yoursaas.com |
| contact_person | VARCHAR(100) | NOT NULL | Primary contact |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Business email |
| mobile | VARCHAR(15) | NOT NULL | Business contact |
| address | TEXT | NULLABLE | Registered address |
| city | VARCHAR(100) | NULLABLE | |
| state | VARCHAR(100) | NULLABLE | |
| state_code | VARCHAR(2) | NULLABLE | GST state code (MH=27) |
| pincode | VARCHAR(10) | NULLABLE | |
| is_active | BOOLEAN | DEFAULT true | Active/Inactive |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `subdomain` (UNIQUE)
- `email` (UNIQUE)

---

#### Table 2: `tenant_settings`
Configuration per tenant including GST module settings

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, UNIQUE, NOT NULL | One config per tenant |
| gst_module_enabled | BOOLEAN | DEFAULT false | Master GST switch |
| gst_number | VARCHAR(15) | NULLABLE | Business GSTIN |
| gst_registered_name | VARCHAR(255) | NULLABLE | Name as per GST certificate |
| hidden_gst_percentage | DECIMAL(5,2) | DEFAULT 0.00 | Hidden GST % for non-GST invoices |
| gst_invoice_prefix | VARCHAR(10) | DEFAULT 'GST' | e.g., GST/2024-25/ |
| non_gst_invoice_prefix | VARCHAR(10) | DEFAULT 'INV' | e.g., INV/2024-25/ |
| order_prefix | VARCHAR(10) | DEFAULT 'ORD' | e.g., ORD/2024-25/ |
| financial_year_start | TINYINT | DEFAULT 4 | April = 4 (for FY 2024-25) |
| enable_itc_tracking | BOOLEAN | DEFAULT false | Track Input Tax Credit |
| currency | VARCHAR(3) | DEFAULT 'INR' | |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Kolkata' | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id` (UNIQUE)
- `gst_number` (INDEX)

**Logic:**
- If `gst_module_enabled = false` → Hide all GST fields, simple invoicing only
- If `gst_module_enabled = true` → Validate `gst_number` is mandatory

---

### Master Data Layer

#### Table 3: `item_types`
Master data for garment types (Gown, Kurti, etc.) with HSN codes

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | Each tenant can customize |
| name | VARCHAR(100) | NOT NULL | Gown, Kurti, Chaniya Choli, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | ગાઉન, કુર્તી (optional) |
| name_hindi | VARCHAR(100) | NULLABLE | गाउन, कुर्ती (optional) |
| hsn_code | VARCHAR(8) | NULLABLE | HSN code for GST (e.g., 6204) |
| gst_rate | DECIMAL(5,2) | DEFAULT 0.00 | GST % (5%, 12%, 18%, etc.) |
| description | TEXT | NULLABLE | |
| is_active | BOOLEAN | DEFAULT true | |
| display_order | INT | DEFAULT 0 | Sort order in dropdowns |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE - no duplicate item types per tenant)
- `tenant_id, is_active`

**Default Seed Data:**
1. Gown
2. Chaniya Choli
3. Kurti
4. Kediyu
5. Top
6. Bottom
7. Palazzo Pair
8. Shrug

---

#### Table 4: `work_types`
Master data for embellishment/work types

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | Each tenant can customize |
| name | VARCHAR(100) | NOT NULL | Jardoshi, Moti, Kutchi, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | જરદોશી, મોતી |
| name_hindi | VARCHAR(100) | NULLABLE | जरदोशी, मोती |
| description | TEXT | NULLABLE | |
| is_active | BOOLEAN | DEFAULT true | |
| display_order | INT | DEFAULT 0 | Sort order in dropdowns |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)
- `tenant_id, is_active`

**Default Seed Data:**
1. Jardoshi
2. Moti (Beadwork)
3. Kutchi Work
4. Bharat Kam
5. Embroidery
6. Aari Work

---

#### Table 5: `embellishment_zones`
Areas of garment where embellishment work is applied

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | Each tenant can customize |
| name | VARCHAR(100) | NOT NULL | Front Neck, Back Neck, Sleeve, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | આગળ ગળો, પાછળ ગળો |
| name_hindi | VARCHAR(100) | NULLABLE | सामने गर्दन, पीछे गर्दन |
| description | TEXT | NULLABLE | |
| is_active | BOOLEAN | DEFAULT true | |
| display_order | INT | DEFAULT 0 | Sort order in dropdowns |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)
- `tenant_id, is_active`

**Default Seed Data:**
1. Front Neck
2. Back Neck
3. Sleeve
4. Kotho (Waist area)
5. Border
6. Belt

---

#### Table 6: `inquiry_sources`
Where customers heard about the business

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Facebook, Instagram, Reference, etc. |
| is_active | BOOLEAN | DEFAULT true | |
| display_order | INT | DEFAULT 0 | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)

**Default Seed Data:**
1. Facebook
2. Instagram
3. WhatsApp
4. Reference/Word of Mouth
5. Walk-in
6. Google Search
7. Existing Customer

---

#### Table 7: `occasions`
Event types for which garments are ordered

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Wedding, Festival, Party, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | લગ્ન, તહેવાર |
| name_hindi | VARCHAR(100) | NULLABLE | शादी, त्यौहार |
| is_active | BOOLEAN | DEFAULT true | |
| display_order | INT | DEFAULT 0 | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)

**Default Seed Data:**
1. Wedding
2. Navratri/Garba
3. Diwali
4. Party
5. Festival
6. Casual Wear
7. Office/Formal
8. Birthday

---

#### Table 8: `budget_ranges`
Configurable budget ranges per tenant

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| label | VARCHAR(100) | NOT NULL | Under ₹5,000, ₹5,000-₹10,000, etc. |
| min_amount | DECIMAL(10,2) | NOT NULL | Minimum range value |
| max_amount | DECIMAL(10,2) | NULLABLE | Maximum range value (NULL = no limit) |
| is_active | BOOLEAN | DEFAULT true | |
| display_order | INT | DEFAULT 0 | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, display_order`

**Default Seed Data:**
1. Under ₹5,000 (0 - 5000)
2. ₹5,000 - ₹10,000
3. ₹10,000 - ₹20,000
4. ₹20,000 - ₹50,000
5. ₹50,000+ (50000 - NULL)

---

### Customer Management Layer

#### Table 9: `customers`
Customer master data

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique customer ID |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | Multi-tenant identifier |
| name | VARCHAR(100) | NOT NULL, INDEX | Customer name (searchable) |
| mobile | VARCHAR(15) | NOT NULL, INDEX | Primary contact (searchable) |
| alternate_mobile | VARCHAR(15) | NULLABLE | Secondary contact |
| email | VARCHAR(100) | NULLABLE, INDEX | Email address |
| address_line1 | VARCHAR(255) | NULLABLE | Street address |
| address_line2 | VARCHAR(255) | NULLABLE | Apartment/Suite |
| city | VARCHAR(100) | NULLABLE | City |
| state | VARCHAR(100) | NULLABLE | State |
| pincode | VARCHAR(10) | NULLABLE | Postal code |
| gst_number | VARCHAR(15) | NULLABLE, INDEX | GST registration number |
| customer_category | ENUM | 'regular', 'vip', 'wholesale' | Customer tier |
| preferred_language | ENUM | 'hindi', 'gujarati', 'english' | Communication preference |
| status | ENUM | 'active', 'inactive' | Account status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, mobile` (UNIQUE - prevent duplicate mobile per tenant)
- `tenant_id, name` (for search)
- `tenant_id, email`
- `tenant_id, gst_number`

---

#### Table 10: `customer_inquiries`
Inquiry form submissions

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| customer_id | BIGINT | FK, NULLABLE, INDEX | NULL if new customer, FK if existing |
| name | VARCHAR(100) | NOT NULL | From form |
| mobile | VARCHAR(15) | NOT NULL, INDEX | From form |
| customer_type | ENUM | 'new', 'existing' | Self-declared by customer |
| inquiry_source_id | BIGINT | FK, NULLABLE | Reference to inquiry_sources |
| appointment_type | ENUM | 'store_visit', 'video_call' | Preferred meeting type |
| preferred_language | ENUM | 'hindi', 'gujarati', 'english' | |
| occasion_id | BIGINT | FK, NULLABLE | Reference to occasions |
| budget_range_id | BIGINT | FK, NULLABLE | Reference to budget_ranges |
| items_interested | TEXT | NULLABLE | Comma-separated item_type IDs or free text |
| notes | TEXT | NULLABLE | Additional notes from customer |
| inquiry_status | ENUM | 'pending', 'contacted', 'converted', 'lost' | Follow-up status |
| follow_up_date | DATE | NULLABLE | When to follow up |
| converted_to_order_id | BIGINT | FK, NULLABLE | If converted to order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Inquiry submission time |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, inquiry_status, follow_up_date` (for pending follow-ups)
- `tenant_id, mobile`
- `customer_id`

**Logic:**
- When form submitted → Search customers by mobile
- If found → Link customer_id, auto-fill details
- If not found → customer_id = NULL
- When converted → Create customer record (if new) + order

---

## GST & Billing System

### Key Requirements

1. **Master Switch:** GST Module ON/OFF per tenant
2. **Split Invoicing:** One order can have:
   - GST Invoice (partial amount)
   - Non-GST Invoice (remaining amount)
3. **Hidden GST Recovery:** For non-GST invoices, business can add hidden GST % to recover input tax paid
4. **ITC Tracking:** Track Input Tax Credit (GST paid on inputs vs collected on outputs)
5. **E-Way Bill:** Required for inter-state transport > ₹50,000

### Invoice Numbering
- GST Invoice: `GST/2024-25/001`
- Non-GST Invoice: `INV/2024-25/001`
- Order Number: `ORD/2024-25/001` (internal)

### Synchronous Order System
```
Main Order (Internal tracking)
├── Total actual value: ₹1,00,000
├── Tracks ALL costs, materials, work, profit
│
├── Invoice 1 (GST): ₹50,000 + GST
└── Invoice 2 (Non-GST): ₹50,000 (with hidden GST % if configured)
```

---

## Data Relationships

```
tenants (1) ──→ (Many) tenant_settings
tenants (1) ──→ (Many) item_types
tenants (1) ──→ (Many) work_types
tenants (1) ──→ (Many) embellishment_zones
tenants (1) ──→ (Many) inquiry_sources
tenants (1) ──→ (Many) occasions
tenants (1) ──→ (Many) budget_ranges
tenants (1) ──→ (Many) customers
tenants (1) ──→ (Many) customer_inquiries

customers (1) ──→ (Many) customer_inquiries
customers (1) ──→ (Many) orders (TBD)
customers (1) ──→ (Many) measurement_profiles
measurement_profiles (1) ──→ (Many) measurement_records (history)
measurement_records (1) ──→ (Many) measurement_values
measurement_types (1) ──→ (Many) measurement_values

inquiry_sources (1) ──→ (Many) customer_inquiries
occasions (1) ──→ (Many) customer_inquiries
budget_ranges (1) ──→ (Many) customer_inquiries
```

---

### Measurement System Layer

#### Table 11: `measurement_profiles`
Named measurement profiles per customer (e.g., "Wedding Fit", "Casual Fit")

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| customer_id | BIGINT | FK, NOT NULL, INDEX | |
| profile_name | VARCHAR(100) | NOT NULL | "Wedding Fit", "Regular", etc. |
| occasion_id | BIGINT | FK, NULLABLE | Link to occasions table |
| is_default | BOOLEAN | DEFAULT false | Default profile for this customer |
| notes | TEXT | NULLABLE | Profile-specific notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, customer_id, profile_name` (UNIQUE)
- `customer_id, is_default`

---

#### Table 12: `measurement_records`
Actual measurements taken on a specific date (history tracking)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| profile_id | BIGINT | FK, NOT NULL, INDEX | Link to measurement_profiles |
| measured_date | DATE | NOT NULL | When measurements were taken |
| measured_by | BIGINT | FK, NULLABLE | Staff who took measurements |
| is_latest | BOOLEAN | DEFAULT true | Latest record for this profile |
| notes | TEXT | NULLABLE | Any notes for this record |
| photo_reference | VARCHAR(255) | NULLABLE | Measurement photo/sketch path |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `profile_id, is_latest`
- `profile_id, measured_date`

---

#### Table 13: `measurement_values`
Individual measurement values (flexible key-value structure)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| record_id | BIGINT | FK, NOT NULL, INDEX | Link to measurement_records |
| measurement_type_id | BIGINT | FK, NOT NULL | Link to measurement_types master |
| value | DECIMAL(6,2) | NOT NULL | The measurement value |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `record_id, measurement_type_id` (UNIQUE)

---

#### Table 14: `measurement_types`
Master list of measurement types (configurable per tenant)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Bust, Waist, Hip, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | |
| name_hindi | VARCHAR(100) | NULLABLE | |
| category | ENUM | 'upper_body', 'lower_body', 'general' | Grouping |
| display_order | INT | DEFAULT 0 | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)
- `tenant_id, category, display_order`

**Default Seed Data:**

*Upper Body:* Bust, Waist, Hip, Shoulder, Arm Length, Arm Hole, Upper Arm, Wrist, Front Neck Depth, Back Neck Depth, Blouse Length

*Lower Body:* Waist, Hip, Length, Inseam, Thigh, Knee, Ankle

*General:* Height, Weight

---

#### Table 15: `tenant_measurement_settings`
Tenant-level measurement configuration

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, UNIQUE, NOT NULL | |
| measurement_unit | ENUM | 'inches', 'cm' | Default unit |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

---

### Order Configuration Layer

#### Table 16: `order_statuses`
Tenant-customizable order statuses

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Draft, Confirmed, In Progress, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | |
| name_hindi | VARCHAR(100) | NULLABLE | |
| color_code | VARCHAR(7) | NULLABLE | Hex color for UI (e.g., #FF5733) |
| is_initial | BOOLEAN | DEFAULT false | Starting status for new orders |
| is_final | BOOLEAN | DEFAULT false | Marks order as completed |
| display_order | INT | DEFAULT 0 | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)
- `tenant_id, is_initial`
- `tenant_id, is_final`

**Default Seed Data:**
1. Draft (is_initial: true)
2. Confirmed
3. In Progress
4. On Hold
5. Completed (is_final: true)
6. Cancelled (is_final: true)

---

#### Table 17: `order_priorities`
Tenant-customizable priority levels

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Normal, Urgent, VIP Express, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | |
| name_hindi | VARCHAR(100) | NULLABLE | |
| color_code | VARCHAR(7) | NULLABLE | Hex color for UI |
| surcharge_percentage | DECIMAL(5,2) | DEFAULT 0.00 | Extra charge % for rush orders |
| is_default | BOOLEAN | DEFAULT false | Default priority for new orders |
| display_order | INT | DEFAULT 0 | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)
- `tenant_id, is_default`

**Default Seed Data:**
1. Normal (is_default: true, surcharge: 0%)
2. Urgent (surcharge: 10%)
3. Rush/Express (surcharge: 25%)

---

#### Table 18: `order_number_sequences`
Tenant-customizable order number patterns

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, UNIQUE, NOT NULL | |
| prefix | VARCHAR(20) | DEFAULT 'ORD' | e.g., ORD, NA (Naari Arts) |
| include_fy | BOOLEAN | DEFAULT true | Include financial year (2024-25) |
| separator | VARCHAR(5) | DEFAULT '/' | ORD/2024-25/0001 |
| padding_length | TINYINT | DEFAULT 4 | 0001, 00001, etc. |
| current_sequence | INT | DEFAULT 0 | Last used number |
| reset_yearly | BOOLEAN | DEFAULT true | Reset sequence each FY |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Example patterns:**
- `ORD/2024-25/0001` (prefix + FY + sequence)
- `NA-0001` (prefix + sequence, no FY)
- `2024-25/ORD/0001` (custom arrangement)

---

### Order Management Layer

#### Table 19: `orders`
Main order header

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| order_number | VARCHAR(50) | NOT NULL, INDEX | Auto-generated based on sequence |
| customer_id | BIGINT | FK, NOT NULL, INDEX | |
| inquiry_id | BIGINT | FK, NULLABLE | If converted from inquiry |
| measurement_record_id | BIGINT | FK, NULLABLE | Selected measurement for this order |
| status_id | BIGINT | FK, NOT NULL | Link to order_statuses |
| priority_id | BIGINT | FK, NOT NULL | Link to order_priorities |
| occasion_id | BIGINT | FK, NULLABLE | Link to occasions |
| order_date | DATE | NOT NULL | Date order was placed |
| expected_delivery_date | DATE | NULLABLE | Promised delivery date |
| actual_delivery_date | DATE | NULLABLE | When actually delivered |
| source | VARCHAR(100) | NULLABLE | Reference/how they came |
| delivery_address_line1 | VARCHAR(255) | NULLABLE | Delivery street address |
| delivery_address_line2 | VARCHAR(255) | NULLABLE | Apartment/Suite |
| delivery_city | VARCHAR(100) | NULLABLE | |
| delivery_state | VARCHAR(100) | NULLABLE | |
| delivery_pincode | VARCHAR(10) | NULLABLE | |
| use_customer_address | BOOLEAN | DEFAULT true | If true, use customer's address |
| notes | TEXT | NULLABLE | Order-level comments |
| created_by | BIGINT | FK, NULLABLE | Staff who created |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, order_number` (UNIQUE)
- `tenant_id, customer_id`
- `tenant_id, status_id`
- `tenant_id, expected_delivery_date`
- `tenant_id, order_date`

**Logic:**
- On create → Generate order_number using `order_number_sequences`
- If `use_customer_address = true` → Copy customer address to delivery fields
- `measurement_record_id` links to specific measurement snapshot for this order

---

#### Table 20: `order_items`
Individual items within an order (Gown, Kurti, etc.)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_id | BIGINT | FK, NOT NULL, INDEX | Link to orders |
| item_type_id | BIGINT | FK, NOT NULL | Link to item_types (Gown, Kurti) |
| quantity | INT | DEFAULT 1 | Number of this item |
| description | TEXT | NULLABLE | Item-specific notes |
| design_reference_photo | VARCHAR(255) | NULLABLE | Pattern/design reference image |
| estimated_days | INT | NULLABLE | Days to complete this item |
| estimated_hours | DECIMAL(6,2) | NULLABLE | Hours estimate |
| item_base_price | DECIMAL(12,2) | DEFAULT 0.00 | Base stitching/making price |
| display_order | INT | DEFAULT 0 | Order of items in list |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_id, item_type_id`
- `order_id, display_order`

---

#### Table 21: `item_fabrics`
Fabric details for each order item

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_item_id | BIGINT | FK, NOT NULL, INDEX | Link to order_items |
| fabric_name | VARCHAR(255) | NULLABLE | Preferred fabric name |
| meters_required | DECIMAL(6,2) | NULLABLE | Approximate meters |
| panno | VARCHAR(255) | NULLABLE | Pattern/design reference |
| color | VARCHAR(100) | NULLABLE | |
| suggested_stores | TEXT | NULLABLE | Where to source fabric |
| days_for_purchase | INT | NULLABLE | Days needed for purchase |
| price_per_meter | DECIMAL(10,2) | NULLABLE | Cost per meter |
| total_fabric_cost | DECIMAL(12,2) | NULLABLE | Auto-calculated |
| photo_reference | VARCHAR(255) | NULLABLE | Fabric reference image |
| comments | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_item_id` (UNIQUE - one fabric record per item)

---

#### Table 22: `item_embellishments`
Embellishment/work details for each order item (can have multiple work types)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_item_id | BIGINT | FK, NOT NULL, INDEX | Link to order_items |
| work_type_id | BIGINT | FK, NOT NULL | Link to work_types (Jardoshi, Moti) |
| worker_id | BIGINT | FK, NULLABLE | Assigned worker |
| days_required | INT | NULLABLE | |
| hours_required | DECIMAL(6,2) | NULLABLE | |
| work_price | DECIMAL(12,2) | DEFAULT 0.00 | Cost for this work |
| photo_reference | VARCHAR(255) | NULLABLE | Work reference image |
| comments | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_item_id, work_type_id`
- `worker_id`

---

#### Table 23: `item_embellishment_zones`
Which zones the embellishment work applies to

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| item_embellishment_id | BIGINT | FK, NOT NULL, INDEX | Link to item_embellishments |
| embellishment_zone_id | BIGINT | FK, NOT NULL | Link to embellishment_zones |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `item_embellishment_id, embellishment_zone_id` (UNIQUE)

---

#### Table 24: `item_stitching_specs`
Stitching specifications for each order item

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_item_id | BIGINT | FK, NOT NULL, INDEX | Link to order_items |
| pad_required | BOOLEAN | DEFAULT false | |
| pad_size | VARCHAR(50) | NULLABLE | If pad required |
| pad_pattern | VARCHAR(100) | NULLABLE | |
| cancan_required | BOOLEAN | DEFAULT false | |
| front_neck_pattern | VARCHAR(100) | NULLABLE | |
| front_neck_length | DECIMAL(6,2) | NULLABLE | |
| back_neck_pattern | VARCHAR(100) | NULLABLE | |
| back_neck_length | DECIMAL(6,2) | NULLABLE | |
| collar_comments | TEXT | NULLABLE | |
| sleeve_comments | TEXT | NULLABLE | |
| belt_comments | TEXT | NULLABLE | |
| gher_comments | TEXT | NULLABLE | Flare comments |
| general_comments | TEXT | NULLABLE | |
| days_to_complete | INT | NULLABLE | |
| hours_to_complete | DECIMAL(6,2) | NULLABLE | |
| stitcher_id | BIGINT | FK, NULLABLE | Assigned stitcher |
| stitching_price | DECIMAL(12,2) | DEFAULT 0.00 | |
| photo_reference | VARCHAR(255) | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_item_id` (UNIQUE - one stitching record per item)
- `stitcher_id`

---

#### Table 25: `item_additional_works`
Additional work like tassels, custom requirements

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_item_id | BIGINT | FK, NOT NULL, INDEX | Link to order_items |
| description | TEXT | NOT NULL | Free text (Tassels, etc.) |
| price | DECIMAL(12,2) | DEFAULT 0.00 | |
| comments | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_item_id`

---

### Worker Management Layer

#### Table 26: `workers`
Worker/artisan master - external workers who do embellishment, stitching work

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Worker name |
| mobile | VARCHAR(15) | NOT NULL, INDEX | Primary contact |
| alternate_mobile | VARCHAR(15) | NULLABLE | Secondary contact |
| address | TEXT | NULLABLE | Worker address |
| city | VARCHAR(100) | NULLABLE | |
| pincode | VARCHAR(10) | NULLABLE | |
| rate_type | ENUM | 'per_piece', 'per_hour', 'per_day', 'fixed' | How they charge |
| default_rate | DECIMAL(10,2) | NULLABLE | Default rate amount |
| bank_account_name | VARCHAR(100) | NULLABLE | For payments |
| bank_account_number | VARCHAR(20) | NULLABLE | |
| bank_ifsc | VARCHAR(11) | NULLABLE | |
| upi_id | VARCHAR(100) | NULLABLE | UPI for quick payments |
| is_active | BOOLEAN | DEFAULT true | |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, mobile` (UNIQUE)
- `tenant_id, name`
- `tenant_id, is_active`

---

#### Table 27: `worker_skills`
Maps workers to work types they can perform

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| worker_id | BIGINT | FK, NOT NULL, INDEX | Link to workers |
| work_type_id | BIGINT | FK, NOT NULL | Link to work_types |
| skill_level | ENUM | 'beginner', 'intermediate', 'expert' | Proficiency level |
| rate_for_skill | DECIMAL(10,2) | NULLABLE | Custom rate for this skill (overrides default) |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `worker_id, work_type_id` (UNIQUE)
- `work_type_id, skill_level`

**Logic:**
- When assigning worker_id → Filter workers by work_type_id from worker_skills
- Use rate_for_skill if set, otherwise use worker's default_rate

---

### Cost Estimation Layer

#### Table 28: `item_cost_estimates`
Cost estimation per order item (Owner access only)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_item_id | BIGINT | FK, NOT NULL, UNIQUE | Link to order_items |
| fabric_name | VARCHAR(255) | NULLABLE | Auto-populated from item_fabrics |
| fabric_meters | DECIMAL(6,2) | NULLABLE | Auto-populated |
| price_per_meter | DECIMAL(10,2) | NULLABLE | Input by owner |
| total_fabric_cost | DECIMAL(12,2) | NULLABLE | Auto: meters × price |
| work_total_cost | DECIMAL(12,2) | DEFAULT 0.00 | Sum from item_embellishments |
| work_total_days | INT | NULLABLE | Sum of embellishment days |
| work_total_hours | DECIMAL(6,2) | NULLABLE | Sum of embellishment hours |
| item_type_price | DECIMAL(12,2) | DEFAULT 0.00 | Price for Kurti/Gown/etc. |
| master_name | VARCHAR(100) | NULLABLE | Master tailor/designer |
| stitcher_name | VARCHAR(100) | NULLABLE | Auto from item_stitching_specs or manual |
| stitching_cost | DECIMAL(12,2) | DEFAULT 0.00 | Stitching price |
| stitching_days | INT | NULLABLE | |
| stitching_hours | DECIMAL(6,2) | NULLABLE | |
| other_work_cost | DECIMAL(12,2) | DEFAULT 0.00 | Sum from item_additional_works |
| staff_expense | DECIMAL(12,2) | DEFAULT 0.00 | |
| packing_charges | DECIMAL(12,2) | DEFAULT 0.00 | |
| total_cost | DECIMAL(12,2) | DEFAULT 0.00 | Auto: fabric + work + stitching + other + staff + packing |
| total_days | INT | NULLABLE | Auto: fabric_purchase + work + stitching days |
| calculated_delivery_date | DATE | NULLABLE | Auto: order_date + total_days |
| profit_margin | DECIMAL(12,2) | NULLABLE | Selling price - total_cost |
| notes | TEXT | NULLABLE | Owner notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_item_id` (UNIQUE)

**Logic:**
```
Auto-calculations:
- total_fabric_cost = fabric_meters × price_per_meter
- total_cost = total_fabric_cost + work_total_cost + stitching_cost + other_work_cost + staff_expense + packing_charges
- total_days = fabric_purchase_days + work_total_days + stitching_days
- calculated_delivery_date = order_date + total_days
```

**Access Control:**
- Only users with `owner` role can view/edit this table

---

### Invoicing Layer

#### Table 29: `invoice_number_sequences`
Separate sequences for GST and Non-GST invoices

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| invoice_type | ENUM | 'gst', 'non_gst' | Type of invoice |
| prefix | VARCHAR(20) | NOT NULL | GST, INV, etc. |
| include_fy | BOOLEAN | DEFAULT true | Include financial year |
| separator | VARCHAR(5) | DEFAULT '/' | |
| padding_length | TINYINT | DEFAULT 4 | |
| current_sequence | INT | DEFAULT 0 | |
| reset_yearly | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, invoice_type` (UNIQUE)

---

#### Table 30: `invoices`
GST and Non-GST invoices linked to orders

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| order_id | BIGINT | FK, NOT NULL, INDEX | Link to orders |
| invoice_number | VARCHAR(50) | NOT NULL, INDEX | Auto-generated |
| invoice_type | ENUM | 'gst', 'non_gst' | Type of invoice |
| invoice_date | DATE | NOT NULL | |
| customer_id | BIGINT | FK, NOT NULL | |
| customer_name | VARCHAR(100) | NOT NULL | Snapshot at invoice time |
| customer_address | TEXT | NULLABLE | |
| customer_gst_number | VARCHAR(15) | NULLABLE | For GST invoices |
| billing_address | TEXT | NULLABLE | |
| shipping_address | TEXT | NULLABLE | |
| subtotal | DECIMAL(12,2) | NOT NULL | Before tax |
| cgst_rate | DECIMAL(5,2) | DEFAULT 0.00 | Central GST % |
| cgst_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| sgst_rate | DECIMAL(5,2) | DEFAULT 0.00 | State GST % |
| sgst_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| igst_rate | DECIMAL(5,2) | DEFAULT 0.00 | Interstate GST % |
| igst_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| hidden_gst_amount | DECIMAL(12,2) | DEFAULT 0.00 | Hidden GST for non-GST invoices |
| total_tax | DECIMAL(12,2) | DEFAULT 0.00 | Sum of all taxes |
| grand_total | DECIMAL(12,2) | NOT NULL | Subtotal + tax |
| amount_in_words | VARCHAR(255) | NULLABLE | |
| status | ENUM | 'draft', 'issued', 'paid', 'partially_paid', 'cancelled' | |
| notes | TEXT | NULLABLE | |
| eway_bill_number | VARCHAR(20) | NULLABLE | E-way bill if applicable |
| eway_bill_date | DATE | NULLABLE | |
| created_by | BIGINT | FK, NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, invoice_number` (UNIQUE)
- `tenant_id, order_id`
- `tenant_id, invoice_type`
- `tenant_id, invoice_date`
- `tenant_id, status`

**Logic:**
```
On Create:
1. Generate invoice_number using invoice_number_sequences (based on invoice_type)
2. Snapshot customer details (name, address, GST number)
3. Determine GST type:
   - IF tenant.state_code = customer.state_code → Intra-state (CGST + SGST)
   - ELSE → Inter-state (IGST)
4. For non-GST invoices:
   - IF tenant_settings.hidden_gst_percentage > 0
   - Calculate hidden_gst_amount = subtotal × hidden_gst_percentage / 100

E-way Bill:
- IF invoice_type = 'gst' AND grand_total > 50000 AND is_interstate
- THEN eway_bill_number is REQUIRED

Tax Calculations:
- For intra-state: CGST = SGST = (GST rate / 2)
- For inter-state: IGST = GST rate
- total_tax = cgst_amount + sgst_amount + igst_amount
- grand_total = subtotal + total_tax
```

---

#### Table 31: `invoice_items`
Line items in an invoice

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| invoice_id | BIGINT | FK, NOT NULL, INDEX | Link to invoices |
| order_item_id | BIGINT | FK, NULLABLE | Link to order_items if applicable |
| description | VARCHAR(255) | NOT NULL | Item description |
| hsn_code | VARCHAR(8) | NULLABLE | HSN/SAC code |
| quantity | INT | DEFAULT 1 | |
| unit_price | DECIMAL(12,2) | NOT NULL | Price per unit |
| discount_percent | DECIMAL(5,2) | DEFAULT 0.00 | |
| discount_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| taxable_amount | DECIMAL(12,2) | NOT NULL | After discount |
| gst_rate | DECIMAL(5,2) | DEFAULT 0.00 | GST % for this item |
| cgst_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| sgst_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| igst_amount | DECIMAL(12,2) | DEFAULT 0.00 | |
| total_amount | DECIMAL(12,2) | NOT NULL | Taxable + tax |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `invoice_id`
- `order_item_id`

---

### Payment Layer

#### Table 32: `payments`
Payment records for orders/invoices

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| order_id | BIGINT | FK, NOT NULL, INDEX | Link to orders |
| invoice_id | BIGINT | FK, NULLABLE, INDEX | Link to invoices (if invoice issued) |
| payment_type | ENUM | 'advance', 'partial', 'final', 'refund' | Type of payment |
| payment_mode | ENUM | 'cash', 'upi', 'card', 'bank_transfer', 'cheque' | How payment was made |
| amount | DECIMAL(12,2) | NOT NULL | Payment amount |
| payment_date | DATE | NOT NULL | |
| reference_number | VARCHAR(100) | NULLABLE | UPI ref, cheque no, transaction ID |
| bank_name | VARCHAR(100) | NULLABLE | For cheque/bank transfer |
| received_by | BIGINT | FK, NULLABLE | Staff who received |
| is_gst_payment | BOOLEAN | DEFAULT false | Payment towards GST invoice |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, order_id`
- `tenant_id, invoice_id`
- `tenant_id, payment_date`
- `tenant_id, payment_type`

**Logic:**
```
On Insert/Update/Delete:
1. Recalculate order_payment_summary for the order_id
2. Update payment_status based on total_paid vs total_order_value
3. Update last_payment_date = MAX(payment_date)
```

---

#### Table 33: `order_payment_summary`
Aggregated payment status per order (for quick lookups)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_id | BIGINT | FK, NOT NULL, UNIQUE | Link to orders |
| total_order_value | DECIMAL(12,2) | DEFAULT 0.00 | Total order amount |
| total_gst_invoiced | DECIMAL(12,2) | DEFAULT 0.00 | GST invoice total |
| total_non_gst_invoiced | DECIMAL(12,2) | DEFAULT 0.00 | Non-GST invoice total |
| total_advance_received | DECIMAL(12,2) | DEFAULT 0.00 | |
| total_paid | DECIMAL(12,2) | DEFAULT 0.00 | Sum of all payments |
| balance_due | DECIMAL(12,2) | DEFAULT 0.00 | Auto: total - paid |
| payment_status | ENUM | 'pending', 'advance_received', 'partially_paid', 'paid', 'overpaid' | |
| last_payment_date | DATE | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_id` (UNIQUE)
- `payment_status`

**Logic:**
```
Auto-updated when payments are added/modified:
- balance_due = total_order_value - total_paid
- Ughrani (pending amount) = balance_due
```

---

### Workflow Management Layer

#### Table 34: `workflow_stages`
Master list of workflow stages (tenant-customizable)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(100) | NOT NULL | Advance Received, Fabric Purchase, etc. |
| name_gujarati | VARCHAR(100) | NULLABLE | |
| name_hindi | VARCHAR(100) | NULLABLE | |
| stage_order | INT | NOT NULL | Sequential order (1, 2, 3...) |
| is_mandatory | BOOLEAN | DEFAULT true | Must complete before next |
| can_skip | BOOLEAN | DEFAULT false | Can skip this stage |
| requires_photo | BOOLEAN | DEFAULT false | Photo upload required |
| requires_payment | BOOLEAN | DEFAULT false | Payment required at this stage |
| color_code | VARCHAR(7) | NULLABLE | For Kanban view |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)
- `tenant_id, stage_order`

**Default Seed Data (21 stages):**
1. Advance Received (requires_payment: true)
2. Fabric Purchase
3. Fabric Dyeing
4. Fabric Fusing
5. Work Khakha (Pattern marking)
6. Work Ferma (Work distribution)
7. Given on Work
8. Check Work Sample (requires_photo: true)
9. Work Complete as Per Order
10. Complete Work
11. Stitching
12. Stitched as Per Order
13. Complete Stitched
14. Other Works
15. Other Work Checked
16. Other Work Done
17. Inform Customer
18. Ready for Delivery
19. Customer Checked (Fitting/Repair)
20. Full Payment Received (requires_payment: true)
21. Completed

---

#### Table 35: `order_workflow_tasks`
Track workflow progress for each order

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_id | BIGINT | FK, NOT NULL, INDEX | Link to orders |
| workflow_stage_id | BIGINT | FK, NOT NULL | Link to workflow_stages |
| status | ENUM | 'pending', 'in_progress', 'completed', 'skipped' | Task status |
| assigned_to | BIGINT | FK, NULLABLE | Staff assigned to this task |
| started_at | TIMESTAMP | NULLABLE | When task started |
| completed_at | TIMESTAMP | NULLABLE | When task completed |
| completed_by | BIGINT | FK, NULLABLE | Staff who completed |
| due_date | DATE | NULLABLE | Expected completion |
| notes | TEXT | NULLABLE | Task-specific notes |
| photo_reference | VARCHAR(255) | NULLABLE | Photo if required |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `order_id, workflow_stage_id` (UNIQUE)
- `order_id, status`
- `assigned_to, status`
- `due_date`

**Logic:**
```
Sequential Workflow:
- On order confirmation → Create all workflow tasks with status = 'pending'
- Task can only move to 'in_progress' if previous task is 'completed' or 'skipped'
- If workflow_stages.is_mandatory = true AND previous task not completed → Block progress
- If workflow_stages.can_skip = true → Allow marking as 'skipped'

Task Assignment:
- Staff can be assigned to specific tasks (assigned_to)
- One staff can handle multiple tasks on different orders
- Staff can only see tasks assigned to them (role-based)

Status Updates:
- When status changes to 'in_progress' → Set started_at = NOW()
- When status changes to 'completed' → Set completed_at = NOW(), completed_by = current_user
- If workflow_stages.requires_photo = true → photo_reference is REQUIRED before completing
```

---

#### Table 36: `workflow_task_comments`
Comments/updates on workflow tasks

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| order_workflow_task_id | BIGINT | FK, NOT NULL, INDEX | Link to order_workflow_tasks |
| comment | TEXT | NOT NULL | |
| commented_by | BIGINT | FK, NOT NULL | Staff who commented |
| attachment | VARCHAR(255) | NULLABLE | Optional file attachment |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `order_workflow_task_id`
- `commented_by`

---

### User Management Layer

#### Table 37: `roles`
System roles for access control

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| name | VARCHAR(50) | NOT NULL | Owner, Manager, Staff |
| description | TEXT | NULLABLE | Role description |
| is_system_role | BOOLEAN | DEFAULT false | System-defined, cannot delete |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, name` (UNIQUE)

**Default Seed Data:**
1. Owner (is_system_role: true)
2. Manager (is_system_role: true)
3. Staff (is_system_role: true)

---

#### Table 38: `permissions`
Granular permissions for the system

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| module | VARCHAR(50) | NOT NULL | customers, orders, invoices, etc. |
| action | VARCHAR(50) | NOT NULL | view, create, edit, delete |
| description | VARCHAR(255) | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `module, action` (UNIQUE)

**Default Permissions:**
- customers: view, create, edit, delete
- orders: view, create, edit, delete
- invoices: view, create, edit, delete
- payments: view, create, edit, delete
- cost_estimation: view, edit (Owner only)
- workflow: view, update
- reports: view
- settings: view, edit

---

#### Table 39: `role_permissions`
Maps roles to permissions

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| role_id | BIGINT | FK, NOT NULL | Link to roles |
| permission_id | BIGINT | FK, NOT NULL | Link to permissions |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `role_id, permission_id` (UNIQUE)

**Default Role-Permission Mapping:**

| Permission | Owner | Manager | Staff |
|------------|-------|---------|-------|
| customers.view | ✅ | ✅ | ❌ |
| customers.create | ✅ | ✅ | ❌ |
| customers.edit | ✅ | ✅ | ❌ |
| orders.view | ✅ | ✅ | ✅ (assigned only) |
| orders.create | ✅ | ✅ | ❌ |
| orders.edit | ✅ | ✅ | ❌ |
| cost_estimation.view | ✅ | ❌ | ❌ |
| cost_estimation.edit | ✅ | ❌ | ❌ |
| payments.view | ✅ | ✅ | ❌ |
| payments.create | ✅ | ✅ | ❌ |
| invoices.view | ✅ | ✅ | ❌ |
| workflow.view | ✅ | ✅ | ✅ |
| workflow.update | ✅ | ✅ | ✅ |
| settings.edit | ✅ | ❌ | ❌ |

---

#### Table 40: `users`
System users (staff who login)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| role_id | BIGINT | FK, NOT NULL | Link to roles |
| name | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(100) | NOT NULL, INDEX | Login email |
| mobile | VARCHAR(15) | NULLABLE | |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| avatar | VARCHAR(255) | NULLABLE | Profile picture |
| preferred_language | ENUM | 'hindi', 'gujarati', 'english' | UI language |
| is_active | BOOLEAN | DEFAULT true | |
| email_verified_at | TIMESTAMP | NULLABLE | |
| last_login_at | TIMESTAMP | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Indexes:**
- `tenant_id, email` (UNIQUE)
- `tenant_id, role_id`
- `tenant_id, is_active`

**Logic:**
```
Authentication:
- Email + Password login
- Password must be hashed (bcrypt/argon2)
- Track last_login_at on successful login

Authorization:
- User's permissions = role_permissions for their role_id
- Staff can only see orders/tasks assigned to them
- Owner can see everything
```

---

#### Table 41: `user_sessions`
Track active user sessions (for security)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| user_id | BIGINT | FK, NOT NULL, INDEX | |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Session/JWT token |
| ip_address | VARCHAR(45) | NULLABLE | |
| user_agent | TEXT | NULLABLE | Browser info |
| expires_at | TIMESTAMP | NOT NULL | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `user_id`
- `token` (UNIQUE)
- `expires_at`

---

#### Table 42: `audit_logs`
Track all changes for audit trail

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| tenant_id | BIGINT | FK, NOT NULL, INDEX | |
| user_id | BIGINT | FK, NULLABLE | Who made the change |
| action | VARCHAR(50) | NOT NULL | create, update, delete |
| table_name | VARCHAR(100) | NOT NULL | Which table |
| record_id | BIGINT | NOT NULL | Which record |
| old_values | JSON | NULLABLE | Previous values |
| new_values | JSON | NULLABLE | New values |
| ip_address | VARCHAR(45) | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `tenant_id, table_name, record_id`
- `tenant_id, user_id`
- `tenant_id, created_at`

---

## User Roles

| Role | Access |
|------|--------|
| **Owner** | Full system access, cost estimation, payment details, customer contacts, system configuration |
| **Manager** | View/Edit orders and workflow, limited cost estimation, view customer details, manage staff assignments |
| **Staff** | View assigned tasks only, update task status, cannot see customer contacts, payments, or costs |

---

## Order Workflow Stages

1. Advance Received
2. Fabric Purchase
3. Fabric Dyeing
4. Fabric Fusing
5. Work Khakha (Pattern marking)
6. Work Ferma (Work distribution)
7. Given on Work (Sent to worker)
8. Check Work Sample
9. Work Complete as Per Order
10. Complete Work
11. Stitching
12. Stitched as Per Order
13. Complete Stitched
14. Other Works
15. Other Work Checked
16. Other Work Done
17. Inform Customer
18. Ready for Delivery
19. Customer Checked (Fitting/Repair if needed)
20. Full Payment Received / Ughrani (Pending amount)
21. Completed

---

## Technical Stack

### Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│                                                             │
│  ┌──────────────────┐      ┌──────────────────────────┐     │
│  │  Flutter App      │      │  React Web Panel          │    │
│  │  (Android + iOS)  │      │  (Admin/Owner/Manager)    │    │
│  │  - Staff tasks    │      │  - Full admin dashboard   │    │
│  │  - Order tracking │      │  - Reports & analytics    │    │
│  │  - Photo capture  │      │  - Cost estimation        │    │
│  │  - Measurements   │      │  - Invoice management     │    │
│  │  - Notifications  │      │  - Settings/config        │    │
│  └────────┬─────────┘      └────────────┬───────────────┘   │
│           │                              │                   │
└───────────┼──────────────────────────────┼───────────────────┘
            │         HTTPS/REST           │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Laravel 11 (PHP 8.3+)                   │   │
│  │  - RESTful API (JSON responses)                      │   │
│  │  - Laravel Sanctum (API token auth)                  │   │
│  │  - Spatie Laravel Permission (RBAC)                  │   │
│  │  - Laravel Queues (background jobs)                  │   │
│  │  - Laravel Notifications (multi-channel)             │   │
│  │  - Laravel Storage (file/photo uploads)              │   │
│  │  - Laravel Events (workflow triggers)                │   │
│  └────────────────────────┬─────────────────────────────┘   │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA & SERVICES LAYER                     │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  MySQL 8.0  │  │  Redis     │  │  Firebase Cloud    │    │
│  │  (Primary)  │  │  (Cache +  │  │  Messaging (FCM)   │    │
│  │             │  │   Queues)  │  │  (Push Notifs)     │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  S3/Spaces  │  │  WhatsApp  │  │  SMS Gateway       │    │
│  │  (File      │  │  Business  │  │  (MSG91/Twilio)    │    │
│  │   Storage)  │  │  API       │  │                    │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 1. Mobile App — Flutter (Android + iOS)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Flutter 3.x (Dart) | Single codebase for Android + iOS |
| **State Management** | Riverpod 2.x | Scalable, testable state management |
| **API Client** | Dio | HTTP client with interceptors, token refresh |
| **Local Storage** | Hive / SharedPreferences | Offline data, auth tokens, draft orders |
| **Image Handling** | image_picker + image_cropper | Camera capture for measurements, fabric, work samples |
| **Image Compression** | flutter_image_compress | Reduce upload size (photos from shop floor) |
| **Push Notifications** | firebase_messaging (FCM) | Workflow stage updates, payment reminders |
| **PDF Viewer** | flutter_pdfview | View invoices, order sheets |
| **Localization** | flutter_localizations + intl | Hindi, Gujarati, English |
| **Navigation** | go_router | Declarative routing with deep links |
| **Forms** | flutter_form_builder | Complex order forms, measurements |
| **Offline Sync** | Custom queue + connectivity_plus | Queue actions when offline, sync when online |

**Flutter App Scope by Role:**

| Feature | Owner | Manager | Staff |
|---------|-------|---------|-------|
| Dashboard overview | ✅ | ✅ | ❌ |
| Customer management | ✅ | ✅ | ❌ |
| Order creation/edit | ✅ | ✅ | ❌ |
| Measurement capture | ✅ | ✅ | ✅ |
| Photo capture (work/fabric) | ✅ | ✅ | ✅ |
| Workflow task updates | ✅ | ✅ | ✅ (assigned only) |
| Cost estimation | ✅ | ❌ | ❌ |
| Payment recording | ✅ | ✅ | ❌ |
| Push notifications | ✅ | ✅ | ✅ |

---

### 2. Web Admin Panel — React

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18+ (Vite) | Fast dev server, optimized builds |
| **UI Library** | Shadcn/UI + Tailwind CSS | Modern, accessible components |
| **State Management** | TanStack Query (React Query) | Server state, caching, auto-refetch |
| **Routing** | React Router v6 | SPA routing with role guards |
| **Forms** | React Hook Form + Zod | Validation for order forms, measurements |
| **Data Tables** | TanStack Table | Sortable, filterable order/customer lists |
| **Charts/Reports** | Recharts | Revenue charts, workflow analytics |
| **Drag & Drop** | dnd-kit | Kanban board for workflow stages |
| **PDF Generation** | react-pdf | Invoice/order sheet generation |
| **Localization** | i18next | Hindi, Gujarati, English |
| **Auth** | Axios + interceptors | Token-based auth with Sanctum |
| **Date Handling** | day.js | Lightweight, locale-aware (Indian formats) |

**Web Panel Scope (primarily Owner + Manager):**

| Module | Description |
|--------|-------------|
| **Dashboard** | Order stats, revenue summary, pending tasks, delivery calendar |
| **Customers** | Customer CRUD, inquiry management, measurement history |
| **Orders** | Full order management, item configuration, fabric/embellishment details |
| **Workflow Board** | Kanban-style drag-and-drop for 21 workflow stages |
| **Cost Estimation** | Owner-only costing sheet with auto-calculations |
| **Invoicing** | GST/Non-GST invoice generation, split invoicing |
| **Payments** | Payment recording, Ughrani (pending) tracking |
| **Workers** | Worker management, skill mapping, assignment |
| **Reports** | Revenue, GST, worker performance, delivery tracking |
| **Settings** | Tenant config, master data, user management, workflow customization |

---

### 3. Backend API — Laravel 11

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Laravel 11 (PHP 8.3+) | RESTful API backend |
| **Authentication** | Laravel Sanctum | API token auth for Flutter + SPA auth for React |
| **Authorization** | Spatie Laravel-Permission | Role-based + permission-based access |
| **Multi-Tenancy** | stancl/tenancy OR custom tenant_id scoping | Data isolation per tenant |
| **API Resources** | Laravel API Resources | Consistent JSON response formatting |
| **Validation** | Laravel Form Requests | Input validation with custom rules |
| **File Storage** | Laravel Storage (S3/DigitalOcean Spaces) | Photos, invoices, attachments |
| **Image Processing** | Intervention Image v3 | Resize, compress uploaded photos |
| **Queue/Jobs** | Laravel Queues (Redis driver) | Email, SMS, WhatsApp, PDF generation |
| **Notifications** | Laravel Notifications | Multi-channel (FCM, SMS, WhatsApp, Email) |
| **Events** | Laravel Events + Listeners | Workflow triggers, audit logging |
| **Scheduler** | Laravel Task Scheduling | Payment reminders, delivery alerts |
| **PDF Generation** | DomPDF / Laravel Snappy | Invoice PDF, order sheets |
| **Excel Export** | Laravel Excel (Maatwebsite) | Reports export |
| **Audit Trail** | owen-it/laravel-auditing | Automatic audit_logs population |
| **API Docs** | Scribe (knuckleswtf/scribe) | Auto-generated API documentation |

**API Structure:**

```
api/v1/
├── auth/
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   └── GET    /me
│
├── customers/
│   ├── GET    /                    (list with filters)
│   ├── POST   /                    (create)
│   ├── GET    /{id}                (detail)
│   ├── PUT    /{id}                (update)
│   └── GET    /{id}/orders         (customer orders)
│
├── inquiries/
│   ├── GET    /                    (list with filters)
│   ├── POST   /                    (create — public form)
│   ├── PUT    /{id}                (update status)
│   └── POST   /{id}/convert        (convert to order)
│
├── orders/
│   ├── GET    /                    (list with filters)
│   ├── POST   /                    (create)
│   ├── GET    /{id}                (full detail with items)
│   ├── PUT    /{id}                (update)
│   ├── GET    /{id}/workflow        (workflow status)
│   ├── GET    /{id}/payments        (payment history)
│   └── GET    /{id}/invoices        (linked invoices)
│
├── order-items/
│   ├── POST   /                    (add item to order)
│   ├── PUT    /{id}                (update item)
│   ├── PUT    /{id}/fabrics         (update fabric details)
│   ├── PUT    /{id}/embellishments  (update embellishment details)
│   ├── PUT    /{id}/stitching       (update stitching specs)
│   └── PUT    /{id}/cost-estimate   (owner only)
│
├── measurements/
│   ├── GET    /profiles/{customerId}  (customer profiles)
│   ├── POST   /profiles               (create profile)
│   ├── POST   /records                (add measurement record)
│   └── GET    /records/{id}           (measurement detail)
│
├── workflow/
│   ├── GET    /tasks                   (my tasks — role filtered)
│   ├── PUT    /tasks/{id}/status       (update task status)
│   ├── POST   /tasks/{id}/comments     (add comment)
│   └── GET    /board                   (kanban board data)
│
├── invoices/
│   ├── GET    /                    (list)
│   ├── POST   /                    (create GST/Non-GST)
│   ├── GET    /{id}                (detail)
│   ├── GET    /{id}/pdf            (download PDF)
│   └── PUT    /{id}/status         (mark paid/cancelled)
│
├── payments/
│   ├── GET    /                    (list)
│   ├── POST   /                    (record payment)
│   └── GET    /summary/{orderId}   (payment summary)
│
├── workers/
│   ├── GET    /                    (list with skill filters)
│   ├── POST   /                    (create)
│   ├── PUT    /{id}                (update)
│   └── GET    /{id}/skills          (worker skills)
│
├── reports/
│   ├── GET    /revenue              (revenue reports)
│   ├── GET    /gst-summary          (GST filing data)
│   ├── GET    /worker-performance   (worker stats)
│   ├── GET    /delivery-tracker     (upcoming deliveries)
│   └── GET    /export/{type}        (Excel export)
│
├── masters/
│   ├── GET    /item-types
│   ├── GET    /work-types
│   ├── GET    /embellishment-zones
│   ├── GET    /occasions
│   ├── GET    /inquiry-sources
│   ├── GET    /budget-ranges
│   ├── GET    /order-statuses
│   └── GET    /order-priorities
│
└── settings/
    ├── GET    /tenant               (tenant settings)
    ├── PUT    /tenant               (update settings)
    ├── GET    /users                (user management)
    ├── POST   /users                (create user)
    └── PUT    /users/{id}           (update user)
```

---

### 4. Database — MySQL 8.0

| Aspect | Configuration | Purpose |
|--------|--------------|---------|
| **Engine** | InnoDB | Transaction support, row-level locking |
| **Charset** | utf8mb4 | Support for Gujarati, Hindi, emojis |
| **Collation** | utf8mb4_unicode_ci | Proper sorting for multi-language |
| **JSON Support** | Native JSON columns | audit_logs old/new values |
| **Indexing Strategy** | Composite indexes on tenant_id + frequently filtered columns | Multi-tenant query performance |
| **Full-Text Search** | FULLTEXT indexes on customer name, order notes | Search functionality |

**Performance Optimizations:**
- Composite indexes: `tenant_id` as first column in all multi-tenant queries
- Eager loading in Laravel to prevent N+1 queries
- Redis caching for master data (item_types, work_types, etc.) — cache per tenant
- Database read replicas for reporting queries (future scaling)
- Pagination on all list endpoints (default: 20 items/page)

---

### 5. Caching — Redis

| Use Case | TTL | Purpose |
|----------|-----|---------|
| Master data (item_types, work_types, etc.) | 24 hours | Reduce DB hits for dropdowns |
| Tenant settings | 1 hour | Frequently accessed config |
| User permissions | 30 minutes | Role/permission checks |
| Dashboard stats | 5 minutes | Prevent heavy aggregate queries |
| API rate limiting | Per-minute window | Prevent abuse |
| Queue driver | N/A | Background job processing |

---

### 6. File Storage

| Type | Storage | Max Size | Compression |
|------|---------|----------|-------------|
| Fabric photos | S3/Spaces | 5 MB | Resize to 1200px, 80% quality |
| Work sample photos | S3/Spaces | 5 MB | Resize to 1200px, 80% quality |
| Measurement photos | S3/Spaces | 5 MB | Resize to 1200px, 80% quality |
| Design references | S3/Spaces | 10 MB | Resize to 1600px, 85% quality |
| Invoice PDFs | S3/Spaces | Generated | N/A |
| Order sheet PDFs | S3/Spaces | Generated | N/A |

**Photo Upload Flow (Flutter):**
```
Camera/Gallery → Crop → Compress (client-side) → Upload to API →
API validates → Intervention Image resize → Store to S3 → Return URL
```

---

### 7. Notifications Architecture

| Event | FCM (Push) | SMS | WhatsApp | In-App |
|-------|-----------|-----|----------|--------|
| New inquiry received | ✅ Owner/Manager | ❌ | ❌ | ✅ |
| Order confirmed | ✅ Staff assigned | ✅ Customer | ✅ Customer | ✅ |
| Workflow stage change | ✅ Assigned staff | ❌ | ❌ | ✅ |
| Payment received | ✅ Owner | ✅ Customer | ✅ Customer | ✅ |
| Ready for delivery | ✅ Owner/Manager | ✅ Customer | ✅ Customer | ✅ |
| Delivery date reminder | ✅ All assigned | ❌ | ✅ Customer | ✅ |
| Payment overdue | ✅ Owner | ✅ Customer | ✅ Customer | ✅ |

**Notification Providers:**
- **Push:** Firebase Cloud Messaging (FCM) — Flutter + Web
- **SMS:** MSG91 (India-optimized, DLT compliant) or Twilio
- **WhatsApp:** WhatsApp Business API (via Interakt/Wati/official API)
- **Email:** Laravel Mail (SMTP/Mailgun/SES) — for invoices, reports

---

### 8. DevOps & Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Server** | DigitalOcean / AWS Lightsail | Cost-effective for India-based SaaS |
| **Web Server** | Nginx + PHP-FPM | Serve Laravel API |
| **SSL** | Let's Encrypt (Certbot) | HTTPS for API + Web panel |
| **CI/CD** | GitHub Actions | Auto-deploy on push to main |
| **Monitoring** | Laravel Telescope (dev) + Sentry (prod) | Error tracking, performance |
| **Logging** | Laravel Log (daily) + Papertrail | Centralized logging |
| **Backup** | Automated MySQL dumps to S3 | Daily backups with 30-day retention |
| **App Distribution** | Google Play Store + Apple App Store | Flutter app distribution |
| **Web Hosting** | Vercel / Netlify OR same server | React web panel hosting |

---

### 9. Security Measures

| Layer | Measure |
|-------|---------|
| **API** | Laravel Sanctum token auth, HTTPS enforced |
| **RBAC** | Spatie Permission — middleware on every route |
| **Multi-Tenant** | Global scope on all queries (`tenant_id` enforced) |
| **Input** | Laravel Form Request validation on every endpoint |
| **SQL Injection** | Eloquent ORM (parameterized queries) |
| **XSS** | React auto-escapes, API returns JSON only |
| **CSRF** | Sanctum SPA cookie + CSRF token for web |
| **Rate Limiting** | Laravel throttle middleware (60 req/min per user) |
| **File Upload** | MIME validation, size limits, virus scan (optional) |
| **Passwords** | bcrypt hashing (default Laravel) |
| **Sensitive Data** | Cost estimation restricted to owner role at API level |
| **Audit Trail** | All CUD operations logged to audit_logs |
| **Session** | Token expiry (24h mobile, 8h web), revoke on logout |

---

### 10. Multi-Language Support

| Language | Code | Usage |
|----------|------|-------|
| English | `en` | Default UI language |
| Gujarati | `gu` | UI + Master data (name_gujarati fields) |
| Hindi | `hi` | UI + Master data (name_hindi fields) |

**Implementation:**
- **Flutter:** `flutter_localizations` + ARB files for UI strings
- **React:** `i18next` + JSON translation files
- **Backend:** Language-aware API responses (accept `Accept-Language` header)
- **Master Data:** Multi-language columns (`name`, `name_gujarati`, `name_hindi`) returned together, client picks based on user preference

---

## Project Folder Structure

### Repository Layout (Monorepo)

```
naari-arts/
├── apps/
│   ├── mobile/                  ← Flutter App (Android + iOS)
│   ├── web/                     ← React Admin Panel
│   └── api/                     ← Laravel Backend API
├── docs/                        ← Project documentation
│   ├── api/                     ← API documentation (auto-generated)
│   ├── wireframes/              ← UI wireframes & mockups
│   └── database/                ← ERD diagrams, schema docs
├── .github/
│   └── workflows/               ← CI/CD pipelines
│       ├── api-deploy.yml
│       ├── web-deploy.yml
│       └── mobile-build.yml
├── docker/                      ← Docker configs (dev environment)
│   ├── docker-compose.yml
│   ├── nginx/
│   └── mysql/
├── .gitignore
├── README.md
└── Blueprint.md                 ← This file
```

---

### 1. Flutter App — `apps/mobile/`

```
apps/mobile/
├── android/                          ← Android native config
├── ios/                              ← iOS native config
├── assets/
│   ├── fonts/                        ← Custom fonts (Gujarati, Hindi support)
│   ├── images/                       ← Static images, icons
│   │   ├── logo.png
│   │   ├── placeholder_avatar.png
│   │   └── empty_state/              ← Empty state illustrations
│   └── lottie/                       ← Lottie animations (loading, success)
│
├── lib/
│   ├── main.dart                     ← App entry point
│   ├── app.dart                      ← MaterialApp, theme, router setup
│   │
│   ├── config/                       ← App-level configuration
│   │   ├── app_config.dart           ← Environment (dev/staging/prod)
│   │   ├── api_config.dart           ← Base URL, timeouts, headers
│   │   ├── theme/
│   │   │   ├── app_theme.dart        ← Light/dark theme definitions
│   │   │   ├── app_colors.dart       ← Color palette constants
│   │   │   ├── app_text_styles.dart  ← Typography definitions
│   │   │   └── app_dimensions.dart   ← Spacing, padding, radius
│   │   └── routes/
│   │       ├── app_router.dart       ← GoRouter configuration
│   │       ├── route_names.dart      ← Named route constants
│   │       └── route_guards.dart     ← Auth & role-based guards
│   │
│   ├── core/                         ← Shared core utilities
│   │   ├── constants/
│   │   │   ├── app_constants.dart    ← Global constants
│   │   │   ├── storage_keys.dart     ← Hive/SharedPrefs keys
│   │   │   └── enums.dart            ← Shared enums (UserRole, OrderStatus)
│   │   ├── errors/
│   │   │   ├── app_exceptions.dart   ← Custom exception classes
│   │   │   └── error_handler.dart    ← Global error handling
│   │   ├── extensions/
│   │   │   ├── string_extensions.dart
│   │   │   ├── date_extensions.dart
│   │   │   └── context_extensions.dart
│   │   ├── utils/
│   │   │   ├── validators.dart       ← Form validation helpers
│   │   │   ├── formatters.dart       ← Currency, date, phone formatting
│   │   │   ├── image_utils.dart      ← Compress, crop helpers
│   │   │   └── permission_utils.dart ← Camera, storage permissions
│   │   └── widgets/                  ← Reusable UI components
│   │       ├── app_bar/
│   │       │   └── custom_app_bar.dart
│   │       ├── buttons/
│   │       │   ├── primary_button.dart
│   │       │   └── icon_button.dart
│   │       ├── cards/
│   │       │   ├── order_card.dart
│   │       │   └── customer_card.dart
│   │       ├── dialogs/
│   │       │   ├── confirm_dialog.dart
│   │       │   └── loading_dialog.dart
│   │       ├── forms/
│   │       │   ├── text_field_widget.dart
│   │       │   ├── dropdown_widget.dart
│   │       │   └── date_picker_widget.dart
│   │       ├── indicators/
│   │       │   ├── loading_indicator.dart
│   │       │   └── empty_state_widget.dart
│   │       └── image/
│   │           ├── photo_picker_widget.dart
│   │           └── cached_image_widget.dart
│   │
│   ├── data/                         ← Data layer (API + Local)
│   │   ├── api/
│   │   │   ├── api_client.dart       ← Dio setup, interceptors, token refresh
│   │   │   ├── api_endpoints.dart    ← All endpoint URL constants
│   │   │   ├── interceptors/
│   │   │   │   ├── auth_interceptor.dart
│   │   │   │   ├── tenant_interceptor.dart
│   │   │   │   └── error_interceptor.dart
│   │   │   └── services/             ← API service classes (one per module)
│   │   │       ├── auth_api_service.dart
│   │   │       ├── customer_api_service.dart
│   │   │       ├── order_api_service.dart
│   │   │       ├── measurement_api_service.dart
│   │   │       ├── workflow_api_service.dart
│   │   │       ├── invoice_api_service.dart
│   │   │       ├── payment_api_service.dart
│   │   │       ├── worker_api_service.dart
│   │   │       ├── master_data_api_service.dart
│   │   │       └── file_upload_api_service.dart
│   │   │
│   │   ├── local/
│   │   │   ├── hive_service.dart     ← Hive box management
│   │   │   ├── secure_storage.dart   ← Token storage (flutter_secure_storage)
│   │   │   └── offline_queue.dart    ← Queue offline actions for sync
│   │   │
│   │   ├── models/                   ← Data models (JSON serializable)
│   │   │   ├── auth/
│   │   │   │   ├── user_model.dart
│   │   │   │   ├── login_request.dart
│   │   │   │   └── login_response.dart
│   │   │   ├── customer/
│   │   │   │   ├── customer_model.dart
│   │   │   │   └── customer_inquiry_model.dart
│   │   │   ├── order/
│   │   │   │   ├── order_model.dart
│   │   │   │   ├── order_item_model.dart
│   │   │   │   ├── item_fabric_model.dart
│   │   │   │   ├── item_embellishment_model.dart
│   │   │   │   ├── item_stitching_spec_model.dart
│   │   │   │   └── item_additional_work_model.dart
│   │   │   ├── measurement/
│   │   │   │   ├── measurement_profile_model.dart
│   │   │   │   ├── measurement_record_model.dart
│   │   │   │   └── measurement_value_model.dart
│   │   │   ├── workflow/
│   │   │   │   ├── workflow_stage_model.dart
│   │   │   │   └── workflow_task_model.dart
│   │   │   ├── invoice/
│   │   │   │   ├── invoice_model.dart
│   │   │   │   └── invoice_item_model.dart
│   │   │   ├── payment/
│   │   │   │   ├── payment_model.dart
│   │   │   │   └── payment_summary_model.dart
│   │   │   ├── worker/
│   │   │   │   ├── worker_model.dart
│   │   │   │   └── worker_skill_model.dart
│   │   │   ├── master/                ← Master data models
│   │   │   │   ├── item_type_model.dart
│   │   │   │   ├── work_type_model.dart
│   │   │   │   ├── embellishment_zone_model.dart
│   │   │   │   ├── occasion_model.dart
│   │   │   │   ├── inquiry_source_model.dart
│   │   │   │   └── budget_range_model.dart
│   │   │   └── common/
│   │   │       ├── api_response.dart   ← Generic API response wrapper
│   │   │       ├── pagination_model.dart
│   │   │       └── file_upload_model.dart
│   │   │
│   │   └── repositories/             ← Repository pattern (data source abstraction)
│   │       ├── auth_repository.dart
│   │       ├── customer_repository.dart
│   │       ├── order_repository.dart
│   │       ├── measurement_repository.dart
│   │       ├── workflow_repository.dart
│   │       ├── invoice_repository.dart
│   │       ├── payment_repository.dart
│   │       ├── worker_repository.dart
│   │       └── master_data_repository.dart
│   │
│   ├── providers/                    ← Riverpod providers
│   │   ├── auth/
│   │   │   ├── auth_provider.dart         ← Auth state (logged in/out)
│   │   │   └── user_provider.dart         ← Current user data
│   │   ├── customer/
│   │   │   ├── customer_list_provider.dart
│   │   │   └── customer_detail_provider.dart
│   │   ├── order/
│   │   │   ├── order_list_provider.dart
│   │   │   ├── order_detail_provider.dart
│   │   │   └── order_form_provider.dart
│   │   ├── measurement/
│   │   │   └── measurement_provider.dart
│   │   ├── workflow/
│   │   │   ├── workflow_board_provider.dart
│   │   │   └── my_tasks_provider.dart
│   │   ├── invoice/
│   │   │   └── invoice_provider.dart
│   │   ├── payment/
│   │   │   └── payment_provider.dart
│   │   ├── worker/
│   │   │   └── worker_provider.dart
│   │   ├── master/
│   │   │   └── master_data_provider.dart  ← Cached master data
│   │   └── common/
│   │       ├── connectivity_provider.dart ← Online/offline state
│   │       └── locale_provider.dart       ← Language selection
│   │
│   ├── features/                     ← Feature modules (screens + widgets)
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart
│   │   │   │   └── forgot_password_screen.dart
│   │   │   └── widgets/
│   │   │       └── login_form.dart
│   │   │
│   │   ├── dashboard/
│   │   │   ├── screens/
│   │   │   │   └── dashboard_screen.dart
│   │   │   └── widgets/
│   │   │       ├── stats_card.dart
│   │   │       ├── recent_orders_list.dart
│   │   │       ├── pending_tasks_list.dart
│   │   │       └── delivery_calendar.dart
│   │   │
│   │   ├── customer/
│   │   │   ├── screens/
│   │   │   │   ├── customer_list_screen.dart
│   │   │   │   ├── customer_detail_screen.dart
│   │   │   │   └── customer_form_screen.dart
│   │   │   └── widgets/
│   │   │       ├── customer_search_bar.dart
│   │   │       └── customer_info_card.dart
│   │   │
│   │   ├── inquiry/
│   │   │   ├── screens/
│   │   │   │   ├── inquiry_list_screen.dart
│   │   │   │   └── inquiry_detail_screen.dart
│   │   │   └── widgets/
│   │   │       └── inquiry_status_badge.dart
│   │   │
│   │   ├── order/
│   │   │   ├── screens/
│   │   │   │   ├── order_list_screen.dart
│   │   │   │   ├── order_detail_screen.dart
│   │   │   │   └── order_form_screen.dart
│   │   │   └── widgets/
│   │   │       ├── order_item_card.dart
│   │   │       ├── fabric_detail_form.dart
│   │   │       ├── embellishment_form.dart
│   │   │       ├── stitching_spec_form.dart
│   │   │       ├── additional_work_form.dart
│   │   │       └── order_status_badge.dart
│   │   │
│   │   ├── measurement/
│   │   │   ├── screens/
│   │   │   │   ├── measurement_profile_screen.dart
│   │   │   │   └── measurement_capture_screen.dart
│   │   │   └── widgets/
│   │   │       ├── body_diagram_widget.dart
│   │   │       └── measurement_input_row.dart
│   │   │
│   │   ├── workflow/
│   │   │   ├── screens/
│   │   │   │   ├── workflow_board_screen.dart  ← Kanban view
│   │   │   │   └── my_tasks_screen.dart        ← Staff task list
│   │   │   └── widgets/
│   │   │       ├── workflow_stage_column.dart
│   │   │       ├── task_card.dart
│   │   │       └── task_comment_widget.dart
│   │   │
│   │   ├── cost_estimation/               ← Owner only
│   │   │   ├── screens/
│   │   │   │   └── cost_estimate_screen.dart
│   │   │   └── widgets/
│   │   │       └── cost_breakdown_card.dart
│   │   │
│   │   ├── invoice/
│   │   │   ├── screens/
│   │   │   │   ├── invoice_list_screen.dart
│   │   │   │   └── invoice_detail_screen.dart
│   │   │   └── widgets/
│   │   │       ├── invoice_type_badge.dart
│   │   │       └── gst_breakdown_widget.dart
│   │   │
│   │   ├── payment/
│   │   │   ├── screens/
│   │   │   │   ├── payment_list_screen.dart
│   │   │   │   └── record_payment_screen.dart
│   │   │   └── widgets/
│   │   │       └── payment_summary_card.dart
│   │   │
│   │   ├── worker/
│   │   │   ├── screens/
│   │   │   │   ├── worker_list_screen.dart
│   │   │   │   └── worker_form_screen.dart
│   │   │   └── widgets/
│   │   │       └── skill_chip_widget.dart
│   │   │
│   │   ├── notifications/
│   │   │   ├── screens/
│   │   │   │   └── notification_list_screen.dart
│   │   │   └── services/
│   │   │       └── fcm_service.dart       ← FCM setup, token management
│   │   │
│   │   └── settings/
│   │       ├── screens/
│   │       │   ├── settings_screen.dart
│   │       │   └── profile_screen.dart
│   │       └── widgets/
│   │           └── language_selector.dart
│   │
│   └── l10n/                             ← Localization files
│       ├── app_en.arb                    ← English strings
│       ├── app_gu.arb                    ← Gujarati strings
│       └── app_hi.arb                    ← Hindi strings
│
├── test/                                 ← Unit & widget tests
│   ├── data/
│   │   ├── models/                       ← Model serialization tests
│   │   ├── repositories/                 ← Repository tests (mocked API)
│   │   └── api/                          ← API service tests
│   ├── providers/                        ← Provider tests
│   └── features/                         ← Widget tests per feature
│
├── integration_test/                     ← Integration/E2E tests
│   └── app_test.dart
│
├── pubspec.yaml                          ← Dependencies
├── analysis_options.yaml                 ← Lint rules
└── README.md
```

**Key Architecture Decisions:**
- **Clean Architecture**: `data/` (API + models) → `repositories/` (abstraction) → `providers/` (state) → `features/` (UI)
- **Feature-first organization**: Each feature has its own `screens/` and `widgets/` — easy for developers to find related code
- **Repository pattern**: All API calls go through repositories — makes testing and offline support straightforward
- **Riverpod providers**: One provider per data concern — no god-providers
- **Shared widgets**: `core/widgets/` for reusable components across features

---

### 2. React Web Panel — `apps/web/`

```
apps/web/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── locales/                       ← i18next translation JSON files
│       ├── en/
│       │   └── translation.json
│       ├── gu/
│       │   └── translation.json
│       └── hi/
│           └── translation.json
│
├── src/
│   ├── main.tsx                       ← App entry point
│   ├── App.tsx                        ← Root component, providers, router
│   ├── vite-env.d.ts                  ← Vite type definitions
│   │
│   ├── config/                        ← App configuration
│   │   ├── env.ts                     ← Environment variables
│   │   ├── api.ts                     ← API base URL, defaults
│   │   ├── routes.ts                  ← Route path constants
│   │   └── query-keys.ts             ← TanStack Query key constants
│   │
│   ├── lib/                           ← Core utilities & setup
│   │   ├── axios.ts                   ← Axios instance, interceptors, token refresh
│   │   ├── query-client.ts            ← TanStack Query client setup
│   │   ├── i18n.ts                    ← i18next initialization
│   │   ├── utils.ts                   ← Utility functions (cn, formatCurrency, etc.)
│   │   └── validators.ts             ← Zod schemas shared across forms
│   │
│   ├── types/                         ← TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── customer.types.ts
│   │   ├── order.types.ts
│   │   ├── measurement.types.ts
│   │   ├── workflow.types.ts
│   │   ├── invoice.types.ts
│   │   ├── payment.types.ts
│   │   ├── worker.types.ts
│   │   ├── master.types.ts            ← ItemType, WorkType, etc.
│   │   └── api.types.ts               ← ApiResponse<T>, PaginatedResponse<T>
│   │
│   ├── services/                      ← API service functions
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── order.service.ts
│   │   ├── measurement.service.ts
│   │   ├── workflow.service.ts
│   │   ├── invoice.service.ts
│   │   ├── payment.service.ts
│   │   ├── worker.service.ts
│   │   ├── master.service.ts
│   │   ├── report.service.ts
│   │   └── settings.service.ts
│   │
│   ├── hooks/                         ← Custom React hooks
│   │   ├── api/                       ← TanStack Query hooks (one per module)
│   │   │   ├── use-auth.ts            ← useLogin, useLogout, useCurrentUser
│   │   │   ├── use-customers.ts       ← useCustomers, useCustomer, useCreateCustomer
│   │   │   ├── use-orders.ts          ← useOrders, useOrder, useCreateOrder
│   │   │   ├── use-measurements.ts
│   │   │   ├── use-workflow.ts        ← useWorkflowBoard, useUpdateTaskStatus
│   │   │   ├── use-invoices.ts
│   │   │   ├── use-payments.ts
│   │   │   ├── use-workers.ts
│   │   │   ├── use-master-data.ts     ← useItemTypes, useWorkTypes (cached)
│   │   │   ├── use-reports.ts
│   │   │   └── use-settings.ts
│   │   ├── use-auth-guard.ts          ← Route protection hook
│   │   ├── use-role-access.ts         ← Permission checking hook
│   │   ├── use-debounce.ts            ← Search debouncing
│   │   ├── use-pagination.ts          ← Pagination state management
│   │   └── use-locale.ts              ← Language switching
│   │
│   ├── store/                         ← Client-side state (minimal)
│   │   ├── auth-store.ts              ← Zustand: auth token, user info
│   │   └── ui-store.ts                ← Zustand: sidebar, theme, locale
│   │
│   ├── components/                    ← Shared/reusable components
│   │   ├── ui/                        ← Shadcn/UI primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...                    ← Other Shadcn components
│   │   │
│   │   ├── layout/                    ← App shell components
│   │   │   ├── app-layout.tsx         ← Main layout (sidebar + content)
│   │   │   ├── sidebar.tsx            ← Navigation sidebar
│   │   │   ├── header.tsx             ← Top bar (search, notifications, profile)
│   │   │   ├── breadcrumb.tsx
│   │   │   └── page-header.tsx        ← Page title + action buttons
│   │   │
│   │   ├── data-table/                ← Reusable data table
│   │   │   ├── data-table.tsx         ← TanStack Table wrapper
│   │   │   ├── data-table-toolbar.tsx ← Filters, search, export
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── data-table-column-header.tsx
│   │   │
│   │   ├── forms/                     ← Reusable form components
│   │   │   ├── form-field.tsx         ← React Hook Form field wrapper
│   │   │   ├── search-select.tsx      ← Searchable dropdown (customers, workers)
│   │   │   ├── date-picker.tsx        ← Date picker with Indian format
│   │   │   ├── currency-input.tsx     ← ₹ formatted input
│   │   │   ├── phone-input.tsx        ← +91 formatted input
│   │   │   ├── file-upload.tsx        ← Drag-and-drop file upload
│   │   │   └── gst-number-input.tsx   ← GST validation + formatting
│   │   │
│   │   └── shared/                    ← Common display components
│   │       ├── status-badge.tsx       ← Order/payment/invoice status
│   │       ├── priority-badge.tsx     ← Order priority display
│   │       ├── currency-display.tsx   ← ₹ formatted display
│   │       ├── confirm-dialog.tsx     ← Delete/action confirmation
│   │       ├── loading-skeleton.tsx   ← Loading placeholders
│   │       ├── empty-state.tsx        ← No data illustrations
│   │       └── error-boundary.tsx     ← React error boundary
│   │
│   ├── features/                      ← Feature pages (route-based)
│   │   ├── auth/
│   │   │   ├── login-page.tsx
│   │   │   └── forgot-password-page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard-page.tsx
│   │   │   └── components/
│   │   │       ├── stats-cards.tsx
│   │   │       ├── revenue-chart.tsx
│   │   │       ├── recent-orders.tsx
│   │   │       ├── pending-tasks.tsx
│   │   │       └── delivery-calendar.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── customer-list-page.tsx
│   │   │   ├── customer-detail-page.tsx
│   │   │   ├── customer-form-page.tsx
│   │   │   └── components/
│   │   │       ├── customer-table-columns.tsx
│   │   │       ├── customer-filters.tsx
│   │   │       └── customer-order-history.tsx
│   │   │
│   │   ├── inquiries/
│   │   │   ├── inquiry-list-page.tsx
│   │   │   ├── inquiry-detail-page.tsx
│   │   │   └── components/
│   │   │       ├── inquiry-table-columns.tsx
│   │   │       └── convert-to-order-dialog.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── order-list-page.tsx
│   │   │   ├── order-detail-page.tsx
│   │   │   ├── order-form-page.tsx
│   │   │   └── components/
│   │   │       ├── order-table-columns.tsx
│   │   │       ├── order-filters.tsx
│   │   │       ├── order-items-section.tsx
│   │   │       ├── fabric-detail-form.tsx
│   │   │       ├── embellishment-form.tsx
│   │   │       ├── stitching-spec-form.tsx
│   │   │       └── additional-work-form.tsx
│   │   │
│   │   ├── measurements/
│   │   │   ├── measurement-page.tsx
│   │   │   └── components/
│   │   │       ├── profile-selector.tsx
│   │   │       ├── measurement-form.tsx
│   │   │       └── measurement-history.tsx
│   │   │
│   │   ├── workflow/
│   │   │   ├── workflow-board-page.tsx     ← Kanban view
│   │   │   └── components/
│   │   │       ├── kanban-board.tsx        ← Drag-and-drop board
│   │   │       ├── kanban-column.tsx       ← Single stage column
│   │   │       ├── kanban-card.tsx         ← Order task card
│   │   │       ├── task-detail-drawer.tsx  ← Side panel for task details
│   │   │       └── task-comments.tsx
│   │   │
│   │   ├── cost-estimation/               ← Owner only
│   │   │   ├── cost-estimate-page.tsx
│   │   │   └── components/
│   │   │       ├── cost-breakdown-table.tsx
│   │   │       └── profit-summary.tsx
│   │   │
│   │   ├── invoices/
│   │   │   ├── invoice-list-page.tsx
│   │   │   ├── invoice-detail-page.tsx
│   │   │   ├── create-invoice-page.tsx
│   │   │   └── components/
│   │   │       ├── invoice-table-columns.tsx
│   │   │       ├── invoice-form.tsx
│   │   │       ├── gst-calculation-preview.tsx
│   │   │       └── invoice-pdf-preview.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── payment-list-page.tsx
│   │   │   ├── record-payment-page.tsx
│   │   │   └── components/
│   │   │       ├── payment-table-columns.tsx
│   │   │       └── payment-summary-card.tsx
│   │   │
│   │   ├── workers/
│   │   │   ├── worker-list-page.tsx
│   │   │   ├── worker-form-page.tsx
│   │   │   └── components/
│   │   │       ├── worker-table-columns.tsx
│   │   │       └── skill-management.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── reports-page.tsx
│   │   │   └── components/
│   │   │       ├── revenue-report.tsx
│   │   │       ├── gst-summary-report.tsx
│   │   │       ├── worker-performance-report.tsx
│   │   │       └── delivery-tracker-report.tsx
│   │   │
│   │   └── settings/
│   │       ├── settings-page.tsx
│   │       └── components/
│   │           ├── tenant-settings-form.tsx
│   │           ├── gst-settings-form.tsx
│   │           ├── master-data-manager.tsx    ← CRUD for item_types, work_types, etc.
│   │           ├── workflow-stage-manager.tsx  ← Customize workflow stages
│   │           ├── user-management.tsx
│   │           └── invoice-sequence-settings.tsx
│   │
│   └── router/                        ← Route definitions
│       ├── index.tsx                  ← Router setup with lazy loading
│       ├── auth-routes.tsx            ← Public routes (login)
│       ├── protected-routes.tsx       ← Auth-required routes
│       └── role-guard.tsx             ← HOC for role-based access
│
├── index.html                         ← Vite entry HTML
├── vite.config.ts                     ← Vite configuration
├── tailwind.config.ts                 ← Tailwind CSS configuration
├── tsconfig.json                      ← TypeScript configuration
├── components.json                    ← Shadcn/UI configuration
├── package.json
└── README.md
```

**Key Architecture Decisions:**
- **Feature-based routing**: Each feature folder maps to a route — `features/orders/` → `/orders/*`
- **TanStack Query for server state**: No Redux needed — all server data managed via query hooks
- **Zustand for client state**: Minimal client state (auth token, UI preferences only)
- **Shadcn/UI**: Copy-paste components in `components/ui/` — fully customizable, no dependency lock-in
- **Colocation**: Feature-specific components live inside feature folders, shared ones in `components/`

---

### 3. Laravel API — `apps/api/`

```
apps/api/
├── app/
│   ├── Console/
│   │   └── Commands/                    ← Custom artisan commands
│   │       ├── ResetFinancialYearSequences.php  ← Reset order/invoice sequences
│   │       ├── SendDeliveryReminders.php        ← Scheduled reminders
│   │       └── SendPaymentOverdueAlerts.php     ← Overdue payment alerts
│   │
│   ├── Enums/                           ← PHP 8.1 backed enums
│   │   ├── CustomerCategory.php         ← regular, vip, wholesale
│   │   ├── InquiryStatus.php            ← pending, contacted, converted, lost
│   │   ├── InvoiceType.php              ← gst, non_gst
│   │   ├── InvoiceStatus.php            ← draft, issued, paid, partially_paid, cancelled
│   │   ├── PaymentType.php              ← advance, partial, final, refund
│   │   ├── PaymentMode.php              ← cash, upi, card, bank_transfer, cheque
│   │   ├── PaymentStatus.php            ← pending, advance_received, partially_paid, paid, overpaid
│   │   ├── WorkerRateType.php           ← per_piece, per_hour, per_day, fixed
│   │   ├── SkillLevel.php               ← beginner, intermediate, expert
│   │   ├── WorkflowTaskStatus.php       ← pending, in_progress, completed, skipped
│   │   ├── MeasurementCategory.php      ← upper_body, lower_body, general
│   │   ├── Language.php                 ← hindi, gujarati, english
│   │   └── UserStatus.php               ← active, inactive
│   │
│   ├── Events/                          ← Domain events
│   │   ├── Order/
│   │   │   ├── OrderCreated.php
│   │   │   ├── OrderStatusChanged.php
│   │   │   └── OrderCompleted.php
│   │   ├── Workflow/
│   │   │   ├── WorkflowTaskStarted.php
│   │   │   └── WorkflowTaskCompleted.php
│   │   ├── Payment/
│   │   │   ├── PaymentReceived.php
│   │   │   └── PaymentOverdue.php
│   │   └── Invoice/
│   │       └── InvoiceIssued.php
│   │
│   ├── Exceptions/                      ← Custom exceptions
│   │   ├── Handler.php
│   │   ├── BusinessLogicException.php
│   │   ├── InsufficientPermissionException.php
│   │   └── TenantMismatchException.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/                  ← Versioned API controllers
│   │   │           ├── AuthController.php
│   │   │           ├── CustomerController.php
│   │   │           ├── InquiryController.php
│   │   │           ├── OrderController.php
│   │   │           ├── OrderItemController.php
│   │   │           ├── MeasurementProfileController.php
│   │   │           ├── MeasurementRecordController.php
│   │   │           ├── WorkflowController.php
│   │   │           ├── CostEstimateController.php
│   │   │           ├── InvoiceController.php
│   │   │           ├── PaymentController.php
│   │   │           ├── WorkerController.php
│   │   │           ├── ReportController.php
│   │   │           ├── MasterDataController.php
│   │   │           └── SettingsController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── EnsureTenantAccess.php     ← Verify tenant_id on every request
│   │   │   ├── SetTenantContext.php        ← Set tenant from auth user
│   │   │   ├── CheckRole.php              ← Role-based middleware
│   │   │   ├── CheckPermission.php        ← Permission-based middleware
│   │   │   ├── OwnerOnly.php              ← Cost estimation, settings
│   │   │   └── SetLocale.php              ← Set app locale from Accept-Language
│   │   │
│   │   ├── Requests/                      ← Form Request validation
│   │   │   ├── Auth/
│   │   │   │   └── LoginRequest.php
│   │   │   ├── Customer/
│   │   │   │   ├── StoreCustomerRequest.php
│   │   │   │   └── UpdateCustomerRequest.php
│   │   │   ├── Order/
│   │   │   │   ├── StoreOrderRequest.php
│   │   │   │   └── UpdateOrderRequest.php
│   │   │   ├── OrderItem/
│   │   │   │   ├── StoreOrderItemRequest.php
│   │   │   │   ├── UpdateFabricRequest.php
│   │   │   │   ├── UpdateEmbellishmentRequest.php
│   │   │   │   ├── UpdateStitchingSpecRequest.php
│   │   │   │   └── UpdateCostEstimateRequest.php
│   │   │   ├── Measurement/
│   │   │   │   ├── StoreMeasurementProfileRequest.php
│   │   │   │   └── StoreMeasurementRecordRequest.php
│   │   │   ├── Workflow/
│   │   │   │   ├── UpdateTaskStatusRequest.php
│   │   │   │   └── StoreTaskCommentRequest.php
│   │   │   ├── Invoice/
│   │   │   │   └── StoreInvoiceRequest.php
│   │   │   ├── Payment/
│   │   │   │   └── StorePaymentRequest.php
│   │   │   └── Worker/
│   │   │       └── StoreWorkerRequest.php
│   │   │
│   │   └── Resources/                    ← API response transformers
│   │       ├── CustomerResource.php
│   │       ├── CustomerCollection.php
│   │       ├── InquiryResource.php
│   │       ├── OrderResource.php
│   │       ├── OrderDetailResource.php    ← Full order with items, fabric, etc.
│   │       ├── OrderItemResource.php
│   │       ├── MeasurementProfileResource.php
│   │       ├── MeasurementRecordResource.php
│   │       ├── WorkflowBoardResource.php
│   │       ├── WorkflowTaskResource.php
│   │       ├── CostEstimateResource.php
│   │       ├── InvoiceResource.php
│   │       ├── PaymentResource.php
│   │       ├── PaymentSummaryResource.php
│   │       ├── WorkerResource.php
│   │       └── MasterData/               ← Master data resources
│   │           ├── ItemTypeResource.php
│   │           ├── WorkTypeResource.php
│   │           ├── EmbellishmentZoneResource.php
│   │           ├── OccasionResource.php
│   │           ├── InquirySourceResource.php
│   │           └── BudgetRangeResource.php
│   │
│   ├── Listeners/                       ← Event listeners
│   │   ├── Order/
│   │   │   ├── InitializeWorkflowTasks.php     ← Create 21 tasks on order confirm
│   │   │   ├── NotifyStaffAssignment.php
│   │   │   └── UpdateOrderStatusFromWorkflow.php
│   │   ├── Workflow/
│   │   │   ├── SendTaskNotification.php
│   │   │   └── ValidateWorkflowProgression.php
│   │   ├── Payment/
│   │   │   ├── RecalculatePaymentSummary.php
│   │   │   ├── SendPaymentConfirmation.php
│   │   │   └── UpdateInvoiceStatus.php
│   │   └── Invoice/
│   │       └── SendInvoiceNotification.php
│   │
│   ├── Models/                          ← Eloquent models
│   │   ├── Tenant.php
│   │   ├── TenantSetting.php
│   │   ├── Customer.php
│   │   ├── CustomerInquiry.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── ItemFabric.php
│   │   ├── ItemEmbellishment.php
│   │   ├── ItemEmbellishmentZone.php
│   │   ├── ItemStitchingSpec.php
│   │   ├── ItemAdditionalWork.php
│   │   ├── ItemCostEstimate.php
│   │   ├── MeasurementProfile.php
│   │   ├── MeasurementRecord.php
│   │   ├── MeasurementValue.php
│   │   ├── MeasurementType.php
│   │   ├── TenantMeasurementSetting.php
│   │   ├── Invoice.php
│   │   ├── InvoiceItem.php
│   │   ├── InvoiceNumberSequence.php
│   │   ├── Payment.php
│   │   ├── OrderPaymentSummary.php
│   │   ├── Worker.php
│   │   ├── WorkerSkill.php
│   │   ├── WorkflowStage.php
│   │   ├── OrderWorkflowTask.php
│   │   ├── WorkflowTaskComment.php
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Permission.php
│   │   ├── UserSession.php
│   │   ├── AuditLog.php
│   │   ├── Scopes/
│   │   │   └── TenantScope.php          ← Global scope: auto-filter by tenant_id
│   │   ├── Traits/
│   │   │   ├── BelongsToTenant.php      ← Apply TenantScope + auto-set tenant_id
│   │   │   └── Auditable.php            ← Auto-log changes to audit_logs
│   │   └── Master/                      ← Master data models
│   │       ├── ItemType.php
│   │       ├── WorkType.php
│   │       ├── EmbellishmentZone.php
│   │       ├── InquirySource.php
│   │       ├── Occasion.php
│   │       ├── BudgetRange.php
│   │       ├── OrderStatus.php
│   │       ├── OrderPriority.php
│   │       └── OrderNumberSequence.php
│   │
│   ├── Notifications/                   ← Multi-channel notifications
│   │   ├── OrderConfirmedNotification.php
│   │   ├── WorkflowTaskAssignedNotification.php
│   │   ├── PaymentReceivedNotification.php
│   │   ├── DeliveryReminderNotification.php
│   │   ├── PaymentOverdueNotification.php
│   │   └── Channels/
│   │       ├── WhatsAppChannel.php       ← Custom WhatsApp notification channel
│   │       └── FcmChannel.php            ← Firebase Cloud Messaging channel
│   │
│   ├── Observers/                       ← Model observers
│   │   ├── OrderObserver.php            ← Auto-generate order_number on create
│   │   ├── InvoiceObserver.php          ← Auto-generate invoice_number, GST calc
│   │   ├── PaymentObserver.php          ← Trigger payment summary recalculation
│   │   └── ItemFabricObserver.php       ← Auto-calculate total_fabric_cost
│   │
│   ├── Policies/                        ← Authorization policies
│   │   ├── CustomerPolicy.php
│   │   ├── OrderPolicy.php
│   │   ├── InvoicePolicy.php
│   │   ├── PaymentPolicy.php
│   │   ├── CostEstimatePolicy.php       ← Owner only
│   │   ├── WorkflowTaskPolicy.php       ← Staff: assigned only
│   │   └── SettingsPolicy.php           ← Owner only
│   │
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── EventServiceProvider.php      ← Register events → listeners
│   │   └── ObserverServiceProvider.php   ← Register model observers
│   │
│   └── Services/                        ← Business logic services
│       ├── Auth/
│       │   └── AuthService.php           ← Login, logout, token management
│       ├── Order/
│       │   ├── OrderService.php          ← Create, update, status transitions
│       │   ├── OrderNumberGenerator.php  ← Generate order numbers from sequence
│       │   └── CostCalculationService.php ← Auto-calculate cost estimates
│       ├── Invoice/
│       │   ├── InvoiceService.php        ← Create GST/Non-GST invoices
│       │   ├── InvoiceNumberGenerator.php
│       │   ├── GstCalculationService.php ← CGST/SGST/IGST calculations
│       │   └── InvoicePdfService.php     ← Generate invoice PDFs
│       ├── Payment/
│       │   └── PaymentService.php        ← Record payment, recalculate summary
│       ├── Workflow/
│       │   ├── WorkflowService.php       ← Initialize tasks, validate progression
│       │   └── WorkflowNotificationService.php
│       ├── Measurement/
│       │   └── MeasurementService.php    ← Profile, record, history management
│       ├── Worker/
│       │   └── WorkerAssignmentService.php ← Skill-based worker filtering
│       ├── Report/
│       │   ├── RevenueReportService.php
│       │   ├── GstReportService.php
│       │   └── DeliveryTrackerService.php
│       ├── Notification/
│       │   ├── SmsService.php             ← MSG91 integration
│       │   └── WhatsAppService.php        ← WhatsApp Business API
│       └── FileUpload/
│           └── FileUploadService.php      ← Upload, compress, store to S3
│
├── bootstrap/
│   └── app.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── filesystems.php                ← S3/Spaces disk config
│   ├── queue.php                      ← Redis queue config
│   ├── services.php                   ← SMS, WhatsApp, FCM credentials
│   ├── permission.php                 ← Spatie permission config
│   └── tenant.php                     ← Custom tenant configuration
│
├── database/
│   ├── migrations/                    ← Ordered by table dependency
│   │   ├── 0001_create_tenants_table.php
│   │   ├── 0002_create_tenant_settings_table.php
│   │   ├── 0003_create_item_types_table.php
│   │   ├── 0004_create_work_types_table.php
│   │   ├── 0005_create_embellishment_zones_table.php
│   │   ├── 0006_create_inquiry_sources_table.php
│   │   ├── 0007_create_occasions_table.php
│   │   ├── 0008_create_budget_ranges_table.php
│   │   ├── 0009_create_customers_table.php
│   │   ├── 0010_create_customer_inquiries_table.php
│   │   ├── 0011_create_measurement_profiles_table.php
│   │   ├── 0012_create_measurement_records_table.php
│   │   ├── 0013_create_measurement_values_table.php
│   │   ├── 0014_create_measurement_types_table.php
│   │   ├── 0015_create_tenant_measurement_settings_table.php
│   │   ├── 0016_create_order_statuses_table.php
│   │   ├── 0017_create_order_priorities_table.php
│   │   ├── 0018_create_order_number_sequences_table.php
│   │   ├── 0019_create_orders_table.php
│   │   ├── 0020_create_order_items_table.php
│   │   ├── 0021_create_item_fabrics_table.php
│   │   ├── 0022_create_item_embellishments_table.php
│   │   ├── 0023_create_item_embellishment_zones_table.php
│   │   ├── 0024_create_item_stitching_specs_table.php
│   │   ├── 0025_create_item_additional_works_table.php
│   │   ├── 0026_create_workers_table.php
│   │   ├── 0027_create_worker_skills_table.php
│   │   ├── 0028_create_item_cost_estimates_table.php
│   │   ├── 0029_create_invoice_number_sequences_table.php
│   │   ├── 0030_create_invoices_table.php
│   │   ├── 0031_create_invoice_items_table.php
│   │   ├── 0032_create_payments_table.php
│   │   ├── 0033_create_order_payment_summary_table.php
│   │   ├── 0034_create_workflow_stages_table.php
│   │   ├── 0035_create_order_workflow_tasks_table.php
│   │   ├── 0036_create_workflow_task_comments_table.php
│   │   ├── 0037_create_roles_table.php
│   │   ├── 0038_create_permissions_table.php
│   │   ├── 0039_create_role_permissions_table.php
│   │   ├── 0040_create_users_table.php
│   │   ├── 0041_create_user_sessions_table.php
│   │   └── 0042_create_audit_logs_table.php
│   │
│   ├── seeders/
│   │   ├── DatabaseSeeder.php           ← Master seeder (runs all)
│   │   ├── RoleAndPermissionSeeder.php  ← Owner, Manager, Staff + permissions
│   │   ├── ItemTypeSeeder.php           ← Default item types (Gown, Kurti, etc.)
│   │   ├── WorkTypeSeeder.php           ← Default work types (Jardoshi, Moti, etc.)
│   │   ├── EmbellishmentZoneSeeder.php  ← Default zones (Front Neck, etc.)
│   │   ├── InquirySourceSeeder.php      ← Default sources (Facebook, etc.)
│   │   ├── OccasionSeeder.php           ← Default occasions (Wedding, etc.)
│   │   ├── BudgetRangeSeeder.php        ← Default ranges
│   │   ├── OrderStatusSeeder.php        ← Default statuses
│   │   ├── OrderPrioritySeeder.php      ← Default priorities
│   │   ├── WorkflowStageSeeder.php      ← 21 default workflow stages
│   │   ├── MeasurementTypeSeeder.php    ← Default measurement types
│   │   └── DemoDataSeeder.php           ← Demo tenant + sample data (dev only)
│   │
│   └── factories/                       ← Model factories for testing
│       ├── CustomerFactory.php
│       ├── OrderFactory.php
│       ├── InvoiceFactory.php
│       └── ...
│
├── routes/
│   ├── api.php                         ← Main API route file
│   ├── api/
│   │   ├── auth.php                    ← /api/v1/auth/*
│   │   ├── customers.php               ← /api/v1/customers/*
│   │   ├── inquiries.php               ← /api/v1/inquiries/*
│   │   ├── orders.php                  ← /api/v1/orders/*
│   │   ├── order-items.php             ← /api/v1/order-items/*
│   │   ├── measurements.php            ← /api/v1/measurements/*
│   │   ├── workflow.php                ← /api/v1/workflow/*
│   │   ├── invoices.php                ← /api/v1/invoices/*
│   │   ├── payments.php                ← /api/v1/payments/*
│   │   ├── workers.php                 ← /api/v1/workers/*
│   │   ├── reports.php                 ← /api/v1/reports/*
│   │   ├── masters.php                 ← /api/v1/masters/*
│   │   └── settings.php                ← /api/v1/settings/*
│   └── console.php                     ← Artisan scheduled commands
│
├── storage/
│   ├── app/
│   │   └── temp/                       ← Temporary file processing
│   ├── framework/
│   └── logs/
│
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   │   └── LoginTest.php
│   │   ├── Customer/
│   │   │   └── CustomerCrudTest.php
│   │   ├── Order/
│   │   │   ├── OrderCrudTest.php
│   │   │   └── OrderWorkflowTest.php
│   │   ├── Invoice/
│   │   │   ├── GstCalculationTest.php
│   │   │   └── InvoiceGenerationTest.php
│   │   ├── Payment/
│   │   │   └── PaymentSummaryTest.php
│   │   └── Workflow/
│   │       └── WorkflowProgressionTest.php
│   │
│   └── Unit/
│       ├── Services/
│       │   ├── OrderNumberGeneratorTest.php
│       │   ├── GstCalculationServiceTest.php
│       │   └── CostCalculationServiceTest.php
│       └── Models/
│           ├── OrderTest.php
│           └── InvoiceTest.php
│
├── .env.example                        ← Environment template
├── artisan
├── composer.json
├── phpunit.xml
└── README.md
```

**Key Architecture Decisions:**
- **Service layer**: All business logic in `Services/` — controllers stay thin (validate → call service → return resource)
- **Event-driven**: Order/workflow/payment events trigger listeners for notifications, recalculations, audit logging
- **Tenant scoping**: `BelongsToTenant` trait auto-applies global scope — no manual `where('tenant_id', ...)` needed
- **Observers**: Auto-generate order numbers, invoice numbers, cost calculations on model events
- **Split route files**: One route file per module in `routes/api/` — keeps routes organized and readable
- **Ordered migrations**: Numbered `0001-0042` matching Blueprint table order — clear dependency chain

---

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| **Flutter files** | snake_case | `order_detail_screen.dart` |
| **Flutter classes** | PascalCase | `OrderDetailScreen` |
| **React files** | kebab-case | `order-detail-page.tsx` |
| **React components** | PascalCase | `OrderDetailPage` |
| **React hooks** | camelCase with `use` prefix | `useOrders`, `useCreateOrder` |
| **Laravel controllers** | PascalCase + Controller | `OrderController.php` |
| **Laravel models** | PascalCase singular | `Order.php`, `ItemFabric.php` |
| **Laravel migrations** | snake_case with number prefix | `0019_create_orders_table.php` |
| **Laravel services** | PascalCase + Service | `OrderService.php` |
| **Laravel requests** | PascalCase + Request | `StoreOrderRequest.php` |
| **Laravel resources** | PascalCase + Resource | `OrderResource.php` |
| **Database tables** | snake_case plural | `order_items`, `item_fabrics` |
| **Database columns** | snake_case | `tenant_id`, `created_at` |
| **API endpoints** | kebab-case | `/api/v1/order-items` |
| **API query params** | snake_case | `?status_id=1&page=2` |

---

## Database Schema Summary

**Total Tables: 42**

| Layer | Tables | Count |
|-------|--------|-------|
| Foundation | tenants, tenant_settings | 2 |
| Master Data | item_types, work_types, embellishment_zones, inquiry_sources, occasions, budget_ranges | 6 |
| Customer | customers, customer_inquiries | 2 |
| Measurement | measurement_profiles, measurement_records, measurement_values, measurement_types, tenant_measurement_settings | 5 |
| Order Config | order_statuses, order_priorities, order_number_sequences | 3 |
| Order Management | orders, order_items, item_fabrics, item_embellishments, item_embellishment_zones, item_stitching_specs, item_additional_works | 7 |
| Worker | workers, worker_skills | 2 |
| Cost Estimation | item_cost_estimates | 1 |
| Invoicing | invoice_number_sequences, invoices, invoice_items | 3 |
| Payment | payments, order_payment_summary | 2 |
| Workflow | workflow_stages, order_workflow_tasks, workflow_task_comments | 3 |
| User Management | roles, permissions, role_permissions, users, user_sessions, audit_logs | 6 |

---

## Development Sprint Plan

### Sprint Configuration

| Parameter | Value |
|-----------|-------|
| **Sprint Duration** | 2 weeks |
| **Team Size** | 2–3 developers |
| **Build Order** | Phase 1: API + Web → Phase 2: Flutter App |
| **Launch Approach** | Full feature launch |
| **Total Sprints** | 13 sprints (Sprint 0 – Sprint 12) |

### Team Roles

| Role | Responsibilities |
|------|-----------------|
| **Dev 1 (Backend Lead)** | Laravel API, database, business logic, integrations |
| **Dev 2 (Frontend Lead)** | React web panel, UI/UX implementation |
| **Dev 3 (Mobile / Flex)** | Flutter app (Phase 2), assists backend/frontend in Phase 1 |

> Dev 3 supports API or Web tasks during Phase 1 (Sprints 0–7). Switches to Flutter full-time from Sprint 5 onward.

---

### Sprint Timeline Overview

```
Phase 1: API + Web Panel
┌─────────────────────────────────────────────────────────────────────┐
│ S0       S1       S2       S3       S4       S5       S6       S7  │
│ Setup    Auth &   Customer Order    Order    Workflow Invoice  Reports│
│ & Infra  Tenant   & Inquiry Mgmt   Detail   & Worker & Payment& Sett│
└─────────────────────────────────────────────────────────────────────┘

Phase 2: Flutter App (Dev 3 starts at S5, full team joins at S8)
┌─────────────────────────────────────────────────────────────────────┐
│          S5       S6       S7       S8       S9       S10      S11 │
│          Flutter  Flutter  Flutter  Flutter  Flutter  Flutter  Integ│
│          Setup    Customer Order    Workflow Invoice  Notif    ration│
└─────────────────────────────────────────────────────────────────────┘

Phase 3: Integration & Launch
┌──────────────────────┐
│ S11      S12         │
│ Testing  Launch      │
│ & QA     & Deploy    │
└──────────────────────┘
```

---

### SPRINT 0 — Project Setup & Infrastructure

**Goal:** Dev environment ready, CI/CD pipeline working, database migrated with seed data

| # | Task | Owner | Platform | Tables/Modules |
|---|------|-------|----------|----------------|
| 1 | Initialize monorepo structure (`apps/api`, `apps/web`, `apps/mobile`) | Dev 1 | All | — |
| 2 | Setup Laravel 11 project with PHP 8.3 | Dev 1 | API | — |
| 3 | Configure MySQL 8.0 database (utf8mb4, InnoDB) | Dev 1 | API | — |
| 4 | Setup Redis for cache + queues | Dev 1 | API | — |
| 5 | Write all 42 database migrations (0001–0042) | Dev 1 | API | Tables 1–42 |
| 6 | Write all seeders (roles, permissions, master data, 21 workflow stages) | Dev 1 | API | All seed data |
| 7 | Setup tenant scoping (`BelongsToTenant` trait, `TenantScope`) | Dev 1 | API | Foundation |
| 8 | Setup `Auditable` trait for audit logging | Dev 1 | API | audit_logs |
| 9 | Configure Laravel Sanctum for API auth | Dev 1 | API | — |
| 10 | Configure Spatie Laravel-Permission | Dev 1 | API | roles, permissions |
| 11 | Setup S3/Spaces file storage config | Dev 1 | API | — |
| 12 | Setup Docker dev environment (docker-compose) | Dev 3 | DevOps | — |
| 13 | Initialize React project (Vite + TypeScript) | Dev 2 | Web | — |
| 14 | Setup Tailwind CSS + Shadcn/UI | Dev 2 | Web | — |
| 15 | Setup TanStack Query, React Router, Axios | Dev 2 | Web | — |
| 16 | Build app layout shell (sidebar, header, breadcrumbs) | Dev 2 | Web | — |
| 17 | Setup i18next with English/Gujarati/Hindi base files | Dev 2 | Web | — |
| 18 | Setup GitHub Actions CI/CD for API + Web | Dev 3 | DevOps | — |
| 19 | Setup Sentry error tracking | Dev 3 | DevOps | — |
| 20 | Configure .env files for dev/staging/prod | Dev 3 | DevOps | — |

**Sprint 0 Deliverables:**
- [ ] Monorepo initialized with all three apps
- [ ] All 42 tables migrated and seeded
- [ ] Laravel API responding at `/api/v1/health`
- [ ] React shell loading with sidebar navigation
- [ ] CI/CD pipeline deploying to staging
- [ ] Docker dev environment running locally

---

### SPRINT 1 — Authentication & Tenant Setup

**Goal:** Login/logout working on web, tenant context established, master data CRUD

**API Tasks (Dev 1):**

| # | Task | Tables/Modules |
|---|------|----------------|
| 1 | `AuthController` — login, logout, refresh-token, me | users, user_sessions |
| 2 | `AuthService` — token management, password hashing | users |
| 3 | `SetTenantContext` middleware — extract tenant from auth user | tenants |
| 4 | `EnsureTenantAccess` middleware — validate tenant on every request | tenants |
| 5 | `CheckRole` + `CheckPermission` middleware | roles, permissions, role_permissions |
| 6 | `SettingsController` — GET/PUT tenant settings | tenant_settings |
| 7 | `MasterDataController` — CRUD for all master tables | Tables 3–8, 16–17 |
| 8 | All master data Eloquent models with `BelongsToTenant` trait | Models for Tables 3–8 |
| 9 | API Resources for all master data | Resources |
| 10 | Unit tests for auth flow + tenant scoping | Tests |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Login page with form validation | `auth/login-page.tsx` |
| 2 | Auth store (Zustand) — token storage, auto-refresh | `store/auth-store.ts` |
| 3 | Axios interceptors — auth token, tenant header, 401 redirect | `lib/axios.ts` |
| 4 | Protected route wrapper + role guard HOC | `router/role-guard.tsx` |
| 5 | Settings page — Tenant settings form | `features/settings/` |
| 6 | Settings page — GST settings form | `features/settings/` |
| 7 | Settings page — Master data manager (item types, work types, zones, occasions, sources, budget ranges) | `features/settings/` |
| 8 | Settings page — Order status + priority manager | `features/settings/` |
| 9 | Settings page — User management (CRUD users, assign roles) | `features/settings/` |
| 10 | Reusable data table component (TanStack Table) | `components/data-table/` |

**Flex Tasks (Dev 3 — assists API):**

| # | Task |
|---|------|
| 1 | Write Form Request validation classes for all master data endpoints |
| 2 | Write `OrderNumberSequence` model + `order_number_sequences` CRUD |
| 3 | Write `InvoiceNumberSequence` model + sequences CRUD |
| 4 | Setup Laravel Telescope for dev debugging |

**Sprint 1 Deliverables:**
- [ ] Login/logout functional on web
- [ ] Role-based route protection working
- [ ] All master data CRUD working (API + Web)
- [ ] Tenant settings editable
- [ ] User management (create staff, assign roles)

---

### SPRINT 2 — Customer Management & Inquiries

**Goal:** Full customer lifecycle — inquiry form → follow-up → customer creation

**API Tasks (Dev 1):**

| # | Task | Tables |
|---|------|--------|
| 1 | `Customer` model with relationships + `BelongsToTenant` | customers |
| 2 | `CustomerController` — list (paginated, searchable), create, show, update | customers |
| 3 | `CustomerInquiry` model with relationships | customer_inquiries |
| 4 | `InquiryController` — list, create (public), update status, convert to order | customer_inquiries |
| 5 | Inquiry conversion logic — create customer (if new) + create order | customer_inquiries → customers → orders |
| 6 | `StoreCustomerRequest` + `UpdateCustomerRequest` validation | — |
| 7 | Customer search API — by name, mobile, email (FULLTEXT) | customers |
| 8 | Customer order history endpoint (`/customers/{id}/orders`) | customers → orders |
| 9 | `CustomerResource` + `InquiryResource` | — |
| 10 | Feature tests for customer CRUD + inquiry conversion | Tests |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Customer list page — data table with search, filters, pagination | `customers/customer-list-page.tsx` |
| 2 | Customer detail page — info card, order history, measurement profiles | `customers/customer-detail-page.tsx` |
| 3 | Customer form page — create/edit with validation | `customers/customer-form-page.tsx` |
| 4 | Inquiry list page — table with status filters, follow-up dates | `inquiries/inquiry-list-page.tsx` |
| 5 | Inquiry detail page — status update, convert to order action | `inquiries/inquiry-detail-page.tsx` |
| 6 | Reusable search-select component (customer search dropdown) | `components/forms/search-select.tsx` |
| 7 | Reusable phone input (+91 format) | `components/forms/phone-input.tsx` |
| 8 | Reusable GST number input (validation) | `components/forms/gst-number-input.tsx` |
| 9 | TanStack Query hooks — `useCustomers`, `useCreateCustomer`, `useInquiries` | `hooks/api/` |

**Flex Tasks (Dev 3 — assists Web):**

| # | Task |
|---|------|
| 1 | Build reusable status badge component |
| 2 | Build reusable currency display component (₹ formatting) |
| 3 | Build confirm dialog component |
| 4 | Build empty state + loading skeleton components |

**Sprint 2 Deliverables:**
- [ ] Customer CRUD working (API + Web)
- [ ] Customer search by name/mobile/email
- [ ] Inquiry form submission + follow-up tracking
- [ ] Inquiry → Order conversion flow
- [ ] Reusable form components library started

---

### SPRINT 3 — Order Management (Core)

**Goal:** Create orders with items, link to customer and measurements

**API Tasks (Dev 1):**

| # | Task | Tables |
|---|------|--------|
| 1 | `Order` model with all relationships | orders |
| 2 | `OrderController` — list (filterable), create, show (full detail), update | orders |
| 3 | `OrderService` — create order with auto-generated order number | orders, order_number_sequences |
| 4 | `OrderNumberGenerator` service | order_number_sequences |
| 5 | `OrderObserver` — auto-generate number on create | orders |
| 6 | `OrderItem` model + `OrderItemController` — add/update/remove items | order_items |
| 7 | `MeasurementProfile` + `MeasurementRecord` + `MeasurementValue` models | Tables 11–15 |
| 8 | `MeasurementProfileController` + `MeasurementRecordController` | measurements |
| 9 | `MeasurementService` — create profile, add record, fetch history | measurements |
| 10 | `OrderResource`, `OrderDetailResource`, `OrderItemResource` | — |
| 11 | Feature tests for order creation + measurement linking | Tests |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Order list page — data table with status/priority/date filters | `orders/order-list-page.tsx` |
| 2 | Order form page — customer selection, occasion, priority, delivery date | `orders/order-form-page.tsx` |
| 3 | Order form — add multiple items (item type dropdown, quantity, description) | `orders/components/order-items-section.tsx` |
| 4 | Order form — delivery address (use customer address toggle) | `orders/order-form-page.tsx` |
| 5 | Order detail page — header info, items list, status badge | `orders/order-detail-page.tsx` |
| 6 | Measurement page — profile selector, create profile | `measurements/measurement-page.tsx` |
| 7 | Measurement form — input all measurement types with units | `measurements/components/measurement-form.tsx` |
| 8 | Measurement history view — compare previous records | `measurements/components/measurement-history.tsx` |
| 9 | Reusable date picker (Indian format DD/MM/YYYY) | `components/forms/date-picker.tsx` |
| 10 | TanStack Query hooks — `useOrders`, `useCreateOrder`, `useMeasurements` | `hooks/api/` |

**Flex Tasks (Dev 3 — assists API):**

| # | Task |
|---|------|
| 1 | `TenantMeasurementSetting` model + API (measurement unit config) |
| 2 | `MeasurementType` model + default seeder validation |
| 3 | Write all Form Request classes for orders + measurements |
| 4 | Implement order delivery address copy logic |

**Sprint 3 Deliverables:**
- [ ] Order creation with auto-generated order number
- [ ] Multiple items per order
- [ ] Measurement profiles (per customer, per occasion)
- [ ] Measurement records with history tracking
- [ ] Order list with filtering and pagination

---

### SPRINT 4 — Order Detail (Fabric, Embellishment, Stitching)

**Goal:** Complete order item configuration — fabric, embellishment work, stitching specs, additional works

**API Tasks (Dev 1):**

| # | Task | Tables |
|---|------|--------|
| 1 | `ItemFabric` model + controller — CRUD per order item | item_fabrics |
| 2 | `ItemFabricObserver` — auto-calculate `total_fabric_cost` | item_fabrics |
| 3 | `ItemEmbellishment` model + controller — multiple per item | item_embellishments |
| 4 | `ItemEmbellishmentZone` model — link embellishments to zones | item_embellishment_zones |
| 5 | `ItemStitchingSpec` model + controller — stitching details per item | item_stitching_specs |
| 6 | `ItemAdditionalWork` model + controller — extra work per item | item_additional_works |
| 7 | File upload API — photo upload for fabric, work samples, designs | FileUploadService |
| 8 | `FileUploadService` — validate, compress (Intervention Image), store to S3 | — |
| 9 | Update `OrderDetailResource` — include all sub-resources (fabric, embellishments, stitching, additional) | — |
| 10 | Feature tests for all item detail endpoints | Tests |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Fabric detail form — name, meters, color, panno, price per meter, auto total | `orders/components/fabric-detail-form.tsx` |
| 2 | Embellishment form — work type, zone selection (multi-select), worker assignment, price | `orders/components/embellishment-form.tsx` |
| 3 | Stitching spec form — pad, cancan, neck patterns, collar/sleeve/belt/gher comments | `orders/components/stitching-spec-form.tsx` |
| 4 | Additional work form — description, price (tassels, custom requirements) | `orders/components/additional-work-form.tsx` |
| 5 | Order detail page — tabbed view (Fabric / Embellishments / Stitching / Additional) | `orders/order-detail-page.tsx` |
| 6 | File upload component — drag-and-drop, preview, compress | `components/forms/file-upload.tsx` |
| 7 | Photo gallery view for order items (fabric ref, design ref, work sample) | Shared component |
| 8 | Currency input component (₹ formatted) | `components/forms/currency-input.tsx` |

**Flex Tasks (Dev 3 — assists API):**

| # | Task |
|---|------|
| 1 | Write all Form Request classes (fabric, embellishment, stitching, additional work) |
| 2 | Implement embellishment zone multi-select API logic |
| 3 | Write image compression + S3 upload integration tests |

**Sprint 4 Deliverables:**
- [ ] Full order item configuration (fabric, embellishment, stitching, additional)
- [ ] Photo upload for fabric, design references, work samples
- [ ] Auto-calculated fabric costs
- [ ] Embellishment zone selection
- [ ] Tabbed order detail view

---

### SPRINT 5 — Workflow & Worker Management

**Goal:** 21-stage workflow board, worker management with skill mapping, task assignments

> **Dev 3 starts Flutter setup in parallel from this sprint**

**API Tasks (Dev 1):**

| # | Task | Tables |
|---|------|--------|
| 1 | `WorkflowStage` model (all 21 stages seeded) | workflow_stages |
| 2 | `OrderWorkflowTask` model + `WorkflowController` | order_workflow_tasks |
| 3 | `WorkflowService` — initialize all tasks on order confirm, validate progression | order_workflow_tasks |
| 4 | Workflow progression logic — mandatory/skippable stage enforcement | order_workflow_tasks |
| 5 | `WorkflowTaskComment` model + add comment endpoint | workflow_task_comments |
| 6 | Events: `WorkflowTaskStarted`, `WorkflowTaskCompleted` | Events |
| 7 | Listeners: `ValidateWorkflowProgression`, `UpdateOrderStatusFromWorkflow` | Listeners |
| 8 | `Worker` model + `WorkerController` — CRUD | workers |
| 9 | `WorkerSkill` model — skill mapping with rate override | worker_skills |
| 10 | `WorkerAssignmentService` — filter workers by skill for assignment | worker_skills |
| 11 | Kanban board API endpoint (`/workflow/board`) — grouped by stage | — |
| 12 | My tasks API endpoint (`/workflow/tasks`) — filtered by assigned_to | — |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Workflow board page — Kanban view with drag-and-drop (dnd-kit) | `workflow/workflow-board-page.tsx` |
| 2 | Kanban column component — one per workflow stage | `workflow/components/kanban-column.tsx` |
| 3 | Kanban card component — order info, status, assigned worker | `workflow/components/kanban-card.tsx` |
| 4 | Task detail drawer — side panel with task info, comments, photo upload | `workflow/components/task-detail-drawer.tsx` |
| 5 | Task comments section | `workflow/components/task-comments.tsx` |
| 6 | Worker list page — data table with skill filters | `workers/worker-list-page.tsx` |
| 7 | Worker form page — create/edit with skill management | `workers/worker-form-page.tsx` |
| 8 | Skill chip component — display worker skills | `workers/components/skill-chip-widget.tsx` |
| 9 | Settings — Workflow stage manager (customize, reorder stages) | `settings/components/workflow-stage-manager.tsx` |

**Flutter Tasks (Dev 3 — starts mobile):**

| # | Task | Notes |
|---|------|-------|
| 1 | Initialize Flutter project (apps/mobile/) | Project setup |
| 2 | Setup Riverpod, Dio, GoRouter, Hive | Dependencies |
| 3 | Configure app theme (colors, typography, dimensions) | `config/theme/` |
| 4 | Setup Dio API client with auth + tenant interceptors | `data/api/` |
| 5 | Build login screen + auth flow | `features/auth/` |
| 6 | Build app shell (bottom nav, drawer) | Navigation |
| 7 | Setup FCM (Firebase Cloud Messaging) | Push notification base |
| 8 | Setup i18n (English, Gujarati, Hindi ARB files) | `l10n/` |

**Sprint 5 Deliverables:**
- [ ] Kanban workflow board with drag-and-drop
- [ ] 21-stage workflow with mandatory/skip enforcement
- [ ] Task assignment to workers
- [ ] Worker CRUD with skill mapping
- [ ] Task comments and photo upload
- [ ] Flutter app: login working, shell navigation ready

---

### SPRINT 6 — Cost Estimation & Invoicing

**Goal:** Owner-only cost estimation, GST/Non-GST invoicing with split invoice support

**API Tasks (Dev 1):**

| # | Task | Tables |
|---|------|--------|
| 1 | `ItemCostEstimate` model + `CostEstimateController` (owner-only policy) | item_cost_estimates |
| 2 | `CostCalculationService` — auto-calculate totals from fabric + work + stitching + additional | item_cost_estimates |
| 3 | `CostEstimatePolicy` — only owner role can view/edit | Policies |
| 4 | `Invoice` model + `InvoiceController` — create, list, detail, PDF download | invoices |
| 5 | `InvoiceItem` model | invoice_items |
| 6 | `InvoiceService` — create GST/Non-GST invoices, snapshot customer data | invoices |
| 7 | `InvoiceNumberGenerator` — separate sequences for GST/Non-GST | invoice_number_sequences |
| 8 | `InvoiceObserver` — auto-generate number, calculate GST | invoices |
| 9 | `GstCalculationService` — CGST/SGST (intra-state) vs IGST (inter-state) | invoices |
| 10 | Hidden GST calculation for non-GST invoices | invoices |
| 11 | E-way bill validation (required if GST invoice > ₹50,000 inter-state) | invoices |
| 12 | `InvoicePdfService` — generate invoice PDF (DomPDF) | — |
| 13 | Unit tests for GST calculations + invoice number generation | Tests |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Cost estimation page — breakdown table (fabric, work, stitching, other, staff, packing) | `cost-estimation/cost-estimate-page.tsx` |
| 2 | Cost estimation — auto-calculated totals, profit margin display | `cost-estimation/components/cost-breakdown-table.tsx` |
| 3 | Cost estimation — role guard (owner only) | Route guard |
| 4 | Invoice list page — table with type/status/date filters | `invoices/invoice-list-page.tsx` |
| 5 | Create invoice page — select order, choose GST/Non-GST, add line items | `invoices/create-invoice-page.tsx` |
| 6 | GST calculation preview — live CGST/SGST/IGST breakdown | `invoices/components/gst-calculation-preview.tsx` |
| 7 | Invoice detail page — full invoice with tax breakdown | `invoices/invoice-detail-page.tsx` |
| 8 | Invoice PDF preview + download | `invoices/components/invoice-pdf-preview.tsx` |
| 9 | Split invoicing UI — create GST + Non-GST invoice for same order | Invoice form |

**Flutter Tasks (Dev 3 — mobile continues):**

| # | Task | Notes |
|---|------|-------|
| 1 | Build all data models (customer, order, measurement, master data) | `data/models/` |
| 2 | Build all API services (customer, order, measurement, master) | `data/api/services/` |
| 3 | Build all repositories | `data/repositories/` |
| 4 | Customer list screen + search | `features/customer/` |
| 5 | Customer detail screen | `features/customer/` |
| 6 | Customer form screen (create/edit) | `features/customer/` |
| 7 | Master data providers (cached item types, work types, etc.) | `providers/master/` |

**Sprint 6 Deliverables:**
- [ ] Cost estimation sheet (owner only) with auto-calculations
- [ ] GST invoice generation with CGST/SGST/IGST
- [ ] Non-GST invoice with hidden GST recovery
- [ ] Split invoicing (GST + Non-GST for same order)
- [ ] Invoice PDF generation + download
- [ ] E-way bill number field for applicable invoices
- [ ] Flutter: Customer module complete

---

### SPRINT 7 — Payments, Reports & Dashboard

**Goal:** Payment recording, payment summary, reports, and dashboard

**API Tasks (Dev 1):**

| # | Task | Tables |
|---|------|--------|
| 1 | `Payment` model + `PaymentController` — record payment, list | payments |
| 2 | `PaymentService` — record payment, update invoice status | payments |
| 3 | `PaymentObserver` — trigger summary recalculation | payments |
| 4 | `OrderPaymentSummary` model — auto-recalculate on payment events | order_payment_summary |
| 5 | Listener: `RecalculatePaymentSummary` | Listeners |
| 6 | Listener: `UpdateInvoiceStatus` (mark paid/partially_paid) | Listeners |
| 7 | `ReportController` — revenue, GST summary, worker performance, delivery tracker | — |
| 8 | `RevenueReportService` — daily/weekly/monthly/yearly revenue | — |
| 9 | `GstReportService` — GST filing summary (CGST/SGST/IGST totals) | — |
| 10 | `DeliveryTrackerService` — upcoming/overdue deliveries | — |
| 11 | Dashboard API endpoint — stats, recent orders, pending tasks | — |
| 12 | Excel export endpoint (`/reports/export/{type}`) using Maatwebsite | — |

**Web Tasks (Dev 2):**

| # | Task | Pages |
|---|------|-------|
| 1 | Payment list page — table with type/mode/date filters | `payments/payment-list-page.tsx` |
| 2 | Record payment page — form with mode selection, reference number | `payments/record-payment-page.tsx` |
| 3 | Payment summary card — total, paid, balance due, Ughrani | `payments/components/payment-summary-card.tsx` |
| 4 | Payment summary in order detail page | Order detail integration |
| 5 | Dashboard page — stats cards (orders, revenue, pending, overdue) | `dashboard/dashboard-page.tsx` |
| 6 | Dashboard — revenue chart (Recharts) | `dashboard/components/revenue-chart.tsx` |
| 7 | Dashboard — recent orders list | `dashboard/components/recent-orders.tsx` |
| 8 | Dashboard — pending tasks list | `dashboard/components/pending-tasks.tsx` |
| 9 | Dashboard — delivery calendar | `dashboard/components/delivery-calendar.tsx` |
| 10 | Reports page — revenue, GST, worker performance, delivery tracker | `reports/` |
| 11 | Excel export buttons on reports | Reports integration |

**Flutter Tasks (Dev 3 — mobile continues):**

| # | Task | Notes |
|---|------|-------|
| 1 | Order list screen with filters | `features/order/` |
| 2 | Order detail screen — view items, fabric, embellishment, stitching | `features/order/` |
| 3 | Order form screen — create order (customer select, items, occasion) | `features/order/` |
| 4 | Measurement capture screen — input measurements with camera | `features/measurement/` |
| 5 | Measurement profile screen — view/select profiles | `features/measurement/` |
| 6 | Photo capture widget — camera, compress, upload | `core/widgets/image/` |

**Sprint 7 Deliverables:**
- [ ] Payment recording with mode selection (cash, UPI, card, bank, cheque)
- [ ] Auto-calculated payment summary per order (Ughrani tracking)
- [ ] Dashboard with stats, charts, calendar
- [ ] Revenue + GST + delivery reports
- [ ] Excel export for reports
- [ ] Flutter: Order + Measurement modules complete

---

### SPRINT 8 — Flutter: Workflow, Invoicing & Payments

**Goal:** Complete Flutter app core features — workflow tasks, cost estimation, invoicing, payments

> **Full team shifts to Flutter polish + integration from this sprint**

**Flutter Tasks (Dev 3 + Dev 2):**

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 1 | Workflow board screen (simplified Kanban for mobile) | Dev 3 | `features/workflow/` |
| 2 | My tasks screen — staff view of assigned tasks | Dev 3 | `features/workflow/` |
| 3 | Task card component — tap to update status | Dev 3 | `features/workflow/widgets/` |
| 4 | Task comment widget — add comments + photos | Dev 3 | `features/workflow/widgets/` |
| 5 | Cost estimation screen (owner only) | Dev 2 | `features/cost_estimation/` |
| 6 | Invoice list screen | Dev 2 | `features/invoice/` |
| 7 | Invoice detail screen — view with GST breakdown | Dev 2 | `features/invoice/` |
| 8 | Payment list screen | Dev 2 | `features/payment/` |
| 9 | Record payment screen — mode selection, amount, reference | Dev 2 | `features/payment/` |
| 10 | Payment summary card widget | Dev 2 | `features/payment/widgets/` |

**API Tasks (Dev 1 — hardening + notifications):**

| # | Task | Notes |
|---|------|-------|
| 1 | Setup FCM integration — send push to Flutter devices | Notifications |
| 2 | `FcmChannel` — custom Laravel notification channel | Channels |
| 3 | `OrderConfirmedNotification` — push to assigned staff | Notifications |
| 4 | `WorkflowTaskAssignedNotification` — push when task assigned | Notifications |
| 5 | `PaymentReceivedNotification` — push to owner + SMS/WhatsApp to customer | Notifications |
| 6 | Setup Laravel Task Scheduling — delivery reminders, payment overdue | Commands |
| 7 | `SendDeliveryReminders` command — daily check | Commands |
| 8 | `SendPaymentOverdueAlerts` command — daily check | Commands |
| 9 | API performance optimization — eager loading, query optimization | Performance |
| 10 | API response caching for master data endpoints | Redis |

**Sprint 8 Deliverables:**
- [ ] Flutter: Workflow + task management complete
- [ ] Flutter: Cost estimation (owner), invoicing, payments
- [ ] Push notifications working (FCM → Flutter)
- [ ] Scheduled delivery reminders + payment overdue alerts
- [ ] API response caching for master data

---

### SPRINT 9 — Notifications, Offline Support & Polish

**Goal:** Full notification system, offline support for Flutter, UI polish

**API Tasks (Dev 1):**

| # | Task | Notes |
|---|------|-------|
| 1 | SMS integration (MSG91) — `SmsService` | Notification |
| 2 | WhatsApp Business API integration — `WhatsAppService` | Notification |
| 3 | `WhatsAppChannel` — custom Laravel notification channel | Channels |
| 4 | SMS: Order confirmed, payment received, ready for delivery | Templates |
| 5 | WhatsApp: Order confirmed, delivery reminder, payment receipt | Templates |
| 6 | `DeliveryReminderNotification` — WhatsApp + push | Notifications |
| 7 | `PaymentOverdueNotification` — SMS + push | Notifications |
| 8 | Audit log auto-population via `Auditable` trait verification | audit_logs |
| 9 | API rate limiting configuration (60 req/min per user) | Middleware |

**Flutter Tasks (Dev 3):**

| # | Task | Notes |
|---|------|-------|
| 1 | Dashboard screen — stats, recent orders, pending tasks | `features/dashboard/` |
| 2 | Worker list screen | `features/worker/` |
| 3 | Worker form screen with skill management | `features/worker/` |
| 4 | Notification list screen — in-app notification center | `features/notifications/` |
| 5 | FCM service — token registration, background handling | `features/notifications/services/` |
| 6 | Offline queue — store actions offline, sync when connected | `data/local/offline_queue.dart` |
| 7 | Connectivity monitoring (connectivity_plus) | `providers/common/` |
| 8 | Settings screen — profile, language selector | `features/settings/` |

**Web Tasks (Dev 2 — polish):**

| # | Task | Notes |
|---|------|-------|
| 1 | Workflow stage manager — customize stages in settings | `settings/components/` |
| 2 | Invoice sequence settings — customize prefixes, patterns | `settings/components/` |
| 3 | Global search — search orders, customers from header | `components/layout/header.tsx` |
| 4 | Notification dropdown in header — recent notifications | `components/layout/header.tsx` |
| 5 | Error boundary implementation | `components/shared/error-boundary.tsx` |
| 6 | Loading skeletons for all list pages | All list pages |
| 7 | Empty state illustrations for all modules | All pages |
| 8 | Responsive adjustments (tablet view for web) | CSS |

**Sprint 9 Deliverables:**
- [ ] SMS notifications working (order, payment, delivery)
- [ ] WhatsApp notifications working (order, delivery, payment)
- [ ] Flutter: Dashboard, workers, notifications, settings
- [ ] Flutter: Offline queue with auto-sync
- [ ] Web: Global search, notification center, polished UI

---

### SPRINT 10 — Advanced Features & Financial Year

**Goal:** Financial year handling, report enhancements, advanced features

**API Tasks (Dev 1):**

| # | Task | Notes |
|---|------|-------|
| 1 | `ResetFinancialYearSequences` command — reset order/invoice sequences on FY change | Commands |
| 2 | Financial year-aware reporting (FY 2024-25 format) | Reports |
| 3 | ITC tracking — input tax credit calculations | tenant_settings |
| 4 | Worker performance report API — orders completed, average time, rating | Reports |
| 5 | Order PDF generation — printable order sheet with measurements | OrderPdfService |
| 6 | Bulk status update API — update multiple orders' workflow tasks at once | Workflow |
| 7 | Customer export API — Excel export | Export |
| 8 | Inquiry analytics API — conversion rate, source analysis | Reports |

**Web Tasks (Dev 2):**

| # | Task | Notes |
|---|------|-------|
| 1 | Worker performance report page | `reports/components/` |
| 2 | Inquiry analytics — source-wise conversion chart | `reports/components/` |
| 3 | Order PDF preview + print | Order detail page |
| 4 | Bulk workflow update UI — select multiple orders, update stage | Workflow board |
| 5 | Customer export button (Excel) | Customer list page |
| 6 | Financial year selector in reports | Reports pages |
| 7 | ITC tracking view in GST report | Reports |

**Flutter Tasks (Dev 3):**

| # | Task | Notes |
|---|------|-------|
| 1 | PDF viewer — view invoices, order sheets | `flutter_pdfview` integration |
| 2 | Fabric detail entry in order form | `features/order/widgets/` |
| 3 | Embellishment entry in order form | `features/order/widgets/` |
| 4 | Stitching spec entry in order form | `features/order/widgets/` |
| 5 | Additional work entry | `features/order/widgets/` |
| 6 | Design reference photo attachment in order | Camera integration |
| 7 | Share invoice PDF via WhatsApp/email from app | Share plugin |

**Sprint 10 Deliverables:**
- [ ] Financial year handling (sequence reset, FY-aware reports)
- [ ] Worker performance + inquiry analytics reports
- [ ] Order PDF generation + print
- [ ] Bulk workflow updates
- [ ] Flutter: Full order detail entry (fabric, embellishment, stitching)
- [ ] Flutter: PDF viewing + sharing

---

### SPRINT 11 — Integration Testing & QA

**Goal:** End-to-end testing, bug fixes, performance optimization, security hardening

**All Developers — Testing Focus:**

| # | Task | Owner | Platform |
|---|------|-------|----------|
| 1 | End-to-end flow: Inquiry → Customer → Order → Workflow → Invoice → Payment | Dev 1 | API |
| 2 | Multi-tenant isolation testing — verify no data leakage | Dev 1 | API |
| 3 | Role-based access testing — verify owner/manager/staff permissions | Dev 1 | API |
| 4 | GST calculation accuracy testing — all scenarios (intra/inter-state, hidden GST) | Dev 1 | API |
| 5 | Payment summary accuracy — advance, partial, full, overpaid, refund | Dev 1 | API |
| 6 | Web: Cross-browser testing (Chrome, Firefox, Safari, Edge) | Dev 2 | Web |
| 7 | Web: Responsive testing (desktop, tablet) | Dev 2 | Web |
| 8 | Web: Form validation testing — all forms | Dev 2 | Web |
| 9 | Web: Performance audit (Lighthouse, bundle size) | Dev 2 | Web |
| 10 | Flutter: Android testing (multiple devices/versions) | Dev 3 | Mobile |
| 11 | Flutter: iOS testing (multiple devices/versions) | Dev 3 | Mobile |
| 12 | Flutter: Offline → Online sync testing | Dev 3 | Mobile |
| 13 | Flutter: Push notification testing (foreground/background/terminated) | Dev 3 | Mobile |
| 14 | Security audit — SQL injection, XSS, CSRF, auth bypass | Dev 1 | API |
| 15 | Load testing — simulate concurrent users | Dev 1 | API |
| 16 | Fix all critical and high-priority bugs | All | All |

**Sprint 11 Deliverables:**
- [ ] All end-to-end flows verified
- [ ] Multi-tenant isolation confirmed
- [ ] No critical/high bugs remaining
- [ ] Performance benchmarks met
- [ ] Security audit passed

---

### SPRINT 12 — Pre-Launch & Deployment

**Goal:** Production deployment, app store submission, client onboarding

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 1 | Production server setup (DigitalOcean/AWS) — Nginx, PHP-FPM, MySQL, Redis | Dev 1 | Infrastructure |
| 2 | SSL certificate (Let's Encrypt) for API + Web domains | Dev 1 | Security |
| 3 | Production .env configuration | Dev 1 | Config |
| 4 | Database production migration + seed | Dev 1 | Database |
| 5 | S3/Spaces production bucket setup | Dev 1 | Storage |
| 6 | CI/CD pipeline — auto-deploy to production on release tag | Dev 1 | DevOps |
| 7 | React web panel production build + deploy (Vercel/Nginx) | Dev 2 | Web |
| 8 | Web panel custom domain setup | Dev 2 | Web |
| 9 | Flutter Android build — signed APK/AAB | Dev 3 | Mobile |
| 10 | Flutter iOS build — Archive, provisioning profiles | Dev 3 | Mobile |
| 11 | Google Play Store submission (internal testing → production) | Dev 3 | Distribution |
| 12 | Apple App Store submission (TestFlight → production) | Dev 3 | Distribution |
| 13 | Create demo tenant with sample data for client walkthrough | Dev 1 | Onboarding |
| 14 | Client onboarding — create production tenant for Naari Arts | Dev 1 | Onboarding |
| 15 | Seed Naari Arts master data (item types, work types, zones, stages) | Dev 1 | Onboarding |
| 16 | Create owner user account for client | Dev 1 | Onboarding |
| 17 | Automated MySQL backup setup (daily → S3) | Dev 1 | Ops |
| 18 | Monitoring setup — Sentry alerts, uptime monitoring | Dev 1 | Ops |
| 19 | SMS/WhatsApp provider production credentials | Dev 1 | Integrations |
| 20 | Final client walkthrough and handover | All | Delivery |

**Sprint 12 Deliverables:**
- [ ] API running on production server
- [ ] Web panel live on production domain
- [ ] Android app published on Google Play Store
- [ ] iOS app published on Apple App Store
- [ ] Client tenant created with master data
- [ ] Automated backups running
- [ ] Monitoring + alerting active
- [ ] Client handover completed

---

### Sprint Summary Table

| Sprint | Focus | API | Web | Flutter |
|--------|-------|-----|-----|---------|
| **S0** | Project Setup & Infrastructure | ✅ Setup + 42 migrations | ✅ Shell + UI framework | ⬜ Not started |
| **S1** | Auth & Tenant Settings | ✅ Auth + RBAC + Master CRUD | ✅ Login + Settings pages | ⬜ Assists API |
| **S2** | Customers & Inquiries | ✅ Customer + Inquiry API | ✅ Customer + Inquiry pages | ⬜ Assists Web |
| **S3** | Order Management (Core) | ✅ Orders + Items + Measurements | ✅ Order + Measurement pages | ⬜ Assists API |
| **S4** | Order Detail (Fabric/Work) | ✅ Fabric + Embellishment + Stitching | ✅ Order detail forms | ⬜ Assists API |
| **S5** | Workflow & Workers | ✅ Workflow + Workers API | ✅ Kanban board + Worker pages | 🟡 Setup + Auth |
| **S6** | Cost Estimation & Invoicing | ✅ Cost + Invoice + GST | ✅ Cost + Invoice pages | 🟡 Customer module |
| **S7** | Payments & Reports | ✅ Payments + Reports + Dashboard | ✅ Payment + Report + Dashboard | 🟡 Order + Measurement |
| **S8** | Flutter Core Features | ✅ FCM + Scheduling + Caching | ⬜ — | ✅ Workflow + Invoice + Payment |
| **S9** | Notifications & Polish | ✅ SMS + WhatsApp integration | ✅ Polish + Search + UX | ✅ Dashboard + Offline + Notif |
| **S10** | Advanced Features | ✅ FY handling + Advanced reports | ✅ Reports + Bulk actions | ✅ Order detail + PDF |
| **S11** | Testing & QA | ✅ E2E + Security + Load test | ✅ Cross-browser + Responsive | ✅ Device testing + Offline |
| **S12** | Launch & Deployment | ✅ Production infra + Monitoring | ✅ Production deploy | ✅ App Store submission |

**Legend:** ✅ Primary focus | 🟡 Parallel/starting | ⬜ Not applicable

---

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| WhatsApp Business API approval delay | Notification delay | Apply early (Sprint 0); fallback to SMS-only initially |
| App Store review rejection (iOS) | Launch delay | Submit TestFlight build by Sprint 10; address issues in Sprint 11 |
| GST calculation edge cases | Invoice errors | Extensive unit testing in Sprint 6; cross-verify with CA |
| Multi-tenant data leakage | Security breach | Dedicated testing in Sprint 11; global scope on every model |
| Offline sync conflicts | Data inconsistency | Last-write-wins strategy; queue audit in Sprint 9 |
| Third-party SMS/WhatsApp rate limits | Notification failures | Queue-based sending; retry logic; fallback channels |
| Team member unavailability | Sprint delay | Cross-train devs; document all architecture decisions |

---

### Definition of Done (Per Sprint)

Each sprint is considered **Done** when:
1. All tasks completed and code merged to `develop` branch
2. API endpoints tested (unit + feature tests passing)
3. Web pages functional and responsive
4. Flutter screens functional on Android + iOS (when applicable)
5. No critical or high-priority bugs open
6. Code reviewed by at least one other team member
7. Sprint demo delivered to stakeholder

---

## Next Steps

1. ✅ Foundation tables (Tables 1-2)
2. ✅ Master data tables (Tables 3-8)
3. ✅ Customer management tables (Tables 9-10)
4. ✅ Measurement system tables (Tables 11-15)
5. ✅ Order configuration tables (Tables 16-18)
6. ✅ Order management tables (Tables 19-25)
7. ✅ Worker management tables (Tables 26-27)
8. ✅ Cost estimation table (Table 28)
9. ✅ Invoicing tables (Tables 29-31)
10. ✅ Payment tables (Tables 32-33)
11. ✅ Workflow tables (Tables 34-36)
12. ✅ User management tables (Tables 37-42)
13. ✅ Define technical stack (Flutter + React + Laravel + MySQL)
14. ✅ Project folder structure (Flutter + React + Laravel)
15. ✅ Development sprint planning (13 sprints)
16. ⏳ Create detailed wireframes/mockups
17. ⏳ Begin Sprint 0 — Project Setup & Infrastructure

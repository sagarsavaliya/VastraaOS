# Naari Arts — Custom Order Management System
## System Overview & Feature Walkthrough

**Prepared for:** Sagar Babariya, Naari Arts, Surat
**Prepared by:** Akshara Technologies

---

## What Are We Building?

We are building a complete digital system to manage your custom fashion order business
from start to finish. Think of it as your **digital workshop manager** — it will handle
everything from the moment a customer contacts you, to the final delivery of the garment.

The system has two parts:

1. **Mobile App (Android + iOS)** — For you, your managers, and your staff to use
   on the shop floor, during measurements, and while tracking daily work.

2. **Web Admin Panel** — A full-featured computer dashboard for managing orders,
   generating invoices, viewing reports, and configuring your business settings.

Both the app and the web panel work together. Any update made on one will instantly
reflect on the other.

---

## How Does a Customer's Journey Work in the System?

Here is the complete flow, from the first inquiry to the final delivery:

```
Customer Inquiry
      │
      ▼
Customer Record Created
      │
      ▼
Body Measurements Taken
      │
      ▼
Order Created (Gown, Kurti, Chaniya Choli, etc.)
      │
      ▼
Fabric Details Added
      │
      ▼
Embellishment Work Assigned (Jardoshi, Moti, Kutchi, etc.)
      │
      ▼
Stitching Specifications Recorded
      │
      ▼
Cost Estimation (Owner Only — Private)
      │
      ▼
21-Stage Workflow Tracking
      │
      ▼
Invoice Generated (GST / Non-GST / Split)
      │
      ▼
Payments Recorded (Advance → Partial → Final)
      │
      ▼
Delivery to Customer
```

Let us walk through each step in detail.

---

## 1. Customer Inquiry

When a new or existing customer reaches out (via phone, WhatsApp, Instagram, walk-in,
or any other source), your team will fill a simple inquiry form in the system.

**What the form captures:**
- Customer name and mobile number
- How they found you (Facebook, Instagram, Reference, Walk-in, etc.)
- Whether they prefer a store visit or video call
- Which occasion the garment is for (Wedding, Navratri, Diwali, Party, etc.)
- Their approximate budget range
- Which items they are interested in (Gown, Chaniya Choli, Kurti, etc.)
- Any additional notes

**What happens next:**
- If the customer already exists in the system, it will automatically link the inquiry
  to their existing profile.
- If the customer is new, their details are saved for future reference.
- You can mark the inquiry as Pending, Contacted, Converted, or Lost.
- When the customer confirms, the inquiry is converted into an order with one click.

---

## 2. Customer Management

Every customer gets a detailed profile in the system:

- Name, mobile, alternate mobile, email
- Full address
- GST number (if applicable)
- Customer category — Regular, VIP, or Wholesale
- Preferred language — Hindi, Gujarati, or English
- Complete order history — every order they have ever placed
- All measurement profiles — saved and reusable for future orders

**Searching customers** is fast — you can search by name, mobile number, or email
instantly from any screen.

---

## 3. Body Measurements

This is one of the most important features for your business.

**How it works:**

- Each customer can have **multiple measurement profiles**. For example:
  - "Wedding Fit" — slightly tighter fit for wedding occasions
  - "Casual Fit" — comfortable everyday fit
  - "Navratri Fit" — specific for garba outfits

- Each profile stores a **complete history** of measurements. Every time you re-measure
  a customer, the old measurements are preserved and the new ones are saved on top.
  This way, you can always compare previous measurements.

- **Measurement types** include:
  - Upper Body: Bust, Waist, Hip, Shoulder, Arm Length, Arm Hole, Upper Arm,
    Wrist, Front Neck Depth, Back Neck Depth, Blouse Length
  - Lower Body: Waist, Hip, Length, Inseam, Thigh, Knee, Ankle
  - General: Height, Weight

- You can choose whether to record measurements in **inches or centimeters**
  — this is configurable in your settings.

- On the mobile app, your staff can **take a photo** alongside the measurements
  for reference.

---

## 4. Creating an Order

When a customer confirms, you create an order. Each order contains:

- **Customer** — selected from existing customers or created on the spot
- **Occasion** — Wedding, Navratri, Diwali, Party, etc.
- **Priority** — Normal, Urgent, or Rush/Express (with automatic surcharge)
- **Expected delivery date**
- **Delivery address** — uses customer's address by default, or you can enter a
  different one
- **Measurement profile** — select which measurement set to use for this order
- **Order number** — automatically generated (e.g., ORD/2025-26/0001)
  You can customize the format in settings.

### Multiple Items Per Order

One order can contain **multiple garment items**. For example, a single wedding order
might include:
- 1 x Gown
- 1 x Chaniya Choli
- 2 x Kurti
- 1 x Shrug

Each item is tracked separately with its own fabric, embellishment, and stitching
details.

---

## 5. Item Details — Fabric, Embellishment, Stitching

For **each item** in an order, the system records:

### Fabric Details
- Fabric name, meters required, panno (pattern), color
- Suggested stores for purchase
- Price per meter → **total fabric cost is auto-calculated**
- Fabric reference photo

### Embellishment / Work Details
- Type of work — Jardoshi, Moti, Kutchi, Bharat Kam, Embroidery, Aari Work, etc.
- **Zones** where the work will be applied — Front Neck, Back Neck, Sleeve,
  Kotho, Border, Belt
- Assigned worker for each type of work
- Days/hours required and work price
- Reference photo for the work design

### Stitching Specifications
- Pad required (yes/no), pad size and pattern
- Cancan required (yes/no)
- Front and back neck pattern and length
- Collar, sleeve, belt, and gher (flare) comments
- Assigned stitcher
- Stitching price and estimated days

### Additional Work
- Any extra requirements like tassels, custom buttons, special finishing
- Price for each additional work item

**All photos** — fabric reference, design reference, work sample — can be captured
directly from the mobile app camera and uploaded to the system.

---

## 6. Cost Estimation (Owner Only — Private)

This is a **private section** visible only to the business owner. No manager or staff
member can see this.

The system automatically calculates the total cost of each item:

```
Total Cost = Fabric Cost + Work Cost + Stitching Cost + Other Work + Staff Expense + Packing

Profit = Selling Price - Total Cost
```

It also calculates:
- Total days required for the item
- Estimated delivery date based on the order date + total days
- Profit margin

This helps you make pricing decisions and track profitability per order.

---

## 7. 21-Stage Workflow Tracking

This is the heart of the system. Every order goes through **21 stages** from start
to finish. You and your team can track exactly where each order stands at any moment.

**The 21 Stages:**

| Stage | What Happens |
|-------|-------------|
| 1. Advance Received | Customer pays advance amount |
| 2. Fabric Purchase | Fabric is purchased from the market |
| 3. Fabric Dyeing | Fabric is sent for dyeing (if needed) |
| 4. Fabric Fusing | Fabric fusing process |
| 5. Work Khakha | Pattern marking on the fabric |
| 6. Work Ferma | Work is distributed to workers |
| 7. Given on Work | Fabric is handed to the worker |
| 8. Check Work Sample | Sample work is checked for quality |
| 9. Work Complete as Per Order | Worker confirms work matches the order |
| 10. Complete Work | All embellishment work is finished |
| 11. Stitching | Garment is being stitched |
| 12. Stitched as Per Order | Stitcher confirms it matches the order |
| 13. Complete Stitched | Stitching is fully done |
| 14. Other Works | Additional work (tassels, finishing, etc.) |
| 15. Other Work Checked | Additional work is quality checked |
| 16. Other Work Done | All additional work complete |
| 17. Inform Customer | Customer is notified that garment is ready |
| 18. Ready for Delivery | Garment is packed and ready |
| 19. Customer Checked | Customer tries the garment — fitting/repair if needed |
| 20. Full Payment Received | Remaining payment (Ughrani) is collected |
| 21. Completed | Order is fully done and delivered |

**How it looks on screen:**
- On the **web panel**, this appears as a **Kanban board** — like a visual board with
  columns for each stage. You can drag and drop orders between stages.
- On the **mobile app**, staff can see their assigned tasks and update the status
  with a single tap.

**Important rules:**
- Some stages are mandatory — you cannot skip them
- Some stages require a photo upload (e.g., checking work sample)
- Some stages require payment (e.g., advance received, full payment)
- You can customize which stages are mandatory or skippable in your settings

---

## 8. Invoicing & GST

The system supports both **GST and Non-GST invoicing**, including the market reality
of **split invoicing**.

### How Split Invoicing Works

For a single order worth ₹1,00,000, you can create:
- **GST Invoice:** ₹50,000 + applicable GST (with proper CGST/SGST/IGST)
- **Non-GST Invoice:** ₹50,000 (simple invoice without GST breakup)

This is how the market operates, and our system fully supports it.

### GST Features
- Automatic calculation of CGST + SGST (same state) or IGST (different state)
- HSN/SAC codes for each item type
- E-Way Bill number tracking (required for inter-state transport above ₹50,000)
- Hidden GST percentage recovery on non-GST invoices
- Input Tax Credit (ITC) tracking
- GST filing summary report

### Invoice Numbering
The system auto-generates invoice numbers based on your financial year:
- GST Invoice: `GST/2025-26/001`
- Non-GST Invoice: `INV/2025-26/001`

You can customize the prefix and format in settings.

### Invoice PDF
Every invoice can be downloaded as a **professional PDF** — ready to print or share
via WhatsApp/email.

---

## 9. Payments & Ughrani (Pending Amount)

The system tracks every rupee:

- **Advance payment** — when the customer confirms the order
- **Partial payments** — during the work process
- **Final payment** — at the time of delivery
- **Refunds** — if any amount needs to be returned

**Payment modes supported:** Cash, UPI, Card, Bank Transfer, Cheque

For each payment, the system records:
- Amount, date, and payment mode
- Reference number (UPI ref, cheque number, transaction ID)
- Which staff member received the payment

**Ughrani (Pending Amount):**
The system automatically calculates how much the customer still owes:
```
Ughrani = Total Order Value - Total Amount Paid
```

You can see the payment status at a glance:
- Pending → Advance Received → Partially Paid → Fully Paid

---

## 10. Worker Management

You can manage all your external workers (karigars) in the system:

- Worker name, mobile, address
- **Skill mapping** — which types of work each worker can do
  (e.g., Worker A does Jardoshi and Moti, Worker B does Kutchi and Aari)
- Skill level — Beginner, Intermediate, Expert
- Rate per piece / per hour / per day / fixed rate
- Bank details and UPI ID for payments

**Smart assignment:** When you assign work to a worker on an order, the system
shows you only the workers who have the matching skill. No more guesswork.

---

## 11. Who Can See What? (User Roles)

The system has three levels of access:

### Owner (You)
- Full access to everything
- Can see cost estimation and profit margins
- Can view all customer contacts and payment details
- Can configure system settings, manage users
- Can view all reports

### Manager
- Can manage orders, customers, and workflow
- Can record payments and generate invoices
- Can assign work to staff and workers
- **Cannot** see cost estimation or profit margins
- **Cannot** change system settings

### Staff
- Can only see tasks assigned to them
- Can update task status (e.g., mark "Stitching Complete")
- Can upload photos of completed work
- **Cannot** see customer contact details
- **Cannot** see payments or cost information

---

## 12. Notifications — Stay Updated Automatically

The system sends automatic notifications through multiple channels:

| Event | You (Owner) | Your Staff | Customer |
|-------|------------|-----------|----------|
| New inquiry received | Mobile push | — | — |
| Order confirmed | Mobile push | Mobile push | SMS + WhatsApp |
| Workflow stage updated | Mobile push | Mobile push | — |
| Payment received | Mobile push | — | SMS + WhatsApp |
| Garment ready for delivery | Mobile push | — | SMS + WhatsApp |
| Delivery date reminder | Mobile push | Mobile push | WhatsApp |
| Payment overdue | Mobile push | — | SMS + WhatsApp |

Your customers receive professional SMS and WhatsApp messages at key moments —
order confirmation, ready for delivery, and payment receipts.

---

## 13. Dashboard & Reports

### Dashboard (Home Screen)
When you open the system, you see:
- Total orders this month and their status
- Revenue summary
- Pending tasks that need attention
- Upcoming deliveries calendar
- Recent orders list

### Reports Available
- **Revenue Report** — daily, weekly, monthly, yearly revenue
- **GST Summary** — for GST filing (CGST/SGST/IGST totals)
- **Worker Performance** — orders completed per worker, average time
- **Delivery Tracker** — upcoming and overdue deliveries
- **Inquiry Analytics** — which sources bring the most customers

All reports can be **exported to Excel** for your records.

---

## 14. Language Support

The entire system supports three languages:
- **English**
- **Gujarati** (ગુજરાતી)
- **Hindi** (हिन्दी)

Each user can choose their preferred language. Master data like item types (Gown,
Kurti) and work types (Jardoshi, Moti) will also be available in all three languages.

---

## 15. What You Will Receive

| Deliverable | Description |
|-------------|-------------|
| **Mobile App (Android)** | Available on Google Play Store for all your staff |
| **Mobile App (iOS)** | Available on Apple App Store |
| **Web Admin Panel** | Accessible from any computer browser (Chrome, Firefox, etc.) |
| **Your Own Business URL** | e.g., naariarts.yoursaas.com |
| **Complete Data Security** | Your data is fully isolated — no other business can see it |
| **Automatic Backups** | Daily backups of all your data |
| **SMS & WhatsApp Notifications** | Automated customer communication |
| **PDF Invoices** | Professional invoice generation |
| **Excel Reports** | Downloadable business reports |

---

## 16. How We Will Build This

We will develop the system in **phases over approximately 26 weeks (6 months)**,
with regular demos every 2 weeks so you can see progress and give feedback.

### Phase 1 — Foundation (Weeks 1–4)
Setting up the system, login, and basic settings. You will see the first screens.

### Phase 2 — Customers & Orders (Weeks 5–10)
Customer management, inquiry forms, order creation, measurement recording, and
complete item detail entry (fabric, embellishment, stitching).

### Phase 3 — Workflow & Workers (Weeks 11–12)
The 21-stage tracking board and worker management with skill mapping.

### Phase 4 — Billing & Payments (Weeks 13–16)
Cost estimation, GST/Non-GST invoicing, payment recording, and dashboard with reports.

### Phase 5 — Mobile App (Weeks 11–20)
The Android and iOS app, built in parallel with Phase 3 and 4. Staff can start
using the mobile app for task updates, measurements, and photo uploads.

### Phase 6 — Final Testing & Launch (Weeks 21–26)
Complete testing on all devices, setting up your production environment, publishing
the apps on Play Store and App Store, and handing over the system to you.

**During every phase**, we will show you a working demo so you can review and
suggest changes before we move forward.

---

## 17. After Launch — Ongoing Support

After the system goes live:
- We will set up your business account with all your item types, work types,
  embellishment zones, and workflow stages
- We will create user accounts for you, your managers, and your staff
- We will provide training on how to use the system
- Bug fixes and minor adjustments are included in the support period
- Future feature additions can be discussed separately

---

## Summary

This system will digitize your entire custom order process — from the first customer
call to the final delivery. No more paper registers, no more lost measurements,
no more guessing which order is at which stage.

**Everything in one place:**
- Customer details and measurement history
- Complete order specifications with photos
- 21-stage workflow tracking visible to your entire team
- GST-compliant invoicing with split billing support
- Payment tracking with Ughrani (pending amount) visibility
- Automated SMS and WhatsApp updates to customers
- Business reports at your fingertips

---

*Document prepared by Akshara Technologies*
*For: Naari Arts, Surat*

# ReliefGrid &mdash; Disaster Relief Resource Platform

An open-standard humanitarian response and emergency supply coordination web platform engineered with semantic **HTML5**, modern **Vanilla CSS3**, and resilient client-side **JavaScript**.

---

## 🌟 Overview & Key Modules

ReliefGrid is designed to streamline multi-agency disaster response, tracking live requisitions, managing regional warehouse stockpiles, mobilizing volunteer responders, and orchestrating convoy dispatches during natural calamities.

### Core Modules:
1. **Operations Dashboard (`index.html`)**: Real-time overview of national incident priorities, key indicators, stock telemetry, and operational audit log.
2. **Relief Requests Management (`relief-requests.html`)**: Field requisition intake form with strict HTML5 validations, urgency indicators, and searchable requisition ledger.
3. **Warehouse Stock & Inventory (`inventory.html`)**: Live depot inventory tracking, SKU catalog, expiry monitoring, and stock level progress bars.
4. **Disaster Zones Tracker (`affected-areas.html`)**: Geographic tracking of affected districts, casualty counts, shelter capacities, and localized survival requirements.
5. **Resource Allocation & Convoys (`allocation.html`)**: Inter-agency dispatch matching requisitions to depot stock and convoy transport modes (air-drops, trucks, boats).
6. **Volunteer Mobilization (`volunteers.html`)**: Responder registry with blood group records, specialized disaster skillsets, and shift rosters.
7. **National Personnel Portal & Auth (`login.html`)**: Dedicated role-based authentication and responder registration portal with 1-click viva demo accounts and session persistence.

---

## 🔒 Authentication & Responder Registration

Every page features **Login** and **Sign Up** controls across three distinct touchpoints:
- **Top Emergency Ribbon**: Golden quick-action links `🔒 Login | ✍ Sign Up`.
- **Main Navigation Bar**: Dedicated action buttons `[ 🔒 Login ]` and `[ ✍ Sign Up ]`.
- **Hero Intro Banner**: On-page personnel callout for quick status switching.
- **Interactive In-Page Modal**: Click any login/signup button on any page to open the dialog popup directly without losing your place.

### Demo Responder Accounts (Password: `password123`):
| Name | Role | Agency | Clearance |
| :--- | :--- | :--- | :--- |
| **Dr. Anita Nair** | Incident Commander | NDRF HQ | Level 4 - National Ops |
| **Capt. V.K. Jadeja** | Logistics Head | Central Emergency Depots | Level 3 - Supply Chain |
| **Dr. Ashwin Menon** | Medical Officer | WHO / Red Cross Field Health | Level 2 - Field Triage |
| **Pooja Kadam** | Volunteer Responder | Civil Defense Citizen Corps | Level 1 - Community Ground |

---

## 🚀 Live Demo & GitHub Pages Setup

To host this repository directly on GitHub Pages:
1. Go to your repository on GitHub: `Settings` &rarr; `Pages`.
2. Under **Build and deployment** &rarr; **Source**, select **Deploy from a branch**.
3. Choose branch: `main` and folder: `/ (root)`.
4. Click **Save**. GitHub Pages will deploy your site to `https://<your-username>.github.io/<repository-name>/`.

---

## 💻 Tech Stack
- **Structure**: Semantic HTML5 (ARIA attributes, WCAG AA compliant forms).
- **Styling**: Vanilla CSS3 (CSS Grid, Flexbox, CSS Custom Properties, Dark/Light Tactical Theme).
- **Client Logic**: Pure JavaScript (LocalStorage persistence, Web Audio chime synthesis, DOM manipulation).
- **Zero External Dependencies**: Fast, lightweight, and fully offline-capable.

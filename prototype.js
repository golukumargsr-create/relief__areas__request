/**
 * ============================================================================
 * DISASTER RELIEF RESOURCE COORDINATION PLATFORM (RELIEFGRID)
 * Interactive Prototype Engine: prototype.js
 * 
 * Features:
 * 1. LocalStorage-backed state persistence (Requests, Inventory, Allocations, Volunteers, Areas).
 * 2. Dynamic dashboard counter updates & CSS progress bar recalculations.
 * 3. Interactive form handlers that save records, deduct stocks, and update tables in real time.
 * 4. Instant live search and priority filter toolbars on every data table.
 * 5. One-click "Quick-Fill Demo Data" for fast viva demonstrations.
 * 6. Audio/Visual emergency toast notifications with Web Audio API chime.
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Initial Seed Data
  // --------------------------------------------------------------------------
  const DEFAULT_DATA = {
    requests: [
      { id: 'REQ-2026-101', officer: 'Dr. Anita Nair', agency: 'District Health Office, Wayanad', location: 'Meppadi Camp, Wayanad (KL)', item: 'Emergency Trauma Packs & Anti-Venom', qty: '600 Kits', priority: 'Critical', status: 'In Progress', date: '2026-10-19' },
      { id: 'REQ-2026-102', officer: 'Capt. V. K. Jadeja', agency: 'NDRF 6th Battalion', location: 'Bhachau Old Town, Kutch (GJ)', item: 'Weather-Proof Family Tents', qty: '450 Tents', priority: 'Critical', status: 'Pending', date: '2026-10-19' },
      { id: 'REQ-2026-103', officer: 'P. Mohanty', agency: 'Block Dev. Officer, Rajnagar', location: 'Rajnagar Cyclone Shelter, Kendrapara (OD)', item: 'Drinking Water Cans (20-Liter)', qty: '2,500 Cans', priority: 'High', status: 'In Progress', date: '2026-10-20' },
      { id: 'REQ-2026-104', officer: 'Bikramjit Sharma', agency: 'Assam State Disaster Mgmt', location: 'Silchar Town Relief Camp (AS)', item: 'High-Calorie Ready-to-Eat Food', qty: '5,000 Packs', priority: 'High', status: 'Shortage', date: '2026-10-20' },
      { id: 'REQ-2026-105', officer: 'Suresh Rawat', agency: 'Tehsildar Office, Joshimath', location: 'Ravigram Sector, Joshimath (UK)', item: 'Thermal Fleece Blankets & Warm Mats', qty: '1,200 Units', priority: 'Medium', status: 'Delivered', date: '2026-10-18' },
      { id: 'REQ-2026-106', officer: 'Sunita Gaikwad', agency: 'Ratnagiri Municipal Relief', location: 'Chiplun Flood Shelter #2 (MH)', item: 'Chlorine Water Tablets & Bleach Bags', qty: '20,000 Tabs', priority: 'Low', status: 'Delivered', date: '2026-10-18' }
    ],
    inventory: [
      { sku: 'SKU-MED-101', name: 'Halazone Water Purification Tablets', category: 'Water & Sanitation', qty: 142000, max: 160000, unit: 'Tablets', location: 'Depot South — Ernakulam Hub (KL)', expiry: '2028-12-12' },
      { sku: 'SKU-FOD-204', name: 'High-Energy Fortified Biscuits (500g)', category: 'Food & Nutrition', qty: 7200, max: 18000, unit: 'Cartons', location: 'Depot East — Guwahati Hub (AS)', expiry: '2027-06-15' },
      { sku: 'SKU-MED-305', name: 'IV Ringer Lactate & Saline Bags (500ml)', category: 'Medical & Surgical', qty: 1450, max: 2500, unit: 'Bottles', location: 'Depot West — Ahmedabad Depot (GJ)', expiry: '2027-09-30' },
      { sku: 'SKU-SHT-402', name: 'All-Weather Family Tents (10-Person)', category: 'Emergency Shelter', qty: 850, max: 4000, unit: 'Tents', location: 'Depot North — Dehradun Hub (UK)', expiry: 'Non-Perishable' },
      { sku: 'SKU-WTR-501', name: 'Sealed Potable Water Jerry Cans (20L)', category: 'Water & Sanitation', qty: 4800, max: 20000, unit: 'Jerry Cans', location: 'Depot East — Bhubaneswar Hub (OD)', expiry: '2027-04-10' },
      { sku: 'SKU-REL-609', name: 'Emergency Thermal Fleece Blankets', category: 'Emergency Shelter', qty: 19500, max: 22000, unit: 'Pieces', location: 'Depot North — Chandigarh Hub (PB)', expiry: 'Non-Perishable' },
      { sku: 'SKU-PWR-711', name: 'Diesel Portable Generators (5 kVA)', category: 'Rescue Equipment', qty: 38, max: 120, unit: 'Units', location: 'Depot West — Surat Central (GJ)', expiry: 'Non-Perishable' }
    ],
    allocations: [
      { id: 'ALC-2026-881', reqId: 'REQ-2026-101', item: 'Medical Trauma Packs (SKU-MED-305)', qty: '600 Kits', destination: 'Meppadi Camp, Wayanad (KL)', provider: 'IAF Air-Drop (Helicopter Mi-17)', dispatchDate: '2026-10-18 21:00', status: 'In Transit' },
      { id: 'ALC-2026-882', reqId: 'REQ-2026-102', item: 'Family Tents (SKU-SHT-402)', qty: '450 Tents', destination: 'Bhachau Old Town, Kutch (GJ)', provider: 'NDRF 6th Bn Truck Fleet', dispatchDate: '2026-10-19 06:00', status: 'Pending' },
      { id: 'ALC-2026-883', reqId: 'REQ-2026-103', item: 'Potable Water Cans 20L (SKU-WTR-501)', qty: '2,500 Cans', destination: 'Rajnagar Coastal, Kendrapara (OD)', provider: 'State Transport Green Corridor', dispatchDate: '2026-10-18 19:30', status: 'In Transit' },
      { id: 'ALC-2026-884', reqId: 'REQ-2026-104', item: 'High-Energy Biscuits (SKU-FOD-204)', qty: '2,200 Packs (Partial)', destination: 'Silchar Town Camp (AS)', provider: 'Inland Motorized Waterways Flotilla', dispatchDate: '2026-10-19 08:00', status: 'Shortage' },
      { id: 'ALC-2026-885', reqId: 'REQ-2026-105', item: 'Thermal Fleece Blankets (SKU-REL-609)', qty: '1,200 Units', destination: 'Ravigram Sector, Joshimath (UK)', provider: 'Indian Red Cross Hill Vans', dispatchDate: '2026-10-18 10:15', status: 'Delivered' },
      { id: 'ALC-2026-886', reqId: 'REQ-2026-106', item: 'Halazone Chlorine Tabs (SKU-MED-101)', qty: '20,000 Tabs', destination: 'Chiplun Flood Shelter #2 (MH)', provider: 'Civil Defense Rapid Response Car', dispatchDate: '2026-10-18 09:00', status: 'Delivered' }
    ],
    volunteers: [
      { id: 'VOL-KL-041', name: 'Dr. Ashwin Menon', phone: '9847120391', blood: 'O+', role: 'Field Trauma Triage & Wound Dressing', area: 'Meppadi Camp, Wayanad (KL)', shift: 'Day Shift (06:00 - 18:00)', officer: 'Dr. A. Nair (ADM)', status: 'Active on Ground' },
      { id: 'VOL-GJ-112', name: 'Pravin Solanki', phone: '9824058291', blood: 'B+', role: 'Earthquake Rubble Search & First Aid', area: 'Bhachau Sector 2, Kutch (GJ)', shift: 'Night Shift (18:00 - 06:00)', officer: 'Capt. V. Jadeja', status: 'En Route' },
      { id: 'VOL-OD-209', name: 'Debashis Das', phone: '9777123904', blood: 'A+', role: 'Speedboat Evacuation & River Rescue', area: 'Rajnagar Creek, Kendrapara (OD)', shift: '24-Hour On-Call Rotational', officer: 'P. Mohanty (BDO)', status: 'Active on Ground' },
      { id: 'VOL-AS-330', name: 'Moushumi Das', phone: '9435198274', blood: 'AB+', role: 'Ration Packaging & Child Nutrition Care', area: 'Silchar Town Camp (AS)', shift: 'Morning Shift (07:00 - 15:00)', officer: 'B. Sharma (SDMA)', status: 'Active on Ground' },
      { id: 'VOL-UK-088', name: 'Harish Semwal', phone: '9412998310', blood: 'O-', role: 'Shelter Construction & Heavy Driving', area: 'Joshimath Base, Chamoli (UK)', shift: 'Standby Roster (Tier 1)', officer: 'S. Rawat (Tehsildar)', status: 'On Standby' },
      { id: 'VOL-MH-514', name: 'Pooja Kadam', phone: '9819230491', blood: 'A-', role: 'Water Chlorination & Hygiene Outreach', area: 'Chiplun Shelter #2, Ratnagiri (MH)', shift: 'Completed (Rotated Off)', officer: 'S. Gaikwad', status: 'Duty Completed' }
    ],
    areas: [
      { name: 'Meppadi & Chooralmala', district: 'Wayanad District • Kerala', disaster: 'Massive Hill Landslide', severity: 'Level 4 - Critical', population: '18,500 Displaced', camps: 14, officer: 'Dr. A. Nair (ADM) • 9447102030', needs: ['Trauma Kits', 'Anti-Venom', 'Bailey Bridges', 'Blankets'], access: 'Air-Drop Required' },
      { name: 'Bhachau & Rapar Belt', district: 'Kutch District • Gujarat', disaster: 'Earthquake (5.8 Magnitude)', severity: 'Level 4 - Critical', population: '32,400 Residents', camps: 22, officer: 'Capt. V. Jadeja • 9825019283', needs: ['Family Tents', 'Surgical Sutures', 'Cranes', 'Purified Water'], access: 'Road Partially Cleared' },
      { name: 'Rajnagar Coastal Strip', district: 'Kendrapara District • Odisha', disaster: "Severe Cyclone 'Dana' Surge", severity: 'Level 3 - High', population: '45,000 Coastal Inhabitants', camps: 38, officer: 'P. Mohanty (BDO) • 9776044123', needs: ['Water 20L Cans', 'Dry Rations', 'Chlorine Tablets', 'Solar Torches'], access: 'Power Grid Down' },
      { name: 'Silchar Municipal & Riverbank', district: 'Cachar District • Assam', disaster: 'Barak River Embankment Breach', severity: 'Level 3 - High', population: '62,000 Marooned Citizens', camps: 41, officer: 'B. Sharma (SDMA) • 9435012948', needs: ['Speedboats', 'Infant Baby Food', 'Water Tanks', 'ORS Sachets'], access: 'Boats Only' },
      { name: 'Ravigram & Sunil Ward', district: 'Chamoli District • Uttarakhand', disaster: 'Land Subsidence & Fissures', severity: 'Level 2 - Medium', population: '8,200 Evacuated Residents', camps: 9, officer: 'S. Rawat (Tehsildar) • 9412033482', needs: ['Thermal Quilts', 'Heating Stoves', 'Prefabs', 'Chronic Meds'], access: 'Unstable Terrain' },
      { name: 'Chiplun Urban & Bazar', district: 'Ratnagiri District • Maharashtra', disaster: 'Vashishti River Flash Overflow', severity: 'Level 1 - Low', population: '14,000 In Rehab Stage', camps: 6, officer: 'S. Gaikwad • 9820149021', needs: ['Bleach Disinfection', 'Sanitary Pads', 'Mud Pumps', 'Ointments'], access: 'Flood Receding' }
    ],
    activities: [
      { type: 'alert', text: 'Critical Request Logged: Wayanad Hill Sector-3 requested 450 ampoules of Anti-Snake Venom.', time: '15 mins ago • Wayanad, Kerala' },
      { type: 'dispatch', text: 'Convoy Dispatched: 2 NDRF trucks loaded with 1,200 water cans departed Kochi Depot for Aluva.', time: '45 mins ago • Central Depot #2' },
      { type: 'volunteer', text: 'Volunteer Team Mobilized: Rapid Medical Team (14 paramedics) assigned to Bhuj Community Hospital.', time: '2 hours ago • Kutch, Gujarat' },
      { type: 'delivered', text: 'Consignment Delivered: 500 Tarpaulin family shelters successfully handed over at Kendrapara Shelter #4.', time: '4 hours ago • Kendrapara, Odisha' },
      { type: 'alert', text: 'Warehouse Alert: High-energy ration kits fell below 25% safety reserve threshold at Guwahati Depot.', time: '6 hours ago • Inventory Operations' }
    ]
  };

  // --------------------------------------------------------------------------
  // 2. Storage Helper
  // --------------------------------------------------------------------------
  const Store = {
    get(key) {
      const data = localStorage.getItem('reliefgrid_' + key);
      return data ? JSON.parse(data) : null;
    },
    set(key, val) {
      localStorage.setItem('reliefgrid_' + key, JSON.stringify(val));
    },
    init() {
      if (!this.get('seeded')) {
        this.reset();
      }
    },
    reset() {
      Object.keys(DEFAULT_DATA).forEach(k => {
        this.set(k, DEFAULT_DATA[k]);
      });
      this.set('seeded', true);
    }
  };

  // --------------------------------------------------------------------------
  // 3. Audio & Toast Notification Engine
  // --------------------------------------------------------------------------
  function playAlertChime(isCritical) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, ctx.currentTime); // A5 or D5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context may require user interaction on first page load
    }
  }

  function showToast(title, msg, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'critical' ? '&#9888;' : (type === 'success' ? '&#10004;' : '&#8505;');
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
      </div>
    `;

    container.appendChild(toast);
    playAlertChime(type === 'critical');

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

  // --------------------------------------------------------------------------
  // 4. Inject Demo Control Toolbar at top of page
  // --------------------------------------------------------------------------
  function injectDemoToolbar() {
    const bar = document.createElement('div');
    bar.className = 'demo-control-bar';
    bar.innerHTML = `
      <div class="demo-title-group">
        <span class="demo-badge-tag">&#9874; Prototype Active</span>
        <span><strong>Viva Demo Engine:</strong> Live Data Synchronized Across All Pages</span>
      </div>
      <div class="demo-actions-group">
        <button type="button" class="btn-demo btn-demo-accent" id="btn-quick-fill">
          <span>&#9889; Quick-Fill Form</span>
        </button>
        <button type="button" class="btn-demo" id="btn-simulate-event">
          <span>&#128666; Simulate Incoming Event</span>
        </button>
        <button type="button" class="btn-demo btn-demo-danger" id="btn-reset-data">
          <span>&#8634; Reset Seed Data</span>
        </button>
      </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);

    // Event listeners
    document.getElementById('btn-quick-fill').addEventListener('click', handleQuickFill);
    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Reset prototype data to original demonstration state?')) {
        Store.reset();
        showToast('System Reset', 'All demonstration tables restored to default state.', 'info');
        setTimeout(() => location.reload(), 400);
      }
    });
    document.getElementById('btn-simulate-event').addEventListener('click', triggerSimulatedIncident);
  }

  // --------------------------------------------------------------------------
  // 5. Intelligent "Quick-Fill Form" for viva demonstrations
  // --------------------------------------------------------------------------
  function handleQuickFill() {
    const path = window.location.pathname;

    if (path.includes('relief-requests.html')) {
      const form = document.querySelector('form');
      if (!form) return;
      form.querySelector('#requester-name').value = 'Maj. Arjun Sen';
      form.querySelector('#requester-contact').value = '9845012399';
      form.querySelector('#requester-agency').value = 'National Disaster Response Force (NDRF)';
      form.querySelector('#affected-area-select').value = 'Wayanad, Kerala (Meppadi Sector)';
      form.querySelector('#resource-category').value = 'Medical & Trauma Care';
      form.querySelector('#resource-quantity').value = '350';
      form.querySelector('#resource-unit').value = 'Kits';
      form.querySelector('input[name="priority_level"][value="Critical"]').checked = true;
      form.querySelector('#required-by-date').value = new Date().toISOString().split('T')[0];
      form.querySelector('#delivery-landmark').value = 'Chooralmala Primary Health Center Helipad';
      form.querySelector('#request-description').value = 'Flash mudflow isolated village cluster. Road KM-14 washed out. Urgent delivery of tourniquets, saline fluid, and anti-venom required by air-drop.';
      showToast('Form Autofilled', 'Emergency requisition filled with realistic Code-Red incident data.', 'success');
    } else if (path.includes('inventory.html')) {
      const form = document.querySelector('form');
      if (!form) return;
      form.querySelector('#resource-name').value = 'Packaged High-Protein ORS Electrolytes';
      form.querySelector('#item-category').value = 'Water & Sanitation';
      form.querySelector('#batch-lot-number').value = 'LOT-2026-ORS-982';
      form.querySelector('#quantity-available').value = '8500';
      form.querySelector('#stock-unit').value = 'Kits / Bags';
      form.querySelector('#warehouse-location').value = 'Depot South - Ernakulam Central Hub (KL)';
      form.querySelector('#expiry-date').value = '2028-08-31';
      form.querySelector('#storage-condition').value = 'Store in moisture-controlled pallets, keep minimum 2 feet above floor grade.';
      showToast('Form Autofilled', 'Incoming inventory details populated for warehouse registration.', 'success');
    } else if (path.includes('allocation.html')) {
      const form = document.querySelector('form');
      if (!form) return;
      const reqSelect = form.querySelector('#target-request');
      if (reqSelect && reqSelect.options.length > 1) reqSelect.selectedIndex = 1;
      const resSelect = form.querySelector('#source-resource');
      if (resSelect && resSelect.options.length > 1) resSelect.selectedIndex = 1;
      form.querySelector('#allocated-quantity').value = '300';
      form.querySelector('#transport-mode').value = 'NDRF Heavy All-Terrain Convoy';
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      form.querySelector('#dispatch-datetime').value = now.toISOString().slice(0, 16);
      form.querySelector('#estimated-delivery').value = new Date().toISOString().split('T')[0];
      form.querySelector('#dispatch-officer').value = 'Col. R. K. Nambiar';
      form.querySelector('#vehicle-reg').value = 'NDRF-4-CONVOY-09';
      form.querySelector('#transit-instructions').value = 'State highway police corridor authorized. Direct access clearance granted at toll gates.';
      showToast('Form Autofilled', 'Resource allocation and green corridor transport details loaded.', 'success');
    } else if (path.includes('volunteers.html')) {
      const form = document.querySelector('form');
      if (!form) return;
      form.querySelector('#vol-fullname').value = 'Rohit Singhania';
      form.querySelector('#vol-phone').value = '9821045678';
      form.querySelector('#vol-email').value = 'rohit.singhania@reliefvolunteers.org';
      form.querySelector('#vol-age').value = '28';
      form.querySelector('#vol-blood-group').value = 'O+';
      form.querySelector('#emergency-kin-contact').value = '9821045600';
      const checkboxes = form.querySelectorAll('input[type="checkbox"][name="skills[]"]');
      if (checkboxes[0]) checkboxes[0].checked = true; // Medical
      if (checkboxes[1]) checkboxes[1].checked = true; // Search & rescue
      form.querySelector('#vol-availability').value = 'Immediate 24x7 Deployment';
      form.querySelector('#preferred-sector').value = 'Wayanad, Kerala (Meppadi Camp)';
      form.querySelector('input[name="disclaimer_consent"]').checked = true;
      showToast('Form Autofilled', 'Volunteer registration loaded with certified first responder skills.', 'success');
    } else if (path.includes('affected-areas.html')) {
      const form = document.querySelector('form');
      if (!form) return;
      form.querySelector('#new-area-name').value = 'Chamba Valley Sector 3';
      form.querySelector('#new-district-state').value = 'Chamba, Himachal Pradesh';
      form.querySelector('#disaster-type').value = 'Cloudburst / Flash Flood';
      form.querySelector('#severity-level').value = 'Level 3 - High Orange (Serious Disruption)';
      form.querySelector('#population-affected').value = '11200';
      form.querySelector('#camps-established').value = '7';
      form.querySelector('#nodal-officer-name').value = 'V. K. Sharma (SDM)';
      form.querySelector('#nodal-officer-contact').value = '9418012390';
      form.querySelector('#accessibility-status').value = 'Light Vehicles Only';
      form.querySelector('#needs-summary').value = 'Ravi tributary swollen. 4 footbridges collapsed. Requiring 2,000 thermal kits, high-calorie meal packs, and mobile chlorine purification carts.';
      showToast('Form Autofilled', 'New disaster zone declaration fields populated.', 'success');
    } else {
      showToast('Dashboard Info', 'Navigate to any form page to try one-click autofill!', 'info');
    }
  }

  // --------------------------------------------------------------------------
  // 6. Simulate incoming emergency event
  // --------------------------------------------------------------------------
  function triggerSimulatedIncident() {
    const incidents = [
      {
        title: '🚨 CRITICAL CODE-RED ALERT',
        msg: 'Flash flood alert triggered in Idukki Valley: River Periyar crossing Danger Level by +1.4m. 300 emergency tents requested.',
        type: 'critical'
      },
      {
        title: '🚛 CONVOY STATUS UPDATE',
        msg: 'Convoy ALC-2026-881 (Medical Trauma Packs) cleared Toll Plaza KM-98 under police escort; ETA Meppadi: 45 minutes.',
        type: 'info'
      },
      {
        title: '✅ CONSIGNMENT DELIVERED',
        msg: '2,500 drinking water jerry cans safely received at Rajnagar Shelter #3, Kendrapara (Odisha).',
        type: 'success'
      }
    ];

    const random = incidents[Math.floor(Math.random() * incidents.length)];
    showToast(random.title, random.msg, random.type);

    // Also add to activities in storage
    const acts = Store.get('activities') || [];
    acts.unshift({
      type: random.type === 'critical' ? 'alert' : (random.type === 'success' ? 'delivered' : 'dispatch'),
      text: random.msg,
      time: 'Just now • Simulated Telemetry'
    });
    Store.set('activities', acts.slice(0, 10));

    // If on index.html, refresh activity list dynamically
    renderDashboardActivities();
  }

  // --------------------------------------------------------------------------
  // 7. Interactive Table Search & Priority Filter Toolbar
  // --------------------------------------------------------------------------
  function injectTableToolbar(tableElement) {
    if (!tableElement || tableElement.dataset.hasToolbar) return;
    tableElement.dataset.hasToolbar = 'true';

    const container = tableElement.closest('.table-container') || tableElement.parentElement;
    const headerBar = container.querySelector('.table-header-bar') || container;

    const toolbar = document.createElement('div');
    toolbar.className = 'table-filter-toolbar';
    toolbar.innerHTML = `
      <div class="filter-group">
        <div class="search-box">
          <input type="text" placeholder="🔍 Live search table records (e.g., Kerala, Tents, Critical)..." aria-label="Search Table Records">
        </div>
        <select class="filter-select" aria-label="Filter by Status or Priority">
          <option value="all">All Priorities / Statuses</option>
          <option value="critical">Priority: Critical</option>
          <option value="high">Priority: High</option>
          <option value="medium">Priority: Medium</option>
          <option value="low">Priority: Low</option>
          <option value="pending">Status: Pending</option>
          <option value="in transit">Status: In Transit</option>
          <option value="delivered">Status: Delivered</option>
        </select>
      </div>
      <div class="filter-counter">Showing all rows</div>
    `;

    // Insert right after table header bar or before table
    if (headerBar.nextSibling) {
      headerBar.parentNode.insertBefore(toolbar, headerBar.nextSibling);
    } else {
      headerBar.parentNode.appendChild(toolbar);
    }

    const searchInput = toolbar.querySelector('input');
    const filterSelect = toolbar.querySelector('select');
    const counter = toolbar.querySelector('.filter-counter');

    function filterTable() {
      const query = searchInput.value.toLowerCase().trim();
      const filter = filterSelect.value.toLowerCase().trim();
      const rows = tableElement.querySelectorAll('tbody tr');
      let visible = 0;

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesQuery = !query || text.includes(query);
        const matchesFilter = filter === 'all' || text.includes(filter);

        if (matchesQuery && matchesFilter) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });

      counter.textContent = `Showing ${visible} of ${rows.length} rows`;
    }

    searchInput.addEventListener('input', filterTable);
    filterSelect.addEventListener('change', filterTable);
  }

  // --------------------------------------------------------------------------
  // 8. Page Specific Rendering & Handlers
  // --------------------------------------------------------------------------

  // A. INDEX.HTML (Dashboard)
  function initDashboard() {
    const requests = Store.get('requests') || [];
    const inventory = Store.get('inventory') || [];
    const volunteers = Store.get('volunteers') || [];
    const areas = Store.get('areas') || [];

    // Calculate metrics
    const totalRequests = requests.length;
    const criticalRequests = requests.filter(r => r.priority === 'Critical').length;
    const totalUnits = inventory.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
    const activeVolunteers = volunteers.length;
    const totalAreas = areas.length;

    // Update summary metric cards if present
    const metricCards = document.querySelectorAll('.metric-card');
    if (metricCards.length >= 5) {
      metricCards[0].querySelector('.metric-value').textContent = (totalRequests + 1476).toLocaleString();
      metricCards[1].querySelector('.metric-value').textContent = (criticalRequests + 126).toLocaleString();
      metricCards[2].querySelector('.metric-value').textContent = totalUnits.toLocaleString();
      metricCards[3].querySelector('.metric-value').textContent = (activeVolunteers + 634).toLocaleString();
      metricCards[4].querySelector('.metric-value').textContent = totalAreas.toLocaleString();
    }

    // Dynamic stock bars
    const stockContainer = document.querySelector('.stock-bars-container');
    if (stockContainer && inventory.length >= 4) {
      stockContainer.innerHTML = '';
      inventory.slice(0, 6).forEach(item => {
        const pct = Math.min(100, Math.round((item.qty / item.max) * 100));
        let fillClass = 'fill-high';
        let label = 'High';
        if (pct <= 25) { fillClass = 'fill-critical'; label = 'Critical'; }
        else if (pct <= 45) { fillClass = 'fill-low'; label = 'Low'; }
        else if (pct <= 65) { fillClass = 'fill-medium'; label = 'Medium'; }

        const div = document.createElement('div');
        div.className = 'stock-item';
        div.innerHTML = `
          <div class="stock-info">
            <span class="stock-name">${item.name}</span>
            <span class="stock-qty">${item.qty.toLocaleString()} / ${item.max.toLocaleString()} ${item.unit} (${pct}% - ${label})</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill ${fillClass}" style="width: ${pct}%;"></div>
          </div>
        `;
        stockContainer.appendChild(div);
      });
    }

    renderDashboardActivities();

    // Render table
    const table = document.querySelector('.data-table');
    if (table) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      requests.slice(0, 6).forEach(r => {
        const badgeClass = `badge-${r.priority.toLowerCase()}`;
        let statusBadge = 'badge-progress';
        if (r.status.toLowerCase().includes('pending')) statusBadge = 'badge-pending';
        else if (r.status.toLowerCase().includes('deliver')) statusBadge = 'badge-delivered';
        else if (r.status.toLowerCase().includes('shortage')) statusBadge = 'badge-shortage';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${r.id}</code></td>
          <td><strong>${r.location}</strong></td>
          <td>Field Requisition</td>
          <td>${r.item}</td>
          <td class="cell-number">${r.qty}</td>
          <td><span class="badge ${badgeClass}">${r.priority}</span></td>
          <td><span class="badge ${statusBadge}">${r.status}</span></td>
          <td>${r.date}</td>
        `;
        tbody.appendChild(tr);
      });
      injectTableToolbar(table);
    }
  }

  function renderDashboardActivities() {
    const actList = document.querySelector('.activity-list');
    if (!actList) return;
    const activities = Store.get('activities') || [];
    actList.innerHTML = '';
    activities.slice(0, 5).forEach(a => {
      let icon = '&#9888;';
      let iconClass = 'icon-alert';
      if (a.type === 'dispatch') { icon = '&#128666;'; iconClass = 'icon-dispatch'; }
      else if (a.type === 'volunteer') { icon = '&#129489;'; iconClass = 'icon-volunteer'; }
      else if (a.type === 'delivered') { icon = '&#10004;'; iconClass = 'icon-delivered'; }

      const li = document.createElement('li');
      li.className = 'activity-item';
      li.innerHTML = `
        <span class="activity-icon ${iconClass}" aria-hidden="true">${icon}</span>
        <div class="activity-content">
          <p class="activity-text">${a.text}</p>
          <time class="activity-time">${a.time}</time>
        </div>
      `;
      actList.appendChild(li);
    });
  }

  // B. RELIEF-REQUESTS.HTML
  function initReliefRequests() {
    const table = document.querySelector('.data-table');
    const form = document.querySelector('form');
    const requests = Store.get('requests') || [];

    if (table) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      requests.forEach(r => {
        const badgeClass = `badge-${r.priority.toLowerCase()}`;
        let statusBadge = 'badge-progress';
        if (r.status.toLowerCase().includes('pending')) statusBadge = 'badge-pending';
        else if (r.status.toLowerCase().includes('deliver')) statusBadge = 'badge-delivered';
        else if (r.status.toLowerCase().includes('shortage')) statusBadge = 'badge-shortage';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${r.id}</code></td>
          <td>
            <strong>${r.officer}</strong><br>
            <small style="color:var(--color-text-muted);">${r.agency}</small>
          </td>
          <td>${r.location}</td>
          <td>${r.item}</td>
          <td class="cell-number">${r.qty}</td>
          <td><span class="badge ${badgeClass}">${r.priority}</span></td>
          <td><span class="badge ${statusBadge}">${r.status}</span></td>
          <td>${r.date}</td>
        `;
        tbody.appendChild(tr);
      });
      injectTableToolbar(table);
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nextId = 'REQ-2026-' + (requests.length + 101);
        const name = form.querySelector('#requester-name').value;
        const agency = form.querySelector('#requester-agency').value;
        const area = form.querySelector('#affected-area-select').value;
        const cat = form.querySelector('#resource-category').value;
        const qty = form.querySelector('#resource-quantity').value;
        const unit = form.querySelector('#resource-unit').value;
        const priority = form.querySelector('input[name="priority_level"]:checked')?.value || 'High';
        const date = form.querySelector('#required-by-date').value;

        const newReq = {
          id: nextId,
          officer: name,
          agency: agency,
          location: area,
          item: cat,
          qty: `${qty} ${unit}`,
          priority: priority,
          status: 'Pending',
          date: date
        };

        requests.unshift(newReq);
        Store.set('requests', requests);

        // Add to activities
        const acts = Store.get('activities') || [];
        acts.unshift({
          type: 'alert',
          text: `New Emergency Request ${nextId}: ${area} requested ${qty} ${unit} of ${cat} (${priority} Priority).`,
          time: 'Just now • Verified Requisition'
        });
        Store.set('activities', acts);

        showToast(
          'Requisition Dispatched',
          `Emergency Request <strong>${nextId}</strong> successfully filed to Central Queue.`,
          priority === 'Critical' ? 'critical' : 'success'
        );

        form.reset();
        initReliefRequests();
      });
    }
  }

  // C. INVENTORY.HTML
  function initInventory() {
    const table = document.querySelector('.data-table');
    const form = document.querySelector('form');
    const inventory = Store.get('inventory') || [];

    if (table) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      inventory.forEach(i => {
        const pct = Math.min(100, Math.round((i.qty / i.max) * 100));
        let badge = 'badge-low';
        let statusText = `Optimal (${pct}%)`;
        if (pct <= 25) { badge = 'badge-critical'; statusText = `Critical (${pct}%)`; }
        else if (pct <= 45) { badge = 'badge-high'; statusText = `Low (${pct}%)`; }
        else if (pct <= 65) { badge = 'badge-medium'; statusText = `Moderate (${pct}%)`; }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${i.sku}</code></td>
          <td><strong>${i.name}</strong></td>
          <td>${i.category}</td>
          <td class="cell-number">${Number(i.qty).toLocaleString()}</td>
          <td>${i.unit}</td>
          <td>${i.location}</td>
          <td>${i.expiry || 'Non-Perishable'}</td>
          <td><span class="badge ${badge}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
      });
      injectTableToolbar(table);
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nextSku = 'SKU-RES-' + (inventory.length + 800);
        const name = form.querySelector('#resource-name').value;
        const cat = form.querySelector('#item-category').value;
        const qty = parseInt(form.querySelector('#quantity-available').value, 10);
        const unit = form.querySelector('#stock-unit').value;
        const loc = form.querySelector('#warehouse-location').value;
        const expiry = form.querySelector('#expiry-date').value;

        const newItem = {
          sku: nextSku,
          name: name,
          category: cat,
          qty: qty,
          max: qty * 2,
          unit: unit,
          location: loc,
          expiry: expiry || 'Non-Perishable'
        };

        inventory.unshift(newItem);
        Store.set('inventory', inventory);

        showToast('Stock Registered', `Item <strong>${name}</strong> added to ${loc}.`, 'success');
        form.reset();
        initInventory();
      });
    }
  }

  // D. AFFECTED-AREAS.HTML
  function initAffectedAreas() {
    const grid = document.querySelector('.areas-grid');
    const form = document.querySelector('form');
    const areas = Store.get('areas') || [];

    if (grid) {
      grid.innerHTML = '';
      areas.forEach((a, idx) => {
        let badgeClass = 'badge-critical';
        if (a.severity.includes('3')) badgeClass = 'badge-high';
        else if (a.severity.includes('2')) badgeClass = 'badge-medium';
        else if (a.severity.includes('1')) badgeClass = 'badge-low';

        const tagsHtml = a.needs.map(n => `<span class="need-tag">${n}</span>`).join(' ');

        const card = document.createElement('article');
        card.className = 'area-card';
        card.innerHTML = `
          <header class="area-card-header">
            <div class="area-title-group">
              <h3>${a.name}</h3>
              <p class="area-location">${a.district}</p>
            </div>
            <span class="badge ${badgeClass}">${a.severity}</span>
          </header>
          <div class="area-card-body">
            <div class="area-stat-row">
              <span class="area-stat-label">Disaster Type</span>
              <span class="area-stat-value">${a.disaster}</span>
            </div>
            <div class="area-stat-row">
              <span class="area-stat-label">Population Affected</span>
              <span class="area-stat-value">${a.population}</span>
            </div>
            <div class="area-stat-row">
              <span class="area-stat-label">Active Relief Camps</span>
              <span class="area-stat-value">${a.camps} Designated Shelters</span>
            </div>
            <div class="area-stat-row">
              <span class="area-stat-label">Nodal Incident Officer</span>
              <span class="area-stat-value">${a.officer}</span>
            </div>
            <div>
              <span class="area-stat-label" style="font-size: 0.8125rem;">Immediate Critical Needs:</span>
              <div class="needs-tag-list">${tagsHtml}</div>
            </div>
          </div>
          <footer class="area-card-footer">
            <span>Terrain Status: <strong>${a.access}</strong></span>
            <a href="relief-requests.html" style="font-weight: 600;">View Demands &rarr;</a>
          </footer>
        `;
        grid.appendChild(card);
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = form.querySelector('#new-area-name').value;
        const dist = form.querySelector('#new-district-state').value;
        const disaster = form.querySelector('#disaster-type').value;
        const severity = form.querySelector('#severity-level').value;
        const pop = form.querySelector('#population-affected').value;
        const camps = form.querySelector('#camps-established').value;
        const officer = form.querySelector('#nodal-officer-name').value;
        const phone = form.querySelector('#nodal-officer-contact').value;
        const access = form.querySelector('#accessibility-status').value;
        const needsText = form.querySelector('#needs-summary').value;
        const needsArray = needsText.split(',').map(s => s.trim()).filter(Boolean);

        const newArea = {
          name: name,
          district: dist,
          disaster: disaster,
          severity: severity.split('(')[0].trim(),
          population: Number(pop).toLocaleString() + ' Affected',
          camps: camps,
          officer: `${officer} • ${phone}`,
          needs: needsArray.length ? needsArray : ['Emergency Food', 'Clean Water', 'First Aid'],
          access: access
        };

        areas.unshift(newArea);
        Store.set('areas', areas);

        showToast('Disaster Zone Declared', `Incident sector <strong>${name}</strong> declared on national grid.`, 'critical');
        form.reset();
        initAffectedAreas();
      });
    }
  }

  // E. ALLOCATION.HTML
  function initAllocation() {
    const table = document.querySelector('.data-table');
    const form = document.querySelector('form');
    const allocations = Store.get('allocations') || [];
    const inventory = Store.get('inventory') || [];

    if (table) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      allocations.forEach(a => {
        let statusBadge = 'badge-progress';
        if (a.status.toLowerCase().includes('pending')) statusBadge = 'badge-pending';
        else if (a.status.toLowerCase().includes('deliver')) statusBadge = 'badge-delivered';
        else if (a.status.toLowerCase().includes('shortage')) statusBadge = 'badge-shortage';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${a.id}</code></td>
          <td><code>${a.reqId}</code></td>
          <td>${a.item}</td>
          <td class="cell-number">${a.qty}</td>
          <td>${a.destination}</td>
          <td>${a.provider}</td>
          <td>${a.dispatchDate}</td>
          <td><span class="badge ${statusBadge}">${a.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
      injectTableToolbar(table);
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nextId = 'ALC-2026-' + (allocations.length + 881);
        const reqStr = form.querySelector('#target-request').value;
        const reqId = reqStr.split('|')[0].trim();
        const dest = reqStr.split('|')[1] || 'Designated Disaster Zone';
        const resStr = form.querySelector('#source-resource').value;
        const qty = parseInt(form.querySelector('#allocated-quantity').value, 10);
        const provider = form.querySelector('#transport-mode').value;
        const dispatchTime = form.querySelector('#dispatch-datetime').value.replace('T', ' ');
        const status = form.querySelector('#initial-status').value;

        // Deduct from inventory if matching SKU found
        const matchingItem = inventory.find(i => resStr.includes(i.sku));
        if (matchingItem) {
          matchingItem.qty = Math.max(0, matchingItem.qty - qty);
          Store.set('inventory', inventory);
        }

        const newAlloc = {
          id: nextId,
          reqId: reqId,
          item: resStr.split('|')[1] || resStr,
          qty: qty.toLocaleString() + ' Units',
          destination: dest,
          provider: provider,
          dispatchDate: dispatchTime || '2026-10-19 12:00',
          status: status
        };

        allocations.unshift(newAlloc);
        Store.set('allocations', allocations);

        // Add activity
        const acts = Store.get('activities') || [];
        acts.unshift({
          type: 'dispatch',
          text: `Convoy Dispatched: Allocation ${nextId} (${qty} units) authorized via ${provider}.`,
          time: 'Just now • Logistics EOC'
        });
        Store.set('activities', acts);

        showToast(
          'Convoy Dispatched',
          `Allocation <strong>${nextId}</strong> linked to ${reqId}. Warehouse stock automatically updated.`,
          'success'
        );

        form.reset();
        initAllocation();
      });
    }
  }

  // F. VOLUNTEERS.HTML
  function initVolunteers() {
    const table = document.querySelector('.data-table');
    const form = document.querySelector('form');
    const volunteers = Store.get('volunteers') || [];

    if (table) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      volunteers.forEach(v => {
        let badgeClass = 'badge-delivered';
        if (v.status.toLowerCase().includes('en route')) badgeClass = 'badge-progress';
        else if (v.status.toLowerCase().includes('standby')) badgeClass = 'badge-pending';
        else if (v.status.toLowerCase().includes('completed')) badgeClass = 'badge-low';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${v.id}</code></td>
          <td>
            <strong>${v.name}</strong><br>
            <small style="color:var(--color-text-muted);">${v.phone} &bull; Blood: ${v.blood}</small>
          </td>
          <td>${v.role}</td>
          <td>${v.area}</td>
          <td>${v.shift}</td>
          <td>${v.officer}</td>
          <td><span class="badge ${badgeClass}">${v.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
      injectTableToolbar(table);
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nextId = 'VOL-IN-' + (volunteers.length + 101);
        const name = form.querySelector('#vol-fullname').value;
        const phone = form.querySelector('#vol-phone').value;
        const blood = form.querySelector('#vol-blood-group').value;
        const checkedSkills = Array.from(form.querySelectorAll('input[name="skills[]"]:checked')).map(c => c.value);
        const area = form.querySelector('#preferred-sector').value;
        const avail = form.querySelector('#vol-availability').value;

        const newVol = {
          id: nextId,
          name: name,
          phone: phone,
          blood: blood,
          role: checkedSkills.length ? checkedSkills.join(' & ') : 'General Humanitarian Support',
          area: area,
          shift: avail.includes('24x7') ? 'Day Shift (06:00 - 18:00)' : 'Rotational Roster',
          officer: 'District Volunteer Liaison',
          status: 'Active on Ground'
        };

        volunteers.unshift(newVol);
        Store.set('volunteers', volunteers);

        // Add activity
        const acts = Store.get('activities') || [];
        acts.unshift({
          type: 'volunteer',
          text: `Volunteer Enrolled: ${name} (${blood}) mobilized for ${area}.`,
          time: 'Just now • Civil Defense Desk'
        });
        Store.set('activities', acts);

        showToast('Volunteer Enrolled', `Responder <strong>${name}</strong> registered and assigned to ${area}.`, 'success');
        form.reset();
        initVolunteers();
      });
    }
  }

  // --------------------------------------------------------------------------
  // 9. Master Initialization On DOM Ready
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    Store.init();
    injectDemoToolbar();

    const path = window.location.pathname;

    if (path.endsWith('relief-requests.html')) {
      initReliefRequests();
    } else if (path.endsWith('inventory.html')) {
      initInventory();
    } else if (path.endsWith('affected-areas.html')) {
      initAffectedAreas();
    } else if (path.endsWith('allocation.html')) {
      initAllocation();
    } else if (path.endsWith('volunteers.html')) {
      initVolunteers();
    } else {
      // index.html / default
      initDashboard();
    }
  });

})();

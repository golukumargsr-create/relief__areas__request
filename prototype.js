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
  // Theme Manager (Dark & Light Mode Engine)
  // --------------------------------------------------------------------------
  const ThemeManager = {
    getSavedTheme() {
      const saved = localStorage.getItem('reliefgrid_theme');
      if (saved) return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    },
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('reliefgrid_theme', theme);
      this.updateButtons(theme);
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || this.getSavedTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      showToast(
        next === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated',
        next === 'dark' ? 'Tactical Night Operations command theme enabled.' : 'Daylight High-Visibility mode enabled.',
        'info'
      );
    },
    updateButtons(theme) {
      const isDark = theme === 'dark';
      const btns = document.querySelectorAll('.theme-toggle-btn, #btn-demo-theme');
      btns.forEach(btn => {
        const iconSpan = btn.querySelector('.theme-toggle-icon');
        const textSpan = btn.querySelector('.theme-toggle-text');
        if (iconSpan) iconSpan.innerHTML = isDark ? '&#9728;' : '&#9790;';
        if (textSpan) textSpan.textContent = isDark ? 'Light' : 'Dark';
        btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      });
    },
    init() {
      const theme = this.getSavedTheme();
      this.applyTheme(theme);
      this.injectNavButton();
    },
    injectNavButton() {
      const navUl = document.querySelector('.main-nav ul');
      if (navUl && !document.getElementById('header-theme-toggle')) {
        const li = document.createElement('li');
        const isDark = (document.documentElement.getAttribute('data-theme') || this.getSavedTheme()) === 'dark';
        li.innerHTML = `
          <button type="button" class="theme-toggle-btn" id="header-theme-toggle" aria-label="Toggle Dark and Light Mode" title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
            <span class="theme-toggle-icon" aria-hidden="true">${isDark ? '&#9728;' : '&#9790;'}</span>
            <span class="theme-toggle-text">${isDark ? 'Light' : 'Dark'}</span>
          </button>
        `;
        navUl.appendChild(li);
        li.querySelector('button').addEventListener('click', () => this.toggle());
      }
    }
  };

  // Immediate theme execution to prevent any flash of unstyled theme
  (function initThemeEarly() {
    const saved = localStorage.getItem('reliefgrid_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
  })();

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
    ],
    users: [
      {
        id: 'USR-CMD-01',
        name: 'Dr. Anita Nair',
        email: 'anita.nair@ndma.gov.in',
        phone: '+91 94471 02030',
        role: 'Incident Commander',
        agency: 'National Disaster Response Force (NDRF)',
        badge: 'NDRF-IC-7749',
        clearance: 'Level 4 - National Ops',
        password: 'password123',
        avatar: '👩‍⚕️',
        status: 'Active Duty'
      },
      {
        id: 'USR-LOG-02',
        name: 'Capt. V. K. Jadeja',
        email: 'vk.jadeja@logistics.ndrf.gov.in',
        phone: '+91 98250 19283',
        role: 'Warehouse Logistics Head',
        agency: 'Central Emergency Depots & Logistics',
        badge: 'LOG-CMD-8821',
        clearance: 'Level 3 - Supply Chain',
        password: 'password123',
        avatar: '👨‍✈️',
        status: 'Active Duty'
      },
      {
        id: 'USR-MED-03',
        name: 'Dr. Ashwin Menon',
        email: 'ashwin.menon@who-relief.org',
        phone: '+91 98471 20391',
        role: 'Field Medical Officer',
        agency: 'Indian Red Cross & WHO Field Health',
        badge: 'MED-FLD-4410',
        clearance: 'Level 2 - Field Triage',
        password: 'password123',
        avatar: '👨‍⚕️',
        status: 'Active Duty'
      },
      {
        id: 'USR-VOL-04',
        name: 'Pooja Kadam',
        email: 'pooja.kadam@reliefvolunteers.org',
        phone: '+91 98192 30491',
        role: 'Registered Volunteer Responder',
        agency: 'Civil Defense & Citizen Corps',
        badge: 'VOL-RES-9104',
        clearance: 'Level 1 - Community Ground',
        password: 'password123',
        avatar: '🦸‍♀️',
        status: 'Active Duty'
      }
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
    remove(key) {
      localStorage.removeItem('reliefgrid_' + key);
    },
    init() {
      if (!this.get('seeded')) {
        this.reset();
      } else {
        if (!this.get('users')) {
          this.set('users', DEFAULT_DATA.users);
        }
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
  // 3.5. Authentication & Operational Identity Manager (AuthManager)
  // --------------------------------------------------------------------------
  const AuthManager = {
    getCurrentUser() {
      return Store.get('currentUser');
    },

    getUsers() {
      return Store.get('users') || DEFAULT_DATA.users;
    },

    setCurrentUser(user) {
      if (user) {
        Store.set('currentUser', user);
      } else {
        Store.remove('currentUser');
      }
      this.renderHeaderAuth();
      this.updateDemoBar();
      this.updatePageIfLoggedIn();
    },

    login(identifier, password, remember = true) {
      if (!identifier || !password) {
        return { success: false, message: 'Please provide both your official Email/Disaster ID and Password.' };
      }

      const users = this.getUsers();
      const cleanId = identifier.trim().toLowerCase();
      
      const user = users.find(u => 
        (u.email && u.email.toLowerCase() === cleanId) || 
        (u.badge && u.badge.toLowerCase() === cleanId) ||
        (u.name && u.name.toLowerCase() === cleanId)
      );

      if (!user) {
        return { success: false, message: `No credential record found matching "${identifier}". Check email or try a 1-click demo role.` };
      }

      // In prototype engine, allow 'password123' as default or stored password
      if (password !== user.password && password !== 'password123') {
        return { success: false, message: 'Incorrect credentials. For viva testing, demo password is "password123".' };
      }

      this.setCurrentUser(user);

      // Log activity
      const acts = Store.get('activities') || [];
      acts.unshift({
        type: 'auth',
        text: `Personnel Session Authorized: ${user.name} (${user.role}) logged in at command console.`,
        time: 'Just now • Gatekeeper Sentinel'
      });
      Store.set('activities', acts);

      showToast(
        'Access Authorized',
        `Welcome back, <strong>${user.name}</strong> (${user.role}). Clearance: ${user.clearance}.`,
        'success'
      );

      this.closeModal();

      const path = window.location.pathname;
      if (path.includes('login.html')) {
        this.renderLoginPageState();
      }

      return { success: true, user };
    },

    loginAsDemo(userId) {
      const users = this.getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        this.setCurrentUser(user);

        const acts = Store.get('activities') || [];
        acts.unshift({
          type: 'auth',
          text: `Demo Persona Activated: ${user.name} assigned as active ${user.role}.`,
          time: 'Just now • Demo Sandbox'
        });
        Store.set('activities', acts);

        showToast(
          'Persona Activated',
          `Logged in as <strong>${user.name}</strong> &mdash; <em>${user.role}</em>.`,
          'success'
        );

        this.closeModal();

        const path = window.location.pathname;
        if (path.includes('login.html')) {
          this.renderLoginPageState();
        }
      }
    },

    register(data) {
      const { name, email, phone, role, agency, badge, password, confirmPassword, terms } = data;

      if (!name || name.trim().length < 2) {
        return { success: false, message: 'Please enter your full official name.' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, message: 'Please provide a valid official email address.' };
      }
      if (!password || password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }
      if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match. Please re-enter.' };
      }
      if (!terms) {
        return { success: false, message: 'You must agree to the Humanitarian Charter & Code of Conduct.' };
      }

      const users = this.getUsers();
      const cleanEmail = email.trim().toLowerCase();
      if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'An account with this email is already provisioned. Please sign in.' };
      }

      let clearance = 'Level 1 - Community Ground';
      let avatar = '🦸‍♀️';
      if (role && role.includes('Commander')) {
        clearance = 'Level 4 - National Ops';
        avatar = '👩‍⚕️';
      } else if (role && role.includes('Logistics')) {
        clearance = 'Level 3 - Supply Chain';
        avatar = '👨‍✈️';
      } else if (role && role.includes('Medical')) {
        clearance = 'Level 2 - Field Triage';
        avatar = '👨‍⚕️';
      }

      const newUser = {
        id: 'USR-REG-' + Date.now().toString(36).toUpperCase(),
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '+91 98000 00000',
        role: role || 'Registered Volunteer Responder',
        agency: agency || 'Civil Defense Corps',
        badge: badge && badge.trim() ? badge.trim() : 'NDMA-ID-' + Math.floor(1000 + Math.random() * 9000),
        clearance: clearance,
        password: password,
        avatar: avatar,
        status: 'Active Duty',
        created: new Date().toISOString()
      };

      users.unshift(newUser);
      Store.set('users', users);
      this.setCurrentUser(newUser);

      const acts = Store.get('activities') || [];
      acts.unshift({
        type: 'auth',
        text: `New Responder Registered: ${newUser.name} enrolled as ${newUser.role} (${newUser.agency}).`,
        time: 'Just now • Civil Credentialing'
      });
      Store.set('activities', acts);

      showToast(
        'Registration Complete',
        `Welcome to ReliefGrid, <strong>${newUser.name}</strong>. Badge ID: <code>${newUser.badge}</code> assigned.`,
        'success'
      );

      this.closeModal();

      const path = window.location.pathname;
      if (path.includes('login.html')) {
        this.renderLoginPageState();
      }

      return { success: true, user: newUser };
    },

    logout() {
      const prev = this.getCurrentUser();
      this.setCurrentUser(null);
      showToast(
        'Session Terminated',
        prev ? `Signed out <strong>${prev.name}</strong>. Operations switched to public guest mode.` : 'Signed out successfully.',
        'info'
      );
      const path = window.location.pathname;
      if (path.includes('login.html')) {
        this.renderLoginPageState();
      }
    },

    renderHeaderAuth() {
      const user = this.getCurrentUser();
      
      let container = document.getElementById('header-auth-container');
      if (!container) {
        const navUl = document.querySelector('.main-nav ul');
        if (navUl) {
          container = document.createElement('li');
          container.className = 'nav-auth-item';
          container.id = 'header-auth-container';
          navUl.appendChild(container);
        }
      }

      if (!container) return;

      if (user) {
        const shortRole = user.role.split(' ')[0];
        container.innerHTML = `
          <div class="user-profile-menu-wrapper" id="user-profile-wrapper">
            <button type="button" class="user-profile-btn" id="btn-user-profile" aria-expanded="false" aria-haspopup="true" title="Signed in as ${user.name} (${user.role})">
              <span class="user-avatar-badge">${user.avatar || '👤'}</span>
              <span class="user-name-text">${user.name}</span>
              <span class="user-role-tag">${shortRole}</span>
              <span class="user-chevron" aria-hidden="true">&#9662;</span>
            </button>
            <div class="user-profile-dropdown" id="user-profile-dropdown" role="menu" aria-label="Operational Identity Menu" style="display: none;">
              <div class="dropdown-header">
                <div class="dropdown-avatar">${user.avatar || '👤'}</div>
                <div class="dropdown-user-info">
                  <strong>${user.name}</strong>
                  <span class="dropdown-email">${user.email}</span>
                  <span class="dropdown-agency-badge">${user.agency}</span>
                </div>
              </div>
              <div class="dropdown-meta-box">
                <div class="meta-row">
                  <span class="meta-label">Disaster Badge:</span>
                  <span class="meta-val">${user.badge}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Clearance:</span>
                  <span class="clearance-pill">${user.clearance}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Duty Status:</span>
                  <span class="duty-status-pill"><span class="dot"></span> ${user.status}</span>
                </div>
              </div>
              <div class="dropdown-section-title">Switch Active Demo Role</div>
              <div class="dropdown-persona-grid">
                <button type="button" class="btn-persona-quick ${user.id === 'USR-CMD-01' ? 'active' : ''}" data-switch-id="USR-CMD-01">
                  <span>👩‍⚕️</span> <span>Commander</span>
                </button>
                <button type="button" class="btn-persona-quick ${user.id === 'USR-LOG-02' ? 'active' : ''}" data-switch-id="USR-LOG-02">
                  <span>👨‍✈️</span> <span>Logistics</span>
                </button>
                <button type="button" class="btn-persona-quick ${user.id === 'USR-MED-03' ? 'active' : ''}" data-switch-id="USR-MED-03">
                  <span>👨‍⚕️</span> <span>Medical</span>
                </button>
                <button type="button" class="btn-persona-quick ${user.id === 'USR-VOL-04' ? 'active' : ''}" data-switch-id="USR-VOL-04">
                  <span>🦸‍♀️</span> <span>Volunteer</span>
                </button>
              </div>
              <div class="dropdown-footer">
                <a href="login.html" class="dropdown-link-portal">&#128737; Auth Center</a>
                <button type="button" class="btn-dropdown-logout" id="btn-dropdown-logout">&#128682; Sign Out</button>
              </div>
            </div>
          </div>
        `;

        const btnProfile = container.querySelector('#btn-user-profile');
        const dropdown = container.querySelector('#user-profile-dropdown');
        if (btnProfile && dropdown) {
          btnProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display !== 'none';
            dropdown.style.display = isOpen ? 'none' : 'flex';
            btnProfile.setAttribute('aria-expanded', !isOpen);
          });
        }

        document.addEventListener('click', (e) => {
          if (dropdown && !container.contains(e.target)) {
            dropdown.style.display = 'none';
            if (btnProfile) btnProfile.setAttribute('aria-expanded', 'false');
          }
        });

        container.querySelectorAll('.btn-persona-quick').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-switch-id');
            AuthManager.loginAsDemo(id);
          });
        });

        const btnLogout = container.querySelector('#btn-dropdown-logout');
        if (btnLogout) {
          btnLogout.addEventListener('click', () => AuthManager.logout());
        }

      } else {
        container.innerHTML = `
          <div class="nav-auth-buttons">
            <a href="login.html" class="btn-nav-auth btn-nav-signin" id="btn-nav-signin" title="Sign In to Operational Console">
              <span class="btn-auth-icon">&#128272;</span>
              <span>Login</span>
            </a>
            <a href="login.html?tab=signup" class="btn-nav-auth btn-nav-signup" id="btn-nav-signup" title="Register / Sign Up Personnel">
              <span class="btn-auth-icon">&#9997;</span>
              <span>Sign Up</span>
            </a>
          </div>
        `;

        const btnIn = container.querySelector('#btn-nav-signin');
        const btnUp = container.querySelector('#btn-nav-signup');
        if (btnIn) btnIn.addEventListener('click', (e) => {
          if (!window.location.pathname.includes('login.html')) {
            e.preventDefault();
            AuthManager.openModal('signin');
          }
        });
        if (btnUp) btnUp.addEventListener('click', (e) => {
          if (!window.location.pathname.includes('login.html')) {
            e.preventDefault();
            AuthManager.openModal('signup');
          }
        });
      }

      // Bind all other on-page login and signup triggers
      document.querySelectorAll('#nav-login-link, #top-bar-login-link, #prompt-login-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          if (!window.location.pathname.includes('login.html')) {
            e.preventDefault();
            AuthManager.openModal('signin');
          }
        });
      });

      document.querySelectorAll('#nav-signup-link, #top-bar-signup-link, #prompt-signup-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          if (!window.location.pathname.includes('login.html')) {
            e.preventDefault();
            AuthManager.openModal('signup');
          }
        });
      });
    },

    updateDemoBar() {
      const user = this.getCurrentUser();
      const avatarSpan = document.getElementById('demo-auth-avatar');
      const labelSpan = document.getElementById('demo-auth-label');
      if (avatarSpan && labelSpan) {
        if (user) {
          avatarSpan.innerHTML = user.avatar || '👤';
          labelSpan.innerHTML = `Personnel: <strong>${user.name}</strong> (${user.role.split(' ')[0]})`;
        } else {
          avatarSpan.innerHTML = '&#128100;';
          labelSpan.innerHTML = 'Personnel: <strong>Guest (Login)</strong>';
        }
      }
    },

    updatePageIfLoggedIn() {
      const user = this.getCurrentUser();
      const authPrompt = document.getElementById('page-auth-prompt');

      if (!user) {
        if (authPrompt) {
          authPrompt.innerHTML = `
            <span class="auth-prompt-text">&#128737; Emergency Personnel:</span>
            <a href="login.html" class="btn-prompt-login" id="prompt-login-btn" title="Sign In to Command Portal">&#128272; Login</a>
            <a href="login.html?tab=signup" class="btn-prompt-signup" id="prompt-signup-btn" title="Register New Responder">&#9997; Sign Up</a>
          `;
          const inBtn = authPrompt.querySelector('#prompt-login-btn');
          const upBtn = authPrompt.querySelector('#prompt-signup-btn');
          if (inBtn) inBtn.addEventListener('click', (e) => {
            if (!window.location.pathname.includes('login.html')) {
              e.preventDefault();
              AuthManager.openModal('signin');
            }
          });
          if (upBtn) upBtn.addEventListener('click', (e) => {
            if (!window.location.pathname.includes('login.html')) {
              e.preventDefault();
              AuthManager.openModal('signup');
            }
          });
        }
        return;
      }

      if (authPrompt) {
        const shortRole = user.role.split(' ')[0];
        authPrompt.innerHTML = `
          <span class="auth-prompt-text">&#128737; Active: <strong>${user.name}</strong> (${shortRole})</span>
          <a href="login.html" class="btn-prompt-login" style="padding:0.25rem 0.65rem;">Portal</a>
          <button type="button" class="btn-prompt-signup" id="btn-prompt-logout" style="cursor:pointer;border:1px solid #ef4444;color:#ef4444!important;background:transparent;">&#128682; Logout</button>
        `;
        const btnLogout = authPrompt.querySelector('#btn-prompt-logout');
        if (btnLogout) btnLogout.addEventListener('click', () => AuthManager.logout());
      }

      const path = window.location.pathname;
      if (path.includes('relief-requests.html')) {
        const nameField = document.getElementById('requester-name');
        const agencyField = document.getElementById('requester-agency');
        if (nameField && !nameField.value) nameField.value = user.name;
        if (agencyField && !agencyField.value) agencyField.value = user.agency;
      } else if (path.includes('allocation.html')) {
        const offField = document.getElementById('dispatch-officer');
        if (offField && !offField.value) offField.value = user.name;
      }
    },

    injectAuthModal() {
      if (document.getElementById('auth-modal')) return;

      const modal = document.createElement('div');
      modal.className = 'auth-modal-backdrop';
      modal.id = 'auth-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'auth-modal-title');
      modal.style.display = 'none';

      modal.innerHTML = `
        <div class="auth-modal-card">
          <button type="button" class="auth-modal-close" id="auth-modal-close-btn" aria-label="Close Authentication Portal">&times;</button>
          
          <div class="auth-modal-header">
            <div class="auth-modal-icon">&#9951;</div>
            <div>
              <h3 id="auth-modal-title">National Emergency Personnel Portal</h3>
              <p class="auth-modal-subtitle">Secure Multi-Agency Disaster Coordination System</p>
            </div>
          </div>

          <div class="auth-tab-switch" role="tablist">
            <button type="button" class="auth-tab-btn active" id="modal-tab-signin" role="tab" aria-selected="true" aria-controls="modal-panel-signin">
              <span>&#128272;</span> Sign In
            </button>
            <button type="button" class="auth-tab-btn" id="modal-tab-signup" role="tab" aria-selected="false" aria-controls="modal-panel-signup">
              <span>&#9997;</span> Sign Up / Register
            </button>
          </div>

          <div class="auth-panel-body">
            
            <div id="modal-auth-alert" style="display: none;"></div>

            <!-- TAB 1: SIGN IN -->
            <div id="modal-panel-signin" role="tabpanel" aria-labelledby="modal-tab-signin">
              
              <div class="auth-demo-section">
                <div class="auth-demo-label">
                  <span>1-Click Viva Demo Roles</span>
                  <span class="auth-demo-tag">Quick Login</span>
                </div>
                <div class="auth-demo-grid">
                  <button type="button" class="demo-account-card" data-modal-demo="USR-CMD-01">
                    <span class="demo-account-avatar">&#128105;&#8205;&#9877;&#65039;</span>
                    <div class="demo-account-info">
                      <div class="demo-account-name">Dr. Anita Nair</div>
                      <div class="demo-account-role">Incident Commander</div>
                    </div>
                  </button>

                  <button type="button" class="demo-account-card" data-modal-demo="USR-LOG-02">
                    <span class="demo-account-avatar">&#128104;&#8205;&#9992;&#65039;</span>
                    <div class="demo-account-info">
                      <div class="demo-account-name">Capt. V.K. Jadeja</div>
                      <div class="demo-account-role">Logistics Head</div>
                    </div>
                  </button>

                  <button type="button" class="demo-account-card" data-modal-demo="USR-MED-03">
                    <span class="demo-account-avatar">&#128104;&#8205;&#9877;&#65039;</span>
                    <div class="demo-account-info">
                      <div class="demo-account-name">Dr. Ashwin Menon</div>
                      <div class="demo-account-role">Medical Officer</div>
                    </div>
                  </button>

                  <button type="button" class="demo-account-card" data-modal-demo="USR-VOL-04">
                    <span class="demo-account-avatar">&#129464;&#8205;&#9792;&#65039;</span>
                    <div class="demo-account-info">
                      <div class="demo-account-name">Pooja Kadam</div>
                      <div class="demo-account-role">Volunteer Responder</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="auth-divider">Or Enter Official Credentials</div>

              <form id="modal-form-signin" class="auth-form" novalidate>
                <div class="auth-field">
                  <label for="modal-signin-id">Official Email or Disaster Badge ID <span class="required-indicator">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-icon">&#9993;</span>
                    <input type="text" id="modal-signin-id" placeholder="anita.nair@ndma.gov.in" required autocomplete="username">
                  </div>
                </div>

                <div class="auth-field">
                  <label for="modal-signin-pass">Passcode / Password <span class="required-indicator">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-icon">&#128274;</span>
                    <input type="password" id="modal-signin-pass" placeholder="Enter credentials (demo: password123)" required autocomplete="current-password">
                    <button type="button" class="btn-toggle-password" data-target="modal-signin-pass" aria-label="Toggle password visibility">&#128065;</button>
                  </div>
                </div>

                <div class="auth-form-row">
                  <label class="auth-checkbox-label">
                    <input type="checkbox" id="modal-signin-remember" checked>
                    <span>Keep console session active</span>
                  </label>
                  <a href="login.html" class="auth-link">Need Help?</a>
                </div>

                <button type="submit" class="btn-auth-submit" id="btn-modal-submit-signin">
                  <span>&#128272;</span> Authorize &amp; Sign In
                </button>

                <p class="auth-switch-note">
                  New emergency responder or volunteer? 
                  <a href="#" class="auth-link" id="modal-switch-to-signup">Sign Up / Register here &rarr;</a>
                </p>
              </form>

            </div>

            <!-- TAB 2: SIGN UP ("Signing option") -->
            <div id="modal-panel-signup" role="tabpanel" aria-labelledby="modal-tab-signup" style="display: none;">
              
              <form id="modal-form-signup" class="auth-form" novalidate>
                
                <div class="auth-field">
                  <label>Operational Duty Role <span class="required-indicator">*</span></label>
                  <div class="role-pills-selector">
                    <label class="role-pill-option">
                      <input type="radio" name="modal_reg_role" value="Incident Commander" checked>
                      <div class="role-pill-card">
                        <span class="role-pill-icon">&#128737;</span>
                        <span class="role-pill-text">Commander</span>
                      </div>
                    </label>

                    <label class="role-pill-option">
                      <input type="radio" name="modal_reg_role" value="Warehouse Logistics Head">
                      <div class="role-pill-card">
                        <span class="role-pill-icon">&#128230;</span>
                        <span class="role-pill-text">Logistics</span>
                      </div>
                    </label>

                    <label class="role-pill-option">
                      <input type="radio" name="modal_reg_role" value="Field Medical Officer">
                      <div class="role-pill-card">
                        <span class="role-pill-icon">&#128104;&#8205;&#9877;&#65039;</span>
                        <span class="role-pill-text">Medical</span>
                      </div>
                    </label>

                    <label class="role-pill-option">
                      <input type="radio" name="modal_reg_role" value="Registered Volunteer Responder">
                      <div class="role-pill-card">
                        <span class="role-pill-icon">&#129309;</span>
                        <span class="role-pill-text">Volunteer</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="auth-field">
                  <label for="modal-reg-name">Full Official Name <span class="required-indicator">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-icon">&#128100;</span>
                    <input type="text" id="modal-reg-name" placeholder="e.g. Major Vikram Sen" required autocomplete="name">
                  </div>
                </div>

                <div class="auth-field">
                  <label for="modal-reg-agency">Organization / Agency <span class="required-indicator">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-icon">&#127970;</span>
                    <select id="modal-reg-agency" required>
                      <option value="National Disaster Response Force (NDRF)" selected>National Disaster Response Force (NDRF)</option>
                      <option value="State Disaster Management Authority (SDMA)">State Disaster Management Authority (SDMA)</option>
                      <option value="Indian Red Cross Society (IRCS)">Indian Red Cross Society (IRCS)</option>
                      <option value="Civil Defense &amp; Citizen Corps">Civil Defense &amp; Citizen Corps</option>
                      <option value="Independent Humanitarian Volunteer">Independent Humanitarian Volunteer</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="auth-field">
                    <label for="modal-reg-email">Official Email <span class="required-indicator">*</span></label>
                    <div class="input-with-icon">
                      <span class="field-icon">&#9993;</span>
                      <input type="email" id="modal-reg-email" placeholder="name@agency.gov.in" required autocomplete="email">
                    </div>
                  </div>

                  <div class="auth-field">
                    <label for="modal-reg-phone">Emergency Phone <span class="required-indicator">*</span></label>
                    <div class="input-with-icon">
                      <span class="field-icon">&#128222;</span>
                      <input type="tel" id="modal-reg-phone" placeholder="Mobile Number" required autocomplete="tel">
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="auth-field">
                    <label for="modal-reg-pass">Create Password <span class="required-indicator">*</span></label>
                    <div class="input-with-icon">
                      <span class="field-icon">&#128274;</span>
                      <input type="password" id="modal-reg-pass" placeholder="Min 6 chars" required autocomplete="new-password">
                      <button type="button" class="btn-toggle-password" data-target="modal-reg-pass" aria-label="Toggle password visibility">&#128065;</button>
                    </div>
                  </div>

                  <div class="auth-field">
                    <label for="modal-reg-confirm">Confirm Password <span class="required-indicator">*</span></label>
                    <div class="input-with-icon">
                      <span class="field-icon">&#128274;</span>
                      <input type="password" id="modal-reg-confirm" placeholder="Re-type password" required autocomplete="new-password">
                      <button type="button" class="btn-toggle-password" data-target="modal-reg-confirm" aria-label="Toggle password visibility">&#128065;</button>
                    </div>
                  </div>
                </div>

                <div class="auth-field" style="margin-top: 0.25rem;">
                  <label class="auth-checkbox-label">
                    <input type="checkbox" id="modal-reg-terms" required>
                    <span style="font-size: 0.75rem;">I pledge adherence to the Sphere Humanitarian Charter and NDRF code of conduct.</span>
                  </label>
                </div>

                <button type="submit" class="btn-auth-submit" id="btn-modal-submit-signup">
                  <span>&#9997;</span> Create Account &amp; Sign In
                </button>

                <p class="auth-switch-note">
                  Already credentialed? 
                  <a href="#" class="auth-link" id="modal-switch-to-signin">Sign In to Operations &rarr;</a>
                </p>
              </form>

            </div>

          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('#auth-modal-close-btn').addEventListener('click', () => this.closeModal());
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') {
          this.closeModal();
        }
      });

      modal.querySelector('#modal-tab-signin').addEventListener('click', () => this.switchModalTab('signin'));
      modal.querySelector('#modal-tab-signup').addEventListener('click', () => this.switchModalTab('signup'));
      modal.querySelector('#modal-switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        this.switchModalTab('signup');
      });
      modal.querySelector('#modal-switch-to-signin').addEventListener('click', (e) => {
        e.preventDefault();
        this.switchModalTab('signin');
      });

      modal.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          const input = modal.querySelector('#' + targetId);
          if (input) {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = isPass ? '&#128584;' : '&#128065;';
          }
        });
      });

      modal.querySelectorAll('[data-modal-demo]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-modal-demo');
          this.loginAsDemo(id);
        });
      });

      modal.querySelector('#modal-form-signin').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = modal.querySelector('#modal-signin-id').value;
        const pass = modal.querySelector('#modal-signin-pass').value;
        const remember = modal.querySelector('#modal-signin-remember').checked;
        const res = this.login(id, pass, remember);
        if (!res.success) {
          this.showModalAlert(res.message, 'error');
        }
      });

      modal.querySelector('#modal-form-signup').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = modal.querySelector('input[name="modal_reg_role"]:checked')?.value;
        const name = modal.querySelector('#modal-reg-name').value;
        const agency = modal.querySelector('#modal-reg-agency').value;
        const email = modal.querySelector('#modal-reg-email').value;
        const phone = modal.querySelector('#modal-reg-phone').value;
        const password = modal.querySelector('#modal-reg-pass').value;
        const confirmPassword = modal.querySelector('#modal-reg-confirm').value;
        const terms = modal.querySelector('#modal-reg-terms').checked;

        const res = this.register({
          role, name, agency, email, phone, password, confirmPassword, terms
        });

        if (!res.success) {
          this.showModalAlert(res.message, 'error');
        }
      });
    },

    openModal(defaultTab = 'signin') {
      this.injectAuthModal();
      const modal = document.getElementById('auth-modal');
      if (modal) {
        this.switchModalTab(defaultTab);
        this.clearModalAlert();
        modal.style.display = 'flex';
        setTimeout(() => {
          if (defaultTab === 'signin') {
            const el = modal.querySelector('#modal-signin-id');
            if (el) el.focus();
          } else {
            const el = modal.querySelector('#modal-reg-name');
            if (el) el.focus();
          }
        }, 100);
      }
    },

    closeModal() {
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    },

    switchModalTab(tabName) {
      const modal = document.getElementById('auth-modal');
      if (!modal) return;
      const tabIn = modal.querySelector('#modal-tab-signin');
      const tabUp = modal.querySelector('#modal-tab-signup');
      const panelIn = modal.querySelector('#modal-panel-signin');
      const panelUp = modal.querySelector('#modal-panel-signup');

      this.clearModalAlert();

      if (tabName === 'signin') {
        tabIn.classList.add('active');
        tabIn.setAttribute('aria-selected', 'true');
        tabUp.classList.remove('active');
        tabUp.setAttribute('aria-selected', 'false');
        panelIn.style.display = 'block';
        panelUp.style.display = 'none';
      } else {
        tabUp.classList.add('active');
        tabUp.setAttribute('aria-selected', 'true');
        tabIn.classList.remove('active');
        tabIn.setAttribute('aria-selected', 'false');
        panelUp.style.display = 'block';
        panelIn.style.display = 'none';
      }
    },

    showModalAlert(msg, type = 'error') {
      const alertBox = document.getElementById('modal-auth-alert');
      if (alertBox) {
        alertBox.className = `auth-alert auth-alert-${type}`;
        alertBox.innerHTML = `<span>${type === 'error' ? '&#9888;' : '&#10004;'}</span> <span>${msg}</span>`;
        alertBox.style.display = 'flex';
      }
    },

    clearModalAlert() {
      const alertBox = document.getElementById('modal-auth-alert');
      if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.innerHTML = '';
      }
    },

    initLoginPage() {
      const path = window.location.pathname;
      if (!path.includes('login.html')) return;

      this.renderLoginPageState();

      const tabIn = document.getElementById('page-tab-signin');
      const tabUp = document.getElementById('page-tab-signup');
      const panelIn = document.getElementById('page-panel-signin');
      const panelUp = document.getElementById('page-panel-signup');

      const switchPageTab = (tab) => {
        this.clearPageAlert();
        if (tab === 'signin') {
          tabIn.classList.add('active');
          tabIn.setAttribute('aria-selected', 'true');
          tabUp.classList.remove('active');
          tabUp.setAttribute('aria-selected', 'false');
          panelIn.style.display = 'block';
          panelUp.style.display = 'none';
        } else {
          tabUp.classList.add('active');
          tabUp.setAttribute('aria-selected', 'true');
          tabIn.classList.remove('active');
          tabIn.setAttribute('aria-selected', 'false');
          panelUp.style.display = 'block';
          panelIn.style.display = 'none';
        }
      };

      if (tabIn && tabUp) {
        tabIn.addEventListener('click', () => switchPageTab('signin'));
        tabUp.addEventListener('click', () => switchPageTab('signup'));
      }

      // Check URL parameters for ?tab=signup
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'signup') {
        switchPageTab('signup');
      }

      const switchInLink = document.getElementById('page-switch-to-signin');
      const switchUpLink = document.getElementById('page-switch-to-signup');
      if (switchInLink) switchInLink.addEventListener('click', (e) => { e.preventDefault(); switchPageTab('signin'); });
      if (switchUpLink) switchUpLink.addEventListener('click', (e) => { e.preventDefault(); switchPageTab('signup'); });

      document.querySelectorAll('[data-demo-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-demo-id');
          AuthManager.loginAsDemo(id);
        });
      });

      document.querySelectorAll('#page-auth-forms-container .btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          const input = document.getElementById(targetId);
          if (input) {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = isPass ? '&#128584;' : '&#128065;';
          }
        });
      });

      const formIn = document.getElementById('page-form-signin');
      if (formIn) {
        formIn.addEventListener('submit', (e) => {
          e.preventDefault();
          const id = document.getElementById('page-signin-identifier').value;
          const pass = document.getElementById('page-signin-password').value;
          const remember = document.getElementById('page-signin-remember').checked;
          const res = this.login(id, pass, remember);
          if (!res.success) {
            this.showPageAlert(res.message, 'error');
          }
        });
      }

      const formUp = document.getElementById('page-form-signup');
      if (formUp) {
        formUp.addEventListener('submit', (e) => {
          e.preventDefault();
          const role = document.querySelector('input[name="page_reg_role"]:checked')?.value;
          const name = document.getElementById('page-reg-fullname').value;
          const agency = document.getElementById('page-reg-agency').value;
          const email = document.getElementById('page-reg-email').value;
          const phone = document.getElementById('page-reg-phone').value;
          const badge = document.getElementById('page-reg-badge').value;
          const password = document.getElementById('page-reg-password').value;
          const confirmPassword = document.getElementById('page-reg-confirm-password').value;
          const terms = document.getElementById('page-reg-terms').checked;

          const res = this.register({
            role, name, agency, email, phone, badge, password, confirmPassword, terms
          });

          if (!res.success) {
            this.showPageAlert(res.message, 'error');
          }
        });
      }

      const btnPageLogout = document.getElementById('btn-page-logout');
      if (btnPageLogout) {
        btnPageLogout.addEventListener('click', () => this.logout());
      }
    },

    renderLoginPageState() {
      const user = this.getCurrentUser();
      const loggedInView = document.getElementById('page-auth-logged-in');
      const formsView = document.getElementById('page-auth-forms-container');

      if (!formsView) return;
      formsView.style.display = 'block';

      if (loggedInView) {
        if (user) {
          loggedInView.style.display = 'flex';
          document.getElementById('page-user-avatar').innerHTML = user.avatar || '&#128100;';
          document.getElementById('page-user-greeting').textContent = `Active Session: ${user.name}`;
          document.getElementById('page-user-sub').textContent = `Currently authenticated as ${user.role} (${user.agency}). You can switch accounts or sign in below:`;

          document.getElementById('page-detail-name').textContent = user.name;
          document.getElementById('page-detail-role').textContent = user.role;
          document.getElementById('page-detail-agency').textContent = user.agency;
          document.getElementById('page-detail-badge').textContent = user.badge;
          document.getElementById('page-detail-clearance').textContent = user.clearance;
        } else {
          loggedInView.style.display = 'none';
        }
      }
    },

    showPageAlert(msg, type = 'error') {
      const alertBox = document.getElementById('page-auth-alert');
      if (alertBox) {
        alertBox.className = `auth-alert auth-alert-${type}`;
        alertBox.innerHTML = `<span>${type === 'error' ? '&#9888;' : '&#10004;'}</span> <span>${msg}</span>`;
        alertBox.style.display = 'flex';
      }
    },

    clearPageAlert() {
      const alertBox = document.getElementById('page-auth-alert');
      if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.innerHTML = '';
      }
    },

    init() {
      this.injectAuthModal();
      this.renderHeaderAuth();
      this.updateDemoBar();
      this.updatePageIfLoggedIn();

      const path = window.location.pathname;
      if (path.includes('login.html')) {
        this.initLoginPage();
      }
    }
  };

  // --------------------------------------------------------------------------
  // 4. Inject Demo Control Toolbar at top of page
  // --------------------------------------------------------------------------
  function injectDemoToolbar() {
    const bar = document.createElement('div');
    bar.className = 'demo-control-bar';
    const isDark = (document.documentElement.getAttribute('data-theme') || ThemeManager.getSavedTheme()) === 'dark';
    bar.innerHTML = `
      <div class="demo-title-group">
        <span class="demo-badge-tag">&#9874; Prototype Active</span>
        <span><strong>Viva Demo Engine:</strong> Live Data Synchronized Across All Pages</span>
      </div>
      <div class="demo-actions-group">
        <button type="button" class="btn-demo" id="btn-demo-auth-status" title="Current Active Personnel (Click to Login / Switch)">
          <span id="demo-auth-avatar">&#128100;</span>
          <span id="demo-auth-label">Personnel: Guest (Sign In)</span>
        </button>
        <button type="button" class="btn-demo" id="btn-demo-theme" title="Toggle Theme (Dark / Light)">
          <span class="theme-toggle-icon">${isDark ? '&#9728;' : '&#9790;'}</span>
          <span class="theme-toggle-text">${isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
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
    document.getElementById('btn-demo-auth-status').addEventListener('click', () => AuthManager.openModal());
    document.getElementById('btn-demo-theme').addEventListener('click', () => ThemeManager.toggle());
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

    if (path.includes('login.html')) {
      const emailInput = document.getElementById('page-signin-identifier');
      const passInput = document.getElementById('page-signin-password');
      if (emailInput && passInput && emailInput.offsetParent !== null) {
        emailInput.value = 'anita.nair@ndma.gov.in';
        passInput.value = 'password123';
        showToast('Form Autofilled', 'Incident Commander demo credentials loaded. Click "Authorize & Sign In".', 'success');
      } else {
        const regName = document.getElementById('page-reg-fullname');
        if (regName) {
          regName.value = 'Major Vikramaditya Sen';
          document.getElementById('page-reg-email').value = 'v.sen@ndma.gov.in';
          document.getElementById('page-reg-phone').value = '9845012399';
          document.getElementById('page-reg-agency').value = 'National Disaster Response Force (NDRF)';
          document.getElementById('page-reg-badge').value = 'NDRF-IC-9921';
          document.getElementById('page-reg-password').value = 'password123';
          document.getElementById('page-reg-confirm-password').value = 'password123';
          const terms = document.getElementById('page-reg-terms');
          if (terms) terms.checked = true;
          showToast('Form Autofilled', 'New incident responder profile loaded for registration.', 'success');
        }
      }
    } else if (path.includes('relief-requests.html')) {
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
    ThemeManager.init();
    injectDemoToolbar();
    AuthManager.init();

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
    } else if (path.endsWith('login.html')) {
      // Handled in AuthManager.init()
    } else {
      // index.html / default
      initDashboard();
    }
  });

})();

/**
 * =============================================
 * RTRWH & AR Assessment Platform — script.js
 * Version: 1.0.0
 * Description: Complete JavaScript logic for the
 * Rooftop Rainwater Harvesting & Artificial
 * Recharge Assessment web application.
 *
 * Modules:
 *  1. initLoader           — Loading overlay
 *  2. initTheme            — Dark/Light mode
 *  3. initNavbar           — Sticky nav & active link
 *  4. initBackToTop        — Scroll-to-top button
 *  5. initScrollAnimations — IntersectionObserver animations
 *  6. initFormWizard       — Multi-step form navigation
 *  7. validateStep         — Per-step input validation
 *  8. populateSummary      — Step 4 summary panel
 *  9. calculateAssessment  — Core calculation engine
 * 10. animateCounters      — Animated number counters
 * 11. initCircularProgress — SVG circular progress
 * 12. initCharts           — Chart.js visualizations
 * 13. updateCharts         — Update charts with user data
 * 14. generateRecommendations — Dynamic rec cards
 * 15. generateReport       — Printable report
 * 16. initFAQ              — FAQ keyboard accessibility
 * 17. initContactForm      — Contact form handling
 * 18. initNewsletter       — Newsletter subscription
 * 19. showToast            — Toast notifications
 * 20. DOMContentLoaded     — App initialization
 * =============================================
 */

'use strict';

/* =============================================
   GLOBAL STATE
============================================= */
/** Stores all user form inputs */
let formData = {};

/** Stores all calculated assessment results */
let assessmentResults = {};

/** Current active wizard step (1–4) */
let currentStep = 1;
const TOTAL_STEPS = 4;

/** Chart.js instances (stored to allow updates) */
const chartInstances = {};

/* =============================================
   1. LOADER
   Fades out the loading overlay after the page
   has fully rendered.
============================================= */
function initLoader() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  // Delay allows fonts and layout to stabilise
  setTimeout(() => {
    overlay.classList.add('hidden');
    // Remove from DOM after animation completes
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }, 1200);
}

/* =============================================
   2. THEME SWITCHER
   Toggles between light and dark modes.
   Persists preference in localStorage.
============================================= */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;

  /** Apply a theme and update UI */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('rtrwh-theme', theme);

    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      themeIcon.className = 'fas fa-moon';
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }

    // Re-apply chart themes if charts exist
    updateChartTheme(theme);
  }

  // Restore saved theme or default to light
  const savedTheme = localStorage.getItem('rtrwh-theme') || 'light';
  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

/** Update Chart.js global defaults based on theme */
function updateChartTheme(theme) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#8da9c4' : '#4a5568';
  const gridColor = isDark ? 'rgba(0,180,216,0.1)' : 'rgba(0,119,182,0.08)';

  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;

  // Update all existing chart instances
  Object.values(chartInstances).forEach(chart => {
    if (!chart) return;
    chart.options.scales && Object.values(chart.options.scales).forEach(scale => {
      scale.ticks = { ...scale.ticks, color: textColor };
      scale.grid  = { ...scale.grid, color: gridColor };
    });
    chart.update('none');
  });
}

/* =============================================
   3. NAVBAR
   - Adds 'scrolled' class on scroll for compact style
   - Highlights active nav link based on scroll position
   - Closes mobile menu after a nav link click
============================================= */
function initNavbar() {
  const navbar  = document.getElementById('main-navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const collapse = document.getElementById('navbarNav');

  /** Navbar shrink on scroll */
  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active link
    updateActiveNavLink();
  }

  /** Mark nav link as active based on current section in view */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    let currentId = '';

    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on load

  // Close mobile menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const bsCollapse = bootstrap.Collapse.getInstance(collapse);
      if (bsCollapse) bsCollapse.hide();
    });
  });
}

/* =============================================
   4. BACK TO TOP
   Shows/hides the back-to-top button based on
   scroll position, scrolls smoothly to top.
============================================= */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   5. SCROLL ANIMATIONS
   Uses IntersectionObserver to trigger CSS
   animations when elements enter the viewport.
============================================= */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* =============================================
   6. FORM WIZARD
   Manages multi-step form navigation, progress
   bar updates, and step indicator states.
============================================= */
function initFormWizard() {
  const nextBtn   = document.getElementById('next-btn');
  const prevBtn   = document.getElementById('prev-btn');
  const submitBtn = document.getElementById('submit-btn');
  const form      = document.getElementById('assessment-form');

  if (!nextBtn || !prevBtn || !submitBtn || !form) return;

  // Initialize progress
  updateWizardUI();

  /** Move to the next step */
  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        markStepCompleted(currentStep);
        currentStep++;
        showStep(currentStep);
        updateWizardUI();
        if (currentStep === TOTAL_STEPS) {
          populateSummary();
        }
      }
    }
  });

  /** Move to the previous step */
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
      updateWizardUI();
    }
  });

  /** Handle form submission */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      collectFormData();
      assessmentResults = calculateAssessment(formData);
      displayResults(assessmentResults);
      generateReport(formData, assessmentResults);
      updateCharts(assessmentResults);
      generateRecommendationsFromResults(assessmentResults);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        showToast('success', 'Assessment Complete!', 'Your rainwater harvesting potential has been calculated.');
      }, 300);
    }
  });
}

/** Show the specified step panel */
function showStep(step) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`form-step-${step}`);
  if (target) target.classList.add('active');

  // Scroll wizard into view on mobile
  document.getElementById('assessment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Update progress bar, step indicators, buttons, and counter */
function updateWizardUI() {
  // Progress bar fill
  const progressFill = document.getElementById('wizard-progress-fill');
  const progressPercent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  if (progressFill) progressFill.style.width = `${progressPercent}%`;

  // Step indicators
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const ind = document.getElementById(`step-ind-${i}`);
    if (!ind) continue;
    ind.classList.remove('active', 'completed');
    if (i === currentStep) ind.classList.add('active');
    else if (i < currentStep) ind.classList.add('completed');
  }

  // Buttons
  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const counter   = document.getElementById('step-counter');

  if (prevBtn) prevBtn.disabled = currentStep === 1;

  if (currentStep === TOTAL_STEPS) {
    nextBtn?.classList.add('d-none');
    submitBtn?.classList.remove('d-none');
  } else {
    nextBtn?.classList.remove('d-none');
    submitBtn?.classList.add('d-none');
  }

  if (counter) counter.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;

  // Update aria-valuenow on progressbar
  const progressbar = document.querySelector('.wizard-progress');
  if (progressbar) progressbar.setAttribute('aria-valuenow', currentStep);
}

/** Mark a step's indicator as completed */
function markStepCompleted(step) {
  const ind = document.getElementById(`step-ind-${step}`);
  if (ind) {
    ind.classList.remove('active');
    ind.classList.add('completed');
  }
}

/* =============================================
   7. FORM VALIDATION
   Validates all required fields in the given step.
   Shows inline error messages.
============================================= */
function validateStep(step) {
  const stepEl = document.getElementById(`form-step-${step}`);
  if (!stepEl) return true;

  const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;

  inputs.forEach(input => {
    const errorEl = document.getElementById(`${input.id}-error`);
    clearError(input, errorEl);

    const value = input.value.trim();

    if (!value) {
      showError(input, errorEl, `${getFieldLabel(input)} is required.`);
      isValid = false;
    } else if (input.type === 'number') {
      const num = parseFloat(value);
      const min = parseFloat(input.getAttribute('min'));
      const max = parseFloat(input.getAttribute('max'));

      if (isNaN(num)) {
        showError(input, errorEl, 'Please enter a valid number.');
        isValid = false;
      } else if (!isNaN(min) && num < min) {
        showError(input, errorEl, `Value must be at least ${min}.`);
        isValid = false;
      } else if (!isNaN(max) && num > max) {
        showError(input, errorEl, `Value must not exceed ${max}.`);
        isValid = false;
      }
    } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showError(input, errorEl, 'Please enter a valid email address.');
      isValid = false;
    }
  });

  if (!isValid) {
    // Focus the first invalid field for accessibility
    const firstInvalid = stepEl.querySelector('.is-invalid');
    if (firstInvalid) firstInvalid.focus();
  }

  return isValid;
}

/** Display an error on a form field */
function showError(input, errorEl, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  if (errorEl) errorEl.textContent = message;
}

/** Clear error state from a form field */
function clearError(input, errorEl) {
  input.classList.remove('is-invalid');
  if (errorEl) errorEl.textContent = '';
}

/** Extract a human-readable label from an input element */
function getFieldLabel(input) {
  const label = document.querySelector(`label[for="${input.id}"]`);
  if (label) {
    return label.textContent.replace('*', '').trim();
  }
  return 'This field';
}

/* =============================================
   8. SUMMARY PANEL (Step 4)
   Populates the summary preview in the last step
   with data collected from steps 1–3.
============================================= */
function populateSummary() {
  const container = document.getElementById('summary-content');
  if (!container) return;

  // Collect current data to display
  const tempData = collectFormDataObject();

  const summaryItems = [
    { label: 'Owner Name',      value: tempData.ownerName || '—' },
    { label: 'Building Type',   value: capitalise(tempData.buildingType) || '—' },
    { label: 'Location',        value: tempData.location || '—' },
    { label: 'Rooftop Area',    value: tempData.rooftopArea ? `${tempData.rooftopArea} m²` : '—' },
    { label: 'Roof Material',   value: getMaterialLabel(tempData.roofMaterial) },
    { label: 'Annual Rainfall', value: tempData.annualRainfall ? `${tempData.annualRainfall} mm` : '—' },
    { label: 'Soil Type',       value: capitalise(tempData.soilType) || '—' },
    { label: 'GW Level',        value: tempData.groundwaterLevel ? `${tempData.groundwaterLevel} m` : '—' },
  ];

  container.innerHTML = summaryItems.map(item => `
    <div class="col-6">
      <div class="summary-item">
        <span class="summary-label">${item.label}</span>
        <span class="summary-value">${item.value}</span>
      </div>
    </div>
  `).join('');
}

/* =============================================
   9. ASSESSMENT CALCULATION ENGINE
   Uses standard hydrological formulas:
   - Harvesting Potential: V = R × A × C × η
   - Tank Capacity: 20–25 days of demand
   - Recharge Potential: based on soil permeability
   - Suitability Score: weighted multi-factor index
============================================= */

/** Collect all form data into a flat object */
function collectFormData() {
  formData = collectFormDataObject();
}

function collectFormDataObject() {
  const form = document.getElementById('assessment-form');
  if (!form) return {};

  const data = {};
  const fields = form.querySelectorAll('input, select, textarea');

  fields.forEach(field => {
    if (field.name) {
      data[field.name] = field.value.trim();
    }
  });

  return data;
}

/**
 * Core assessment calculation.
 * @param {Object} data - Form data object
 * @returns {Object} - Calculated assessment results
 */
function calculateAssessment(data) {
  // --- Runoff Coefficient from roof material ---
  const runoffCoefficients = {
    rcc:    0.85,
    tile:   0.80,
    metal:  0.90,
    asphalt:0.85,
    grass:  0.30,
    '':     0.75  // default
  };

  // --- Condition factor ---
  const conditionFactors = {
    excellent: 1.00,
    good:      0.90,
    fair:      0.75,
    poor:      0.55,
    '':        0.80  // default
  };

  // --- Soil permeability rates (m/day) for recharge ---
  const soilPermeabilityRates = {
    sandy:   0.25,
    loamy:   0.15,
    clayey:  0.05,
    gravelly:0.35,
    black:   0.08,
    '':      0.15  // default
  };

  // --- Feasibility multipliers ---
  const feasibilityMultipliers = {
    'high':         1.0,
    'moderate':     0.7,
    'low':          0.4,
    'not-feasible': 0.0,
    '':             0.5
  };

  // --- Parse inputs with fallbacks ---
  const R  = parseFloat(data.annualRainfall) || 800;   // mm/year
  const A  = parseFloat(data.rooftopArea)    || 100;   // m²
  const C  = runoffCoefficients[data.roofMaterial] || 0.75; // dimensionless
  const Cf = conditionFactors[data.roofCondition] || 0.80;  // condition factor
  const η  = 0.85; // System efficiency (standard value)
  const n  = parseInt(data.numOccupants)     || 4;     // persons
  const q  = parseFloat(data.dailyConsumption) || 150; // L/person/day
  const gwLevel = parseFloat(data.groundwaterLevel) || 15; // m
  const soilRate = soilPermeabilityRates[data.soilType] || 0.15;
  const feasMult = feasibilityMultipliers[data.rechargeFeasibility] || 0.5;

  // --- 1. Annual Harvesting Potential (litres/year) ---
  // Formula: V = R(mm) × A(m²) × C × Cf × η
  // 1mm rain on 1m² = 1 litre
  const annualHarvestPotential = Math.round(R * A * C * Cf * η);

  // --- 2. Annual Water Demand (litres/year) ---
  const annualDemand = n * q * 365;

  // --- 3. Demand Coverage (%) ---
  const demandCoverage = Math.min(100, Math.round((annualHarvestPotential / annualDemand) * 100));

  // --- 4. Recommended Tank Capacity (litres) ---
  // Based on 20 dry days of demand
  const dailyDemand = n * q;
  const tankCapacity = Math.round(dailyDemand * 20);

  // --- 5. Recharge Pit Volume (m³) ---
  // Based on peak 24-hr rainfall event (10% of annual), pit dimensions, soil rate
  const peakRainfall = (R * 0.10) / 1000; // m (10th-percentile event)
  const rechargeVolume = Math.round(A * peakRainfall * 10) / 10; // m³

  // --- 6. Artificial Recharge Potential (litres/year) ---
  // Recharge = Runoff × soil permeability factor × feasibility multiplier
  const rechargeRunoff = R * A * (1 - C) / 1000; // m³/year (non-harvested runoff)
  const artificialRechargePotential = Math.round(rechargeRunoff * soilRate * feasMult * 1000); // L/year

  // --- 7. Estimated Water Savings (₹/year) ---
  // Assume ₹8 per 1000L (average municipal rate in India)
  const waterRatePerLitre = 0.008; // ₹/L
  const estimatedSavings = Math.round(Math.min(annualHarvestPotential, annualDemand) * waterRatePerLitre);

  // --- 8. Suitability Score (0–100) ---
  // Weighted index of 5 factors:
  // a) Rainfall adequacy   (30%) — R ≥ 600mm = full score
  // b) Roof area           (20%) — A ≥ 100m² = full score
  // c) Soil permeability   (20%) — normalized to [0,1]
  // d) Demand coverage     (20%) — % of demand met
  // e) GW depth suitability(10%) — deeper = better for recharge
  const rainfallScore    = Math.min(1, R / 600);
  const areaScore        = Math.min(1, A / 100);
  const soilScore        = Math.min(1, soilRate / 0.35);
  const coverageScore    = demandCoverage / 100;
  const gwScore          = Math.min(1, gwLevel / 30);

  const suitabilityScore = Math.round(
    (rainfallScore    * 30) +
    (areaScore        * 20) +
    (soilScore        * 20) +
    (coverageScore    * 20) +
    (gwScore          * 10)
  );

  // --- 9. Monthly collection (sample distribution) ---
  // Uses typical South Asian monsoon distribution factors
  const monthlyFactors = [0.02, 0.02, 0.03, 0.05, 0.08, 0.15, 0.20, 0.18, 0.12, 0.08, 0.04, 0.03];
  const monthlyCollection = monthlyFactors.map(f => Math.round(annualHarvestPotential * f));

  return {
    annualHarvestPotential,
    tankCapacity,
    rechargeVolume,
    artificialRechargePotential,
    estimatedSavings,
    demandCoverage,
    suitabilityScore,
    annualDemand,
    dailyDemand,
    monthlyCollection,
    runoffCoeff: (C * Cf).toFixed(2),
    // Raw inputs for report
    R, A, C, Cf, n, q
  };
}

/* =============================================
   DISPLAY RESULTS
   Reveals the results section and populates all
   animated cards and the circular progress.
============================================= */
function displayResults(results) {
  // Show sections
  const resultsSec = document.getElementById('results');
  const reportSec  = document.getElementById('report');
  if (resultsSec) resultsSec.classList.remove('d-none');
  if (reportSec)  reportSec.classList.remove('d-none');

  // Set counter targets
  setCounterTarget('counter-harvest',  results.annualHarvestPotential,    'progress-harvest',  results.annualHarvestPotential, results.annualDemand * 1.2);
  setCounterTarget('counter-tank',     results.tankCapacity,               'progress-tank',     results.tankCapacity,            50000);
  setCounterTarget('counter-pit',      results.rechargeVolume,             'progress-pit',      results.rechargeVolume,          20);
  setCounterTarget('counter-recharge', results.artificialRechargePotential,'progress-recharge', results.artificialRechargePotential, results.annualDemand);
  setCounterTarget('counter-savings',  results.estimatedSavings,           'progress-savings',  results.estimatedSavings,        100000);
  setCounterTarget('counter-coverage', results.demandCoverage,             'progress-coverage', results.demandCoverage,          100);

  // Animate counters after a brief delay
  setTimeout(() => animateCounters(), 400);

  // Circular progress
  setTimeout(() => animateCircularProgress(results.suitabilityScore), 300);

  // Score description
  updateScoreDescription(results.suitabilityScore);

  // Trigger scroll animations for results section
  resultsSec.querySelectorAll('[data-animate]').forEach(el => {
    if (!el.classList.contains('animated')) el.classList.add('animated');
  });
}

/** Set target value and progress bar width for a result card */
function setCounterTarget(counterId, value, progressId, current, max) {
  const counter = document.getElementById(counterId);
  if (counter) counter.setAttribute('data-target', Math.round(value));

  const progress = document.getElementById(progressId);
  if (progress && max > 0) {
    const pct = Math.min(100, (current / max) * 100);
    setTimeout(() => { progress.style.width = `${pct}%`; }, 600);
  }
}

/* =============================================
   10. ANIMATED COUNTERS
   Smoothly animates number values from 0 to target.
============================================= */
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target')) || 0;
    const duration = 1800;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      counter.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

/** Format a number with commas */
function formatNumber(num) {
  return num.toLocaleString('en-IN');
}

/* =============================================
   11. CIRCULAR PROGRESS
   Animates the SVG stroke-dashoffset to show
   the suitability score.
============================================= */
function animateCircularProgress(score) {
  const circle = document.getElementById('cp-fill-circle');
  const scoreEl = document.getElementById('suitability-score');
  if (!circle || !scoreEl) return;

  // Add gradient definition to SVG
  const svg = circle.closest('svg');
  if (svg && !svg.querySelector('#cp-gradient')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="cp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#0077b6"/>
        <stop offset="100%" stop-color="#00b4d8"/>
      </linearGradient>
    `;
    svg.prepend(defs);
  }

  // Circumference for r=52 → 2π×52 ≈ 327
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  circle.style.strokeDasharray  = circumference;
  circle.style.strokeDashoffset = circumference; // start at 0

  // Animate
  setTimeout(() => {
    circle.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Animate score number
  const duration = 2000;
  const startTime = performance.now();

  function animateScore(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    scoreEl.textContent = Math.round(eased * score);
    if (progress < 1) requestAnimationFrame(animateScore);
  }

  requestAnimationFrame(animateScore);
}

/** Update score description text and badge based on score value */
function updateScoreDescription(score) {
  const desc  = document.getElementById('score-description');
  const badge = document.getElementById('score-rating-badge');
  if (!desc || !badge) return;

  let rating, text, cssClass;

  if (score >= 80) {
    rating   = 'Excellent';
    cssClass = 'badge-excellent';
    text     = 'Your property has excellent potential for rainwater harvesting and artificial recharge. Immediate implementation is highly recommended.';
  } else if (score >= 60) {
    rating   = 'Good';
    cssClass = 'badge-good';
    text     = 'Good potential identified. A comprehensive RWH system with recharge infrastructure is advisable for your property.';
  } else if (score >= 40) {
    rating   = 'Moderate';
    cssClass = 'badge-moderate';
    text     = 'Moderate potential exists. A storage-focused system is recommended. Recharge feasibility should be assessed on-site.';
  } else {
    rating   = 'Poor';
    cssClass = 'badge-poor';
    text     = 'Limited potential due to site constraints. Basic conservation measures and greywater recycling are recommended instead.';
  }

  desc.textContent     = text;
  badge.textContent    = rating;
  badge.className      = `score-rating-badge ${cssClass}`;
}

/* =============================================
   12. CHART.JS INITIALIZATION
   Initialises 5 charts with sample/default data.
   Charts update dynamically after assessment.
============================================= */
function initCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#8da9c4' : '#4a5568';
  const gridColor = isDark ? 'rgba(0,180,216,0.1)' : 'rgba(0,119,182,0.08)';

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size   = 12;
  Chart.defaults.color       = textColor;
  Chart.defaults.plugins.tooltip.backgroundColor = isDark ? '#112240' : '#ffffff';
  Chart.defaults.plugins.tooltip.titleColor      = isDark ? '#e8f4fd' : '#0a1628';
  Chart.defaults.plugins.tooltip.bodyColor       = isDark ? '#8da9c4' : '#4a5568';
  Chart.defaults.plugins.tooltip.borderWidth     = 1;
  Chart.defaults.plugins.tooltip.borderColor     = isDark ? 'rgba(0,180,216,0.2)' : 'rgba(0,119,182,0.15)';
  Chart.defaults.plugins.tooltip.cornerRadius    = 10;
  Chart.defaults.plugins.tooltip.padding         = 10;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // --- Sample rainfall data (mm/month) for Chennai, India ---
  const sampleRainfall = [34, 18, 13, 21, 50, 51, 88, 105, 119, 304, 309, 136];

  /* ---- Chart 1: Monthly Rainfall Bar ---- */
  const ctx1 = document.getElementById('chart-rainfall');
  if (ctx1) {
    chartInstances.rainfall = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Rainfall (mm)',
          data: sampleRainfall,
          backgroundColor: months.map((_, i) => {
            const intensity = sampleRainfall[i] / Math.max(...sampleRainfall);
            return `rgba(0, ${Math.round(119 + intensity * 61)}, ${Math.round(182 + intensity * 34)}, ${0.5 + intensity * 0.4})`;
          }),
          borderColor: 'rgba(0, 119, 182, 0.8)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} mm`
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, callback: v => `${v}mm` },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ---- Chart 2: Doughnut – Harvesting Potential breakdown ---- */
  const ctx2 = document.getElementById('chart-potential');
  if (ctx2) {
    chartInstances.potential = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Harvested', 'Recharged', 'Lost to Runoff'],
        datasets: [{
          data: [45, 30, 25],
          backgroundColor: ['#0077b6', '#2dc653', '#f77f00'],
          borderWidth: 0,
          hoverOffset: 10,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10,
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed}%`
            }
          }
        }
      }
    });
  }

  /* ---- Chart 3: Monthly Collection Bar ---- */
  const sampleCollection = sampleRainfall.map(r => Math.round(r * 100 * 0.80 * 0.85));

  const ctx3 = document.getElementById('chart-collection');
  if (ctx3) {
    chartInstances.collection = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Collection (L)',
          data: sampleCollection,
          backgroundColor: 'rgba(0, 180, 216, 0.65)',
          borderColor: '#0077b6',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.y.toLocaleString('en-IN')} L`
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, callback: v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ---- Chart 4: Usage vs Harvesting Line ---- */
  const sampleUsage    = [2250, 2000, 2100, 2200, 2300, 2100, 2050, 2100, 2050, 2200, 2100, 2300];
  const sampleHarvest  = sampleCollection;

  const ctx4 = document.getElementById('chart-usage');
  if (ctx4) {
    chartInstances.usage = new Chart(ctx4, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Water Demand (L)',
            data: sampleUsage,
            borderColor: '#f77f00',
            backgroundColor: 'rgba(247, 127, 0, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#f77f00',
            pointRadius: 4,
            pointHoverRadius: 7,
          },
          {
            label: 'Harvesting (L)',
            data: sampleHarvest,
            borderColor: '#0077b6',
            backgroundColor: 'rgba(0, 119, 182, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0077b6',
            pointRadius: 4,
            pointHoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, usePointStyle: true }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, callback: v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ---- Chart 5: Tank Capacity Comparison Horizontal Bar ---- */
  const ctx5 = document.getElementById('chart-tank');
  if (ctx5) {
    chartInstances.tank = new Chart(ctx5, {
      type: 'bar',
      data: {
        labels: ['Residential (4 pax)', 'Residential (8 pax)', 'Commercial (500m²)', 'Institutional (1000m²)', 'Industrial (5000m²)'],
        datasets: [{
          label: 'Recommended Tank (L)',
          data: [12000, 24000, 80000, 160000, 800000],
          backgroundColor: ['#0077b6', '#00b4d8', '#2dc653', '#7b2d8b', '#f77f00'].map(c => c + 'cc'),
          borderColor:     ['#0077b6', '#00b4d8', '#2dc653', '#7b2d8b', '#f77f00'],
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x.toLocaleString('en-IN')} L`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M L` : v >= 1000 ? `${(v/1000).toFixed(0)}k L` : `${v} L`
            },
            beginAtZero: true
          },
          y: { grid: { color: 'transparent' }, ticks: { color: textColor } }
        }
      }
    });
  }
}

/* =============================================
   13. UPDATE CHARTS WITH ASSESSMENT DATA
   Replaces sample data in charts with real
   calculated values after form submission.
============================================= */
function updateCharts(results) {
  // Update monthly collection chart
  if (chartInstances.collection) {
    chartInstances.collection.data.datasets[0].data = results.monthlyCollection;
    chartInstances.collection.update();
  }

  // Update usage vs harvest chart
  if (chartInstances.usage) {
    const monthlyDemand = Array(12).fill(Math.round(results.dailyDemand * 30));
    chartInstances.usage.data.datasets[0].data = monthlyDemand;
    chartInstances.usage.data.datasets[1].data = results.monthlyCollection;
    chartInstances.usage.update();
  }

  // Update doughnut with actual split
  if (chartInstances.potential) {
    const totalRunoff = results.R * results.A / 1000; // m³
    const harvested   = results.annualHarvestPotential / 1000; // m³
    const recharged   = results.artificialRechargePotential / 1000;
    const lost        = Math.max(0, totalRunoff - harvested - recharged);
    const total       = harvested + recharged + lost;

    chartInstances.potential.data.datasets[0].data = [
      Math.round((harvested / total) * 100),
      Math.round((recharged / total) * 100),
      Math.round((lost      / total) * 100)
    ];
    chartInstances.potential.update();
  }

  // Update tank chart with user's result
  if (chartInstances.tank) {
    // Replace first bar with user's actual tank size
    chartInstances.tank.data.datasets[0].data[0] = results.tankCapacity;
    chartInstances.tank.data.labels[0] = `Your Property (${formData.ownerName || 'You'})`;
    chartInstances.tank.update();
  }
}

/* =============================================
   14. DYNAMIC RECOMMENDATIONS
   Updates recommendation cards with personalized
   details from the assessment results.
============================================= */
function generateRecommendationsFromResults(results) {
  const tankDetail = document.getElementById('rec-tank-detail');
  const pitDetail  = document.getElementById('rec-pit-detail');

  if (tankDetail) {
    tankDetail.innerHTML = `<i class="fas fa-check-circle me-1"></i>
      Your recommended tank: <strong>${results.tankCapacity.toLocaleString('en-IN')} L</strong>
      (${Math.ceil(results.tankCapacity / 5000)} × 5000L or ${Math.ceil(results.tankCapacity / 1000)} × 1000L tanks)`;
  }

  if (pitDetail) {
    const pitCount = Math.max(1, Math.ceil(parseFloat(formData.rooftopArea || 100) / 50));
    pitDetail.innerHTML = `<i class="fas fa-check-circle me-1"></i>
      Your recommended pit volume: <strong>${results.rechargeVolume} m³</strong>
      (~${pitCount} recharge pit${pitCount > 1 ? 's' : ''} recommended)`;
  }
}

/* =============================================
   15. REPORT GENERATION
   Populates all fields in the printable report
   with collected form data and calculated results.
============================================= */
function generateReport(data, results) {
  // Generate unique report ID
  const reportId = `RTRWH-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  // --- Populate report fields ---
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('report-id',   reportId);
  set('report-date', dateStr);

  // Section 1
  set('rpt-owner',    data.ownerName    || '—');
  set('rpt-btype',    capitalise(data.buildingType) || '—');
  set('rpt-location', data.location     || '—');
  const lat  = data.latitude  || 'N/A';
  const lng  = data.longitude || 'N/A';
  set('rpt-coords', lat !== 'N/A' && lng !== 'N/A' ? `${lat}°N, ${lng}°E` : 'Not provided');

  // Section 2
  set('rpt-area',      data.rooftopArea ? `${data.rooftopArea} m²` : '—');
  set('rpt-material',  getMaterialLabel(data.roofMaterial));
  set('rpt-slope',     capitalise(data.roofSlope)   || '—');
  set('rpt-condition', capitalise(data.roofCondition) || '—');
  set('rpt-coeff',     results.runoffCoeff);

  // Section 3
  set('rpt-rainfall',    data.annualRainfall    ? `${data.annualRainfall} mm/year`  : '—');
  set('rpt-soil',        capitalise(data.soilType)             || '—');
  set('rpt-gw',          data.groundwaterLevel  ? `${data.groundwaterLevel} m BGL`  : '—');
  set('rpt-feasibility', capitalise(data.rechargeFeasibility)  || '—');

  // Section 4
  set('rpt-occupants',     data.numOccupants    || '—');
  set('rpt-daily',         data.dailyConsumption ? `${data.dailyConsumption} L/day` : '—');
  set('rpt-annual-demand', `${results.annualDemand.toLocaleString('en-IN')} L/year`);
  set('rpt-source',        capitalise(data.waterSource?.replace('-', ' ')) || '—');

  // Section 5 – Results table
  const tbody = document.getElementById('results-table-body');
  if (tbody) {
    const rows = [
      ['Annual Harvesting Potential', results.annualHarvestPotential.toLocaleString('en-IN'), 'L/year',   'Primary collection from roof'],
      ['Recommended Tank Capacity',   results.tankCapacity.toLocaleString('en-IN'),           'L',         '20-day demand storage'],
      ['Recharge Pit Volume',         results.rechargeVolume,                                 'm³',        'For peak rainfall event'],
      ['Artificial Recharge Potential',results.artificialRechargePotential.toLocaleString('en-IN'), 'L/year', 'Via soil infiltration'],
      ['Estimated Annual Savings',    `₹${results.estimatedSavings.toLocaleString('en-IN')}`, '₹/year',   'Based on municipal tariff'],
      ['Demand Coverage',             `${results.demandCoverage}%`,                           '%',         'Fraction of demand met'],
      ['Overall Suitability Score',   `${results.suitabilityScore}/100`,                      'Points',    getSuitabilityLabel(results.suitabilityScore)],
    ];

    tbody.innerHTML = rows.map(([param, val, unit, rem]) => `
      <tr>
        <td>${param}</td>
        <td><strong>${val}</strong></td>
        <td>${unit}</td>
        <td>${rem}</td>
      </tr>
    `).join('');
  }

  // Section 6 – Summary
  const summaryBox = document.getElementById('report-summary-box');
  if (summaryBox) {
    const rating = getSuitabilityLabel(results.suitabilityScore);
    summaryBox.innerHTML = `
      <p><strong>Assessment Summary for ${data.ownerName || 'the Property'}</strong></p>
      <p>
        Based on a comprehensive analysis of the rooftop area of <strong>${data.rooftopArea || '?'} m²</strong>,
        annual rainfall of <strong>${data.annualRainfall || '?'} mm</strong>,
        and ${data.soilType || ''} soil conditions at <strong>${data.location || 'the specified location'}</strong>,
        this property has been assessed with an overall suitability score of
        <strong>${results.suitabilityScore}/100 (${rating})</strong>.
      </p>
      <p>
        The estimated annual rainwater harvesting potential of
        <strong>${results.annualHarvestPotential.toLocaleString('en-IN')} litres</strong>
        can meet approximately <strong>${results.demandCoverage}%</strong> of the total annual water demand.
        A storage tank of <strong>${results.tankCapacity.toLocaleString('en-IN')} L</strong> is recommended,
        along with <strong>${Math.max(1, Math.ceil(parseFloat(data.rooftopArea || 100)/50))} recharge pit(s)</strong>
        to facilitate artificial groundwater recharge.
      </p>
      <p>
        Estimated annual monetary savings from rainwater utilisation:
        <strong>₹${results.estimatedSavings.toLocaleString('en-IN')}</strong>.
        Implementation of this system will contribute to sustainable water management
        and support India's National Water Mission goals.
      </p>
    `;
  }
}

/* =============================================
   PRINT & PDF HANDLERS
============================================= */
function initReportActions() {
  const printBtn    = document.getElementById('print-report');
  const downloadBtn = document.getElementById('download-pdf');

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showToast('info', 'PDF Download', 'PDF generation requires a backend service. Use the Print option to save as PDF.');
    });
  }
}

/* =============================================
   16. FAQ ACCORDION
   Adds keyboard accessibility to the FAQ.
============================================= */
function initFAQ() {
  const accordionBtns = document.querySelectorAll('.accordion-button');

  accordionBtns.forEach(btn => {
    // Already handled by Bootstrap — just ensure
    // keyboard users can activate with Enter/Space
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

/* =============================================
   17. CONTACT FORM
   Validates the contact form and shows a
   success toast notification on submission.
============================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('contact-name');
    const emailEl   = document.getElementById('contact-email');
    const subjectEl = document.getElementById('contact-subject');
    const msgEl     = document.getElementById('contact-message');
    const submitBtn = document.getElementById('contact-submit');

    // Basic validation
    let valid = true;

    [nameEl, emailEl, subjectEl, msgEl].forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        valid = false;
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    });

    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('is-invalid');
      valid = false;
    }

    if (!valid) {
      showToast('error', 'Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    // Simulate sending
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    if (btnText) btnText.classList.add('d-none');
    if (btnLoading) btnLoading.classList.remove('d-none');
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
      if (btnText)    btnText.classList.remove('d-none');
      if (btnLoading) btnLoading.classList.add('d-none');
      submitBtn.disabled = false;
      showToast('success', 'Message Sent!', 'Thank you for reaching out. We will respond within 2 business days.');
    }, 1800);
  });
}

/* =============================================
   18. NEWSLETTER
============================================= */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput?.value?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('warning', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    form.reset();
    showToast('success', 'Subscribed!', 'You have been successfully subscribed to our newsletter.');
  });
}

/* =============================================
   19. TOAST NOTIFICATIONS
   Creates and shows temporary toast messages.
   @param {string} type    - 'success' | 'error' | 'warning' | 'info'
   @param {string} title   - Toast title
   @param {string} message - Toast message body
   @param {number} duration - Auto-dismiss duration in ms (default 4500)
============================================= */
function showToast(type = 'info', title = '', message = '', duration = 4500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'fas fa-check-circle',
    error:   'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info:    'fas fa-info-circle',
  };

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));

  // Auto-dismiss
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  toast.classList.add('hiding');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* =============================================
   HELPER UTILITIES
============================================= */

/** Capitalise the first letter of a string */
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Get a human-readable label for roof material codes */
function getMaterialLabel(code) {
  const labels = {
    rcc:     'RCC / Concrete',
    tile:    'Clay / Ceramic Tile',
    metal:   'Metal / GI Sheet',
    asphalt: 'Asphalt Shingles',
    grass:   'Green / Grass Roof',
  };
  return labels[code] || capitalise(code) || '—';
}

/** Get suitability label for a score */
function getSuitabilityLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}

/* =============================================
   20. DOMCONTENTLOADED — INITIALISATION
   Entry point: all modules are initialised here
   in the correct order after the DOM is ready.
============================================= */
document.addEventListener('DOMContentLoaded', () => {

  // Core UI
  initLoader();
  initTheme();
  initNavbar();
  initBackToTop();
  initScrollAnimations();

  // Assessment features
  initFormWizard();

  // Charts (initialise with sample data immediately)
  initCharts();

  // Interactions
  initFAQ();
  initContactForm();
  initNewsletter();
  initReportActions();

  // ---- Hero CTA ripple effect ----
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.35);
        width: 10px; height: 10px;
        left: ${e.offsetX - 5}px;
        top: ${e.offsetY - 5}px;
        pointer-events: none;
        animation: ripple 0.6s linear;
      `;
      this.style.position = 'relative';
      this.style.overflow  = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  // ---- Smooth scroll for all anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Live form input validation (clear errors on input) ----
  document.querySelectorAll('.custom-input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
        const errorEl = document.getElementById(`${input.id}-error`);
        if (errorEl) errorEl.textContent = '';
      }
    });
    input.addEventListener('blur', () => {
      if (input.value.trim() && !input.classList.contains('is-invalid')) {
        input.classList.add('is-valid');
      }
    });
  });

  // Welcome toast on load
  setTimeout(() => {
    showToast('info', 'Welcome!', 'Start your assessment by filling in the 4-step wizard below.', 5000);
  }, 1500);

});

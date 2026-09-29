/**
 * MISSOURI MARKETING (میسوری مارکیٹنگ)
 * Interactive Application Logic & Real Estate Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    selectedCategory: 'all',
    societyFilter: '',
    sizeFilter: '',
    budgetFilter: '',
    keyword: '',
    sortBy: 'featured',
    calculator: {
      price: 4000000,
      downPercent: 20,
      months: 36
    }
  };

  // DOM Elements
  const propertiesGrid = document.getElementById('propertiesGrid');
  const noResultsBox = document.getElementById('noResultsBox');
  const societiesGrid = document.getElementById('societiesGrid');
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  const liveMatchCounter = document.getElementById('liveMatchCounter');
  const countAll = document.getElementById('countAll');
  const countPlots = document.getElementById('countPlots');
  const countHouses = document.getElementById('countHouses');

  // Search & Filter Elements
  const heroSearchForm = document.getElementById('heroSearchForm');
  const filterSociety = document.getElementById('filterSociety');
  const filterSize = document.getElementById('filterSize');
  const filterBudget = document.getElementById('filterBudget');
  const searchCategoryTabs = document.querySelectorAll('.search-tab');
  const propertyFilterPills = document.querySelectorAll('.pill-btn');
  const propertyKeyword = document.getElementById('propertyKeyword');
  const propertySortSelect = document.getElementById('propertySortSelect');
  const btnResetFilters = document.getElementById('btnResetFilters');

  // Calculator Elements
  const sliderPrice = document.getElementById('sliderPrice');
  const sliderDownPercent = document.getElementById('sliderDownPercent');
  const calcPriceDisplay = document.getElementById('calcPriceDisplay');
  const calcDownPercentDisplay = document.getElementById('calcDownPercentDisplay');
  const calcDurationDisplay = document.getElementById('calcDurationDisplay');
  const durationButtons = document.querySelectorAll('.duration-btn');
  const outDownPayment = document.getElementById('outDownPayment');
  const outMonthly = document.getElementById('outMonthly');
  const outQuarterly = document.getElementById('outQuarterly');
  const outRemaining = document.getElementById('outRemaining');
  const outMonthsCount = document.getElementById('outMonthsCount');
  const btnShareCalculationWA = document.getElementById('btnShareCalculationWA');

  // Modals
  const propertyDetailsModal = document.getElementById('propertyDetailsModal');
  const modalDetailsContent = document.getElementById('modalDetailsContent');
  const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');

  const siteVisitModal = document.getElementById('siteVisitModal');
  const closeSiteVisitModalBtn = document.getElementById('closeSiteVisitModalBtn');
  const siteVisitForm = document.getElementById('siteVisitForm');

  const listPropertyModal = document.getElementById('listPropertyModal');
  const closeListPropertyModalBtn = document.getElementById('closeListPropertyModalBtn');
  const listPropertyForm = document.getElementById('listPropertyForm');

  // Navigation & Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  // Initialize
  initApp();

  function initApp() {
    updateCategoryCounts();
    renderProperties();
    renderSocieties();
    renderTestimonials();
    initCalculator();
    setupEventListeners();
  }

  // Count helper
  function updateCategoryCounts() {
    if (countAll) countAll.textContent = PROPERTIES_DATA.length;
    if (countPlots) countPlots.textContent = PROPERTIES_DATA.filter(p => p.type === 'plot').length;
    if (countHouses) countHouses.textContent = PROPERTIES_DATA.filter(p => p.type === 'house').length;
  }

  // Format PKR Currency
  function formatPKR(amount) {
    if (amount >= 10000000) {
      const crore = (amount / 10000000).toFixed(2);
      return `PKR ${crore} Crore`;
    } else if (amount >= 100000) {
      const lakh = (amount / 100000).toFixed(2);
      return `PKR ${lakh} Lakhs`;
    }
    return `PKR ${amount.toLocaleString()}`;
  }

  // Render Properties
  function renderProperties() {
    let filtered = PROPERTIES_DATA.filter(prop => {
      // Category filter
      if (state.selectedCategory === 'plot' && prop.type !== 'plot') return false;
      if (state.selectedCategory === 'house' && prop.type !== 'house') return false;
      if (state.selectedCategory === 'commercial' && prop.type !== 'commercial') return false;
      if (state.selectedCategory === 'installments' && !prop.installmentsAvailable) return false;

      // Society filter
      if (state.societyFilter && !prop.society.toLowerCase().includes(state.societyFilter.toLowerCase())) {
        return false;
      }

      // Size filter
      if (state.sizeFilter && !prop.size.toLowerCase().includes(state.sizeFilter.toLowerCase())) {
        return false;
      }

      // Budget filter
      if (state.budgetFilter) {
        const p = prop.priceRaw;
        if (state.budgetFilter === 'under-40' && p > 4000000) return false;
        if (state.budgetFilter === '40-80' && (p < 4000000 || p > 8000000)) return false;
        if (state.budgetFilter === '80-200' && (p < 8000000 || p > 20000000)) return false;
        if (state.budgetFilter === '200-500' && (p < 20000000 || p > 50000000)) return false;
        if (state.budgetFilter === 'above-500' && p < 50000000) return false;
      }

      // Keyword search
      if (state.keyword) {
        const q = state.keyword.toLowerCase();
        const match = prop.title.toLowerCase().includes(q) ||
                      prop.society.toLowerCase().includes(q) ||
                      prop.city.toLowerCase().includes(q) ||
                      prop.category.toLowerCase().includes(q) ||
                      prop.size.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // Sorting
    if (state.sortBy === 'price-asc') {
      filtered.sort((a, b) => a.priceRaw - b.priceRaw);
    } else if (state.sortBy === 'price-desc') {
      filtered.sort((a, b) => b.priceRaw - a.priceRaw);
    } else if (state.sortBy === 'size-desc') {
      filtered.sort((a, b) => b.marla - a.marla);
    } else {
      // featured
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Update Counter
    if (liveMatchCounter) {
      liveMatchCounter.textContent = `${filtered.length} Properties Found`;
    }

    if (filtered.length === 0) {
      propertiesGrid.innerHTML = '';
      noResultsBox.style.display = 'block';
      return;
    }

    noResultsBox.style.display = 'none';

    // Build Cards
    propertiesGrid.innerHTML = filtered.map(prop => {
      const isHouse = prop.type === 'house';
      const isPlot = prop.type === 'plot';

      return `
        <article class="property-card" data-id="${prop.id}">
          <div class="property-img-box">
            <img src="${prop.image}" alt="${prop.title}" loading="lazy">
            <div class="card-top-badges">
              <span class="card-badge badge-status">${prop.status}</span>
              ${prop.badge ? `<span class="card-badge badge-highlight">${prop.badge}</span>` : ''}
            </div>
            <div class="card-price-overlay">
              <div class="price-main">${prop.price}</div>
              <div class="price-installment-chip">
                ${prop.installmentsAvailable ? `<i class="fa-solid fa-clock-rotate-left"></i> Installments` : `<i class="fa-solid fa-check-circle"></i> Full Cash / Ready`}
              </div>
            </div>
          </div>

          <div class="property-card-body">
            <div class="property-society-row">
              <span class="society-pin"><i class="fa-solid fa-location-dot"></i> ${prop.society}</span>
              <span><i class="fa-solid fa-shield-halved text-green"></i> Verified</span>
            </div>

            <h3 class="property-card-title">${prop.title}</h3>

            <div class="property-specs-grid">
              <div class="spec-item">
                <i class="fa-solid fa-ruler-combined spec-icon"></i>
                <span class="spec-val">${prop.size}</span>
                <span class="spec-sub">${prop.dimensions || 'Standard'}</span>
              </div>
              
              ${isHouse ? `
                <div class="spec-item">
                  <i class="fa-solid fa-bed spec-icon"></i>
                  <span class="spec-val">${prop.beds} Beds</span>
                  <span class="spec-sub">${prop.baths} Baths</span>
                </div>
                <div class="spec-item">
                  <i class="fa-solid fa-car spec-icon"></i>
                  <span class="spec-val">${prop.carParking ? 'Parking' : 'Porch'}</span>
                  <span class="spec-sub">Double Storey</span>
                </div>
              ` : `
                <div class="spec-item">
                  <i class="fa-solid fa-map spec-icon"></i>
                  <span class="spec-val">${prop.possession.includes('Ready') ? 'Ready' : 'Balloted'}</span>
                  <span class="spec-sub">Possession</span>
                </div>
                <div class="spec-item">
                  <i class="fa-solid fa-receipt spec-icon"></i>
                  <span class="spec-val">${prop.installmentsAvailable ? 'Monthly' : 'Direct'}</span>
                  <span class="spec-sub">Schedule</span>
                </div>
              `}
            </div>

            <div class="property-down-payment-box">
              <span><strong>Down Payment:</strong> ${prop.downPayment}</span>
              <span class="text-gold font-bold">${prop.monthlyInstallment}</span>
            </div>

            <div class="property-card-actions">
              <button class="btn btn-outline btn-view-details" data-id="${prop.id}">
                <i class="fa-solid fa-circle-info"></i> View Details
              </button>
              <a href="${getWhatsAppLink(prop)}" target="_blank" class="btn btn-primary">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Details Click Handlers
    document.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openPropertyDetails(id);
      });
    });
  }

  // Build WhatsApp URL
  function getWhatsAppLink(prop) {
    const text = encodeURIComponent(
      `Assalam o Alaikum Adil Dawar (Missouri Marketing),\n` +
      `I am interested in this property:\n` +
      `*${prop.title}*\n` +
      `Price: ${prop.price}\n` +
      `Location: ${prop.society}\n` +
      `Size: ${prop.size}\n\n` +
      `Please share further details, payment plan, and site visit schedule.`
    );
    return `https://wa.me/923005557890?text=${text}`;
  }

  // Render Societies
  function renderSocieties() {
    if (!societiesGrid) return;
    societiesGrid.innerHTML = SOCIETIES_DATA.map(soc => `
      <div class="society-card">
        <div class="society-img-wrap">
          <img src="${soc.image}" alt="${soc.name}" loading="lazy">
          <span class="society-noc-badge"><i class="fa-solid fa-certificate"></i> ${soc.noc}</span>
          <span class="society-status-pill">${soc.statusBadge}</span>
        </div>
        <div class="society-card-body">
          <h3>${soc.name}</h3>
          <div class="society-tagline">${soc.tagline}</div>
          <div class="society-loc"><i class="fa-solid fa-location-dot"></i> ${soc.location}</div>
          <p class="text-sm text-muted mb-3" style="font-size: 0.85rem; line-height: 1.5;">${soc.description}</p>
          <div class="society-tags-cloud">
            ${soc.categories.map(cat => `<span class="soc-chip">${cat}</span>`).join('')}
          </div>
          <button class="btn btn-outline full-width btn-filter-soc" data-society="${soc.name}">
            <i class="fa-solid fa-eye"></i> View ${soc.name} Plots
          </button>
        </div>
      </div>
    `).join('');

    // Add filter buttons click
    document.querySelectorAll('.btn-filter-soc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const socName = e.currentTarget.getAttribute('data-society');
        state.societyFilter = socName.split(' ')[0]; // first word matching
        if (filterSociety) filterSociety.value = state.societyFilter;
        renderProperties();
        scrollToSection('properties');
        showToast(`Filtered properties for ${socName}`);
      });
    });
  }

  // Render Testimonials
  function renderTestimonials() {
    if (!testimonialsGrid) return;
    testimonialsGrid.innerHTML = TESTIMONIALS_DATA.map(t => `
      <div class="testimonial-card">
        <div class="test-stars">
          ${Array(t.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <p class="test-quote">"${t.quote}"</p>
        <div class="test-author-row">
          <img src="${t.avatar}" alt="${t.name}" class="test-avatar" loading="lazy">
          <div class="test-author-info">
            <strong>${t.name}</strong>
            <small>${t.role}</small>
            <span><i class="fa-solid fa-map-pin"></i> ${t.location}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Calculator Logic
  function initCalculator() {
    function updateCalc() {
      const price = parseInt(sliderPrice.value, 10);
      const percent = parseInt(sliderDownPercent.value, 10);
      const months = state.calculator.months;

      state.calculator.price = price;
      state.calculator.downPercent = percent;

      // Format displays
      if (calcPriceDisplay) calcPriceDisplay.textContent = formatPKR(price);
      if (calcDownPercentDisplay) calcDownPercentDisplay.textContent = `${percent}%`;
      if (calcDurationDisplay) calcDurationDisplay.textContent = `${months / 12} Years (${months} Months)`;

      const downPaymentAmount = Math.round(price * (percent / 100));
      const remainingAmount = price - downPaymentAmount;
      const monthlyAmount = Math.round(remainingAmount / months);
      const quarterlyAmount = Math.round(monthlyAmount * 3);

      if (outDownPayment) outDownPayment.textContent = formatPKR(downPaymentAmount);
      if (outMonthly) outMonthly.textContent = formatPKR(monthlyAmount);
      if (outQuarterly) outQuarterly.textContent = formatPKR(quarterlyAmount);
      if (outRemaining) outRemaining.textContent = formatPKR(remainingAmount);
      if (outMonthsCount) outMonthsCount.textContent = `For ${months} Months`;
    }

    if (sliderPrice) {
      sliderPrice.addEventListener('input', updateCalc);
    }
    if (sliderDownPercent) {
      sliderDownPercent.addEventListener('input', updateCalc);
    }

    durationButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        durationButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.calculator.months = parseInt(e.currentTarget.getAttribute('data-months'), 10);
        updateCalc();
      });
    });

    if (btnShareCalculationWA) {
      btnShareCalculationWA.addEventListener('click', () => {
        const price = formatPKR(state.calculator.price);
        const percent = state.calculator.downPercent;
        const months = state.calculator.months;
        const down = outDownPayment.textContent;
        const monthly = outMonthly.textContent;

        const text = encodeURIComponent(
          `Assalam o Alaikum Adil Dawar (Missouri Marketing),\n` +
          `I calculated an installment plan on your website:\n` +
          `- Total Budget: ${price}\n` +
          `- Down Payment (${percent}%): ${down}\n` +
          `- Plan Duration: ${months / 12} Years (${months} Months)\n` +
          `- Monthly Estimate: ${monthly}\n\n` +
          `Please suggest available plots or houses matching this exact installment budget.`
        );
        window.open(`https://wa.me/923005557890?text=${text}`, '_blank');
      });
    }

    updateCalc();
  }

  // Open Property Details Modal
  function openPropertyDetails(id) {
    const prop = PROPERTIES_DATA.find(p => p.id === id);
    if (!prop) return;

    const isHouse = prop.type === 'house';

    modalDetailsContent.innerHTML = `
      <div class="modal-details-grid">
        <div class="modal-gallery-col">
          <div class="modal-gallery-main">
            <img src="${prop.image}" id="mainModalImg" alt="${prop.title}">
          </div>
          <div class="modal-gallery-thumbs">
            ${prop.gallery.map((img, idx) => `
              <div class="modal-thumb ${idx === 0 ? 'active' : ''}" data-src="${img}">
                <img src="${img}" alt="Thumbnail ${idx}">
              </div>
            `).join('')}
          </div>

          <div class="mt-4" style="margin-top: 20px;">
            <h4 style="font-size: 1rem; color: #0f172a; margin-bottom: 8px;">Property Overview</h4>
            <p style="font-size: 0.88rem; color: #475569; line-height: 1.6;">${prop.description}</p>
          </div>
        </div>

        <div class="modal-info-col">
          <div class="details-title-row">
            <span class="noc-badge-top" style="margin-bottom: 8px;"><i class="fa-solid fa-shield-check"></i> ${prop.nocStatus}</span>
            <h2>${prop.title}</h2>
            <div class="details-price-badge">${prop.price}</div>
          </div>

          <table class="details-specs-table">
            <tbody>
              <tr>
                <td>Society / Sector:</td>
                <td><strong>${prop.society}</strong></td>
              </tr>
              <tr>
                <td>City / Region:</td>
                <td>${prop.city}</td>
              </tr>
              <tr>
                <td>Area / Dimensions:</td>
                <td><strong>${prop.size}</strong> (${prop.dimensions || '25 x 50'})</td>
              </tr>
              <tr>
                <td>Possession Status:</td>
                <td><span class="text-green font-bold">${prop.possession}</span></td>
              </tr>
              <tr>
                <td>Down Payment:</td>
                <td><strong class="text-gold">${prop.downPayment}</strong></td>
              </tr>
              <tr>
                <td>Monthly / Tenure:</td>
                <td>${prop.monthlyInstallment} (${prop.duration})</td>
              </tr>
              ${isHouse ? `
                <tr>
                  <td>Accommodation:</td>
                  <td>${prop.beds} Master Beds | ${prop.baths} Baths | ${prop.kitchens} Kitchens</td>
                </tr>
                <tr>
                  <td>Car Parking:</td>
                  <td>${prop.carParking}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <h4 style="font-size: 0.95rem; margin-bottom: 8px; color: #042f24;">Key Features & Specifications</h4>
          <ul class="details-features-list">
            ${prop.features.map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('')}
          </ul>

          <div style="background: #f1f5f9; padding: 14px; border-radius: 10px; margin-bottom: 20px;">
            <div style="font-size: 0.82rem; color: #64748b;">Consultant Assigned:</div>
            <div style="font-weight: 800; color: #042f24; font-size: 1rem;">${prop.agent} (Missouri Marketing)</div>
            <div style="font-size: 0.8rem; color: #334155;">Direct Line: ${prop.phone}</div>
          </div>

          <div style="display: flex; gap: 10px; flex-direction: column;">
            <a href="${getWhatsAppLink(prop)}" target="_blank" class="btn btn-primary full-width">
              <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp About This Property
            </a>
            <button class="btn btn-outline full-width" id="btnModalBookVisit" data-society="${prop.society}">
              <i class="fa-solid fa-car-side"></i> Schedule Chauffeur Site Visit
            </button>
          </div>
        </div>
      </div>
    `;

    // Thumbnails Click
    document.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        const newSrc = target.getAttribute('data-src');
        const mainImg = document.getElementById('mainModalImg');
        if (mainImg) mainImg.src = newSrc;
      });
    });

    // Site visit from modal
    const btnModalBookVisit = document.getElementById('btnModalBookVisit');
    if (btnModalBookVisit) {
      btnModalBookVisit.addEventListener('click', () => {
        closeModal(propertyDetailsModal);
        openModal(siteVisitModal);
        const visitSoc = document.getElementById('visitSociety');
        if (visitSoc) visitSoc.value = prop.society.split(' ')[0];
      });
    }

    openModal(propertyDetailsModal);
  }

  // Setup Global Event Listeners
  function setupEventListeners() {
    // Search Category Tabs
    searchCategoryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        searchCategoryTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const type = e.currentTarget.getAttribute('data-type');
        state.selectedCategory = type;

        // Sync with pills
        propertyFilterPills.forEach(pill => {
          if (pill.getAttribute('data-filter') === type) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });

        renderProperties();
      });
    });

    // Filter Pills
    propertyFilterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        propertyFilterPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const type = e.currentTarget.getAttribute('data-filter');
        state.selectedCategory = type;

        // Sync with hero tabs
        searchCategoryTabs.forEach(t => {
          if (t.getAttribute('data-type') === type) {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });

        renderProperties();
      });
    });

    // Hero Search Form Submit
    if (heroSearchForm) {
      heroSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.societyFilter = filterSociety.value;
        state.sizeFilter = filterSize.value;
        state.budgetFilter = filterBudget.value;
        renderProperties();
        scrollToSection('properties');
      });
    }

    // Quick Tags
    document.querySelectorAll('.quick-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const quick = e.currentTarget.getAttribute('data-quick');
        if (quick === 'plot-faisal') {
          state.selectedCategory = 'plot';
          state.societyFilter = 'Faisal Hills';
        } else if (quick === 'house-ready') {
          state.selectedCategory = 'house';
          state.societyFilter = '';
        } else if (quick === 'park-view') {
          state.selectedCategory = 'plot';
          state.societyFilter = 'Park View City';
        } else if (quick === 'easy-installments') {
          state.selectedCategory = 'installments';
        }
        renderProperties();
        scrollToSection('properties');
      });
    });

    // Explorer Cards Click
    document.querySelectorAll('.explorer-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        state.selectedCategory = filter;
        propertyFilterPills.forEach(p => {
          if (p.getAttribute('data-filter') === filter) p.classList.add('active');
          else p.classList.remove('active');
        });
        renderProperties();
        scrollToSection('properties');
      });
    });

    // Nav Filter Links
    document.querySelectorAll('[data-filter]').forEach(link => {
      if (link.tagName === 'A' && link.closest('.nav-links, .mobile-drawer, .footer-links')) {
        link.addEventListener('click', (e) => {
          const filter = e.currentTarget.getAttribute('data-filter');
          state.selectedCategory = filter;
          propertyFilterPills.forEach(p => {
            if (p.getAttribute('data-filter') === filter) p.classList.add('active');
            else p.classList.remove('active');
          });
          renderProperties();
          if (mobileDrawer.classList.contains('open')) {
            mobileDrawer.classList.remove('open');
          }
        });
      }
    });

    // Keyword & Sort
    if (propertyKeyword) {
      propertyKeyword.addEventListener('input', (e) => {
        state.keyword = e.target.value.trim();
        renderProperties();
      });
    }

    if (propertySortSelect) {
      propertySortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderProperties();
      });
    }

    // Reset Filters
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        state.selectedCategory = 'all';
        state.societyFilter = '';
        state.sizeFilter = '';
        state.budgetFilter = '';
        state.keyword = '';
        state.sortBy = 'featured';

        if (filterSociety) filterSociety.value = '';
        if (filterSize) filterSize.value = '';
        if (filterBudget) filterBudget.value = '';
        if (propertyKeyword) propertyKeyword.value = '';
        if (propertySortSelect) propertySortSelect.value = 'featured';

        propertyFilterPills.forEach(p => p.classList.remove('active'));
        if (propertyFilterPills[0]) propertyFilterPills[0].classList.add('active');

        renderProperties();
        showToast('All filters have been reset');
      });
    }

    // Modals Controls
    if (closeDetailsModalBtn) {
      closeDetailsModalBtn.addEventListener('click', () => closeModal(propertyDetailsModal));
    }
    if (closeSiteVisitModalBtn) {
      closeSiteVisitModalBtn.addEventListener('click', () => closeModal(siteVisitModal));
    }
    if (closeListPropertyModalBtn) {
      closeListPropertyModalBtn.addEventListener('click', () => closeModal(listPropertyModal));
    }

    // Modal Trigger Buttons
    const openSiteVisitBtns = [
      document.getElementById('btnBookVisitHero'),
      document.getElementById('btnBookConsultationModal'),
      document.getElementById('btnFooterSiteVisit')
    ];
    openSiteVisitBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => openModal(siteVisitModal));
      }
    });

    const openListPropBtns = [
      document.getElementById('btnListPropertyHeader'),
      document.getElementById('btnListPropertyMobile'),
      document.getElementById('btnOpenListProperty')
    ];
    openListPropBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => openModal(listPropertyModal));
      }
    });

    // Custom Plan Modal Button in Calc
    const btnCustomPlanModal = document.getElementById('btnCustomPlanModal');
    if (btnCustomPlanModal) {
      btnCustomPlanModal.addEventListener('click', () => {
        openModal(siteVisitModal);
      });
    }

    // Close on Backdrop Click
    window.addEventListener('click', (e) => {
      if (e.target === propertyDetailsModal) closeModal(propertyDetailsModal);
      if (e.target === siteVisitModal) closeModal(siteVisitModal);
      if (e.target === listPropertyModal) closeModal(listPropertyModal);
    });

    // Form Submissions
    if (siteVisitForm) {
      siteVisitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('visitName').value;
        const phone = document.getElementById('visitPhone').value;
        const soc = document.getElementById('visitSociety').value;
        const date = document.getElementById('visitDate').value;
        
        closeModal(siteVisitModal);
        siteVisitForm.reset();
        showToast(`Thank you, ${name}! Your free site visit for ${soc} on ${date} is scheduled with Adil Dawar.`);

        // Ask to open WhatsApp for instant confirmation
        setTimeout(() => {
          if (confirm(`Would you like to send this site visit request directly to Adil Dawar on WhatsApp?`)) {
            const text = encodeURIComponent(
              `Assalam o Alaikum Adil Dawar (Missouri Marketing),\n` +
              `I scheduled a Site Visit via your website:\n` +
              `- Name: ${name}\n` +
              `- Phone: ${phone}\n` +
              `- Society: ${soc}\n` +
              `- Preferred Date: ${date}`
            );
            window.open(`https://wa.me/923005557890?text=${text}`, '_blank');
          }
        }, 600);
      });
    }

    if (listPropertyForm) {
      listPropertyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('ownerName').value;
        const phone = document.getElementById('ownerPhone').value;
        const type = document.getElementById('propSellType').value;
        const soc = document.getElementById('propSociety').value;
        const demand = document.getElementById('propDemand').value;

        closeModal(listPropertyModal);
        listPropertyForm.reset();
        showToast(`Property submitted successfully! Missouri Marketing team will contact you at ${phone}.`);

        setTimeout(() => {
          if (confirm(`Would you like to send property details to Adil Dawar on WhatsApp now for fast valuation?`)) {
            const text = encodeURIComponent(
              `Assalam o Alaikum Adil Dawar (Missouri Marketing),\n` +
              `I want to sell my property:\n` +
              `- Owner: ${name}\n` +
              `- Type: ${type}\n` +
              `- Society: ${soc}\n` +
              `- Demand: ${demand}\n` +
              `- Contact: ${phone}`
            );
            window.open(`https://wa.me/923005557890?text=${text}`, '_blank');
          }
        }, 600);
      });
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        contactForm.reset();
        showToast(`Inquiry sent! Adil Dawar's office will reach out to ${name} within 30 minutes.`);
      });
    }

    // Mobile Drawer
    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('open');
      });
    }
    if (drawerCloseBtn && mobileDrawer) {
      drawerCloseBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    }

    // Scroll-to-Top Button
    window.addEventListener('scroll', () => {
      if (scrollTopBtn) {
        if (window.scrollY > 400) {
          scrollTopBtn.classList.add('show');
        } else {
          scrollTopBtn.classList.remove('show');
        }
      }
    });

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Modal Helpers
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Toast Notification
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});

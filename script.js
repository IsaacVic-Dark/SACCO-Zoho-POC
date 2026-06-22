window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
});

document.getElementById('navHamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

// scroll reveal
const revEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revEls.forEach(el => revObs.observe(el));

// counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.counter);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const update = (now) => {
    const elapsed = Math.min((now - start) / duration, 1);
    const val = Math.floor((1 - Math.pow(1 - elapsed, 3)) * target);
    el.textContent = val.toLocaleString() + suffix;
    if (elapsed < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('[data-counter]').forEach(animateCounter);
      counterObs.disconnect();
    }
  });
}, { threshold: 0.3 });
const firstCounter = document.querySelector('[data-counter]');
if (firstCounter) counterObs.observe(firstCounter);

// carousel
let carIdx = 0;
const carSlides = 3;
const track = document.getElementById('carouselTrack');
const dots = document.querySelectorAll('.carousel-dot');

function goToSlide(idx) {
  carIdx = (idx + carSlides) % carSlides;
  track.style.transform = `translateX(-${carIdx * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === carIdx));
}

document.getElementById('carNext').addEventListener('click', () => goToSlide(carIdx + 1));
document.getElementById('carPrev').addEventListener('click', () => goToSlide(carIdx - 1));
dots.forEach(d => d.addEventListener('click', () => goToSlide(parseInt(d.dataset.idx))));

let autoCarousel = setInterval(() => goToSlide(carIdx + 1), 5500);
track.closest('section').addEventListener('mouseenter', () => clearInterval(autoCarousel));
track.closest('section').addEventListener('mouseleave', () => { autoCarousel = setInterval(() => goToSlide(carIdx + 1), 5500); });

//  form state
const formState = {
  membership: {
    current: 1, total: 6, stepsInfo: [
      'Step 1 of 6: Select Product', 'Step 2 of 6: Terms & Conditions',
      'Step 3 of 6: Upload Documents', 'Step 4 of 6: Member Details',
      'Step 5 of 6: Next of Kin', 'Step 6 of 6: Review & Submit'
    ]
  },
  loan: {
    current: 1, total: 4, stepsInfo: [
      'Step 1 of 4: Loan Details', 'Step 2 of 4: Employment & Income',
      'Step 3 of 4: Guarantors', 'Step 4 of 4: Review & Submit'
    ]
  },
  savings: {
    current: 1, total: 3, stepsInfo: [
      'Step 1 of 3: Account Info', 'Step 2 of 3: Contribution Details',
      'Step 3 of 3: Review & Submit'
    ]
  }
};

const pfxMap = {
  membership: { sec: 'msection', prev: 'mPrevBtn', next: 'mNextBtn', label: 'mStepLabel', pct: 'mStepPct', bar: 'mProgressBar', form: 'mForm', success: 'mSuccess', sdot: 'msdot', swrap: 'mswrap', line: 'mline', wrap: 'wrapMembership' },
  loan: { sec: 'lsection', prev: 'lPrevBtn', next: 'lNextBtn', label: 'lStepLabel', pct: 'lStepPct', bar: 'lProgressBar', form: 'lForm', success: 'lSuccess', sdot: 'lsdot', swrap: 'lswrap', line: 'lline', wrap: 'wrapLoan' },
  savings: { sec: 'ssection', prev: 'sPrevBtn', next: 'sNextBtn', label: 'sStepLabel', pct: 'sStepPct', bar: 'sProgressBar', form: 'sForm', success: 'sSuccess', sdot: 'ssdot', swrap: 'sswrap', line: 'sline', wrap: 'wrapSavings' },
  leads: { wrap: 'wrapLeads' }
};

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function switchTab(name) {
  ['membership', 'loan', 'savings', 'leads'].forEach(f => {
    document.getElementById(pfxMap[f].wrap).style.display = f === name ? '' : 'none';
    document.getElementById('tab' + cap(f)).classList.toggle('active', f === name);
  });
}

function changeStep(form, dir) {
  const state = formState[form];
  const p = pfxMap[form];
  if (dir === 1 && state.current === state.total) { return; }
  // Membership: Zoho form handles its own submission on step 4
  const next = state.current + dir;
  if (next < 1 || next > state.total) return;
  document.getElementById(p.sec + state.current).classList.remove('active');
  const newPanel = document.getElementById(p.sec + next);
  newPanel.classList.add('active');
  if (dir < 0) { newPanel.classList.add('step-back'); setTimeout(() => newPanel.classList.remove('step-back'), 350); }
  state.current = next;
  updateProgress(form);
}

function updateProgress(form) {
  const state = formState[form];
  const p = pfxMap[form];
  const pct = Math.round((state.current / state.total) * 100);
  document.getElementById(p.bar).style.width = pct + '%';
  document.getElementById(p.pct).textContent = pct + '%';
  document.getElementById(p.label).textContent = state.stepsInfo[state.current - 1];

  for (let i = 1; i <= state.total; i++) {
    const dot = document.getElementById(p.sdot + i);
    const wrap = document.getElementById(p.swrap + i);
    const line = document.getElementById(p.line + i);
    if (!dot || !wrap) continue;
    dot.classList.remove('active', 'done');
    wrap.classList.remove('active', 'done');
    if (i < state.current) { dot.classList.add('done'); dot.textContent = '✓'; wrap.classList.add('done'); }
    else if (i === state.current) { dot.classList.add('active'); dot.textContent = i; wrap.classList.add('active'); }
    else { dot.textContent = i; }
    if (line) line.style.background = i < state.current ? '#16a34a' : '';
  }

  const prevBtn = document.getElementById(p.prev);
  const nextBtn = document.getElementById(p.next);
  prevBtn.style.display = state.current > 1 ? 'flex' : 'none';
  if (state.current === state.total && form === 'membership') {
    nextBtn.style.display = 'none'; // Zoho form has its own submit button
  } else if (state.current === state.total) {
    nextBtn.style.display = '';
    nextBtn.innerHTML = 'Submit Application <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    nextBtn.style.background = '#16a34a';
  } else {
    nextBtn.style.display = '';
    nextBtn.innerHTML = 'Next Step <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
    nextBtn.style.background = '';
  }
}

function collectFormData(form) {
  const data = {};
  document.getElementById(pfxMap[form].wrap).querySelectorAll('input, select, textarea').forEach(el => {
    if (!el.id && !el.name) return;
    const key = el.id || el.name;
    if (el.type === 'radio') { if (el.checked) data[key] = el.value; }
    else if (el.type === 'checkbox') { data[key] = el.checked; }
    else { data[key] = el.value; }
  });
  return data;
}

function resetForm(form) {
  const state = formState[form];
  const p = pfxMap[form];
  document.getElementById(p.success).classList.add('hidden');
  document.getElementById(p.form).style.display = '';
  for (let i = 1; i <= state.total; i++) {
    const panel = document.getElementById(p.sec + i);
    if (panel) panel.classList.remove('active');
  }
  document.getElementById(p.sec + '1').classList.add('active');
  state.current = 1;
  updateProgress(form);
}

//  amount pills
document.getElementById('amountOptionsSavings').querySelectorAll('.apill').forEach(pill => {
  pill.addEventListener('click', function () {
    document.getElementById('amountOptionsSavings').querySelectorAll('.apill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    const custom = document.getElementById('custom_amount_savings');
    if (this.dataset.val === 'custom') { custom.style.display = 'block'; custom.focus(); }
    else { custom.style.display = 'none'; }
  });
});

//  product card highlight
document.querySelectorAll('input[name="product_interest"]').forEach(radio => {
  radio.addEventListener('change', function () {
    document.querySelectorAll('.prod-card').forEach(c => c.classList.remove('selected'));
    this.closest('.prod-card').classList.add('selected');
  });
});

//  init the form...
Object.keys(formState).forEach(f => {
  for (let i = 2; i <= formState[f].total; i++) {
    const p = document.getElementById(pfxMap[f].sec + i);
    if (p) p.classList.remove('active');
  }
  document.getElementById(pfxMap[f].sec + '1').classList.add('active');
  updateProgress(f);
});


function handleMUpload(input, zoneId, nameId) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); input.value = ''; return; }
  document.getElementById(zoneId).classList.add('has-file');
  const nameEl = document.getElementById(nameId);
  nameEl.textContent = file.name;
  nameEl.classList.remove('hidden');
}

function updateKinIdField() {
  const isPassport = document.querySelector('input[name="kin_id_type"]:checked').value === 'passport';
  document.getElementById('kin_id_doc_label').innerHTML = isPassport
    ? 'Passport Number <span style="color:var(--color-red)">*</span>'
    : 'National ID Number <span style="color:var(--color-red)">*</span>';
  document.getElementById('kin_id_no').style.display = isPassport ? 'none' : '';
  document.getElementById('kin_passport_no').style.display = isPassport ? '' : 'none';
  if (isPassport) document.getElementById('kin_id_no').value = '';
  else document.getElementById('kin_passport_no').value = '';
}

// ── Load Zoho membership form component ──
fetch('leads-zoho-form.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('zohoFormMount');
    if (!mount) return;
    mount.innerHTML = html;
    // Re-execute Zoho scripts that arrived as HTML strings
    mount.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      if (old.src) { s.src = old.src; s.async = true; }
      else { s.textContent = old.textContent; }
      old.parentNode.replaceChild(s, old);
    });
  })
  .catch(() => {
    const mount = document.getElementById('zohoFormMount');
    if (mount) mount.innerHTML =
      '<p class="text-sm py-4 text-center" style="color:#f14e3f;">Could not load the form. Please refresh and try again.</p>';
  });
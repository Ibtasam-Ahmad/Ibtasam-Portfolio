'use strict';

/* Based on the vCard template (MIT, codewithsadee), extended with hash routing,
   project details modal, accessible modals and Netlify Forms submission. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); };


/* ---------- sidebar (mobile "Show Contacts") ---------- */

const sidebar = $("[data-sidebar]");
const sidebarBtn = $("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
  sidebarBtn.setAttribute("aria-expanded", sidebar.classList.contains("active"));
});


/* ---------- generic modal helper ---------- */

let lastFocused = null;

const openModal = function (container, overlay) {
  lastFocused = document.activeElement;
  container.classList.add("active");
  overlay.classList.add("active");
  document.body.classList.add("modal-open");
  const closeBtn = $(".modal-close-btn", container);
  if (closeBtn) closeBtn.focus();
};

const closeModal = function (container, overlay) {
  container.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("modal-open");
  if (lastFocused) lastFocused.focus();
};

document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  $$(".modal-container.active").forEach(function (container) {
    closeModal(container, $(".overlay", container));
  });
});


/* ---------- testimonials modal ---------- */

const testimonialsItem = $$("[data-testimonials-item]");
const modalContainer = $("[data-modal-container]");
const modalCloseBtn = $("[data-modal-close-btn]");
const overlay = $("[data-overlay]");

const modalImg = $("[data-modal-img]");
const modalTitle = $("[data-modal-title]");
const modalMeta = $("[data-modal-meta]");
const modalText = $("[data-modal-text]");

const openTestimonial = function (item) {
  modalImg.textContent = $("[data-testimonials-avatar]", item).textContent;
  modalTitle.textContent = $("[data-testimonials-title]", item).textContent;
  modalMeta.textContent = $("[data-testimonials-meta]", item).textContent;
  modalText.innerHTML = $("[data-testimonials-text]", item).innerHTML;
  openModal(modalContainer, overlay);
};

testimonialsItem.forEach(function (item) {
  item.addEventListener("click", function () { openTestimonial(item); });
  item.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTestimonial(item); }
  });
});

modalCloseBtn.addEventListener("click", function () { closeModal(modalContainer, overlay); });
overlay.addEventListener("click", function () { closeModal(modalContainer, overlay); });


/* ---------- portfolio filter ---------- */

const select = $("[data-select]");
const selectItems = $$("[data-select-item]");
const selectValue = $("[data-select-value]");
const filterBtn = $$("[data-filter-btn]");
const filterItems = $$("[data-filter-item]");

const filterFunc = function (selectedValue) {
  filterItems.forEach(function (item) {
    const show = selectedValue === "all" || selectedValue === item.dataset.category;
    item.classList.toggle("active", show);
  });
};

select.addEventListener("click", function () { elementToggleFunc(this); });

selectItems.forEach(function (item) {
  item.addEventListener("click", function () {
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(this.dataset.selectItem);
  });
});

let lastClickedBtn = filterBtn[0];

filterBtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    selectValue.innerText = this.innerText;
    filterFunc(this.dataset.filterBtn);
    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
});


/* ---------- project details modal ---------- */

const projectModal = $("[data-project-modal]");
const projectOverlay = $("[data-project-overlay]");
const projectClose = $("[data-project-close]");
const projectModalImg = $("[data-project-modal-img]");
const projectModalTitle = $("[data-project-modal-title]");
const projectModalCategory = $("[data-project-modal-category]");
const projectModalBody = $("[data-project-modal-body]");

$$("[data-project]").forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const item = link.closest(".project-item");
    const img = $(".project-img img", item);
    projectModalImg.src = img.getAttribute("src");
    projectModalImg.alt = img.alt;
    projectModalTitle.textContent = $(".project-title", item).textContent;
    projectModalCategory.textContent = $(".project-category", item).textContent;
    projectModalBody.innerHTML = $(".project-details", item).innerHTML;
    $$("a", projectModalBody).forEach(function (a) { a.classList.add("btn-secondary"); });
    openModal(projectModal, projectOverlay);
  });
});

projectClose.addEventListener("click", function () { closeModal(projectModal, projectOverlay); });
projectOverlay.addEventListener("click", function () { closeModal(projectModal, projectOverlay); });


/* ---------- page navigation (hash based, so tabs are linkable) ---------- */

const navigationLinks = $$("[data-nav-link]");
const pages = $$("[data-page]");
const pageNames = pages.map(function (p) { return p.dataset.page; });

// Anchors from the previous version of the site, so old links still land somewhere sensible.
const legacyHashes = { home: "about", education: "resume", experience: "resume" };

const showPage = function (name, scroll) {
  name = legacyHashes[name] || name;
  if (!pageNames.includes(name)) name = "about";
  pages.forEach(function (page) { page.classList.toggle("active", page.dataset.page === name); });
  navigationLinks.forEach(function (link) {
    const isActive = link.dataset.navLink === name;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (scroll) window.scrollTo(0, 0);
};

navigationLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const name = this.dataset.navLink;
    if (location.hash !== "#" + name) history.pushState(null, "", "#" + name);
    showPage(name, true);
  });
});

window.addEventListener("popstate", function () {
  showPage(location.hash.slice(1), true);
});

showPage(location.hash.slice(1) || "about", false);


/* ---------- contact form (Netlify Forms) ---------- */

const form = $("[data-form]");
const formInputs = $$("[data-form-input]");
const formBtn = $("[data-form-btn]");
const formStatus = $("[data-form-status]");

const updateFormBtn = function () {
  if (form.checkValidity()) formBtn.removeAttribute("disabled");
  else formBtn.setAttribute("disabled", "");
};

formInputs.forEach(function (input) {
  input.addEventListener("input", updateFormBtn);
  input.addEventListener("change", updateFormBtn);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  formBtn.setAttribute("disabled", "");
  formStatus.className = "form-status";
  formStatus.textContent = "Sending…";

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(new FormData(form)).toString()
  })
    .then(function (res) {
      if (!res.ok) throw new Error(res.status);
      form.reset();
      formStatus.classList.add("success");
      formStatus.textContent = "Thanks! Your message has been sent. I'll reply within 24 hours.";
    })
    .catch(function () {
      formStatus.classList.add("error");
      formStatus.innerHTML = 'Something went wrong. Please email me at <a href="mailto:shibtasam@gmail.com">shibtasam@gmail.com</a> instead.';
      updateFormBtn();
    });
});

// Non-JS fallback lands on /?sent=1#contact after Netlify handles the POST.
if (new URLSearchParams(location.search).has("sent")) {
  formStatus.classList.add("success");
  formStatus.textContent = "Thanks! Your message has been sent. I'll reply within 24 hours.";
}


/* ---------- footer year ---------- */

const yearEl = $("[data-year]");
if (yearEl) yearEl.textContent = new Date().getFullYear();

(() => {
  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const openInquiryBtns = document.querySelectorAll("[data-open-inquiry], #open-inquiry-btn");
  const closeInquiryBtn = document.getElementById("close-inquiry-btn");
  const inquiryModal = document.getElementById("inquiry-modal");
  const toastEl = document.getElementById("toast");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Header scroll state
  const updateHeaderOnScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  // Mobile navigation
  const setMenuOpen = (isOpen) => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("open", isOpen);
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!expanded);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Toast helper
  let toastTimer = null;
  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("visible");
    }, 2800);
  };

  // Copy buttons
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy");
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        showToast("Copied to clipboard");
      } catch {
        showToast(value);
      }
    });
  });

  // Inquiry modal
  let lastFocusedEl = null;

  const openModal = () => {
    if (!inquiryModal) return;
    lastFocusedEl = document.activeElement;
    inquiryModal.hidden = false;
    document.body.style.overflow = "hidden";
    const firstInput = inquiryModal.querySelector("input");
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    if (!inquiryModal || inquiryModal.hidden) return;
    inquiryModal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedEl instanceof HTMLElement) {
      lastFocusedEl.focus();
    }
  };

  openInquiryBtns.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  if (closeInquiryBtn) {
    closeInquiryBtn.addEventListener("click", closeModal);
  }

  if (inquiryModal) {
    inquiryModal.addEventListener("click", (event) => {
      if (event.target === inquiryModal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      setMenuOpen(false);
    }
  });

  // Case assessment / inquiry forms -> open Gmail compose
  const RECIPIENT_EMAIL = "MachenRob110316@gmail.com";

  document.querySelectorAll(".js-assessment-form, #inquiry-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const matter = String(data.get("matterType") || data.get("area") || "General enquiry").trim();
      const message = String(data.get("message") || "").trim();
      const statusEl = form.querySelector(".form-status");

      const subject = `Case Assessment Enquiry — ${matter} (${name})`;
      const body = [
        `Full Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Type of Matter: ${matter}`,
        "",
        "The Matter:",
        message,
      ].join("\n");

      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(RECIPIENT_EMAIL)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      const mailtoUrl =
        `mailto:${RECIPIENT_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      window.open(gmailUrl, "_blank", "noopener,noreferrer");

      if (statusEl) {
        statusEl.innerHTML =
          `Opening Gmail to send to ${RECIPIENT_EMAIL}… ` +
          `<a href="${mailtoUrl}" class="status-mail-link">Use default email app instead</a>`;
      }
      showToast("Opening Gmail with your enquiry details…");

      if (inquiryModal && inquiryModal.contains(form)) {
        window.setTimeout(closeModal, 1400);
      }
    });
  });
})();

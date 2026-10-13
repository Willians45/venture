(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- header al hacer scroll ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- menú móvil ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const closeNav = () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
  };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  $$("a", nav).forEach(a => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });

  /* ---------- reveal al hacer scroll ---------- */
  const revealables = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add("is-in"));
  }

  /* ---------- pestañas de unidades ---------- */
  $$("[data-tabs]").forEach(root => {
    const tabs = $$('[role="tab"]', root);
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));

    const activate = index => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        if (on) {
          panels[i].style.animation = "none";
          void panels[i].offsetWidth;
          panels[i].style.animation = "";
        }
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(i));
      tab.addEventListener("keydown", e => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = (map[e.key] + tabs.length) % tabs.length;
        tabs[next].focus();
        activate(next);
      });
    });
  });

  /* ---------- formulario ---------- */
  const form = $("#form");
  const status = $("#formStatus");
  const isPlaceholder = form.action.includes("PLACEHOLDER");

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = "form__status" + (type ? ` is-${type}` : "");
  };

  const validate = () => {
    let firstBad = null;
    $$("[required]", form).forEach(field => {
      const bad = !field.value.trim();
      field.closest(".field").classList.toggle("is-error", bad);
      if (bad && !firstBad) firstBad = field;
    });
    if (firstBad) {
      firstBad.focus();
      setStatus("Completa los campos obligatorios.", "err");
      return false;
    }
    return true;
  };

  $$("input, select, textarea", form).forEach(field => {
    field.addEventListener("input", () => field.closest(".field").classList.remove("is-error"));
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate()) return;

    if (isPlaceholder) {
      setStatus("Formulario validado. Reemplaza PLACEHOLDER_ID en index.html por tu ID de Formspree para activar el envío.", "ok");
      return;
    }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    setStatus("Enviando…");

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      setStatus("¡Gracias! Recibimos tu solicitud y te contactaremos pronto.", "ok");
    } catch {
      setStatus("No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos por correo.", "err");
    } finally {
      btn.disabled = false;
    }
  });
})();

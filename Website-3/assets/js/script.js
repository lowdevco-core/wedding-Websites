(() => {
  /* ---------- Edit your details here ---------- */
  const CONFIG = {
    start: "2027-11-24T10:00:00+05:30", // ceremony start (IST)
    hours: 4, // length used for the calendar entry
    title: "Rahul & Anjali's Wedding",
    venue: "The Backwater Resort, Kerala, India",
    mapQuery: "The Backwater Resort Kerala",
    rsvpWhatsApp: "", // e.g. "919876543210" (country code + number). Leave empty to hide the button.
    rsvpMessage: "Hi! I will be joining the wedding of Rahul & Anjali.",
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Buttons: map, calendar, RSVP ---------- */
  $("#btn-map").href =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(CONFIG.mapQuery);

  if (CONFIG.rsvpWhatsApp) {
    const r = $("#btn-rsvp");
    r.href = `https://wa.me/${CONFIG.rsvpWhatsApp}?text=${encodeURIComponent(CONFIG.rsvpMessage)}`;
    r.hidden = false;
  }

  $("#btn-cal").addEventListener("click", () => {
    const fmt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const s = new Date(CONFIG.start);
    const e = new Date(s.getTime() + CONFIG.hours * 3600000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//EN",
      "BEGIN:VEVENT",
      `UID:${fmt(s)}@wedding-invitation`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(s)}`,
      `DTEND:${fmt(e)}`,
      `SUMMARY:${CONFIG.title}`,
      `LOCATION:${CONFIG.venue}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "wedding.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ---------- Countdown ---------- */
  const cd = (k) => $(`[data-cd="${k}"]`);
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, new Date(CONFIG.start) - Date.now());
    const d = Math.floor(diff / 864e5);
    diff %= 864e5;
    const h = Math.floor(diff / 36e5);
    diff %= 36e5;
    const m = Math.floor(diff / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);
    cd("d").textContent = pad(d);
    cd("h").textContent = pad(h);
    cd("m").textContent = pad(m);
    cd("s").textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Animations ---------- */
  
  const loader = $(".loader");
  const finish = () => {
    loader.remove();
    document.body.classList.remove("is-loading");
    gsap.set(".nav", { clearProps: "transform" });
  };

  if (!window.gsap || reduce) {
    loader.remove();
    document.body.classList.remove("is-loading");
    $(".nav").style.transform = "none";
    $(".progress").style.display = "none";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Helpers: split text into characters / words
  function splitChars(el) {
    const t = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", t);
    return [...t].map((c) => {
      const s = document.createElement("span");
      s.className = "char";
      s.setAttribute("aria-hidden", "true");
      s.textContent = c;
      el.appendChild(s);
      return s;
    });
  }
  function splitWords(el) {
    const t = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-label", t);
    return t.split(/\s+/).map((w) => {
      const s = document.createElement("span");
      s.className = "w";
      s.setAttribute("aria-hidden", "true");
      s.textContent = w;
      el.appendChild(s);
      return s;
    });
  }

  const nameChars = $$(".names [data-chars]").flatMap(splitChars);
  const dateChars = $$(".date-num[data-chars]").flatMap(splitChars);
  gsap.set(nameChars, { yPercent: 115 });
  gsap.set(dateChars, { yPercent: 115 });
  gsap.set([".hero-ml", ".amp", ".hero-date", ".scroll-cue"], { opacity: 0 });
  gsap.set(".hero-kasavu", { scaleX: 0 });
  gsap.set(".nav", { yPercent: -100 });

  // The lamp flame flickers while the intro plays
  gsap.to(".flame", {
    scaleY: 1.1,
    scaleX: 0.93,
    svgOrigin: "40 56",
    repeat: -1,
    yoyo: true,
    duration: 0.35,
    ease: "sine.inOut",
  });

  // One orchestrated moment: light the lamp, open the gate, reveal the couple
  const intro = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: finish,
  });
  intro
    .from(".loader-lamp", { scale: 0.6, opacity: 0, duration: 1 })
    .from(".loader-ml", { y: 16, opacity: 0, duration: 0.8 }, "-=.4")
    .to(
      ".loader-line",
      { scaleX: 1, duration: 1, ease: "power2.inOut" },
      "-=.5",
    )
    .to(".loader-inner", { opacity: 0, scale: 0.96, duration: 0.5 }, "+=.25")
    .to(".loader-panel.l", {
      xPercent: -100,
      duration: 1.4,
      ease: "power4.inOut",
    })
    .to(
      ".loader-panel.r",
      { xPercent: 100, duration: 1.4, ease: "power4.inOut" },
      "<",
    )
    .fromTo(
      ".hero-video",
      { scale: 1.25 },
      { scale: 1, duration: 2.4, ease: "power2.out" },
      "<",
    )
    .to(".hero-ml", { opacity: 1, duration: 1 }, "-=1.1")
    .to(
      nameChars,
      { yPercent: 0, duration: 1.2, stagger: 0.06, ease: "power4.out" },
      "-=1.0",
    )
    .to(".amp", { opacity: 1, duration: 1 }, "-=.9")
    .to(".hero-date", { opacity: 1, duration: 1 }, "-=.6")
    .to(
      ".hero-kasavu",
      { scaleX: 1, duration: 1.6, ease: "power3.inOut" },
      "-=1",
    )
    .to(".scroll-cue", { opacity: 1, duration: 1 }, "-=.8");

  // Falling jasmine petals in the hero
  const petalBox = $(".petals");
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("i");
    p.className = "petal";
    petalBox.appendChild(p);
    const x0 = gsap.utils.random(0, innerWidth);
    gsap.set(p, {
      x: x0,
      y: -30,
      rotation: gsap.utils.random(0, 360),
      scale: gsap.utils.random(0.5, 1.1),
      opacity: gsap.utils.random(0.35, 0.8),
    });
    gsap.to(p, {
      y: () => petalBox.clientHeight + 40,
      x: x0 + gsap.utils.random(-140, 140),
      rotation: "+=" + gsap.utils.random(180, 420),
      duration: gsap.utils.random(10, 18),
      delay: gsap.utils.random(2, 12),
      repeat: -1,
      ease: "none",
    });
  }

  // Hero fades and drifts as you scroll away
  gsap.to(".hero-content", {
    yPercent: 18,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom 30%",
      scrub: true,
    },
  });
  gsap.to(".hero-video", {
    yPercent: 8,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // Nav slides in once the hero is passed
  ScrollTrigger.create({
    trigger: ".hero",
    start: "bottom 20%",
    onEnter: () =>
      gsap.to(".nav", { yPercent: 0, duration: 0.6, ease: "power3.out" }),
    onLeaveBack: () =>
      gsap.to(".nav", { yPercent: -100, duration: 0.5, ease: "power3.in" }),
  });

  // Gold progress thread
  gsap.to(".progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
    },
  });

  // Invitation: words light up as you read; the couple's photo drifts inside its arch
  const words = splitWords($(".statement"));
  gsap.fromTo(
    words,
    { opacity: 0.15 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".statement",
        start: "top 80%",
        end: "bottom 45%",
        scrub: true,
      },
    },
  );
  gsap.fromTo(
    ".arch-img",
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".arch",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
  gsap.from(".arch-wrap", {
    clipPath: "inset(100% 0 0 0)",
    duration: 1.4,
    ease: "power4.out",
    scrollTrigger: { trigger: ".arch-wrap", start: "top 80%" },
  });

  // Kasavu borders weave in
  gsap.from(".invite + .kasavu", {
    scaleX: 0,
    transformOrigin: "left",
    duration: 1.6,
    ease: "power3.inOut",
    scrollTrigger: { trigger: ".invite + .kasavu", start: "top 95%" },
  });

  // Details: the date rises, everything else is calm
  gsap.to(dateChars, {
    yPercent: 0,
    duration: 1.1,
    stagger: 0.12,
    ease: "power4.out",
    scrollTrigger: { trigger: ".date-big", start: "top 80%" },
  });
  gsap.from(".date-rest", {
    opacity: 0,
    x: -24,
    duration: 1,
    delay: 0.3,
    ease: "power3.out",
    scrollTrigger: { trigger: ".date-big", start: "top 80%" },
  });
  gsap.from(".detail", {
    borderTopColor: "rgba(201,162,75,0)",
    opacity: 0,
    y: 24,
    duration: 0.9,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: { trigger: ".details-grid", start: "top 85%" },
  });
  gsap.from(".countdown div", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".countdown", start: "top 90%" },
  });
  gsap.from(".actions .btn", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".actions", start: "top 92%" },
  });

  // Footer: slow zoom on the gate
  gsap.fromTo(
    ".footer-img",
    { scale: 1.2 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
      },
    },
  );
  gsap.from(".footer-content > *", {
    opacity: 0,
    y: 30,
    duration: 1,
    stagger: 0.18,
    ease: "power3.out",
    scrollTrigger: { trigger: ".footer-content", start: "top 85%" },
  });
})();

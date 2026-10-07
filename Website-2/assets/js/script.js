(() => {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Config ---------- */
  const WEDDING_DATE = new Date("2027-11-24T10:30:00+05:30"); // Kerala (IST)
  const PETAL_COUNT = 28;
  const WIPE_HIDDEN = "inset(-20% 100% -20% -10%)";
  const WIPE_SHOWN = "inset(-20% -10% -20% -10%)";

  /* ---------- Helpers ---------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const gate = $("#gate");
  const navbar = $("#navbar");
  const heroVideo = $("#hero-video");

  /* ---------- Line-drawn crosses ---------- */
  function prepareCrosses() {
    $$(".draw").forEach((el) => {
      const length = el.getTotalLength();
      gsap.set(el, {
        strokeDasharray: length,
        strokeDashoffset: prefersReducedMotion ? 0 : length,
      });
    });
  }

  function drawCross(cross, vars = {}) {
    return gsap.to($$(".draw", cross), {
      strokeDashoffset: 0,
      duration: 1.6,
      stagger: 0.4,
      ease: "power2.inOut",
      ...vars,
    });
  }

  /* ---------- Petals ---------- */
  function createPetals() {
    const container = $("#petals");
    if (prefersReducedMotion || !container) return;

    for (let i = 0; i < PETAL_COUNT; i++) {
      const petal = document.createElement("div");
      petal.className = "petal";
      container.appendChild(petal);

      gsap.set(petal, {
        x: gsap.utils.random(0, window.innerWidth),
        scale: gsap.utils.random(0.6, 1.2),
      });
      gsap.fromTo(
        petal,
        { y: -40, rotation: 0 },
        {
          y: window.innerHeight + 40,
          x: `+=${gsap.utils.random(-120, 120)}`,
          rotation: gsap.utils.random(360, 720),
          duration: gsap.utils.random(6, 11),
          delay: gsap.utils.random(0, 6),
          repeat: -1,
          ease: "none",
        },
      );
    }
  }

  function fadeOutPetals() {
    gsap.to("#petals", {
      autoAlpha: 0,
      duration: 2,
      delay: 8,
      onComplete: () => $("#petals")?.remove(),
    });
  }

  /* ---------- Gate and hero intro ---------- */
  function playGateIntro() {
    if (prefersReducedMotion) return;
    gsap.from("#gate-content > *", {
      y: 24,
      autoAlpha: 0,
      stagger: 0.2,
      duration: 1.2,
      ease: "power2.out",
    });
    drawCross($("#gate-content .cross"), { delay: 0.2 });
  }

  function prepareHeroIntro() {
    if (prefersReducedMotion) return;
    gsap.set("[data-hero]", { autoAlpha: 0, y: 16 });
    gsap.set(".hero-name", { clipPath: WIPE_HIDDEN });
  }

  function playHeroIntro() {
    gsap
      .timeline({ defaults: { ease: "power2.out" } })
      .to("[data-hero=pre]", { autoAlpha: 1, y: 0, duration: 1 })
      .to(
        ".hero-name",
        {
          clipPath: WIPE_SHOWN,
          duration: 1.6,
          stagger: 0.6,
          ease: "power2.inOut",
        },
        "-=0.4",
      )
      .to(
        "[data-hero=post]",
        { autoAlpha: 1, y: 0, duration: 1, stagger: 0.25 },
        "-=0.6",
      );
  }

  function finishOpening() {
    gate.remove();
    document.body.classList.remove("is-locked");
    ScrollTrigger.refresh();
  }

  function openInvitation() {
    $("#open-btn").disabled = true;
    heroVideo?.play().catch(() => {});

    if (prefersReducedMotion) {
      gsap.set("[data-hero]", { clearProps: "all" });
      finishOpening();
      return;
    }

    gsap
      .timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: finishOpening,
      })
      .to("#gate-content", { autoAlpha: 0, y: -30, duration: 0.8 })
      .to("[data-door=left]", { xPercent: -100, duration: 1.8 }, "-=0.1")
      .to("[data-door=right]", { xPercent: 100, duration: 1.8 }, "<")
      .add(playHeroIntro, "-=1.2");

    fadeOutPetals();
  }

  /* ---------- Scroll animations ---------- */
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    // Hero video parallax
    gsap.to(heroVideo, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Navbar appears after the hero
    ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom 30%",
      onEnter: () => gsap.to(navbar, { autoAlpha: 1, duration: 0.5 }),
      onLeaveBack: () => gsap.to(navbar, { autoAlpha: 0, duration: 0.3 }),
    });

    // Verse: cross draws, then the lines appear one by one
    gsap
      .timeline({ scrollTrigger: { trigger: "#verse", start: "top 60%" } })
      .add(drawCross($("#verse .cross")))
      .from(
        ".verse-line",
        {
          autoAlpha: 0,
          y: 20,
          stagger: 0.4,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=0.8",
      );

    // Events: the line grows as you scroll and each event slides in from its side
    gsap.fromTo(
      "#timeline-line",
      { scaleY: 0, transformOrigin: "top" },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#timeline",
          start: "top 70%",
          end: "bottom 70%",
          scrub: true,
        },
      },
    );

    $$(".event").forEach((event) => {
      const direction = event.dataset.side === "left" ? -60 : 60;
      gsap.from(event, {
        x: direction,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: event, start: "top 80%" },
      });
    });

    // Countdown
    gsap.from(".countdown-item", {
      autoAlpha: 0,
      y: 24,
      stagger: 0.15,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: { trigger: "#countdown", start: "top 70%" },
    });

    // Family
    gsap
      .timeline({ scrollTrigger: { trigger: "#family", start: "top 65%" } })
      .from(".family-col", {
        autoAlpha: 0,
        y: 30,
        stagger: 0.3,
        duration: 1.1,
        ease: "power2.out",
      })
      .from(
        ".family-divider",
        { scale: 0, duration: 0.8, ease: "power2.out" },
        "-=0.9",
      );

    // Footer
    gsap
      .timeline({ scrollTrigger: { trigger: "footer", start: "top 70%" } })
      .add(drawCross($("footer .cross")))
      .from(
        ".footer-text",
        { autoAlpha: 0, y: 24, duration: 1.2, ease: "power2.out" },
        "-=0.8",
      );
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const fields = {
      days: $("#cd-days"),
      hours: $("#cd-hours"),
      mins: $("#cd-mins"),
      secs: $("#cd-secs"),
    };
    const pad = (value) => String(value).padStart(2, "0");

    function update() {
      const totalSeconds = Math.max(
        0,
        Math.floor((WEDDING_DATE - Date.now()) / 1000),
      );
      fields.days.textContent = pad(Math.floor(totalSeconds / 86400));
      fields.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
      fields.mins.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      fields.secs.textContent = pad(totalSeconds % 60);
      return totalSeconds;
    }

    if (update() === 0) return;
    const timer = setInterval(
      () => update() === 0 && clearInterval(timer),
      1000,
    );
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    prepareCrosses();
    prepareHeroIntro();
    createPetals();
    initCountdown();
    initScrollAnimations();
    playGateIntro();
    $("#open-btn").addEventListener("click", openInvitation);
  });
})();

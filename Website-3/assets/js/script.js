document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Custom Cursor (Only on Desktop)
  let mm = gsap.matchMedia();
  
  mm.add("(min-width: 768px)", () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if(cursorDot && cursorOutline) {
      window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({
          left: `${posX}px`,
          top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
      });
    }
  });

  // Initial Loader Animation (Universal)
  const tl = gsap.timeline();

  tl.to('.loader-line', { width: '100px', duration: 1, ease: 'power3.inOut' })
    .to('.loader-text', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, "-=0.5")
    .to('.loader', { yPercent: -100, duration: 1.2, ease: 'power4.inOut', delay: 0.5 })
    .to('.hero-img-wrap', { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' }, "-=1")
    .to('.hero-date', { y: 0, duration: 1, ease: 'power3.out' }, "-=1")
    .to('.hero-title', { y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, "-=0.8")
    .to('.hero-amp', { y: 0, duration: 1, ease: 'power3.out' }, "-=0.8")
    .to('.hero-loc', { y: 0, duration: 1, ease: 'power3.out' }, "-=0.6");

  // Navbar logic
  const navWrap = document.querySelector('.nav-wrap');
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.8) {
      navWrap.classList.add('is-visible');
    } else {
      navWrap.classList.remove('is-visible');
    }
  });

  // Responsive Scroll Animations
  mm.add({
    isDesktop: "(min-width: 768px)",
    isMobile: "(max-width: 767px)"
  }, (context) => {
    let { isDesktop, isMobile } = context.conditions;

    // Story Section
    gsap.fromTo('.reveal-left', 
      { x: isDesktop ? -50 : 0, y: isMobile ? 50 : 0, opacity: 0 },
      { x: 0, y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: '#story', start: 'top 75%' } }
    );

    gsap.fromTo('.reveal-right', 
      { x: isDesktop ? 50 : 0, y: isMobile ? 50 : 0, opacity: 0 },
      { x: 0, y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: isMobile ? '.reveal-right' : '#story', start: 'top 75%' } }
    );

    gsap.to('.parallax-img', {
      yPercent: isMobile ? 10 : 20,
      ease: "none",
      scrollTrigger: { trigger: '#story', start: "top bottom", end: "bottom top", scrub: true }
    });

    // Events Section
    if (isDesktop) {
      // Horizontal scroll
      let eventsWrapper = document.querySelector('.events-wrapper');
      let scrollWidth = eventsWrapper.scrollWidth - window.innerWidth;
      
      gsap.to(eventsWrapper, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: '#events',
          start: "top top",
          end: () => `+=${scrollWidth}`,
          pin: true,
          scrub: 1,
        }
      });
    } else {
      // Mobile staggered fade up for event cards
      gsap.fromTo('.event-card', 
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.2,
          scrollTrigger: {
            trigger: '#events',
            start: "top 80%",
          }
        }
      );
    }

    return () => { 
      // Cleanup if needed
    };
  });

  // Footer Reveal
  gsap.fromTo('.footer-content',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: 'footer', start: 'top 80%' } }
  );

});


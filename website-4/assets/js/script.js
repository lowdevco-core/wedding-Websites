document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Hero Initial Load Animation
  const tl = gsap.timeline();
  
  // Float in Polaroids
  tl.fromTo('.hero-pic-1', 
    { y: window.innerHeight, rotation: -20, opacity: 0 },
    { y: 0, rotation: -10, opacity: 1, duration: 1.5, ease: "power3.out" }
  )
  .fromTo('.hero-pic-2', 
    { y: window.innerHeight, rotation: 20, opacity: 0 },
    { y: 0, rotation: 8, opacity: 1, duration: 1.5, ease: "power3.out" },
    "-=1.2"
  )
  // Fade up typography
  .to('.hero-text', { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" }, "-=1");

  // Floating effect for polaroids on mousemove
  const heroSection = document.querySelector('section');
  heroSection.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    gsap.to('.hero-pic-1', { x: x, y: y, duration: 1, ease: "power1.out" });
    gsap.to('.hero-pic-2', { x: -x, y: -y, duration: 1, ease: "power1.out" });
  });

  // Story Scroll Animation
  gsap.utils.toArray('.story-block').forEach((block, i) => {
    gsap.fromTo(block,
      { y: 100, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1,
        scrollTrigger: {
          trigger: block,
          start: "top 80%",
        }
      }
    );
    
    // Tiny image parallax inside the rounded container
    const img = block.querySelector('.story-img');
    if(img) {
      gsap.fromTo(img, 
        { scale: 1.2 }, 
        { scale: 1, duration: 1, scrollTrigger: { trigger: block, start: "top 80%" } }
      );
    }
  });

  // Bento Box Stagger Reveal
  gsap.fromTo('.bento-item', 
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.2,
      scrollTrigger: {
        trigger: '#itinerary',
        start: "top 70%"
      }
    }
  );

  

  // Navbar appear after hero
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.8) {
      navbar.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
      navbar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    } else {
      navbar.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
      navbar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }
  });
});

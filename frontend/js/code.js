/**
My Script
*/
(function() {
  "use strict";

  //easy slector helper funtion 

  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  //easy event listener function 

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

   //easy on scroll event listener 

  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  //Navbar links Active state on scroll 

  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth'
    })
  }

  //Mobile Nav Toggle 

  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  //Scroll to an Element with header offset 

  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  //scroll with offset on page load with hash in URL 

  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  //skill animation 

  let skillsContent=select('.skill-content')
  if(skillsContent)
  {
    new Waypoint(
      {
        element:skillsContent,
        offset:'80%',
        handler:function(direction)
        {
          let progress=select('.progress .progress-bar',true)
          progress.forEach((el)=>
          {
            el.style.width=el.getAttribute('aria-valuenow') + '%'
          });
        }
      }
    )
  };
  //Portfolio isotops and filters 

  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flter li', true);

      on('click', '#portfolio-flter li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      },true);
    }
  });
  //Inializing Glightbox
  const portfolioLightbox=GLightbox(
    {
      selector:'.portfolio-lightbox'
    }
  )


  //Testimonial Slider 

  new Swiper('.testimonial-slider',{
    speed:600,
    loop:true,
    autoplay:{
      delay:5000,
      disableOnInteraction:false
    },
    slidePerView:'auto',
    pagination:{
      el:'.swiper-pagination',
      type:'bullets',
      clickable:true
    },
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      // when window width is >= 640px
      640: {
        slidesPerView: 3,
        spaceBetween: 40
      }
    }
  })
  //Back to Top Button 

  let backtotop=select('.back-to-top')
  if(backtotop)
  {
    const toggleBacktotop=()=>
    {
      if(window.scrollY > 100)
      {
        backtotop.classList.add('active')
      }
      else
      {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load',toggleBacktotop)
    onscroll(document,toggleBacktotop)
  }
  //Initializing Pure Counter 
  new PureCounter();
})()

/* ===== LMS Screenshot Slider + Project Modal ===== */
const lmsSlides = [
    "img/projects/admin-dashboard.png",
    "img/projects/course-page.png",
    "img/projects/login-page.png",
    "img/projects/register-page.png",
    "img/projects/student-dashboard.png",
    "img/projects/teacher-dashboard.png"
];

let lmsCurrentSlide = 0;

function renderLmsSlider() {
    const img = document.getElementById("lmsSlideImage");
    const dots = document.getElementById("lmsSliderDots");

    if (!img || !dots) return;

    img.src = lmsSlides[lmsCurrentSlide];

    dots.innerHTML = "";
    lmsSlides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === lmsCurrentSlide ? "active" : "";
        dot.onclick = () => {
            lmsCurrentSlide = index;
            renderLmsSlider();
        };
        dots.appendChild(dot);
    });
}

function changeLmsSlide(direction) {
    lmsCurrentSlide += direction;

    if (lmsCurrentSlide < 0) {
        lmsCurrentSlide = lmsSlides.length - 1;
    }

    if (lmsCurrentSlide >= lmsSlides.length) {
        lmsCurrentSlide = 0;
    }

    renderLmsSlider();
}

function openProjectModal() {
    const modal = document.getElementById("projectModal");
    if (modal) {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closeProjectModal() {
    const modal = document.getElementById("projectModal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderLmsSlider();

    const modal = document.getElementById("projectModal");
    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeProjectModal();
            }
        });
    }
});

window.addEventListener("load",()=>{
setTimeout(()=>{
document.body.classList.add("loaded");
},1000);
});

const counters=document.querySelectorAll(".counter");

counters.forEach(counter=>{
const update=()=>{
const target=+counter.getAttribute("data-target");
const current=+counter.innerText;
const increment=target/100;

if(current<target){
counter.innerText=Math.ceil(current+increment);
setTimeout(update,20);
}else{
counter.innerText=target;
}
};
update();
});

const backToTop=document.getElementById("backToTop");

window.addEventListener("scroll",()=>{
if(window.scrollY>300){
backToTop.style.display="block";
}else{
backToTop.style.display="none";
}
});

if(backToTop){
backToTop.addEventListener("click",()=>{
window.scrollTo({top:0,behavior:"smooth"});
});
}


/* Professional fixed slider and modal */
const proSlides = [
    "img/projects/admin-dashboard.png",
    "img/projects/course-page.png",
    "img/projects/login-page.png",
    "img/projects/register-page.png",
    "img/projects/student-dashboard.png",
    "img/projects/teacher-dashboard.png"
];

let proSlideIndex = 0;

function proChangeSlide(direction){
    proSlideIndex += direction;
    if(proSlideIndex < 0) proSlideIndex = proSlides.length - 1;
    if(proSlideIndex >= proSlides.length) proSlideIndex = 0;

    const img = document.getElementById("proProjectImage");
    if(img) img.src = proSlides[proSlideIndex];
}

function openProModal(){
    const modal = document.getElementById("proProjectModal");
    if(modal){
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closeProModal(){
    const modal = document.getElementById("proProjectModal");
    if(modal){
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}

document.addEventListener("click", function(e){
    const modal = document.getElementById("proProjectModal");
    if(modal && e.target === modal){
        closeProModal();
    }
});

"use strict";

// Detect touch (mobile)
function isTouchDevice() {
  return 'ontouchstart' in document.documentElement;
}

// Add Selected class to nav link that matches page ID
let pageId;

function matchPage(e) {
  if (e.getAttribute("data-page") === pageId) {
    e.classList.add("nav__link--selected");
  }
}

const navLinks = Array.prototype.slice.call(document.querySelectorAll("header nav li[data-page]"));
if (document.body.hasAttribute("data-page")) {
  pageId = document.body.getAttribute("data-page");
  navLinks.forEach(matchPage);
}

// Toggle MOW menu
let mowActive = false;
const headerNav = document.querySelector("header nav");

document.getElementById("header__mow-nav-trigger").onclick = function() {
  if (!mowActive) {
    headerNav.classList.add("nav--mow-active");
    mowActive = true;
  } else {
    headerNav.classList.remove("nav--mow-active");
    mowActive = false;
  }
}

// Auto select-all text in code block on click (if user is on desktop)
if (!isTouchDevice()) {
  // Loop through tab code blocks
  const tabCodes = document.querySelectorAll(".tab__page code");
  for (let i = 0; i < tabCodes.length; i++) {
    // Add onClick to each tab code block
    tabCodes[i].addEventListener("click", function() {
      let sel, range;
      const el = this;
      if (window.getSelection && document.createRange) {
        sel = window.getSelection();
        if (sel.toString() === ""){
          window.setTimeout(function() {
            range = document.createRange();
            range.selectNodeContents(el);
            sel.removeAllRanges();
            sel.addRange(range);
          },1);
        }
      } else if (document.selection) {
        sel = document.selection.createRange();
        if (sel.text === "") {
          range = document.body.createTextRange();
          range.moveToElementText(el);
          range.select();
        }
      }
    });
  }
}

// Tab Navigation Interaction
const tabNavItems = document.querySelectorAll("li.tab__nav__item");
// Loop through all tabNavItems
for (let i = 0; i < tabNavItems.length; i++) {
  // Add onClick function
  tabNavItems[i].addEventListener("click", function() {
    // Set constants
    const tabPageContainer = this.parentNode.nextElementSibling;
    const tabPages = tabPageContainer.children;
    const tabNavItems = this.parentNode.children;
    const navDataTab = this.getAttribute("data-tab");
    // Unselect all Tab pages
    function unselectTabNavItems() {
      for (let i = 0; i < tabNavItems.length; i++) {
        tabNavItems[i].classList.remove("tab__nav__item--selected");
      }
    }
    // if this tab nav item isn't selected then select it
    if (!this.classList.contains("tab__nav__item--selected")) {
      let contentHeight;
      // Clear selected tab nav items
      unselectTabNavItems();
      // Add selected class to selected tab nav item
      this.classList.add("tab__nav__item--selected");
      // Loop through tab pages
      for (let i = 0; i < tabPages.length; i++) {
        // unselect all pages
        tabPages[i].classList.remove("tab__page--selected");
        // Select page that matches selected nav
        if (tabPages[i].getAttribute("data-tab") === navDataTab) {
          contentHeight = tabPages[i].offsetHeight;
          tabPages[i].classList.add("tab__page--selected");
        }
      }
      // Set container height to selected page content height
      tabPageContainer.style.height = contentHeight + "px";
    // otherwise, unselct all tab nav items
    } else {
      // Clear selected tab nav items
      unselectTabNavItems();
      // Collapse all pages
      tabPageContainer.style.height = "0px";
      for (let i = 0; i < tabPages.length; i++) {
        tabPages[i].classList.remove("tab__page--selected");
      }
    }
  });
}

// Auto-generate Side-Nav Section Navigation
if (document.getElementById("auto-nav")) {
  const sections = document.querySelectorAll("#auto-nav .col-layout__content .js-dynamic-section");
  const sectionNav = document.querySelector("#auto-nav .col-layout__nav nav");
  let html = sectionNav.innerHTML;
  let group = "";
  for (let i = 0; i < sections.length; i++) {
    const thisGroup = sections[i].getAttribute("data-group");
    if (thisGroup !== group) {
      if (i === 0) {
        html += `<a href="#top" title="Scroll to top of page"><h4>${thisGroup}</h4></a><ul>`;
      } else {
        html += `</ul><h4>${thisGroup}</h4><ul>`;
      }
    }
    group = thisGroup;
    html += '<li><a class="js-dynamic-link" href="#' + sections[i].id + '">' + sections[i].getAttribute("data-label") + '</a></li>';
  }
  sectionNav.innerHTML = `${html}</ul>`;

  // Select nav link that corresponds to visible section
  let scrollPosition = window.scrollY;
  window.addEventListener('scroll', function() {
    scrollPosition = window.scrollY;
    const dynamicLinks = document.querySelectorAll("#auto-nav .col-layout__nav nav ul li a.js-dynamic-link");
    for (let i = 0; i < dynamicLinks.length; i++) {
      dynamicLinks[i].parentNode.classList.remove("col-layout__nav--selected");
      const section = document.querySelector(dynamicLinks[i].getAttribute("href"));
      const sectionTop = section.offsetTop;
      // Offset (in pixels) from top of section that should trigger corresponding side-nav selection:
      const selectionOffset = 80;
      if ((scrollPosition > (sectionTop - selectionOffset)) && (scrollPosition < sectionTop + section.offsetHeight - selectionOffset)) {
        dynamicLinks[i].parentNode.classList.add("col-layout__nav--selected");
      }
    }
  });
}

// Smooth Scroll anchor links
const anchorLinks = document.querySelectorAll("a[href^='#']");
for (let i = 0; i < anchorLinks.length; i++) {
  anchorLinks[i].addEventListener("click", function(e) {
    e.preventDefault();
    const element = this.getAttribute("href");
    document.querySelector(element).scrollIntoView({behavior: "smooth", block: "start"});
  });
}

// Tutorial scrolling UX
const annotatedCode = document.getElementById("annotated-code");

// Proceed with code annotation logic if container element exists:
if (annotatedCode) {
  const annotationContainer = document.getElementById("annotated-code__annotations");
  // Dynamically create top/bottom fade effects for annotation scrolling:
  let topFadeNode = document.createElement("li");
  let bottomFadeNode = document.createElement("li");
  topFadeNode.setAttribute("id", "annotated-code__top-fade");
  bottomFadeNode.setAttribute("id", "annotated-code__bottom-fade");
  annotationContainer.insertBefore(topFadeNode, annotationContainer.childNodes[0]);
  annotationContainer.appendChild(bottomFadeNode);

  // Set common element constants:
  const topFade = document.getElementById("annotated-code__top-fade");
  const bottomFade = document.getElementById("annotated-code__bottom-fade");
  const codeBlocks = document.querySelectorAll(".annotated-code__code-block");
  const annotations = document.querySelectorAll("#annotated-code__annotations li.annotation");

  // Set default distance from top of screen for determining which code block is auto-focused during scroll:
  let scrollTop = 0;
  let containerTopOffset = 0;
  let scrollOffset = 0;
  let focusThreshold = 300;

  function focusBlock(id) {
    const focusedCodeBlock = document.getElementById(`c${id}`);
    const focusedAnnotation = document.getElementById(`a${id}`);

    // Remove focus class on any code block or annotation element that has it:
    function resetFocus(array) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].classList.contains("focused")) {
          array[i].classList.remove("focused");
        }
      }
    }
    resetFocus(codeBlocks);
    resetFocus(annotations);

    // Add focused class to the focused code/annotation pair:
    focusedCodeBlock.classList.add("focused");
    focusedAnnotation.classList.add("focused");

    // Set container offsets:
    const codeOffset = focusedCodeBlock.offsetTop;
    const annotationOffset = focusedAnnotation.offsetTop;
    const offset = annotationOffset - codeOffset;

    // Move annotation list to align focused annotation with focused code block:
    annotationContainer.style.transform = `translateY(-${offset}px)`;
    // Compensate for transform offset on sticky bottom/top fade-out elements:
    topFade.style.transform = `translateY(${offset}px)`;
    bottomFade.style.transform = `translateY(${offset}px)`;
  }

  // Update scroll-based offsets:
  function updateOffsets() {
    scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    containerTopOffset = annotatedCode.offsetTop;
    scrollOffset = scrollTop - containerTopOffset;
  }

  // onScroll Event:
  window.addEventListener("scroll", function() {
    updateOffsets();
    const containerBottomOffset = containerTopOffset + annotatedCode.offsetHeight;
    // Make topFade "sticky"
    if (scrollTop >= containerTopOffset) {
      topFade.style.top = `${scrollOffset - 120}px`;
    } else {
      topFade.style.top = "";
    }
    // Make bottomFade "sticky
    if (scrollTop <= containerBottomOffset) {
      bottomFade.style.top = `${scrollOffset + window.innerHeight}px`;
    }
    if (scrollTop >= (containerBottomOffset - window.innerHeight)) {
      bottomFade.style.top = `${annotatedCode.offsetHeight}px`;
    }
    // Focus code block at appropriate scroll offset:
    for (let i = 0; i < codeBlocks.length; i++) {
      const thisId = codeBlocks[i].id;
      const thisCodeBlock = document.getElementById(thisId);
      const thisOffset = thisCodeBlock.offsetTop;

      if ((scrollOffset > (thisOffset - focusThreshold)) && (scrollOffset < (thisOffset + thisCodeBlock.offsetHeight - focusThreshold))) {
        focusBlock(thisId.replace("c",""));
        break;
      }
    }
  });

  // Iterate through element list and add mouse events that call focusBlock
  function buildEvents(array) {
    for (let i = 0; i < array.length; i++) {
      const thisId = array[i].id;
      array[i].addEventListener("mousemove", function() {
        updateOffsets();
        focusThreshold = document.getElementById(`c${thisId.replace(/c|a/g,"")}`).offsetTop - scrollOffset;
        focusBlock(thisId.replace(/c|a/g,""));
      });
    }
  }
  buildEvents(codeBlocks);
  buildEvents(annotations);

  // Focus first code block/annotation pair by default
  focusBlock(document.querySelector(".annotated-code__code-block:first-child").id.replace(/c|a/g,""));
}

// Initialize Syntax Highlighting
hljs.initHighlightingOnLoad();

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

// Add Selected class to nav link that matches Tutorial ID
let tutId;

function matchTut(e) {
  if (e.getAttribute("data-tutorial-id") === tutId) {
    e.classList.add("tutorial__nav--selected");
  }
}

const tutNavLinks = Array.prototype.slice.call(document.querySelectorAll(".tutorial__nav li[data-tutorial-id]"));
if (document.body.hasAttribute("data-tutorial-id")) {
  tutId = document.body.getAttribute("data-tutorial-id");
  tutNavLinks.forEach(matchTut);
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

//window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');

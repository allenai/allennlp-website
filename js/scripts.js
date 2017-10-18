// Detect touch (mobile)
function isTouchDevice() {
  return 'ontouchstart' in document.documentElement;
}

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

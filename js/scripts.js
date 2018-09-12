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

if (annotatedCode) {
  const annotationContainer = document.getElementById("annotated-code__annotations");
  const topFade = document.getElementById("annotated-code__top-fade");
  const bottomFade = document.getElementById("annotated-code__bottom-fade");
  const codeBlocks = document.querySelectorAll(".annotated-code__code-block");
  const annotations = document.querySelectorAll("#annotated-code__annotations li.annotation");

  // Default distance from top of screen for determining which code block is auto-focused during scroll
  let scrollTop = 0;
  let containerTopOffset = 0;
  let scrollOffset = 0;

  let focusThreshold = 300;

  function focusBlock(id) {
    const focusedCodeBlock = document.getElementById(`c${id}`);
    const focusedAnnotation = document.getElementById(`a${id}`);

    // Remove focus class on any code block or annotation element that has it
    function resetFocus(array) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].classList.contains("focused")) {
          array[i].classList.remove("focused");
        }
      }
    }
    resetFocus(codeBlocks);
    resetFocus(annotations);

    focusedCodeBlock.classList.add("focused");
    focusedAnnotation.classList.add("focused");

    const codeOffset = focusedCodeBlock.offsetTop;
    const annotationOffset = focusedAnnotation.offsetTop;
    const offset = annotationOffset - codeOffset;

    // Move annotation list to align focused annotation with focused code block
    annotationContainer.style.transform = `translateY(-${offset}px)`;
    // Compensate for transform offset on sticky bottom/top fade-out elements
    topFade.style.transform = `translateY(${offset}px)`;
    bottomFade.style.transform = `translateY(${offset}px)`;
  }

  function updateOffsets() {
    scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    containerTopOffset = annotatedCode.offsetTop;
    scrollOffset = scrollTop - containerTopOffset;
  }

  // onScroll mechanics
  window.addEventListener("scroll", function() {
    updateOffsets();
    const containerBottomOffset = containerTopOffset + annotatedCode.offsetHeight;

    if (scrollTop >= containerTopOffset) {
      topFade.style.top = `${scrollOffset}px`;
    } else {
      topFade.style.top = "";
    }

    if (scrollTop <= containerBottomOffset) {
      bottomFade.style.top = `${scrollOffset + window.innerHeight - 120}px`;
    }

    if (scrollTop >= (containerBottomOffset - window.innerHeight)) {
      bottomFade.style.top = `${annotatedCode.offsetHeight - 120}px`;
    }

    for (let i = 0; i < codeBlocks.length; i++) {
      const thisId = codeBlocks[i].id;
      const thisCodeBlock = document.getElementById(thisId);
      const thisOffset = thisCodeBlock.offsetTop;

      if ( ((scrollOffset) > (thisOffset - focusThreshold)) && ((scrollOffset) < (thisOffset + thisCodeBlock.offsetHeight - focusThreshold)) ) {
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

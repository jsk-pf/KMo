// [add (230220)]
// +++ scroll 방식의 tab 일 경우

// + tab Scroll Type Click
function tabStateScroll(_elem) {
  let tabScrollList = document.querySelectorAll('.tab-scroll-item');
  for (const scrollTab of tabScrollList) {
    scrollTab.addEventListener('click', function (e) {
      e.preventDefault();
      let nowTab = this.getAttribute('aria-controls'),
        offset = document.querySelector('.header').offsetHeight,
        elementPos = document.querySelector(`#${nowTab}`).offsetTop,
        flexContainer = document.querySelector('#container');
      if (nowTab) {
        document.querySelector('.header').classList.remove('scroll-hide');
      }
      flexContainer.scrollTo({
        top: elementPos - offset,
        behavior: 'smooth'
      });
    });
  }
}

// + tab Scroll Type Scroll
const _moveHeader = document.querySelector('#container').querySelector('.header.co-header');
let lastScrollTop = 0;
function tabScrollEvt() {
  let _activeEl = 0;
  let tabLeft = 0;
  document.querySelector('#container').addEventListener('scroll', function () {
    let tabWrap = document.querySelector('.c-tab');
    let navbarlinks = document.querySelectorAll('.tab-scroll-item'),
      tabField = document.querySelector('.scroll-tab-field'),
      firstTab = tabField.querySelectorAll('[role="tabpanel"]');
    navbarlinks.forEach(navbarlink => {
      let position = document.querySelector('#container').scrollTop + 100;
      if (position <= 264) {
        if (document.querySelector('.header').classList.contains('scroll-hide')) {
          document.querySelector('.header').classList.remove('scroll-hide');
        }
      }
      let nowTab = navbarlink.getAttribute('aria-controls'),
        rdoChk = navbarlink.querySelector('input');
      let section = document.querySelector(`#${nowTab}`);
      if (!navbarlink) return;
      if (!section) return;
      if (position < firstTab.offsetTop) {
        document.querySelector('.tab-scroll-item').querySelector('input').checked = true;
      }
      if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
        rdoChk.checked = true;
        _activeEl = rdoChk.parentNode;
      } else {
        rdoChk.checked = false;
      }
    });
    tabLeft = _activeEl.offsetLeft;
    let tabStyle = tabWrap.currentStyle || window.getComputedStyle(tabWrap);
    let tabPadRes = parseInt(tabStyle.paddingLeft) + parseInt(tabStyle.paddingRight);
    let tabWidth = tabWrap.clientWidth - tabPadRes;
    let tabDiff = tabLeft - tabWidth / 2;
    tabWrap.scroll({
      left: tabDiff,
      behavior: 'smooth'
    });
  });
}

// + jobStress Progressbar
function once(fn, context) {
  let fnResult;
  return function () {
    if (fn) {
      fnResult = fn.apply(context || this, arguments);
      fn = null;
    }
    return fnResult;
  };
}
const jobProgressbar = once(function () {
  let i = 0;
  progressList = document.querySelectorAll('.jo-progress');
  Array.prototype.forEach.call(progressList, function (value, index) {
    let elemWidth = value.querySelector('span').innerText;
    function progressCall(index) {
      let prgbarElem = progressList[index];
      let barWidth = 0;
      if (i === 0) {
        var prgInterval = setInterval(doing, 20);
      }
      function doing() {
        if (barWidth >= elemWidth) {
          clearInterval(prgInterval);
          i = 0;
        } else {
          {
            barWidth++;
            if (elemWidth <= barWidth) {
              prgbarElem.style.width = elemWidth + '%';
            } else {
              prgbarElem.style.width = barWidth + '%';
            }
          }
        }
      }
    }
    progressCall(index);
  });
});
function jobProgressbarInit() {
  let scrollPosInit = document.querySelector('#container').scrollTop;
  document.querySelector('#container').addEventListener('scroll', function () {
    let totalSectionPos = document.querySelector('.total-article').offsetTop;
    scrollPosInit = document.querySelector('#container').scrollTop + document.querySelector('.total-article').offsetHeight + 100;
    if (scrollPosInit >= totalSectionPos) {
      jobProgressbar();
    }
  });
}
//# sourceMappingURL=maps/common02.js.map

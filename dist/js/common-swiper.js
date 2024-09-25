'use strict';

// = Common swiper

/**
 * swiper variable
 */
let autoPlayState = true;
const SWIPER_ALT_TXT = {
  rolling: {
    start: '자동롤링되있는리스트입니다이중탭하면자동롤링이멈춥니다',
    stop: '자동롤링이정지되어있는리스트입니다이중탭하면자동롤링이플레이됩니다'
  }
};

/**
 * swiper
 */
// swiper 공통 event
// + init
function swiperInitEvt(_elem) {
  swiperInitAriaExpanded(_elem);
}
// 접근성: aria-expanded, aria-hidden
function swiperInitAriaExpanded(_elem) {
  setTimeout(() => {
    // slide
    slide(_elem);

    // dot
    dot(_elem);

    // left, right Arrow
    arrow(_elem);
  }, 1);
}
// + transition end event
function swiperTransitionEndEvt(_elem) {
  _elem.on('slideChangeTransitionEnd', () => {
    setTimeout(() => {
      swiperInitAriaExpanded(_elem);
    }, 1);
  });
}
// + slide
function slide(_slide) {
  let SlideEls = _slide.$el[0].querySelectorAll('.swiper-slide');
  let currentSlide = _slide.$el[0].querySelector('.swiper-slide-active');
  if (SlideEls && currentSlide) {
    for (let i = 0; i < SlideEls.length; i++) {
      SlideEls[i].setAttribute('aria-expanded', false);
      SlideEls[i].setAttribute('aria-hidden', true);
      SlideEls[i].setAttribute('tabindex', '-1');
    }
    currentSlide.setAttribute('aria-expanded', true);
    currentSlide.setAttribute('aria-hidden', false);
    currentSlide.setAttribute('tabindex', '0');
  }
}
// + dot
function dot(_dot) {
  let dotWrap = _dot.$el[0].querySelector('.swiper-pagination');
  if (dotWrap) {
    let allDot = dotWrap.querySelectorAll('.swiper-pagination-bullet');
    let currentDot = dotWrap.querySelector('.swiper-pagination-bullet-active');
    if (allDot && currentDot) {
      for (let i = 0; i < allDot.length; i++) allDot[i].setAttribute('aria-label', `이중탭하면 ${i + 1}번 슬라이드로 이동`);
      currentDot.setAttribute('aria-label', `현재 ${_dot.realIndex + 1}번 슬라이드`);
    }
  }
}
// left, right Arrow
function arrow(_arrow) {
  let arrPrev = _arrow.$el[0].querySelector('.swiper-button-prev');
  let arrNext = _arrow.$el[0].querySelector('.swiper-button-next');
  if (arrPrev) arrPrev.setAttribute('aria-label', '이전 슬라이드로 이동');
  if (arrNext) arrNext.setAttribute('aria-label', '다음 슬라이드로 이동');
}
// button: rolling swiper
function rollingSwiper(_this) {
  let swiper = _this.parentElement.swiper;
  autoPlayState ? swiper.autoplay.stop() : swiper.autoplay.start();
  autoPlayState ? _this.setAttribute('aria-label', SWIPER_ALT_TXT.rolling.stop) : _this.setAttribute('aria-label', SWIPER_ALT_TXT.rolling.start);
  autoPlayState = autoPlayState ? false : true;
}
// swiper update
function swiperUpdate(_updateSwiper) {
  _updateSwiper.update();
}
//# sourceMappingURL=maps/common-swiper.js.map

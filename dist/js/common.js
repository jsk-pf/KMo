'use strict';

// = Common

/**
 * common variable
 */
// animation time
const ANI_TIME_300 = 301;

// interval time
const INTERVAL_1 = 1;
const INTERVAL_100 = 100;
const INTERVAL_1000 = 1000;

// scroll
const SHOW_HEADER_NUM = 100; // 이 숫자만큼 스크롤을 올려야 .co-header가 보임
const SCROLL_TIME = 0.5; // 초(second), 이 숫자만큼의 스피드로 scroll top 이동
const INVERTED = 55;

/**
 * common interface
 */
// POPUP
const IPOPUP = {
  iModal: {
    mAlert: 'mAlert',
    mHeader: 'mHeader',
  },
  iFull: {
    fLayer: 'fLayer',
    fFooter: 'fFooter',
  },
};
// ACCORDION
const IACCORDION = {
  iAll: 'iAll',
  iOne: 'iOne',
};
const ACC_ALT_TXT = {
  open: '버튼확장됨축소하려면이중탭하십시요',
  close: '버튼축소됨확장하려면이중탭하십시요',
};
// container
let elTopArr = [];
let elTopRes = 0;

/**
 * HTML element length check
 */
function elemLenCheck(..._el) {
  let okEl = 1;
  if (_el.length > 0) {
    for (let i = 0; i < _el.length; i++) {
      if (document.querySelectorAll(_el[i]).length > 0) {
        okEl += 1;
        if (okEl === _el.length) {
          okEl = 0;
          return true;
        }
      }
      return false;
    }
  }
}

/**
 * load event
 */
document.addEventListener('readystatechange', (event) => {
  // does same as:  ..addEventListener("DOMContentLoaded"..
  // When HTML/DOM elements are ready:
  if (event.target.readyState === 'interactive') {
  }

  // When window loaded ( external resources are loaded too- css, src, etc...)
  if (event.target.readyState === 'complete') {
    commonInit();
  }
});

/**
 * 접근성 공통
 */
// #container -> aria-hidden: true || false
function containerHidden(_state) {
  const GNB_CONTAINER_EL = document.getElementById('container');
  if (GNB_CONTAINER_EL) {
    if (_state) {
      GNB_CONTAINER_EL.setAttribute('aria-hidden', true);
    } else {
      let OPEN_POPUPS = document.querySelectorAll('.kmi-popup.show');
      if (OPEN_POPUPS.length == 0) GNB_CONTAINER_EL.setAttribute('aria-hidden', false);
    }
  }
}

/**
 * common function
 */
function commonInit() {
  /**
   * resize event
   */
  let rtime;
  let timeout = false;
  const DELTA = 10;
  window.addEventListener('resize', function () {
    rtime = new Date();
    if (timeout === false) {
      timeout = true;
      setTimeout(resizeend, DELTA);
    }
  });
  function resizeend() {
    if (new Date() - rtime < DELTA) {
      setTimeout(resizeend, DELTA);
    } else {
      timeout = false;
      // resize end
      // full popup이 있을 경우 하단 버튼 scroll 체크
      fullPopupState();

      // modal header popup: header shadow
      modalHeaderPopupShadow();

      // full layer popup: resize scrollbar
      fullPopupResizeScrollbar();

      // container resize scrollbar
      containerResizeScrollbar();

      // container resize bottom floating button
      containerResizeFloatingBtn();
    }
  }
  /**
   * GNB
   */
  const GNB_ELEM = document.querySelectorAll('.btn-open-gnb');
  if (GNB_ELEM.length > 0) for (let i = 0; i < GNB_ELEM.length; i++) gnbComn(GNB_ELEM[i]);

  // + gnb common event
  function gnbComn(_gnbEl) {
    _gnbEl.setAttribute('aria-expanded', false);
    const NAV_INIT = document.querySelector('.co-gnb');
    if (NAV_INIT) {
      popupStyle(NAV_INIT, 'hide');
      NAV_INIT.setAttribute('aria-hidden', true);
      const GNB_BG_INIT = NAV_INIT.querySelector('.gnb-bg');
      if (GNB_BG_INIT) popupStyle(GNB_BG_INIT, 'hide');
    }
    _gnbEl.addEventListener('click', () => {
      _gnbEl.setAttribute('aria-expanded', true);
      const NAV = document.querySelector('.co-gnb');
      if (NAV) gnbClickEvent(NAV, _gnbEl);
    });
  }
  // + gnb open button click event
  function gnbClickEvent(_navEl, _gnbEl) {
    _navEl.setAttribute('aria-hidden', false);
    const GNB_CLOSE_BTN = _navEl.querySelector('.btn-close-gnb');
    const GNB_BG = _navEl.querySelector('.gnb-bg');
    const GNB_ACC = _navEl.querySelectorAll('.accordion');
    if (GNB_CLOSE_BTN && GNB_BG && GNB_ACC.length > 0) {
      navComnEvent(_navEl, GNB_BG);
      setTimeout(() => {
        GNB_CLOSE_BTN.focus();
      }, INTERVAL_1);

      // 전체메뉴 닫기
      navCloseEvent(_navEl, _gnbEl, GNB_BG, GNB_CLOSE_BTN, GNB_ACC);
    }
  }
  // + gnb 공통 event
  function navComnEvent(_navEl, _bgEl) {
    if (!_navEl.classList.contains('show')) {
      popupStyle(_navEl, 'show');
      popupStyle(_bgEl, 'show');
      _navEl.classList.add('show');
      containerHidden(true);
    }
  }
  // + 전체메뉴 닫기
  function navCloseEvent(_navEl, _gnbEl, _gnbBgEl, _gnbCloseBtn, _gnbAcc) {
    const GNB_CLOSE_ARR = [_gnbBgEl, _gnbCloseBtn];
    for (let i = 0; i < GNB_CLOSE_ARR.length; i++) {
      GNB_CLOSE_ARR[i].addEventListener(
        'click',
        () => {
          _navEl.setAttribute('aria-hidden', true);
          _navEl.classList.remove('show');
          _gnbEl.setAttribute('aria-expanded', false);
          containerHidden(false);
          navTimeoutEvent(_navEl, _gnbBgEl, _gnbAcc, _gnbEl);
        },
        false
      );
    }
  }
  // + 전체메뉴 닫은 후 setTimeout Event
  function navTimeoutEvent(_navEl, _gnbBgEl, _gnbAcc, _gnbEl) {
    setTimeout(() => {
      popupStyle(_navEl, 'hide');
      popupStyle(_gnbBgEl, 'hide');
      // close Allaccordion
      accordionAllClose(_gnbAcc);
      setTimeout(() => {
        _gnbEl.focus();
      }, INTERVAL_1);
    }, ANI_TIME_300);
  }

  /**
   * tab
   */
  const TAB_EL = document.querySelectorAll('ul.c-tab');
  if (TAB_EL.length > 0) for (let i = 0; i < TAB_EL.length; i++) tabCommonEvent(TAB_EL[i]);

  // tabCommonEvent
  function tabCommonEvent(_elem) {
    // panel 내용이 바뀌는 방식의 tab 일 경우
    // 탭과 연동된 tab-click-list 모두 보임
    tabClickListAllShow(_elem);

    // 탭의 하단 bar가 animation되는 경우
    if (_elem.classList.contains('type-basic')) tabBarAnimation(_elem);
    let tabEl = _elem.querySelectorAll('li');
    if (tabEl.length > 0) for (let j = 0; j < tabEl.length; j++) tabClickCheck(_elem, tabEl[j], j);
  }
  // + tab click check
  function tabClickCheck(_wrap, _elem, _j) {
    let ipt = _elem.querySelector('input[type="radio"]') || _elem.querySelector('a.tab');
    let ipt_checked = _elem.querySelector('input[type="radio"]:checked') || _elem.querySelector('a.tab.active');
    if (ipt) tabClickEvent(_wrap, ipt, _elem, _j, ipt_checked);
  }
  // ++ tab Click Event
  function tabClickEvent(_wrap, _ipt, _elem, _j, _ipt_checked) {
    tabAltTxtInit(_elem, _ipt, _ipt_checked);
    let tabState = tabStateCheck(_wrap);

    // panel 내용이 바뀌는 방식의 tab 일 경우 + scroll Type
    if (_wrap.classList.contains('type-move')) {
      setTimeout(() => {
        tabStateMove(_elem);
      }, INTERVAL_1);
    }
    // [Mod [230220]]
    if (_wrap.classList.contains('type-scroll')) {
      setTimeout(() => {
        tabScrollEvt();
      }, INTERVAL_1);
    }
    // talkback event listener
    // + 탭 터치 event
    if (_ipt.tagName !== 'A' && _ipt.tagName !== 'a') {
      _ipt.parentElement.addEventListener('click', () => {
        _ipt.checked = true;
        tabClickComn(_wrap, _elem, _ipt, tabState, _j);
      });
    } else {
      _ipt.addEventListener('click', () => {
        tabClickComn(_wrap, _elem, _ipt, tabState, _j);
      });
    }
  }
  // ++ tab click common
  function tabClickComn(_wrap, _elem, _ipt, _tabState, _j) {
    // focus 제거
    const FOCUS_INPUT = document.querySelectorAll('.input-focus');
    if (FOCUS_INPUT.length > 0) for (let i = 0; i < FOCUS_INPUT.length; i++) FOCUS_INPUT[i].classList.remove('input-focus');
    setTimeout(() => {
      clkElClickPopupChk(_elem);
    }, INTERVAL_1);

    // 대체텍스트 적용
    if (_ipt.tagName !== 'A' && _ipt.tagName !== 'a') {
      let altEl = _wrap.querySelectorAll('.alt-txt');
      if (altEl.length > 0) applyTabAltText(_ipt, altEl, _j);
    }
    // hide / show 방식의 tab 일 경우
    if (_tabState === 'hide-type') tabStatePanel(_elem);
    // scroll 방식의 tab 일 경우
    if (_tabState === 'scroll-type') tabStateScroll(_elem);
    // panel 내용이 바뀌는 방식의 tab 일 경우
    if (_tabState === 'click-type') tabStateClick(_elem);

    // tab터치 시 tab의 하단 bar가 animation되는 경우
    if (_ipt.closest('.c-tab').classList.contains('type-basic')) tabBarTouchAnimation(_elem);

    // center 정렬 필요한 tab
    let centerType = tabCenterCheck(_wrap);
    if (centerType) tabCenterEvent(_wrap, _elem);
  }
  // +++ 탭 종류 체크
  function tabStateCheck(_tabState) {
    let tabCase = _tabState.classList;

    // 탭 터치 시 페이지 이동되는 경우
    if (tabCase.contains('type-move')) return 'move-type';
    // 탭 터치 시 스크롤 되는 경우: scroll-type
    if (tabCase.contains('type-scroll')) return 'scroll-type';
    // 탭 터치 시 panel이 hide/show 되는 경우: hide-type
    if (tabCase.contains('type-panel')) return 'hide-type';
    // 탭 터치 시 panel안의 내용이 바뀌는 경우
    if (tabCase.contains('type-click')) return 'click-type';
  }
  // +++ 탭 터치 시 center 정렬 필요한 경우
  function tabCenterCheck(_tabEl) {
    // a tag tab일 경우 실행 안함
    const A_TAG_CHECK = _tabEl.querySelectorAll('li a');
    if (A_TAG_CHECK.length > 0) return false;
    let tabCenterState = _tabEl.classList;
    if (tabCenterState.contains('type-basic') || tabCenterState.contains('type-move')) return false;
    return true;
  }
  // +++ 터치 전 대체텍스트 적용 - 선택됨, 선택안됨
  function tabAltTxtInit(_elem, _ipt, _ipt_checked) {
    let altElBefore = document.createElement('span');
    altElBefore.classList.add('alt-txt');
    if (_ipt.tagName == 'A') {
      if (_elem.closest('.c-tab').classList.contains('type-step')) {
        altElBefore.innerText = '선택안됨페이지이동안됨이중탭하면팝업열림';
        if (_ipt.classList.contains('active')) _ipt.setAttribute('title', '');
        else _ipt.setAttribute('title', '페이지이동');
      } else {
        altElBefore.innerText = '선택안됨이중탭시페이지이동';
        if (_ipt.classList.contains('active')) _ipt.setAttribute('title', '');
        else _ipt.setAttribute('title', '페이지이동');
      }
    } else {
      altElBefore.innerText = '선택안됨';
    }

    // if (_ipt.classList.contains('is-disable')) altElBefore.innerText = '선택안됨비활성화됨';
    if (_ipt.classList.contains('is-disable')) {
      altElBefore.innerText = '이중탭하면팝업열림';
      _ipt.setAttribute('title', '팝업열림');
    }
    if (_ipt.classList.contains('is-save-data')) {
      altElBefore.innerText = '이중탭하면페이지이동';
      _ipt.setAttribute('title', '페이지이동');
    }
    _elem.insertBefore(altElBefore, _ipt);
    if (_ipt_checked) _ipt_checked.parentElement.querySelector('.alt-txt').innerText = '선택됨';
  }
  // +++ 터치 시 대체텍스트 적용 - 선택됨, 선택안됨
  function applyTabAltText(_ipt, _elem, _j) {
    HTMLElement.prototype.index = function () {
      let self = this.parentNode;
      let parent = self.parentNode;
      let i = 0;
      while (self.previousElementSibling) {
        i++;
        self = self.previousElementSibling;
      }
      return this.parentNode === parent.children[i] ? i : -1;
    };
    let indexRes = Number(_ipt.index() - 1);
    if (_ipt.closest('.c-tab').querySelector('.ico-plus')) {
      // 탭 제일 왼쪽에 +버튼이 있는 경우
      for (let k = 0; k < _elem.length; k++) _elem[k].innerText = '선택안됨';
      _elem[indexRes].innerText = '선택됨';
    } else {
      for (let k = 0; k < _elem.length; k++) _elem[k].innerText = '선택안됨';
      _elem[_j].innerText = '선택됨';
    }
  }
  // +++ center 정렬 필요한 tab
  function tabCenterEvent(_tabWrap, _tabEl) {
    _tabEl.addEventListener('click', () => {
      const SCROLL_WRAP = _tabEl.parentElement;
      if (SCROLL_WRAP) tabCenterComnEvent(_tabEl, _tabWrap, SCROLL_WRAP);
    });
  }
  // +++ center정렬 common event
  function tabCenterComnEvent(_tabEl, _tabWrap, _scrollWrap) {
    let tabLeft = _tabEl.offsetLeft;
    let tabStyle = _tabWrap.currentStyle || window.getComputedStyle(_tabWrap);
    let tabPadRes = parseInt(tabStyle.paddingLeft) + parseInt(tabStyle.paddingRight);
    let tabWidth = _scrollWrap.clientWidth - tabPadRes;
    let tabDiff = tabLeft - tabWidth / 2;
    _scrollWrap.scroll({
      left: tabDiff,
      behavior: 'smooth',
    });
  }
  // +++ tab의 하단 bar가 animation되는 경우
  function tabBarAnimation(_tabWrap) {
    const TAB_LI_ELEM = _tabWrap.querySelectorAll('li');
    let aniEl = 0;
    if (TAB_LI_ELEM.length > 0) {
      for (let i = 0; i < TAB_LI_ELEM.length; i++) aniEl += 1;
      _tabWrap.classList.add('tab-len-' + aniEl);
      aniEl = 0;
      for (let i = 0; i < TAB_LI_ELEM.length; i++) tabBarAnimationComn(TAB_LI_ELEM[i], i);
    }
  }
  // +++ tabBarAnimation
  function tabBarAnimationComn(_tabLiEl, _i) {
    let tab_chked_ipt = _tabLiEl.querySelector('input[type="radio"]:checked');
    if (tab_chked_ipt) tab_chked_ipt.closest('.c-tab').classList.add('tab-active-' + _i);
  }
  // ++ tab터치 시 tab의 하단 bar가 animation되는 경우
  function tabBarTouchAnimation(_elem) {
    let el = _elem.parentElement;
    let prefix = 'tab-active-';
    let classes = el.className.split(' ').filter(function (c) {
      return c.lastIndexOf(prefix, 0) !== 0;
    });
    el.className = classes.join(' ').trim();
    let idx = Array.prototype.indexOf.call(el.children, _elem);
    el.classList.add('tab-active-' + idx);
  }
  // +++ hide / show 방식의 tab 일 경우
  function tabStatePanel(_elem) {
    // aria-labelledby element의 removeClass: show
    let tabList = [];
    let tabWrap = _elem.closest('.c-tab');
    let tabListEl = tabWrap.querySelectorAll('[role="tab"]');
    for (let i = 0; i < tabListEl.length; i++) tabList.push(tabListEl[i].getAttribute('aria-controls'));
    if (tabList.length > 0) tabStatePanelEvent(tabList);

    // 터치한 tab의 aria-controls와 동일한 aria-labelledby에게 addClass: show
    let AC = _elem.getAttribute('aria-controls');
    if (AC) {
      let activeAC = document.querySelector('[aria-labelledby=' + AC + ']');
      if (activeAC) activeAC.classList.add('show');
      // .tabpanel.show에 있는 아코디언
      if (activeAC) tabAccInit(activeAC);
    }
  }
  function tabStatePanelEvent(_tabList) {
    for (let i = 0; i < _tabList.length; i++) {
      let panelEl = document.querySelector('[aria-labelledby="' + _tabList[i] + '"]');
      if (panelEl) if (panelEl.classList.contains('show')) panelEl.classList.remove('show');
    }
  }
  function tabAccInit(_panelEl) {
    if (_panelEl) {
      const ACC_EL = _panelEl.querySelectorAll('.accordion');
      if (ACC_EL.length > 0) {
        for (let i = 0; i < ACC_EL.length; i++) {
          const ACC_HEADER = ACC_EL[i].querySelector('.accordion-header');
          const ACC_BODY = ACC_EL[i].querySelector('.accordion-body');
          if (ACC_BODY && ACC_HEADER) {
            if (ACC_EL[i].classList.contains('open')) ACC_BODY.style.maxHeight = ACC_BODY.scrollHeight + 'px';
            else tabAccClickEvt(ACC_EL[i], ACC_HEADER, ACC_BODY);
          }
        }
      }
    }
  }
  function tabAccClickEvt(_accEl, _accHead, _accBody) {
    _accHead.addEventListener('click', function (e) {
      let accordionType = accordionTypeCheck(_accEl);
      let bodyHeight = _accBody.scrollHeight;
      accButtonClickEvtComn(e, accordionType, _accEl, _accBody, bodyHeight);
    });
  }
  function clkElClickPopupChk(_elem) {
    let popHasElem = _elem.closest('.c-full-layer.show');
    if (popHasElem) {
      if (popHasElem.classList.contains('type-full')) clkElClickPopupChkFull(popHasElem);
      if (popHasElem.classList.contains('type-full-footer')) clkElClickPopupChkFullFooter(popHasElem);
    }
  }
  function clkElClickPopupChkFull(_popHasElem) {
    const TAB_POP_BODY_EL = _popHasElem.querySelector('.full-body');
    const TAB_POP_CONT_EL = _popHasElem.querySelector('.cont-box');
    const TAB_POP_BTN_EL = _popHasElem.querySelector('.btn-floating');
    if (TAB_POP_BODY_EL) TAB_POP_BODY_EL.classList.add('type-flex');
    if (TAB_POP_CONT_EL) if (TAB_POP_CONT_EL.classList.contains('type-btn-floating')) TAB_POP_BTN_EL.classList.remove('.type-btn-floating');
    if (TAB_POP_BTN_EL) {
      if (TAB_POP_BTN_EL.classList.contains('isScroll')) TAB_POP_BTN_EL.classList.remove('isScroll');
      if (TAB_POP_BTN_EL.classList.contains('isScrollEnd')) TAB_POP_BTN_EL.classList.remove('isScrollEnd');
    }
    fullPopupScrollHeightCheck('full', _popHasElem);
  }
  function clkElClickPopupChkFullFooter(_popHasElem) {
    const TAB_POP_BTN_ELEM = _popHasElem.querySelector('.full-footer');
    if (TAB_POP_BTN_ELEM) if (TAB_POP_BTN_ELEM.classList.contains('scroll')) TAB_POP_BTN_ELEM.classList.remove('scroll');
    fullPopupScrollHeightChk('full-footer', _popHasElem);
  }
  // X XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // +++ 팝업에서 tab 터치 시 full 팝업 c-container 높이가 변할 경우
  // function clkElClickPopupCheck(_elem) {
  //   let popHasElem = _elem.closest('.c-full-layer.show');
  //   if (popHasElem) {
  //     const TAB_POP_BTN_ELEM = popHasElem.querySelector('.full-footer');
  //     if (TAB_POP_BTN_ELEM) if (TAB_POP_BTN_ELEM.classList.contains('scroll')) TAB_POP_BTN_ELEM.classList.remove('scroll');

  //     if (popHasElem.classList.contains('type-full')) fullPopupScrollHeightChk('full', popHasElem);
  //     if (popHasElem.classList.contains('type-full-footer')) fullPopupScrollHeightChk('full-footer', popHasElem);
  //   }
  // }
  // X XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // // 사용안함 +++ tab 터치 시 panel의 내용이 바뀌는 방식의 tab 일 경우
  function tabStateClick(_elem) {
    // panel의 aria-labelledby를 터치한 탭의 aria-controls로 변경
    const TAB_ONE_WRAP = _elem.closest('.c-tab');
    if (TAB_ONE_WRAP) tabStateClickAraiControls(TAB_ONE_WRAP);

    // 사용안함
    // tab의 data-case에 해당하는 panel의 data-view가 보여짐
    const DATA_CASE = _elem.dataset.case;
    const DATA_TAB_LIST = _elem.closest('.c-tab');
    if (DATA_CASE && DATA_TAB_LIST) {
      const DATA_VIEW = document.querySelectorAll('*[data-view="' + DATA_CASE + '"]');
      if (DATA_VIEW.length > 0) {
        const DATA_WRAP = DATA_VIEW[0].closest('.tab-click-list');
        if (DATA_WRAP) {
          const DATA_LIST = DATA_WRAP.querySelectorAll('[data-view]');
          if (DATA_LIST) {
            for (let i = 0; i < DATA_LIST.length; i++) DATA_LIST[i].classList.remove('show');
            for (let i = 0; i < DATA_VIEW.length; i++) DATA_VIEW[i].classList.add('show');
          }
        }
      } else {
        // 해당하는 리스트가 없는 경우
        const DATA_NULL_DATA = DATA_TAB_LIST.dataset.tablist;
        const DATA_NULL_WRAP = document.querySelector('[data-tabpanel="' + DATA_NULL_DATA + '"]');
        if (DATA_NULL_WRAP) {
          const DATA_NULL_LIST = DATA_NULL_WRAP.querySelectorAll('[data-view]');
          if (DATA_NULL_LIST.length > 0) for (let i = 0; i < DATA_NULL_LIST.length; i++) DATA_NULL_LIST[i].classList.remove('show');

          // 전체 tab click
          if (DATA_CASE === 'all') for (let i = 0; i < DATA_NULL_LIST.length; i++) DATA_NULL_LIST[i].classList.add('show');
        }
      }
    }
  }
  function tabStateClickAraiControls() {
    const TAB_ONE_TAB = TAB_ONE_WRAP.dataset.onetab;
    if (TAB_ONE_TAB) {
      const TAB_ONE_PANEL = document.querySelector('[data-onepanel="' + TAB_ONE_TAB + '"]');
      if (TAB_ONE_PANEL) {
        const ONE_TARGET_TAB = _elem.getAttribute('aria-controls');
        if (ONE_TARGET_TAB) TAB_ONE_PANEL.setAttribute('aria-labelledby', ONE_TARGET_TAB);
      }
    }
  }
  // +++ tab 터치 시 페이지 이동하는 tab 일 경우 or scroll 이동
  function tabStateMove(_elem) {
    const TAB_WRAP = _elem.closest('.c-tab');
    if (TAB_WRAP) tabStateMoveConm(TAB_WRAP);
  }
  function tabStateMoveConm(_tabWrap) {
    const TAB_MOVE_LIST = _tabWrap.querySelectorAll('li');
    if (TAB_MOVE_LIST.length > 0) tabStateMoveConmEvt(TAB_MOVE_LIST, _tabWrap);
  }
  function tabStateMoveConmEvt(_tabMoveList, _tabWrap) {
    for (let i = 0; i < _tabMoveList.length; i++) {
      let activeTab = _tabMoveList[i].querySelectorAll('a.tab.active');
      if (activeTab.length > 0) moveTabActivity(_tabWrap, _tabMoveList[i]);
    }
  }
  function moveTabActivity(_wrap, _tab) {
    if (_wrap && _tab) {
      const TAB_WRAP_NAME = _wrap.dataset.tablist;
      const TAB_ATTR = _tab.getAttribute('aria-controls');
      if (TAB_WRAP_NAME && TAB_ATTR) moveTabActivityComn(TAB_WRAP_NAME, TAB_ATTR, _wrap, _tab);
    }
  }
  function moveTabActivityComn(_tabWrapName, _tabAttr, _wrap, _tab) {
    const PANEL_SELECTOR = document.querySelector('[data-panelname="' + _tabWrapName + '"]');
    if (PANEL_SELECTOR) {
      PANEL_SELECTOR.setAttribute('aria-labelledby', _tabAttr);
      // 선택된 tab 중앙 이동
      moveTabCenterScroll(_wrap, _tab);
    }
  }
  // + tab Click 시 스크롤 이동
  function tabStateMoveConm(_tabWrap) {
    const TAB_MOVE_LIST = _tabWrap.querySelectorAll('li');
    if (TAB_MOVE_LIST.length > 0) tabStateMoveConmEvt(TAB_MOVE_LIST, _tabWrap);
  }
  // 선택된 tab 중앙 이동
  function moveTabCenterScroll(_scrollBody, _activeEl) {
    if (_scrollBody && _activeEl) moveTabCenterScrollComn(_activeEl, _scrollBody);
  }
  function moveTabCenterScrollComn(_activeEl, _scrollBody) {
    let tabLeft = _activeEl.offsetLeft;
    let tabStyle = _scrollBody.currentStyle || window.getComputedStyle(_scrollBody);
    let tabPadRes = parseInt(tabStyle.paddingLeft) + parseInt(tabStyle.paddingRight);
    let tabWidth = _scrollBody.clientWidth - tabPadRes;
    let tabDiff = tabLeft - tabWidth / 2;
    _scrollBody.scroll({
      left: tabDiff,
      behavior: 'smooth',
    });
  }
  // 사용안함
  // panel 내용이 바뀌는 방식의 tab 일 경우
  // 탭과 연동된 tab-click-list 모두 보임
  function tabClickListAllShow(_tabWrap) {
    let dataTabList = _tabWrap.dataset.tablist;
    if (dataTabList) {
      const DATA_TAB_PANEL = document.querySelector('*[data-tabpanel="' + dataTabList + '"]');
      if (DATA_TAB_PANEL) {
        const PANEL_VIEW_LIST = DATA_TAB_PANEL.querySelectorAll('*[data-view]');
        if (PANEL_VIEW_LIST.length > 0) for (let i = 0; i < PANEL_VIEW_LIST.length; i++) PANEL_VIEW_LIST[i].classList.add('show');
      }
    }
  }

  /**
   * popup
   */
  // 화면에 팝업이 있을 경우 공통 스타일 적용
  // 팝업 필수 class: kmi-popup
  const POPUP_ELEM = document.querySelectorAll('.kmi-popup');
  // style
  if (POPUP_ELEM.length > 0) for (let i = 0; i < POPUP_ELEM.length; i++) popupStyle(POPUP_ELEM[i], 'hide');
  // 팝업 열림
  const POPUP_BTN_ELEM = document.querySelectorAll('.btn-open-popup');
  // popup open button - click event
  if (POPUP_BTN_ELEM.length > 0)
    for (let i = 0; i < POPUP_BTN_ELEM.length; i++)
      POPUP_BTN_ELEM[i].addEventListener('click', () => {
        popupOpenEvent(POPUP_BTN_ELEM[i], i);
      });
  // + popup open button click event
  function popupOpenEvent(_btnElem, ..._i) {
    const OPENSTATE_POPUP = document.querySelectorAll('.kmi-popup.show');
    if (OPENSTATE_POPUP.length > 0) for (let i = 0; i < OPENSTATE_POPUP.length; i++) OPENSTATE_POPUP[i].setAttribute('aria-hidden', true);
    const TARGET = _btnElem.getAttribute('data-target');
    const CURRENT_POPUP = document.getElementById(TARGET);
    CURRENT_POPUP.classList.add('show');
    CURRENT_POPUP.setAttribute('aria-hidden', false);

    // 접근성: popup 오픈 시 #container focus 막기
    containerHidden(true);

    // 팝업 종류 체크
    let popupState = popupStateCheck(CURRENT_POPUP);

    // style
    let btnArr = 0;
    if (OPENSTATE_POPUP.length > 0) btnArr = OPENSTATE_POPUP.length;
    if (_i.length > 0) btnArr = _i.map((idx) => idx);
    popupStyle(CURRENT_POPUP, 'show', _i.length > 0 ? btnArr[0] : btnArr);

    // 접근성
    focusFirstBtn(popupState, CURRENT_POPUP);

    // 팝업 배경 click event

    // modal header type _현재 팝업 상태 체크
    popupModalHeader(popupState, CURRENT_POPUP);

    // full type: floating tab 있는 full type 팝업이 스크롤 되는 경우
    popupScrollTabCase(popupState, CURRENT_POPUP);

    // full type: floating 버튼있는 full type 팝업이 스크롤 되는 경우
    popupScrollCase(popupState, CURRENT_POPUP);
  }
  // + 팝업 종류 체크
  function popupStateCheck(_popState) {
    let popCase = _popState.classList;
    // 모달 팝업: modal
    if (popCase.contains('type-modal')) return 'modal';
    // 모탈 팝업 : modal (header + footer)
    else if (popCase.contains('type-modal-hf-fixed')) return 'modal-hf-fixed';
    // 푸터 없는 풀팝업: full
    else if (popCase.contains('type-full')) return 'full';
    // 푸터 있는 풀팝업: full-footer
    else if (popCase.contains('type-full-footer')) return 'full-footer';
  }
  // + 팝업 style - top, z-index, visibility
  function popupStyle(_elem, _state, ..._i) {
    let indexRes = 0;
    if (_i.length > 0) for (let i = 0; i < _i.length; i++) indexRes = _i[i];
    switch (_state) {
      case 'show':
        _elem.style.top = 0;
        _elem.style.zIndex = 2000 + indexRes;
        _elem.style.visibility = 'visible';
        break;
      case 'hide':
        _elem.style.top = window.innerHeight + 'px';
        _elem.style.zIndex = '-1';
        _elem.style.visibility = 'hidden';
        break;
      default:
        _elem.style.top = window.innerHeight + 'px';
        _elem.style.zIndex = '-1';
        _elem.style.visibility = 'hidden';
        break;
    }
  }
  // + 팝업 배경 click event
  function popupBgClickEvt(_elem) {
    const POPUP_BG_ELEM = _elem.querySelector('.popup-bg');
    if (POPUP_BG_ELEM) {
      POPUP_BG_ELEM.addEventListener('click', () => {
        // 팝업 닫힘
        _elem.classList.remove('show');
        _elem.setAttribute('aria-hidden', true);
        setTimeout(() => {
          popupStyle(_elem, 'hide');
        }, ANI_TIME_300);
      });
    }
  }
  function popupScrollTabCase(_state, _elem) {
    if (_state === 'full') fullTabScrollChk(_elem);
  }
  function fullTabScrollChk(_elem) {
    const F_CONTAINER = _elem.querySelector('.c-container');
    if (F_CONTAINER) {
      const F_Tab = F_CONTAINER.querySelector('.tab-floating');
      const F_HEADER = F_CONTAINER.querySelector('.full-header');
      const F_BODY = F_CONTAINER.querySelector('.full-body');
      if (F_HEADER && F_BODY && F_Tab) fullTabScrollEvt(F_CONTAINER, F_Tab, F_HEADER, F_BODY);
    }
  }
  function fullTabScrollEvt(_container, _tab, _header, _body) {
    // scroll end check
    let headerHeight = _header.clientHeight;
    let lastScrollTop = 0;
    let scrollArr = [];
    var isScrolling;
    _body.addEventListener('scroll', function () {
      const CONT_BOX = _container.querySelector('.cont-box');
      const TIT = _container.querySelector('.top-title-box');
      if (CONT_BOX && TIT) {
        let contBoxStyle = CONT_BOX.currentStyle || window.getComputedStyle(CONT_BOX);
        let contBoxStyleRes = parseInt(contBoxStyle.paddingTop);
        let scrollRes = this.clientHeight + _header.clientHeight + _tab.clientHeight + TIT.clientHeight + contBoxStyleRes;
        if (this.scrollHeight > scrollRes) {
          _container.closest('.kmi-popup.show').classList.add('type-floating');
          if (this.scrollTop > headerHeight) {
            let st = this.pageYOffset || this.scrollTop;
            if (st > lastScrollTop) {
              // SCROLL: DOWN
              _container.classList.add('scroll-hide');
              console.log(' scroll down');
            } else {
              // SCROLL: UP
              scrollArr.push(st);
              console.log('scroll up');
              window.clearTimeout(isScrolling);
              isScrolling = setTimeout(function () {
                scrollArr = [];
              }, 66);
              if (Math.max.apply(Math, scrollArr) - Math.min.apply(Math, scrollArr) > SHOW_HEADER_NUM) {
                _container.classList.remove('scroll-hide');
                scrollArr = [];
              }
            }
            lastScrollTop = st <= 0 ? 0 : st;
            console.log('🚀 ~ file: common.js:796 ~ lastScrollTop', lastScrollTop);
          }
          if (this.scrollTop > TIT.clientHeight + _tab.clientHeight) _container.classList.add('isTop');
          else _container.classList.remove('isTop');
          if (this.scrollTop <= 0) {
            _container.classList.remove('scroll-hide');
            scrollArr = [];
          }
        } else _container.closest('.kmi-popup.show').classList.remove('type-floating');
      }
    });
  }
  // + full type: 스크롤 되는 경우 check
  function popupScrollCase(_state, _elem) {
    if (_state === 'full') fullScrollChk(_elem);
    if (_state === 'full-footer') fullFooterScrollCheck(_elem);

    // scroll event
    if (_state === 'full' || _state === 'full-footer') customScrollbar(_elem, _state);
  }
  function fullScrollChk(_elem) {
    const F_CONTAINER = _elem.querySelector('.c-container');
    if (F_CONTAINER) {
      const F_HEADER = F_CONTAINER.querySelector('.full-header');
      const F_BODY = F_CONTAINER.querySelector('.full-body');
      const F_BUTTON = F_CONTAINER.querySelector('.btn-floating');
      if (F_HEADER && F_BODY && F_BUTTON) fullScrollEvt(F_CONTAINER, F_HEADER, F_BODY, F_BUTTON);
    }
  }
  function fullScrollEvt(_container, _header, _body, _fBtn) {
    // scroll end check
    _body.classList.add('type-flex');
    _fBtn.classList.remove('isScrollEnd');
    if (_body.offsetHeight + _body.scrollTop >= _body.scrollHeight) _fBtn.classList.add('isScrollEnd');
    if (_body.scrollHeight > _body.clientHeight + 72) {
      _body.classList.remove('type-flex');
      _fBtn.classList.add('isScroll');
      _body.addEventListener('scroll', () => {
        const SCROLL_WRAP = document.querySelector('.c-full-layer.kmi-popup.show');
        if (SCROLL_WRAP) fullScrollEvtInit(SCROLL_WRAP, _fBtn);
      });
    } else {
      _fBtn.classList.remove('isScroll');
    }
  }
  function fullScrollEvtInit(_scrollWrap, _fBtn) {
    const SCROLL_BODY = _scrollWrap.querySelector('.full-body');
    if (SCROLL_BODY) fullScrollEvtScroll(SCROLL_BODY, _fBtn);
  }
  function fullScrollEvtScroll(_scrollBody, _fBtn) {
    // scroll end check
    let scrollRes = _scrollBody.offsetHeight + _scrollBody.scrollTop + 30;
    // scroll down end
    if (scrollRes >= _scrollBody.scrollHeight) _fBtn.classList.add('isScrollEnd');
    else _fBtn.classList.remove('isScrollEnd');
  }
  // X XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // ++ full type 일 경우
  // function fullScrollCheck(_elem) {
  //   const F_CONTAINER = _elem.querySelector('.c-container');
  //   if (F_CONTAINER) {
  //     const F_HEADER = F_CONTAINER.querySelector('.full-header');
  //     const F_BODY = F_CONTAINER.querySelector('.full-body');
  //     const F_FOOTER = F_CONTAINER.querySelector('.full-footer');
  //     // full-body가 스크롤 되는지 체크
  //     if (F_HEADER && F_BODY && F_FOOTER) fullScrollEvent(F_CONTAINER, F_HEADER, F_BODY, F_FOOTER);
  //   }
  // }
  // +++ full type의 container가 스크롤 될 경우
  // function fullScrollEvent(_container, _header, _body, _footer) {
  //   let bStyle = _body.currentStyle || window.getComputedStyle(_body);
  //   let cHeight = _container.clientHeight;
  //   let hHeight = _header.clientHeight;
  //   // let bHeight = _body.scrollHeight;
  //   let bhInit = parseInt(bStyle.paddingBottom);
  //   let bHeight = (_body.clientHeight + bhInit) > _body.scrollHeight ? _body.clientHeight + bhInit : _body.scrollHeight;
  //   let fHeight = _footer.clientHeight; // 100px || 72px
  //   let hRes = cHeight - (hHeight + 72);
  //   if (bHeight > hRes) {
  //     // bottom fixed 버튼: 애니메이션 제거
  //     // _footer.style.transition = 'none';
  //     // footer addClass: scroll
  //     _footer.classList.add('scroll');
  //     // scroll end event check
  //     fullScrollEndEvent(_container, _body, _footer);
  //   }
  // }
  // ++++ scroll end event check
  // function fullScrollEndEvent(_scrollContainer, _scrollBody, _buttonEl) {
  //   // let scrollInit = 0;
  //   _scrollBody.addEventListener('scroll', () => {
  //     // bottom fixed 버튼: 애니메이션 적용
  //     // _buttonEl.style.transition = 'padding .1s ease-in-out';
  //     // scroll up
  //     if (!timeout) {
  //       // scroll end check
  //       let scrollRes = _scrollBody.offsetHeight + _scrollBody.scrollTop;
  //       // scroll down end
  //       if (scrollRes >= _scrollBody.scrollHeight) _buttonEl.classList.remove('scroll');
  //       if (scrollRes < _scrollBody.scrollHeight - 28) _buttonEl.classList.add('scroll');
  //     }
  //   });
  // }
  // X XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // ++ full footer type 일 경우
  function fullFooterScrollCheck(_elem) {
    const FF_CONTAINER = _elem.querySelector('.c-container');
    if (FF_CONTAINER) {
      const FF_HEADER = FF_CONTAINER.querySelector('.full-header');
      const FF_BODY = FF_CONTAINER.querySelector('.full-body');
      const FF_BUTTON = FF_CONTAINER.querySelector('.full-footer');
      const FF_FOOTER = FF_CONTAINER.querySelector('.footer');

      // fixed 버튼 있는 full-body가 스크롤 되는지 체크
      if (FF_HEADER && FF_BODY && FF_BUTTON && FF_FOOTER) fullFooterScrollEvent(_elem, FF_CONTAINER, FF_HEADER, FF_BODY, FF_BUTTON, FF_FOOTER);
      // fixed 버튼 없는 full-body가 스크롤 되는지 체크
      if (FF_HEADER && FF_BODY && FF_FOOTER) fullNoFooterScrollEvent(_elem, FF_CONTAINER, FF_HEADER, FF_BODY, FF_FOOTER);
    }
  }
  // +++ fixed 버튼 없는 full-body가 스크롤 되는지 체크
  function fullNoFooterScrollEvent(_popEl, _container, _header, _body, _footer) {
    let cHeight = _container.clientHeight;
    let hHeight = _header.clientHeight;
    let bHeight = _body.scrollHeight;
    let fHeight = _footer.clientHeight;
    let hRes = cHeight - (hHeight + fHeight);
    if (bHeight > hRes) _popEl.classList.add('type-scroll');
  }
  // +++ fixed 버튼 있는 full-body가 스크롤 되는지 체크
  function fullFooterScrollEvent(_popEl, _container, _header, _body, _btnEl, _footer) {
    let cHeight = _container.clientHeight;
    let hHeight = _header.clientHeight;
    let bHeight = _body.scrollHeight;
    let btnHeight = _btnEl.clientHeight; // 72px || 100px
    let fHeight = _footer.clientHeight;
    let hRes = cHeight - (hHeight + fHeight + btnHeight);
    if (bHeight > hRes) {
      // popup addClass: type-scroll
      _popEl.classList.add('type-scroll');
      // fixed button addClass: scroll
      _btnEl.classList.add('scroll');
      _container.scrollTop = 1;
      setTimeout(() => {
        _container.scrollTop = 0;
      }, INTERVAL_1);
      // scroll end event check
      fullFooterScrollEndEvent(_container, _btnEl, _footer);
    }
  }
  // ++++ scroll end event check
  function fullFooterScrollEndEvent(_scrollContainer, _buttonEl, _footerEl) {
    _scrollContainer.addEventListener('scroll', () => {
      // scroll end check
      let scrollRes = _scrollContainer.offsetHeight + _scrollContainer.scrollTop + 50;
      let scrollRight = _scrollContainer.scrollHeight - _footerEl.clientHeight;
      // scroll down end
      if (scrollRes >= scrollRight) if (_buttonEl.classList.contains('scroll')) _buttonEl.classList.remove('scroll');
      // scroll up
      let scrollResUp = _scrollContainer.scrollHeight - _footerEl.clientHeight;
      if (scrollRes < scrollResUp) if (!_buttonEl.classList.contains('scroll')) _buttonEl.classList.add('scroll');
    });
  }
  // + modal header type
  function popupModalHeader(_state, _popupEl) {
    if (_state === 'modal') setTimeout(popupModalHeaderScroll, ANI_TIME_300, _popupEl, _state);
    else if (_state === 'modal-hf-fixed') setTimeout(popupModalHFFixedScroll, ANI_TIME_300, _popupEl, _state);
  }
  // ++ modal header type의 modal-field가 스크롤 되는지 체크
  function popupModalHeaderScroll(_popEl, _state) {
    const SCROLL_ELEM = _popEl.querySelector('.modal-field');
    if (SCROLL_ELEM) {
      const POP_HEADER = SCROLL_ELEM.querySelector('.c-modal-header');
      if (POP_HEADER) {
        if (SCROLL_ELEM.scrollHeight > SCROLL_ELEM.clientHeight) {
          // scrollbar design
          customScrollbar(_popEl, _state);

          // scroll event
          popupModalHeaderScrollEvt(SCROLL_ELEM, POP_HEADER);
        }
      }
    }
  }

  // ++ popupModalHFFixedScroll
  function popupModalHFFixedScroll(_popEl, _state) {
    const SCROLL_ELEM2 = _popEl.querySelector('.modal-field');
    const SCROLL_ELEM2_BODY = _popEl.querySelector('.modal-field').querySelector('.c-modal-body');
    if (SCROLL_ELEM2) {
      const POP_HEADER2 = SCROLL_ELEM2.querySelector('.c-modal-header');
      if (POP_HEADER2) {
        if (SCROLL_ELEM2.querySelector('.c-modal-body').scrollHeight > SCROLL_ELEM2.querySelector('.c-modal-body').clientHeight) {
          // scrollbar design
          customScrollbar(_popEl, _state);

          // scroll event
          popupModalHeaderScrollEvt(SCROLL_ELEM2_BODY, POP_HEADER2);
        }
      }
    }
  }

  // +++ modal header type의 modal-field가 스크롤 되는 경우
  function popupModalHeaderScrollEvt(_scrollEl, _popHeader) {
    console.log(_scrollEl);
    _scrollEl.addEventListener('scroll', function () {
      console.log('scroll');
      if (this.scrollTop <= 0) _popHeader.classList.remove('isScroll');
      else _popHeader.classList.add('isScroll');
    });
  }
  // 팝업 닫힘 - 닫힘버튼 class: popup-btn-close
  const POPUP_CLOSE_ELEM = document.querySelectorAll('.popup-btn-close');
  if (POPUP_CLOSE_ELEM.length > 0) popupCloseComn(POPUP_CLOSE_ELEM);

  // + popup close
  function popupCloseComn(_popupCloseEl) {
    for (let i = 0; i < _popupCloseEl.length; i++) {
      // popup close button - click event
      _popupCloseEl[i].addEventListener('click', () => {
        const CLOSESTATE_POPUP = document.querySelectorAll('.kmi-popup.show');
        if (CLOSESTATE_POPUP.length > 0) for (let i = 0; i < CLOSESTATE_POPUP.length; i++) CLOSESTATE_POPUP[i].setAttribute('aria-hidden', false);
        const TARGET = _popupCloseEl[i].closest('.kmi-popup');
        TARGET.classList.remove('show');
        TARGET.setAttribute('aria-hidden', true);

        // 접근성: popup close 시 #container focus 풀기
        containerHidden(false);

        // style - 사라지는 animation을 위해 setTimeout 사용
        setTimeout(() => {
          popupCloseTimeout(TARGET);
        }, ANI_TIME_300);
      });
    }
  }
  function popupCloseTimeout(_target) {
    popupStyle(_target, 'hide');
    focusCloseState(_target);
  }
  // 팝업: 접근성
  // + 팝업 닫을 때 열었던 버튼에 focus 시키기
  function focusCloseState(_elem) {
    setTimeout(() => {
      const FOCUS_ELEM = document.querySelector(`[data-target="${_elem.id}"]`);
      if (FOCUS_ELEM) FOCUS_ELEM.focus();
    }, INTERVAL_1);
  }
  function focusFirstBtn(_state, _elem) {
    setTimeout(() => {
      let focus_el = new Object();
      if (_state === 'full-footer' || _state === 'full') focus_el = _elem.querySelectorAll('.btn-go-back');
      if (_state === 'modal') focus_el = _elem.querySelectorAll('.popup-cls-btn.popup-btn-close');
      if (focus_el.length > 0)
        setTimeout(() => {
          focus_el[0].focus();
        }, INTERVAL_1);
    }, ANI_TIME_300);
  }
  // DOM에 풀팝업이 있을 경우
  function fullPopupState() {
    const FULL_POP_ELEM = document.querySelectorAll('.c-full-layer.show');
    if (FULL_POP_ELEM.length > 0) {
      for (let i = 0; i < FULL_POP_ELEM.length; i++) {
        if (FULL_POP_ELEM[i].classList.contains('type-full')) fullPopupScrollHeightCheck('full', FULL_POP_ELEM[i]);
        if (FULL_POP_ELEM[i].classList.contains('type-full-footer')) fullPopupScrollHeightChk('full-footer', FULL_POP_ELEM[i]);
      }
    }
  }
  function fullPopupScrollHeightCheck(_type, _popEl) {
    const F_CONTAINER = _popEl.querySelector('.c-container');
    if (F_CONTAINER) {
      const F_HEADER = F_CONTAINER.querySelector('.full-header');
      const F_BODY = F_CONTAINER.querySelector('.full-body');
      const F_BUTTON = F_CONTAINER.querySelector('.btn-floating');
      if (F_HEADER && F_BODY && F_BUTTON) if (_type === 'full') fullScrollEvt(F_CONTAINER, F_HEADER, F_BODY, F_BUTTON);
    }
  }
  // + resize: DOM에 팝업이 있는 경우
  function fullPopupScrollHeightChk(_type, _popEl) {
    const FULL_CONTAINER = _popEl.querySelector('.c-container');
    if (FULL_CONTAINER) {
      const FULL_HEADER = FULL_CONTAINER.querySelector('.full-header');
      const FULL_BODY = FULL_CONTAINER.querySelector('.full-body');
      const FULL_FOOTER = FULL_CONTAINER.querySelector('.full-footer');
      // full type
      if (_type === 'full') fullResizeEvent(FULL_CONTAINER, FULL_HEADER, FULL_BODY, FULL_FOOTER);
    }
  }
  // ++ reize check
  function fullResizeEvent(_container, _header, _body, _footer) {
    let bStyle = _body.currentStyle || window.getComputedStyle(_body);
    let cHeight = _container.clientHeight;
    let hHeight = _header.clientHeight;
    let bhInit = parseInt(bStyle.paddingBottom);
    let bHeight = _body.clientHeight + bhInit > _body.scrollHeight ? _body.clientHeight + bhInit : _body.scrollHeight;
    // let fHeight = _footer.clientHeight; // 100px || 72px
    let fHeight = 72;
    let hRes = cHeight - (hHeight + fHeight);

    // footer addClass: scroll
    if (bHeight > hRes) _footer.classList.add('scroll');
    // footer removeClass: scroll
    else _footer.classList.remove('scroll');

    // reisze 했을 때 scroll이 최하단일 경우
    if (_body.offsetHeight + _body.scrollTop >= _body.scrollHeight) _footer.classList.remove('scroll');
  }
  // resize: modal header popup shadow
  function modalHeaderPopupShadow() {
    const MODAL_HEADER_POPUP = document.querySelectorAll('.c-layer-popup.kmi-popup.type-modal.show');
    if (MODAL_HEADER_POPUP.length > 0) for (let i = 0; i < MODAL_HEADER_POPUP.length; i++) customScrollbar(MODAL_HEADER_POPUP[i], 'modal');
  }
  // resize: full popup
  function fullPopupResizeScrollbar() {
    const FULL_POPUP = document.querySelectorAll('.c-full-layer.kmi-popup.show');
    if (FULL_POPUP.length > 0) {
      for (let i = 0; i < FULL_POPUP.length; i++) {
        if (FULL_POPUP[i].classList.contains('type-full')) customScrollbar(FULL_POPUP[i], 'full');
        if (FULL_POPUP[i].classList.contains('type-full-footer')) customScrollbar(FULL_POPUP[i], 'full-footer');
      }
    }
  }
  // 팝업 열림 버튼을 직접 click할 경우
  function popupDirectClick(_popupBtnEl) {
    popupOpenEvent(_popupBtnEl);
  }

  /**
   * accordion
   */
  const ACCORDION_ELEM = document.querySelectorAll('.accordion');
  if (ACCORDION_ELEM.length > 0) {
    for (let i = 0; i < ACCORDION_ELEM.length; i++) {
      // 아코디언 타입체크
      let accordionType = accordionTypeCheck(ACCORDION_ELEM[i]);

      // 접근성
      accordionAltTxt(ACCORDION_ELEM[i]);
      accordionAccessibility(ACCORDION_ELEM[i]);
      const BTN_OPEN = ACCORDION_ELEM[i].querySelectorAll('.accordion-header');
      // acc button click event
      if (BTN_OPEN.length > 0) accButtonClickEvent(ACCORDION_ELEM[i], BTN_OPEN[0], accordionType);
    }
  }

  // + 아코디언 타입 체크: 하나만 보이는 타입, 모두 보이는 타입
  function accordionTypeCheck(_accEl) {
    if (_accEl.classList.contains('type-open-one')) return 'type-one-open';
    return 'type-multi-open';
  }
  function accordionAltTxt(_elem) {
    if (_elem.classList.contains('type-inner-btn')) {
      let altElTxt = document.createElement('em');
      altElTxt.classList.add('alt-txt');
      altElTxt.setAttribute('role', 'button');
      let header = _elem.querySelector('.accordion-header');
      let accTit = header.querySelector('.acc-tit');
      header.insertBefore(altElTxt, accTit);
      _elem.classList.contains('open') ? (altElTxt.innerHTML = ACC_ALT_TXT.open) : (altElTxt.innerHTML = ACC_ALT_TXT.close);
    }
  }
  function accordionAltTxtTouch(_altEl, _state) {
    switch (_state) {
      case true:
        _altEl.innerHTML = ACC_ALT_TXT.open;
        break;
      default:
        _altEl.innerHTML = ACC_ALT_TXT.close;
        break;
    }
  }
  function accordionAccessibility(_elem) {
    if (_elem.classList.contains('open')) {
      _elem.querySelector('.accordion-header').setAttribute('aria-expanded', true);
      _elem.querySelector('.accordion-body').setAttribute('tabindex', 0);
      _elem.querySelector('.accordion-body').setAttribute('aria-hidden', false);
      if (_elem.classList.contains('type-inner-btn')) if (_elem.querySelector('.alt-txt')) accordionAltTxtTouch(_elem.querySelector('.alt-txt'), true);
    } else {
      _elem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      _elem.querySelector('.accordion-body').setAttribute('tabindex', -1);
      _elem.querySelector('.accordion-body').setAttribute('aria-hidden', true);
      if (_elem.classList.contains('type-inner-btn')) if (_elem.querySelector('.alt-txt')) accordionAltTxtTouch(_elem.querySelector('.alt-txt'), false);
    }
  }
  // + acc button click event
  function accButtonClickEvent(_accWrap, _elem, _accType) {
    let bodyHeight = 0;
    setTimeout(() => {
      let accBodyEl = _accWrap.querySelector('.accordion-body');
      bodyHeight = accBodyEl.scrollHeight;

      // 열려있는 아코디언이 있을 경우
      if (_accWrap.classList.contains('open')) _accWrap.querySelector('.accordion-body').style.maxHeight = bodyHeight + 'px';
      _elem.onclick = function (e) {
        accButtonClickEvtComn(e, _accType, _accWrap, accBodyEl, bodyHeight);
      };
    }, INTERVAL_100);
  }
  function accButtonClickEvtComn(_e, _accType, _accWrap, _accBodyEl, _bodyHeight) {
    // 터치하는 영역이 '비교하기' 버튼이 아닐 경우 - 아코디언 hide / show
    // 터치하는 영역이 물음표 아이콘이 아닐 경우 - 아코디언 hide / show
    if (!_e.target.parentElement.classList.contains('co-btn') && !_e.target.classList.contains('co-btn') && !_e.target.classList.contains('ico-ques')) {
      accButtonTypeOneOpen(_accType, _accWrap);
      accButtonOpenClose(_accWrap, _accBodyEl);
      // 접근성
      accordionAccessibility(_accWrap);
      // btn-bottom-floating check
      setTimeout(() => {
        const CONTAINER_EL = document.getElementById('container');
        if (CONTAINER_EL) scrollTopFake(CONTAINER_EL);
      }, ANI_TIME_300);
    }
  }
  function accButtonTypeOneOpen(_accType, _accWrap) {
    // 터치 시 하나만 보이는 타입
    if (_accType === 'type-one-open') {
      // 아코디언이 열려있으면
      if (!_accWrap.classList.contains('open')) accButtonTypeOneOpenAllClose(_accWrap);
    }
  }
  function accButtonTypeOneOpenAllClose(_accWrap) {
    const ACC_WRAP = _accWrap.closest('.accordion-list');
    if (ACC_WRAP) {
      // 아코디언 모두 닫기
      let accOneList = ACC_WRAP.querySelectorAll('.accordion');
      for (let i = 0; i < accOneList.length; i++) {
        accOneList[i].classList.remove('open');
        accOneList[i].querySelector('.accordion-body').style.maxHeight = 0;
        accOneList[i].querySelector('.accordion-body').setAttribute('tabindex', -1);
        accOneList[i].querySelector('.accordion-body').setAttribute('aria-hidden', true);
        accOneList[i].querySelector('.accordion-header').setAttribute('aria-expanded', false);
      }
    }
  }
  function accButtonOpenClose(_accWrap, _accBodyEl) {
    if (_accWrap.classList.contains('open')) {
      _accWrap.classList.remove('open');
      _accBodyEl.style.maxHeight = 0;
    } else {
      _accWrap.classList.add('open');
      _accBodyEl.style.maxHeight = _accBodyEl.scrollHeight + 'px';
    }
  }
  // + 아코디언 모두닫힘
  function accordionAllClose(_accEl) {
    for (let i = 0; i < _accEl.length; i++) {
      _accEl[i].classList.remove('open');
      _accEl[i].querySelector('.accordion-body').setAttribute('tabindex', -1);
      _accEl[i].querySelector('.accordion-body').setAttribute('aria-hidden', true);
      _accEl[i].querySelector('.accordion-body').style.maxHeight = 0;
    }
  }

  /**
   * terms
   */
  const TERMS_ELEM = document.querySelectorAll('.terms-box');
  if (TERMS_ELEM.length > 0) termsComn(TERMS_ELEM);

  // + 약관이 있으면
  function termsComn(_elem) {
    for (let i = 0; i < TERMS_ELEM.length; i++) {
      const TERMS_INNER = TERMS_ELEM[i].querySelectorAll('.inner');
      termsInner(TERMS_INNER, TERMS_ELEM[i]);
    }
  }
  function termsInner(_inner, _elem) {
    if (_inner.length > 0) for (let j = 0; j < _inner.length; j++) temrsRow(_inner[j], _elem);
  }
  // ++ 약관에 내용이 있으면
  function temrsRow(_row, _elem) {
    if (_row.scrollHeight > _elem.clientHeight + 2) {
      const TERMS_ROW = _row.querySelectorAll('.terms-row');
      termsAppend(TERMS_ROW, _elem, _row);
    }
  }
  // +++ 약관에 내용이 길면
  function termsAppend(_row, _elem, _rowEl) {
    if (_row.length > 0) {
      let scrollEl = document.createElement('div');
      let scrollInner = document.createElement('span');
      scrollEl.classList.add('terms_scroll');
      scrollEl.setAttribute('aria-hidden', true);
      scrollEl.appendChild(scrollInner);
      // 스크롤바 element 만들기
      _elem.appendChild(scrollEl);

      // 스크롤바 scroll event
      termsScrollEvent(_rowEl, scrollEl, scrollInner);
    }
  }
  // ++++ 스크롤바 scroll event
  function termsScrollEvent(_scrollBody, _scrollWrap, _scrollElem) {
    let scrollRes = 0;
    let isScrolling;
    _scrollBody.addEventListener('scroll', function () {
      window.clearTimeout(isScrolling);
      if (this.scrollTop > 0) {
        _scrollWrap.classList.add('show');
        scrollRes = ((100 - _scrollElem.clientHeight) / (this.scrollHeight - this.clientHeight)) * this.scrollTop;
        _scrollElem.style.top = `${scrollRes}%`;
      } else {
        _scrollElem.style.top = '0';
      }
      // scroll stop event
      isScrolling = setTimeout(function () {
        if (_scrollWrap.classList.contains('show')) _scrollWrap.classList.remove('show');
      }, INTERVAL_1000);
    });
  }

  /**
   * textarea
   */
  const TEXTAREA_ELEM = document.querySelectorAll('textarea');
  if (TEXTAREA_ELEM.length > 0) for (let i = 0; i < TEXTAREA_ELEM.length; i++) textareaComn(TEXTAREA_ELEM[i]);
  // + textarea가 있으면
  function textareaComn(_elem) {
    if (_elem.scrollHeight > _elem.clientHeight) textareaScrollbar(_elem);
    // add scrollbar
    _elem.addEventListener('input', function () {
      if (this.scrollHeight > this.clientHeight) textareaScrollbar(_elem);
    });
  }
  // + create textarea scrollbar
  function textareaScrollbar(_elem) {
    if (_elem.parentElement.querySelector('.textarea-scroll')) {
      // has scrollbar
    } else {
      // null scrollbar
      let scrollEl = document.createElement('div');
      let scrollInner = document.createElement('span');
      scrollEl.classList.add('textarea-scroll');
      scrollEl.setAttribute('aria-hidden', true);
      scrollEl.appendChild(scrollInner);
      _elem.parentElement.appendChild(scrollEl);
      // 스크롤바 scroll event
      termsScrollEvent(_elem, scrollEl, scrollInner);
    }
  }

  /**
   * input
   */
  const INPUT_ELEM = document.querySelectorAll('input');
  if (INPUT_ELEM.length > 0) for (let i = 0; i < INPUT_ELEM.length; i++) inputComn(INPUT_ELEM[i]);
  // input 공통 scritp
  function inputComn(_elem) {
    let inputTypeState = inputTypeCase(_elem);
    inputFocusEvent(_elem, inputTypeState);
  }
  // + input type check
  function inputTypeCase(_input) {
    let inputCase = _input.type;
    switch (inputCase) {
      case 'text':
      case 'password':
      case 'number':
        return 'default';
        break;
      default:
        break;
    }
  }
  // + input [text, password, number] focus event
  function inputFocusEvent(_inputEl, _inputState) {
    if (_inputState === 'default') inputFocusEvtComn(_inputEl);
  }
  function inputFocusEvtComn(_inputEl) {
    _inputEl.addEventListener('focus', function () {
      inputFocusEvtFloating(_inputEl);
      inputFocusEvtModal();
      let elTop = 0;
      setTimeout(() => {
        let elTopElem = _inputEl.closest('*[class^="c-input-"]');
        if (elTopElem) {
          elTop = elTopElem.offsetTop;
          // type-fulld
          const PARENT_EL_FULL = _inputEl.closest('.c-container');
          if (PARENT_EL_FULL) {
            const PARENT_EL_HEADER = PARENT_EL_FULL.querySelector('.full-header');
            if (PARENT_EL_HEADER) PARENT_EL_FULL.scrollTop = elTop - PARENT_EL_HEADER.clientHeight;
          }
          // type-modal
          const PARENT_EL_MODAL = _inputEl.closest('.c-layer-popup.kmi-popup.type-modal.show');
          if (PARENT_EL_MODAL) {
            const MODAL_INNER = PARENT_EL_MODAL.querySelector('.modal-field');
            if (MODAL_INNER) {
              const MODAL_HEADER = MODAL_INNER.querySelector('.c-modal-header');
              if (MODAL_HEADER) MODAL_INNER.scrollTop = elTop - MODAL_HEADER.clientHeight;
            }
          }
          elTop = 0;
        }
      }, INTERVAL_100);
      return false;
    });
    _inputEl.addEventListener('blur', function () {
      // type-full
      let floatinPopup = _inputEl.closest('.c-full-layer.kmi-popup.show');
      if (floatinPopup) {
        let floatingContainer = floatinPopup.querySelector('.c-container');
        if (floatingContainer) {
          const SCROLL_ELEM = floatingContainer.querySelector('.full-body');
          if (SCROLL_ELEM) {
            let floatingBtn = SCROLL_ELEM.querySelector('.btn-floating');
            floatinPopup.classList.remove('input-focus');
            if (floatinPopup.classList.contains('input-focus')) {
              floatinPopup.classList.remove('input-focus');
            }
            if (SCROLL_ELEM.scrollHeight - 72 > SCROLL_ELEM.clientHeight) floatingBtn.classList.add('isScroll');
          }
        }
      }
      return false;
    });
  }
  // ++ floating 버튼 있는 full 팝업
  function inputFocusEvtFloating(_inputEl) {
    let floatinPopup = document.querySelector('.c-full-layer.kmi-popup.show');
    if (floatinPopup) {
      let floatingContainer = floatinPopup.querySelector('.c-container');
      let floatingBtn = floatinPopup.querySelector('.btn-floating');
      if (floatingContainer && floatingBtn) inputFocusEvtFloatingBtn(floatinPopup, floatingContainer, floatingBtn, _inputEl);
    }
  }
  function inputFocusEvtFloatingBtn(_floatinPopup, _floatingContainer, _floatingBtn, _inputEl) {
    if (_floatinPopup.classList.contains('input-focus')) {
      //
    } else {
      _floatinPopup.classList.add('input-focus');
    }
  }
  // ++ modal 팝업
  function inputFocusEvtModal() {
    // let modalPopup = document.querySelector('.c-layer-popup.kmi-popup.show');
    // if (modalPopup) {
    //   modalPopup.classList.add('input-focus');
    //   this.addEventListener('blur', () => {
    //     modalPopup.classList.remove('input-focus');
    //   });
    // }
  }

  /**
   * #container scroll event
   */
  const CONTAINER_ELEM = document.querySelector('#container');
  if (CONTAINER_ELEM) {
    const FLEX_ELEM = CONTAINER_ELEM.querySelector('.flex-wrap');
    if (!FLEX_ELEM.classList.contains('type-tab-scroll')) {
      const MOVE_HEADER = CONTAINER_ELEM.querySelector('.header.co-header');
      if (MOVE_HEADER) containerScrollEvent(MOVE_HEADER, CONTAINER_ELEM);
    } else if (FLEX_ELEM.classList.contains('type-tab-scroll')) {
      const MOVE_HEADER = CONTAINER_ELEM.querySelector('.header.co-header');
      if (MOVE_HEADER) containerTabScrollEvent(MOVE_HEADER, CONTAINER_ELEM);
    }
    // custom 스크롤바 만들기
    customScrollbar(CONTAINER_ELEM);
  }
  function containerScrollEvent(_moveHeader, _scrollEl) {
    let headerHeight = _moveHeader.clientHeight;
    let lastScrollTop = 0;
    let scrollArr = [];
    var isScrolling;
    const BTN_BOTTOM_FLOATING = _scrollEl.querySelector('.btn-bottom-floating');
    const CONTAINER_FOOTER = _scrollEl.querySelector('.footer');
    const FLOATING_BLOCK_ARR = ['rv-block', 'rc-block'];
    if (BTN_BOTTOM_FLOATING) {
      const MARGIN_EL = BTN_BOTTOM_FLOATING.previousSibling.previousElementSibling;
      if (MARGIN_EL) MARGIN_EL.style.marginBottom = '3.75rem';
      FLOATING_BLOCK_ARR.map((el) => {
        let blockEl = document.querySelector('.' + el);
        if (blockEl) blockEl.classList.add('type-floating-btn');
      });
      if (CONTAINER_FOOTER) floatingBtnComn(_scrollEl, CONTAINER_FOOTER);
      else floatingBtnComn(_scrollEl);
    }

    // move top button
    const MOVE_TOP_BTN_ELEM = document.querySelector('.btn-move-top');
    _scrollEl.addEventListener(
      'scroll',
      function (e) {
        if (this.scrollTop > headerHeight) {
          let st = this.pageYOffset || this.scrollTop;
          if (st > lastScrollTop) {
            // SCROLL: DOWN
            // console.log('SCROLL DOWN');

            _moveHeader.classList.add('scroll-hide');
            if (document.querySelector('.flex-wrap').classList.contains('type-tab-scroll')) {
              _moveHeader.classList.remove('scroll-hide');
            }
            // _moveHeader.classList.add('scroll-hide');
            //}
          } else {
            // SCROLL: UP
            scrollArr.push(st);
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
              scrollArr = [];
            }, 66);
            if (Math.max.apply(Math, scrollArr) - Math.min.apply(Math, scrollArr) > SHOW_HEADER_NUM) {
              _moveHeader.classList.remove('scroll-hide');
              scrollArr = [];
            }
          }
          lastScrollTop = st <= 0 ? 0 : st;
        }
        if (this.scrollTop <= _moveHeader.clientHeight) {
          _moveHeader.classList.remove('scroll-hide');
          scrollArr = [];
        }
        if (MOVE_TOP_BTN_ELEM) {
          if (this.scrollTop <= 0) MOVE_TOP_BTN_ELEM.classList.add('hide');
          else MOVE_TOP_BTN_ELEM.classList.remove('hide');
        }

        // 하단 고정 버튼이 있는 경우
        if (BTN_BOTTOM_FLOATING) scrollingFloatingBtn(BTN_BOTTOM_FLOATING, this, CONTAINER_FOOTER);
      },
      false
    );
  }

  // [Mod 230220]
  // + touch move
  function containerTabScrollEvent(_moveHeader, _scrollEl) {
    let headerHeight = _moveHeader.clientHeight;
    let lastScrollTop = 0;
    let scrollArr = [];
    var isScrolling;
    const BTN_BOTTOM_FLOATING = _scrollEl.querySelector('.btn-bottom-floating');
    const CONTAINER_FOOTER = _scrollEl.querySelector('.footer');
    const FLOATING_BLOCK_ARR = ['rv-block', 'rc-block'];
    if (BTN_BOTTOM_FLOATING) {
      const MARGIN_EL = BTN_BOTTOM_FLOATING.previousSibling.previousElementSibling;
      if (MARGIN_EL) MARGIN_EL.style.marginBottom = '3.75rem';
      FLOATING_BLOCK_ARR.map((el) => {
        let blockEl = document.querySelector('.' + el);
        if (blockEl) blockEl.classList.add('type-floating-btn');
      });
      if (CONTAINER_FOOTER) floatingBtnComn(_scrollEl, CONTAINER_FOOTER);
      else floatingBtnComn(_scrollEl);
    }

    // move top button
    const MOVE_TOP_BTN_ELEM = document.querySelector('.btn-move-top');
    _scrollEl.addEventListener(
      'touchmove',
      function (e) {
        let SHOW_HEADER_NUM = '10';
        if (this.scrollTop > headerHeight) {
          let st = this.pageYOffset || this.scrollTop; // 현재 위치

          if (st > lastScrollTop) {
            // SCROLL: DOWN
            // console.log('touch move scroll down');

            _moveHeader.classList.add('scroll-hide');
          } else {
            // SCROLL: UP
            scrollArr.push(st);
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
              scrollArr = [];
            }, 66);
            if (Math.max.apply(Math, scrollArr) - Math.min.apply(Math, scrollArr) > SHOW_HEADER_NUM) {
              _moveHeader.classList.remove('scroll-hide');
              scrollArr = [];
            }
          }
          lastScrollTop = st <= 0 ? 0 : st;
        }

        // if (this.scrollTop <= _moveHeader.clientHeight) {
        //   _moveHeader.classList.remove('scroll-hide');
        //   scrollArr = [];
        // }

        if (MOVE_TOP_BTN_ELEM) {
          if (this.scrollTop <= 0) MOVE_TOP_BTN_ELEM.classList.add('hide');
          else MOVE_TOP_BTN_ELEM.classList.remove('hide');
        }

        // 하단 고정 버튼이 있는 경우
        if (BTN_BOTTOM_FLOATING) scrollingFloatingBtn(BTN_BOTTOM_FLOATING, this, CONTAINER_FOOTER);
      },
      false
    );
  }
  function floatingBtnComn(_scrollBody, ..._footer) {
    if (_footer.length > 0) {
      // console.log(_scrollBody.scrollHeight);
      // console.log(_scrollBody.clientHeight + _footer[0].clientHeight + INVERTED);
      if (_scrollBody.scrollHeight > _scrollBody.clientHeight + _footer[0].clientHeight + INVERTED) floatingBtnInner(true, _scrollBody);
      else floatingBtnInner(false, _scrollBody);
    } else {
      if (_scrollBody.scrollHeight > _scrollBody.clientHeight + INVERTED) floatingBtnInner(true, _scrollBody);
      else floatingBtnInner(false, _scrollBody);
    }
  }
  function floatingBtnInner(_state, _el) {
    switch (_state) {
      case true:
        _el.classList.add('isFloatingScroll');
        scrollTopFake(_el);
        break;
      default:
        _el.classList.remove('isFloatingScroll');
        break;
    }
  }
  function scrollingFloatingBtn(_floatingBtn, _this, _footer) {
    const S_HEADER = _this.querySelector('.header.co-header');
    const S_BTN = _this.querySelector('.btn-bottom-floating');
    if (elTopArr.length < 10) {
      elTopArr.push(_floatingBtn.offsetTop);
      elTopArr.sort(function (a, b) {
        if (a > b) return 1;
        if (a === b) return 0;
        if (a < b) return -1;
      });
    }
    let min = 0;
    if (_this.scrollTop <= 0) {
      min = Math.min.apply(Math, elTopArr);
    } else {
      if (S_HEADER && S_BTN) {
        min = _this.clientHeight - S_HEADER.clientHeight - S_BTN.clientHeight;
      }
    }
    elTopRes = Math.ceil(_floatingBtn.offsetTop - _this.scrollTop);
    if (min > elTopRes) {
      _this.classList.remove('isFloatingScroll');
    } else {
      if (_footer)
        if (_this.scrollHeight - _this.clientHeight - INVERTED > _footer.clientHeight) _this.classList.add('isFloatingScroll');
        else _this.classList.add('isFloatingScroll');
    }
  }
  function scrollTopFake(_scrollBody) {
    _scrollBody.scrollTop += 1;
    _scrollBody.scrollTop -= 1;
  }

  // container scrollbar resize
  function containerResizeScrollbar() {
    const CONTAINER_ELEM = document.getElementById('container');
    if (CONTAINER_ELEM) customScrollbar(CONTAINER_ELEM);
  }
  // container bottom floating button
  function containerResizeFloatingBtn() {
    elTopArr = [];
    const CONTAINER_ELEM = document.getElementById('container');
    if (CONTAINER_ELEM) {
      const CONTAINER_HEADER = CONTAINER_ELEM.querySelector('.header.co-header');
      const CONTAINER_BTN = document.querySelector('.btn-bottom-floating');
      if (CONTAINER_HEADER && CONTAINER_BTN) {
        if (CONTAINER_ELEM.scrollHeight > CONTAINER_ELEM.clientHeight) {
          let lRes = CONTAINER_ELEM.clientHeight - CONTAINER_HEADER.clientHeight - CONTAINER_BTN.clientHeight;
          let rRes = Math.ceil(CONTAINER_BTN.offsetTop - CONTAINER_ELEM.scrollTop);
          if (lRes > rRes) CONTAINER_ELEM.classList.remove('isFloatingScroll');
          else CONTAINER_ELEM.classList.add('isFloatingScroll');
        }
      }
    }
  }
  /**
   * 최상단 스크롤 이동 버튼 click event
   */
  const BTN_MOVE_TOP_ELEM = document.querySelector('.btn-move-top');
  if (BTN_MOVE_TOP_ELEM) {
    const SCROLLING_ELEM = document.getElementById('container');
    if (SCROLLING_ELEM) {
      if (SCROLLING_ELEM.scrollTop <= 0) BTN_MOVE_TOP_ELEM.classList.add('hide');
      BTN_MOVE_TOP_ELEM.addEventListener('click', () => {
        scrollToItemId(SCROLLING_ELEM.id);
      });
    }
  }
  // + pure js animate
  function scrollToItemId(containerId) {
    var scrollContainer = document.getElementById(containerId);
    var from = scrollContainer.scrollTop;
    let by = scrollContainer.scrollTop * -1;
    var currentIteration = 0;
    var animIterations = Math.round(60 * SCROLL_TIME);
    (function scroll() {
      var value = easeOutCubic(currentIteration, from, by, animIterations);
      scrollContainer.scrollTop = value;
      currentIteration++;
      if (currentIteration < animIterations) requestAnimationFrame(scroll);
    })();
  }
  // ++ linearEase
  function linearEase(currentIteration, startValue, changeInValue, totalIterations) {
    return (changeInValue * currentIteration) / totalIterations + startValue;
  }
  // ++ easeOutCubic
  function easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
    return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
  }

  /**
   * floating tab
   */
  const STICKYELM = document.querySelector('.tab-floating');
  if (STICKYELM) {
    const scrollEl = document.querySelector('#container');
    if (scrollEl) {
      let tabOffsetTop = STICKYELM.offsetTop;
      scrollEl.addEventListener('scroll', () => {
        stickyElComn(STICKYELM, tabOffsetTop);
      });
    }
  }
  function stickyElComn(_el, _top) {
    // scrolling
    let tabOffsetTopScroll = _el.offsetTop;
    if (tabOffsetTopScroll <= _top) _el.classList.remove('isScroll');
    else _el.classList.add('isScroll');
  }

  /**
   * custom scrollbar
   */
  // common formula
  // + popup: modal header
  let scrollElHeight = (_body, _header) => parseFloat(_body.clientHeight - _header.clientHeight - 20) + 'px';
  let scrollStyleTop = (_header) => parseFloat(_header.clientHeight) + 'px';
  let innerStyleHeight = (_body, _header) => (_body.clientHeight - _header.clientHeight) * ((_body.clientHeight - _header.clientHeight) / (_body.scrollHeight - _header.clientHeight)) + 'px';
  // + popup: full
  let innerStyleHeightFull = (_body, _header) => (_body.clientHeight - _header.clientHeight) * ((_body.clientHeight - _header.clientHeight) / (_body.scrollHeight - _header.clientHeight)) + 'px';
  // + popup: full footer
  let innerStyleHeightFooter = (_body, _header) => (_body.clientHeight - _header.clientHeight) * ((_body.clientHeight - _header.clientHeight) / (_body.scrollHeight - _header.clientHeight)) + 'px';
  // + container
  let scrollElHeightCon = (_body) => _body.clientHeight - 24 + 'px';
  let innerStyleHeightCon = (_body) => (_body.clientHeight * _body.clientHeight) / _body.scrollHeight + 'px';
  // common create scrollbar
  function customScrollbar(_elem, ..._state) {
    if (_state.length > 0) {
      // popup - modal: .modal-field
      if (_state[0] === 'modal') scrollDesignPopModalHeader(_elem);
      // popup - full: .full-body
      if (_state[0] === 'full') scrollDesignPopFullLayer(_elem);
      // popup - full-footer: c-container
      if (_state[0] === 'full-footer') scrollDesignPopFullFooter(_elem);
    } else {
      // container
      scrollDesignContainer(_elem);
    }
  }
  // container
  function scrollDesignContainer(_container) {
    const CUSTOMER_SCROLL = _container.querySelector('.kmi-scroll');
    if (CUSTOMER_SCROLL) {
      const CUSTOMER_SCROLL_INNER = CUSTOMER_SCROLL.querySelector('span');
      if (CUSTOMER_SCROLL_INNER) addStyle('container', CUSTOMER_SCROLL, CUSTOMER_SCROLL_INNER, _container);
    } else {
      scrollbarCreate(_container);
    }
  }
  // popup: full
  function scrollDesignPopFullLayer(_elem) {
    const POPUP_SCROLL_ELEM = _elem.querySelector('.c-container');
    if (POPUP_SCROLL_ELEM) {
      const POPUP_HEADER = POPUP_SCROLL_ELEM.querySelector('.full-header');
      const POPUP_BODY = POPUP_SCROLL_ELEM.querySelector('.full-body');
      const CUSTOMER_SCROLL = POPUP_SCROLL_ELEM.querySelector('.kmi-scroll');
      if (POPUP_HEADER && POPUP_BODY) fullLayerScrollbarComn(POPUP_BODY, CUSTOMER_SCROLL, POPUP_HEADER);
    }
  }
  // popup: full footer
  function scrollDesignPopFullFooter(_elem) {
    const POPUP_SCROLL_ELEM = _elem.querySelector('.c-container');
    if (POPUP_SCROLL_ELEM) {
      const POPUP_HEADER = POPUP_SCROLL_ELEM.querySelector('.full-header');
      const POPUP_BODY = POPUP_SCROLL_ELEM.querySelector('.full-body');
      const CUSTOMER_SCROLL = POPUP_SCROLL_ELEM.querySelector('.kmi-scroll');
      if (POPUP_HEADER && POPUP_BODY) fullLayerScrollbarComn(POPUP_SCROLL_ELEM, CUSTOMER_SCROLL, POPUP_HEADER);
    }
  }
  // popup: modal header
  function scrollDesignPopModalHeader(_elem) {
    const POPUP_SCROLL_ELEM = _elem.querySelector('.modal-field');
    if (POPUP_SCROLL_ELEM) {
      const POPUP_HEADER = POPUP_SCROLL_ELEM.querySelector('.c-modal-header');
      const POPUP_BODY = POPUP_SCROLL_ELEM.querySelector('.c-modal-body');
      const CUSTOMER_SCROLL = POPUP_SCROLL_ELEM.querySelector('.kmi-scroll');
      if (POPUP_HEADER && POPUP_BODY) modalHeaderScrollbarComn(POPUP_SCROLL_ELEM, CUSTOMER_SCROLL, POPUP_HEADER);
    }
  }
  // popup: modal header + footer
  function scrollDesignPopModalHeaderFooter(_elem) {
    const POPUP_SCROLL_ELEM = _elem.querySelector('.modal-field.type02');
    if (POPUP_SCROLL_ELEM) {
      const POPUP_HEADER = POPUP_SCROLL_ELEM.querySelector('.c-modal-header');
      const POPUP_BODY = POPUP_SCROLL_ELEM.querySelector('.c-modal-body');
      const CUSTOMER_SCROLL = POPUP_SCROLL_ELEM.querySelector('.kmi-scroll');
      if (POPUP_HEADER && POPUP_BODY) modalHeaderScrollbarComn(POPUP_SCROLL_ELEM, CUSTOMER_SCROLL, POPUP_HEADER);
    }
  }
  // + modal heder create scrollbar comn
  function modalHeaderScrollbarComn(_wrap, _scrollEl, _header) {
    if (_scrollEl) {
      const CUSTOMER_SCROLL_INNER = _scrollEl.querySelector('span');
      // add style
      if (CUSTOMER_SCROLL_INNER) addStyle('modal', _scrollEl, CUSTOMER_SCROLL_INNER, _wrap, _header);
    } else {
      // create element
      scrollbarCreate(_wrap, _header);
    }
    // scroll event: isScroll check
    popupModalHeaderScrollEvt(_wrap, _header);
  }
  // + full layer create scrollbar comn
  function fullLayerScrollbarComn(_wrap, _scrollEl, _header) {
    if (_scrollEl) {
      const CUSTOMER_SCROLL_INNER = _scrollEl.querySelector('span');
      if (CUSTOMER_SCROLL_INNER) {
        // add style
        addStyle('full', _scrollEl, CUSTOMER_SCROLL_INNER, _wrap, _header);
      }
    } else {
      // create element
      scrollbarCreate(_wrap, _header);
    }
  }
  // ++ create element
  function scrollbarCreate(_scrollEl, _popHeader) {
    let scrollEl = document.createElement('div');
    let scrollInner = document.createElement('span');
    scrollEl.classList.add('kmi-scroll');
    scrollEl.setAttribute('aria-hidden', true);
    scrollEl.appendChild(scrollInner);
    _scrollEl.appendChild(scrollEl);

    // add style
    // modal
    if (scrollEl.closest('.type-modal')) {
      addStyle('modal', scrollEl, scrollInner, _scrollEl, _popHeader);
    }
    // full
    else if (scrollEl.closest('.type-full')) {
      addStyle('full', scrollEl, scrollInner, _scrollEl, _popHeader);
    }
    // full-footer
    else if (scrollEl.closest('.type-full-footer')) {
      addStyle('full-footer', scrollEl, scrollInner, _scrollEl, _popHeader);
    }
    // container
    else {
      addStyle('container', scrollEl, scrollInner, _scrollEl);
    }
  }
  function addStyle(_type, _scrollEl, _scrollInner, _popScrollEl, _popHeader) {
    setTimeout(() => {
      if (_type === 'modal') {
        _scrollEl.style.height = scrollElHeight(_popScrollEl, _popHeader);
        _scrollEl.style.top = scrollStyleTop(_popHeader);
        _scrollInner.style.height = innerStyleHeight(_popScrollEl, _popHeader);
      }
      if (_type === 'full') {
        _scrollInner.style.height = innerStyleHeightFull(_popScrollEl, _popHeader);
      }
      if (_type === 'full-footer') {
        _scrollInner.style.height = innerStyleHeightFooter(_popScrollEl, _popHeader);
      }
      if (_type === 'container') {
        _scrollEl.style.height = scrollElHeightCon(_popScrollEl);
        _scrollInner.style.height = innerStyleHeightCon(_popScrollEl);
      }

      // scroll event
      scrollDesignScrollEvt(_type, _popScrollEl, _scrollEl, _scrollInner);
    }, INTERVAL_1);
  }
  // +++ scroll event
  function scrollDesignScrollEvt(_type, _sclBody, _sclBar, _sclThum) {
    let sclBarTop = parseInt(_sclBar.style.top);
    let isScrolling;
    _sclBody.addEventListener('scroll', function () {
      if (this.scrollTop > 0) {
        if (_type === 'modal') _sclBar.style.top = parseFloat(sclBarTop + this.scrollTop) + 'px';
        _sclBar.classList.add('show');
        _sclThum.style.top = this.scrollTop / ((this.scrollHeight - this.clientHeight + _sclBar.clientHeight) / 100) + '%';
      } else {
        if (_type === 'modal') _sclBar.style.top = sclBarTop + 'px';
        _sclThum.style.top = '0';
      }
      // scroll stop event
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(function () {
        if (_sclBar.classList.contains('show')) _sclBar.classList.remove('show');
      }, INTERVAL_1000);
    });
  }
}
//# sourceMappingURL=maps/common.js.map

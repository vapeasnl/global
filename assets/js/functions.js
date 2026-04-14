// @codekit-prepend "/vendor/hammer-2.0.8.js";

$( document ).ready(function() {

  var sectionIds = ['accueil', 'services', 'methode', 'contact', 'devis'];
  var activePackFilter = null;
  var enableAutoSectionNavigation = false;

  function getVisibleSliderItems() {
    return $('.slider--item').filter(function() {
      return $(this).css('display') !== 'none';
    });
  }

  function setSliderWindow($visibleItems, startIndex) {
    var total = $visibleItems.length;
    if (!total) {
      return;
    }

    $('.slider--item')
      .removeClass('slider--item-left slider--item-center slider--item-right')
      .hide();

    $visibleItems.eq(startIndex % total).show().addClass('slider--item-left');

    if (total > 1) {
      $visibleItems.eq((startIndex + 1) % total).show().addClass('slider--item-center');
    }

    if (total > 2) {
      $visibleItems.eq((startIndex + 2) % total).show().addClass('slider--item-right');
    }
  }

  function applySliderFilter(packKey) {
    activePackFilter = packKey || null;

    if (!activePackFilter) {
      $('.slider--item').show();
      $('.slider--prev, .slider--next').show();
      setSliderWindow(getVisibleSliderItems(), 0);
      return;
    }

    $('.slider--item').each(function() {
      var match = $(this).data('pack') === activePackFilter;
      $(this).toggle(match);
    });

    var $primaryItem = $('.slider--item[data-pack="' + activePackFilter + '"][data-pack-primary="true"]').first();

    var $filteredItems = getVisibleSliderItems();
    $('.slider--prev, .slider--next').show();

    if (!$filteredItems.length) {
      return;
    }

    var startIndex = 0;
    if ($primaryItem.length) {
      startIndex = $filteredItems.index($primaryItem);
      if (startIndex < 0) {
        startIndex = 0;
      }
    }

    setSliderWindow($filteredItems, startIndex);
  }

  window.applySliderFilter = applySliderFilter;

  // DOMMouseScroll included for firefox support
  var canScroll = true,
      scrollController = null;
  $(this).on('mousewheel DOMMouseScroll', function(e){

    if (!enableAutoSectionNavigation) {
      return;
    }

    if (!($('.outer-nav').hasClass('is-vis'))) {

      var isDevisActive = $('.main-content .section--is-active').attr('id') === 'devis';
      if (isDevisActive) {
        return;
      }

      e.preventDefault();

      var delta = (e.originalEvent.wheelDelta) ? -e.originalEvent.wheelDelta : e.originalEvent.detail * 20;

      if (delta > 50 && canScroll) {
        canScroll = false;
        clearTimeout(scrollController);
        scrollController = setTimeout(function(){
          canScroll = true;
        }, 800);
        updateHelper(1);
      }
      else if (delta < -50 && canScroll) {
        canScroll = false;
        clearTimeout(scrollController);
        scrollController = setTimeout(function(){
          canScroll = true;
        }, 800);
        updateHelper(-1);
      }

    }

  });

  $('.side-nav li, .outer-nav li').click(function(){

    if (!($(this).hasClass('is-active'))) {

      var $this = $(this),
          curActive = $this.parent().find('.is-active'),
          curPos = $this.parent().children().index(curActive),
          nextPos = $this.parent().children().index($this),
          lastItem = $(this).parent().children().length - 1;

      updateNavs(nextPos);
      updateContent(curPos, nextPos, lastItem);

    }

  });

  $('.cta').click(function(){

    var curActive = $('.side-nav').find('.is-active'),
        curPos = $('.side-nav').children().index(curActive),
        lastItem = $('.side-nav').children().length - 1,
        nextPos = lastItem;

    updateNavs(lastItem);
    updateContent(curPos, nextPos, lastItem);

  });

  // swipe support for touch devices
  var targetElement = document.getElementById('viewport'),
      mc = new Hammer(targetElement);
  mc.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
  mc.on('swipeup swipedown', function(e) {
    if (!enableAutoSectionNavigation) {
      return;
    }

    updateHelper(e);

  });

  $(document).keyup(function(e){
    if (!enableAutoSectionNavigation) {
      return;
    }

    if (!($('.outer-nav').hasClass('is-vis'))) {
      e.preventDefault();
      updateHelper(e);
    }

  });

  // determine scroll, swipe, and arrow key direction
  function updateHelper(param) {

    var curActive = $('.side-nav').find('.is-active'),
        curPos = $('.side-nav').children().index(curActive),
        lastItem = $('.side-nav').children().length - 1,
        nextPos = 0;

    if (param.type === "swipeup" || param.keyCode === 40 || param > 0) {
      if (curPos !== lastItem) {
        nextPos = curPos + 1;
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
      else {
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
    }
    else if (param.type === "swipedown" || param.keyCode === 38 || param < 0){
      if (curPos !== 0){
        nextPos = curPos - 1;
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
      else {
        nextPos = lastItem;
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
    }

  }

  // sync side and outer navigations
  function updateNavs(nextPos) {

    $('.side-nav, .outer-nav').children().removeClass('is-active');
    $('.side-nav').children().eq(nextPos).addClass('is-active');
    $('.outer-nav').children().eq(nextPos).addClass('is-active');

  }

  // update main content area
  function updateContent(curPos, nextPos, lastItem) {

    $('.main-content').children().removeClass('section--is-active');
    $('.main-content').children().eq(nextPos).addClass('section--is-active');
    $('.main-content .section').children().removeClass('section--next section--prev');

    if (curPos === lastItem && nextPos === 0 || curPos === 0 && nextPos === lastItem) {
      $('.main-content .section').children().removeClass('section--next section--prev');
    }
    else if (curPos < nextPos) {
      $('.main-content').children().eq(curPos).children().addClass('section--next');
    }
    else {
      $('.main-content').children().eq(curPos).children().addClass('section--prev');
    }

    if (nextPos !== 0 && nextPos !== lastItem) {
      $('.header--cta').addClass('is-active');
    }
    else {
      $('.header--cta').removeClass('is-active');
    }

    var activeSectionId = $('.main-content').children().eq(nextPos).attr('id');
    if (activeSectionId === 'devis') {
      $('#devis .hire').scrollTop(0);
    }

    if (activeSectionId && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + activeSectionId);
    }

  }

  function goToSectionByHash() {

    var hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    var nextPos = sectionIds.indexOf(hash);

    if (nextPos === -1) {
      return;
    }

    var curActive = $('.side-nav').find('.is-active');
    var curPos = $('.side-nav').children().index(curActive);
    var lastItem = $('.side-nav').children().length - 1;

    updateNavs(nextPos);
    updateContent(curPos, nextPos, lastItem);
  }

  function outerNav() {

    $('.header--nav-toggle').click(function(){

      $('.perspective').addClass('perspective--modalview');
      setTimeout(function(){
        $('.perspective').addClass('effect-rotate-left--animate');
      }, 25);
      $('.outer-nav, .outer-nav li, .outer-nav--return').addClass('is-vis');

    });

    $('.outer-nav--return, .outer-nav li').click(function(){

      $('.perspective').removeClass('effect-rotate-left--animate');
      setTimeout(function(){
        $('.perspective').removeClass('perspective--modalview');
      }, 400);
      $('.outer-nav, .outer-nav li, .outer-nav--return').removeClass('is-vis');

    });

  }

  function workSlider() {

    $('.slider--prev, .slider--next').click(function() {

      var $this = $(this),
          $visibleItems = getVisibleSliderItems(),
          totalWorks = $visibleItems.length,
          leftPos = $visibleItems.index($visibleItems.filter('.slider--item-left').first()),
          centerPos = $visibleItems.index($visibleItems.filter('.slider--item-center').first()),
          rightPos = $visibleItems.index($visibleItems.filter('.slider--item-right').first());

      if (!totalWorks) {
        return;
      }

      if (leftPos === -1 || centerPos === -1 || rightPos === -1) {
        setSliderWindow($visibleItems, 0);
        leftPos = 0;
        centerPos = totalWorks > 1 ? 1 : 0;
        rightPos = totalWorks > 2 ? 2 : centerPos;
      }

      $('.slider').animate({ opacity : 0 }, 400);

      setTimeout(function(){

      if ($this.hasClass('slider--next')) {
        setSliderWindow($visibleItems, (leftPos + 1) % totalWorks);
      }
      else {
        setSliderWindow($visibleItems, (leftPos - 1 + totalWorks) % totalWorks);
      }

    }, 400);

    $('.slider').animate({ opacity : 1 }, 400);

    });

  }

  function transitionLabels() {

    $('.work-request--information input, .work-request--information textarea').focusout(function(){

      var textVal = $(this).val();

      if (textVal === "") {
        $(this).removeClass('has-value');
      }
      else {
        $(this).addClass('has-value');
      }

      // correct mobile device window position
      window.scrollTo(0, 0);

    });

  }

  outerNav();
  workSlider();
  transitionLabels();
  goToSectionByHash();

  $(window).on('hashchange', function() {
    goToSectionByHash();
  });

});

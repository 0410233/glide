;(function($, Glide) {
  "use strict";

  if (!$ || !Glide) {
    console.error('JQuery and Glide is required.');
    return;
  }

  $.extend(Glide.prototype, {
    isStart: function() {
      return this._c.Run.isStart();
    },
    isEnd: function() {
      return this._c.Run.isEnd();
    },
    emit: function(event) {
      event && this._e.emit(event);
    },
    goto: function(index) {
      this.go('='+index);
    },
  });

  Object.defineProperty(Glide.prototype, 'count', {
    get: function() {
      return this._c.Run.length + 1;
    },
  });

  function isThumbsLike(thumbs) {
    return thumbs && (thumbs instanceof Object)
      && (typeof thumbs.goto === 'function')
      && (typeof thumbs.on === 'function')
      && (typeof thumbs.index === 'number');
  }

  $.fn.glide = function(options) {
    if (!this.length || !(this[0] instanceof HTMLElement)) return;

    // 补全选项
    options = $.extend({
      type: 'carousel',
      animationDuration: 500,
    }, options);

    if (options.rewind == null) {
      if (options.loop != null) {
        options.rewind = !!options.loop;
      } else if (options.type === 'carousel') {
        options.rewind = true;
      }
    }

    if (options.focusAt == null && options.center) {
      options.focusAt = 'center';
    }

    let $slides = this.find('.glide__slide');
    $slides.each(function(index) {
      this.setAttribute('data-index', index);
    });

    let $slidesWrapper = $slides.parent();
    if (! $slidesWrapper.hasClass('glide__slides')) {
      $slidesWrapper = $('<div class="glide__slides">').appendTo($slidesWrapper);
      $slides.appendTo($slidesWrapper);
    }

    let $track = $slidesWrapper.parent();
    if (! $track.hasClass('glide__track')) {
      $slidesWrapper.wrap('<div class="glide__track">');
      $track = $slidesWrapper.parent();
    }
    $track.attr('data-glide-el', 'track');

    // 补全左右切换按钮
    if (options.arrows && !this.find('.glide__arrows').length) {
      $('<div class="glide__arrows" data-glide-el="controls">' +
        '\n  <button class="glide__arrow glide__arrow--left" data-glide-dir="<">Prev</button>' +
        '\n  <button class="glide__arrow glide__arrow--right" data-glide-dir=">">Next</button>' +
        '\n</div>').appendTo(this);
    }

    // 补全点状导航
    if (options.dots && !this.find('.glide__bullets').length) {
      let bulletsHtml = '<div class="glide__bullets" data-glide-el="controls[nav]">';
      for (let i = 0; i < $slides.length; i++) {
        bulletsHtml += `\n  <button class="glide__bullet" data-glide-dir="=${i}"></button>`;
      }
      bulletsHtml += '\n</div>';

      $(bulletsHtml).appendTo(this);
    }

    let glide = new Glide(this[0], options);

    if (isThumbsLike(options.thumbs)) {
      let thumbs = options.thumbs;
      glide.on('run', function() {
        if (thumbs.index !== glide.index) {
          thumbs.goto(glide.index);
        }
      });
      thumbs.on('run', function() {
        if (glide.index !== thumbs.index) {
          glide.goto(thumbs.index);
        }
      });

      $(thumbs._c.Html.root).on('click', '.glide__slide', function() {
        const index = this.getAttribute('data-index');
        // console.log(this)
        glide.goto(index);
        thumbs.goto(index);
      });
    }

    glide.mount();

    return glide;
  };
})(window.$ || window.jQuery, window.Glide);

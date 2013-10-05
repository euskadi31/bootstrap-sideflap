/**
 * Bootstrap SideFlap
 */

+function($) { "use strict";

    // MODAL CLASS DEFINITION
    // ======================

    var SideFlap = function(element, options) {
        this.options   = options;
        this.$element  = $(element);
        this.$backdrop = null;
        this.isShown   = null;

        if (this.options.remote) {
            this.$element.load(this.options.remote);
        }
    };

    SideFlap.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    SideFlap.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    SideFlap.prototype.show = function(_relatedTarget) {
        var that = this;
        var e    = $.Event('show.bs.sideflap', {
            relatedTarget: _relatedTarget
        });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.sideflap', '[data-dismiss="sideflap"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass('fade');

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move sideflaps dom position
            }

            that.$element.show();

            if (transition) {
                that.$element[0].offsetWidth; // force reflow
            }

            that.$element.addClass('in').attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.bs.sideflap', {
                relatedTarget: _relatedTarget
            });

            transition ?
                that.$element.find('.sideflap-dialog') // wait for sideflap to slide in
                .one($.support.transition.end, function() {
                    that.$element.focus().trigger(e);
                })
                .emulateTransitionEnd(300) : that.$element.focus().trigger(e);
        });
    };

    SideFlap.prototype.hide = function(e) {
        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.bs.sideflap');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.bs.sideflap');

        this.$element
            .removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.sideflap');

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
                .one($.support.transition.end, $.proxy(this.hideSideFlap, this))
                .emulateTransitionEnd(300) : this.hideSideFlap();
    };

    SideFlap.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.bs.sideflap') // guard against infinite focus loop
            .on('focusin.bs.sideflap', $.proxy(function(e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    SideFlap.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.bs.sideflap', $.proxy(function(e) {
                e.which == 27 && this.hide();
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.bs.sideflap');
        }
    };

    SideFlap.prototype.hideSideFlap = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function() {
            that.removeBackdrop();
            that.$element.trigger('hidden.bs.sideflap');
        });
    };

    SideFlap.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    };

    SideFlap.prototype.backdrop = function(callback) {
        var that    = this;
        var animate = this.$element.hasClass('fade') ? 'fade' : '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="sideflap-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.sideflap', $.proxy(function(e) {
                if (e.target !== e.currentTarget) {
                    return;
                }

                this.options.backdrop == 'static' ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this);
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // force reflow
            }

            this.$backdrop.addClass('in');

            if (!callback) {
                return;
            }

            doAnimate ?
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150) : callback();

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in');

            $.support.transition && this.$element.hasClass('fade')?
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150) : callback();

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.sideflap;

    $.fn.sideflap = function(option, _relatedTarget) {
        return this.each(function() {
            var $this   = $(this);
            var data    = $this.data('bs.sideflap');
            var options = $.extend({}, SideFlap.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('bs.sideflap', (data = new SideFlap(this, options)));
            }

            if (typeof option == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.sideflap.Constructor = SideFlap;


    // MODAL NO CONFLICT
    // =================

    $.fn.sideflap.noConflict = function() {
        $.fn.sideflap = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.bs.sideflap.data-api', '[data-toggle="sideflap"]', function(e) {
        var $this   = $(this);
        var href    = $this.attr('href');
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); //strip for ie7
        var option  = $target.data('sideflap') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        e.preventDefault();

        $target
            .sideflap(option, this)
            .one('hide', function() {
                $this.is(':visible') && $this.focus();
            });
    });

    $(document)
        .on('show.bs.sideflap',  '.sideflap', function() {
            $(document.body).addClass('sideflap-open');
        })
        .on('hidden.bs.sideflap', '.sideflap', function() {
            $(document.body).removeClass('sideflap-open');
        });

}(window.jQuery);

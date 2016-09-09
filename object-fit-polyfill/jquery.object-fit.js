;(function($, window, document, undefined) {
	'use strict';
	var pluginName = 'objectFit';
	var defaults = {
		debug: false,
		fit: 'cover',
		position: '50% 50%'
	};
	function Plugin(element, options) {
		this.$element = $(element);
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	};
	$.extend(Plugin.prototype, {
		init: function() {
			var self = this;
			this.wrapPresents();
			this.calculateDimensions();
			$(window).on('resize', function() {
				self.calculateDimensions();
			});
		},
		wrapPresents: function() {
			const $wrapper = $('<x-fit>').css({
				'overflow': 'hidden',
				'display': 'block',
				'height': '100%'
			});
			this.$element.wrap($wrapper);
			this.$element.attr('data-width', this.$element.width()).attr('data-height', this.$element.height());
			this.$wrapper = this.$element.parent('x-fit');
		},
		calculateDimensions: function() {
			var calculatedWidth = 0,
			    calculatedHeight = 0, 
			    xOffset = 0, 
			    yOffset = 0;
			this.containerWidth = this.$wrapper.parent().width();
			this.containerHeight = this.$wrapper.parent().height();
			this.containerRatio = this.containerWidth / this.containerHeight;
			this.$wrapper.css({
				'width': this.containerWidth + 'px', 
				'height': this.containerHeight + 'px'
			});
			var testImage = new Image();
			testImage.src = this.$element.attr('src');
			this.imageWidth = testImage.naturalWidth;
			this.imageHeight = testImage.naturalHeight;
			this.imageRatio = this.imageWidth / this.imageHeight;
			if(this.settings.debug) console.log("Container ratio:", this.containerRatio, "Image ratio:", this.imageRatio);
			if(this.containerRatio >= this.imageRatio) {
				calculatedWidth = this.containerWidth;
				calculatedHeight = Math.round(this.containerWidth / this.imageRatio);
			}
			else {
				calculatedWidth = Math.round(this.containerHeight * this.imageRatio);
				calculatedHeight = this.containerHeight;
			};
			if(calculatedWidth > this.containerWidth) {
				xOffset = 0 - ((calculatedWidth - this.containerWidth) / 2);
			};
			if(calculatedHeight > this.containerHeight) {
				yOffset = 0 - ((calculatedHeight - this.containerHeight) / 2);
			};
			this.$element.css({
				'width': calculatedWidth,
				'height': calculatedHeight,
				'margin-top': yOffset,
				'margin-left': xOffset,
				'max-width': 'none'
			});
			if(this.settings.debug) console.log("Calculated width:", calculatedWidth, "Calculated height:", calculatedHeight);
		}
	});
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	}
})(jQuery, window, document);
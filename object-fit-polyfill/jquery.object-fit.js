;(function($, window, document, undefined) {
	"use strict";
	var pluginName = "imageCover";
	var defaults = {
		debug: false
	};
	function Plugin(element, options) {
		this.$element = $(element);
		this.identifier = "[IC" + Math.round((Math.random() * 1000) + 1000) + "]";
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}
	$.extend(Plugin.prototype, {
		init: function() {
			if(this.settings.debug) console.log(this.identifier, "ObjectFit polyfill initialised for " + this.$element.attr("src"));
			this.workMagic();
		},
		workMagic: function() {
			var containerWidth,
			    containerHeight,
			    containerRatio,
			    imageWidth,
			    imageHeight,
			    imageRatio,
			    calculatedWidth,
			    calculatedHeight,
			    xOffset,
			    yOffset;
			this.$element.wrap("<x-cover></x-cover>");
			containerWidth = this.$element.parent("x-cover").width();
			containerHeight = this.$element.parent("x-cover").height();
			containerRatio = containerWidth / containerHeight;
			var testImage = new Image();
			testImage.src = this.$element.attr("src");
			imageWidth = testImage.naturalWidth;
			imageHeight = testImage.naturalHeight;
			imageRatio = imageWidth / imageHeight;
			if(this.settings.debug) console.log(this.identifier, "Container ratio: " + containerRatio + ". Image ratio: " + imageRatio + ".");
			if(containerRatio >= imageRatio) {
				calculatedWidth = containerWidth;
				calculatedHeight = Math.round(containerWidth / imageRatio);
			}
			else {
				calculatedWidth = Math.round(containerHeight * imageRatio);
				calculatedHeight = containerHeight;
			}
			if(calculatedWidth > containerWidth) {
				xOffset = 0 - ((calculatedWidth - containerWidth) / 2);
			}
			if(calculatedHeight > containerHeight) {
				yOffset = 0 - ((calculatedHeight - containerHeight) / 2);
			}
			this.$element.css({
				"width": calculatedWidth,
				"height": calculatedHeight,
				"margin-top": yOffset,
				"margin-left": xOffset
			});
			if(this.settings.debug) console.log(this.identifier, "Calcualted width: " + calculatedWidth + ". Calculated height: " + calculatedHeight + ".");
		}
	});
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
/*
 * jQuery Tags Input 2.0.0
 *
 * Developed by Kimberly Grey
 * https://github.com/querkmachine
 *
 * Based on the one built by XOXCO, Inc. 
 * http://xoxco.com/clickable/jquery-tags-input
 *
 * Licensed under the MIT licence:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */

;(function($, window, document, undefined) {
	'use strict';
	const pluginName = 'tagsInput';
	const defaults = {
		classes: {
			container: 'tag-input',
			tagContainer: 'tag-input__tag-list',
			tag: 'tag-input__tag',
			tagLabel: 'tag-input__label',
			tagRemove: 'tag-input__remove',
			form: 'tag-input__form',
			formLabel: 'screenreader',
			formInput: 'tag-input__input',
			formInputInvalid: 'tag-input__input--invalid'
		},
		interactive: true,
		defaultText: 'add a tag',
		minChars: 0,
		maxChars: false,
		autoComplete: { 
			url: '',
			selectFirst: false 
		},
		hide: true,
		delimiter: ',',
		unique: true,
		removeWithBackspace: true,
		autosize: true,
		comfortZone: 20,
		debug: false
	};
	function Plugin(element, options) {
		this.$element = $(element);
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.id = `${pluginName}-${Math.random().toString(36).substring(6)}`;

		this.callbacks = [];

		// Don't init if it's already been done 
		if(typeof this.$element.data(`${pluginName}-init`) !== 'undefined') {
			return;
		};
		this.init();
	};
	$.extend(Plugin.prototype, {
		init: function() {
			this.$element.data(`${this._name}-init`, true);

			// Setting up callbacks
			if(this.settings.onAddTag || this.settings.onRemoveTag || this.settings.onChange) {
				this.callbacks['onAddTag'] = this.settings.onAddTag;
				this.callbacks['onRemoveTag'] = this.settings.onRemoveTag;
				this.callbacks['onChange'] = this.settings.onChange;
			}

			// Hide the defaut text input
			if(this.settings.hide) {
				this.$element.hide();
			};

			// Generate initial markup
			let $container,
			    $tagContainer,
			    $form,
			    $formLabel,
			    $formInput;
			$container = $('<div/>', {
				'class': this.settings.classes.container
			});
			$tagContainer = $('<div/>', {
				'class': this.settings.classes.tagContainer
			});
			this.$container = $container;
			this.$tagContainer = $tagContainer;
			$container.append($tagContainer);
			if(this.settings.interactive) {
				$form = $('<div/>', {
					'class': this.settings.classes.form
				});
				$formLabel = $('<label/>', {
					'class': this.settings.classes.formLabel,
					'text': this.settings.defaultText,
					'for': this.id
				});
				$formInput = $('<input/>', {
					'class': this.settings.classes.formInput,
					'placeholder': this.settings.defaultText,
					'type': 'text',
					'id': this.id
				});
				this.$form = $form;
				this.$formLabel = $formLabel;
				this.$formInput = $formInput;
				$form.append($formLabel).append($formInput);
				$container.append($form);
			}

			// Populate any tags already set
			if(this.$element.val() != '') {
				this.importTags(this.$element, this.$element.val());
			};

			if(this.settings.interactive) {
				this.resetAutosize();

				// Focus the input if the user clicks anywhere on the control
				$container.on('click', () => {
					$formInput.trigger('focus');
				});

				// If autocomplete is used... *UNTESTED*
				if(typeof this.settings.autoComplete.url !== 'undefined') {
					if(typeof jQuery.Autocompleter !== 'undefined') {
						$formInput.autocomplete(this.settings.autoComplete.url, this.settings.autoComplete);
						$formInput.on('result', (e, data, formatted) => {
							if(data) {
								this.addTag(`${data[0]}`, {
									focus: true,
									unique: this.settings.unique
								});
							};
						});
					}
					else if(typeof jQuery.ui !== 'undefined' && typeof jQuery.ui.autocomplete !== 'undefined') {
						$formInput.autocomplete(this.settings.autoComplete);
						$formInput.on('autocompleteselect', (e, ui) => {
							this.addTag(ui.item.value, {
								focus: true,
								unique: this.settings.unique
							});
							return false;
						});
					}
				}

				// If the user presses the key for a delimiter character (e.g. a comma), add a tag
				$formInput.on('keypress', (e) => {
					if(this.checkDelimiter(e)) {
						e.preventDefault();
						if((this.settings.minChars) <= $formInput.val().length && (!this.settings.maxChars || this.settings.maxChars >= $formInput.val().length)) {
							this.addTag($formInput.val(), {
								focus: true,
								unique: this.settings.unique
							});
						}
						this.resetAutosize();
						return false;
					}
					else if(this.settings.autosize) {
						this.doAutosize();
					}
				});

				// If the user presses backspace on an empty input, delete the last tag
				if(this.settings.removeWithBackspace) {
					$formInput.on('keydown', (e) => {
						if(e.which === 8 && $formInput.val() === '') {
							e.preventDefault();
							const lastTag = this.$tagContainer.find(`.${this.settings.classes.tag}:last .${this.settings.classes.tagLabel}`).text();
							this.removeTag(lastTag);
							$formInput.trigger('focus');
						}
					});
				}

				// Remove input error style if input value gets changed
				if(this.settings.unique) {
					$formInput.on('keydown', (e) => {
						$formInput.removeClass(this.settings.classes.formInputInvalid);
					});
				}
			};

			// Add code to the DOM finally
			this.$element.after($container);
		},
		doAutosize: function() {
			if(this.settings.debug) console.log('doAutosize')
			if(this.$formInput.val() === '') { return; }
			this.$formInput.on('keyup paste', (e) => {
				const width = $(`#${this.id}-tester`).html(this.$formInput.val()).width() + this.settings.comfortZone;
				this.$formInput.width(width);
			});
		},
		resetAutosize: function() {
			if(this.settings.debug) console.log('resetAutosize')
			if(!$(`#${this.id}-tester`).length) {
				const $formInputDummy = $('<span/>').css({
					'position': 'fixed',
					'bottom': '0',
					'left': '0',
					'width': 'auto',
					'font-size': this.$formInput.css('font-size'),
					'font-family': this.$formInput.css('font-family'),
					'font-weight': this.$formInput.css('font-weight'),
					'letter-spacing': this.$formInput.css('letter-spacing'),
					'white-space': 'nowrap'
				}).attr('id', `${this.id}-tester`);
				$('body').append($formInputDummy);
				return;
			};
			$(`#${this.id}-tester`).css({'width': 'auto'});
		},
		addTag: function(value, options) {
			if(this.settings.debug) console.log('addTag', value, options);

			// Combine default options with those passed
			options = $.extend({
				focus: false,
				callback: false,
				unique: this.settings.unique
			}, options);

			// Set up tag array
			let tagsList = [];
			if(this.$element.val() != '') {
				tagsList = this.$element.val().split(this.settings.delimiter);
			};

			// Check if value actually has content
			value = $.trim(value);
			if(value === '') {
				return false;
			};

			// Check if the tag is unique or not, reject it if not
			if(options.unique) {
				const skipTag = this.tagExists(value);
				if(skipTag) {
					this.$formInput.addClass(this.settings.classes.formInputInvalid);
					return false;
				};
			};

			// Add markup for the new tag
			const $tag = $('<span/>', {
				'class': this.settings.classes.tag
			});
			const $tagLabel = $('<span/>', {
				'class': this.settings.classes.tagLabel,
				'text': value
			});
			const $tagRemove = $('<button/>', {
				'class': this.settings.classes.tagRemove,
				'type': 'button',
				'title': `Remove tag '${value}'`,
				'aria-label': `Remove tag '${value}'`,
				'text': 'Remove'
			}).on('click', (e) => {
				this.removeTag(value);
			});
			this.$tagContainer.append($tag.append($tagLabel).append($tagRemove));
			
			// Update tags list 
			tagsList.push(value);
			this.inputUpdate(this.$element, tagsList);

			// Manage focus
			this.$formInput.val('');
			if(options.focus) {
				this.$formInput.trigger('focus');
			}
			else {
				this.$formInput.trigger('blur');
			};

			// Fire callbacks
			if(options.callbacks) {
				if(this.callbacks && this.callbacks['onAddTag']) {
					let func = this.callbacks['onAddTag'];
					func.call(this, value);
				}
				if(this.callbacks && this.callbacks['onChange']) {
					let func = this.callbacks['onChange'];
					func.call(this, this.$element, tagsList[tagsList.length - 1]);
				}
			}

		},
		removeTag: function(value) {
			if(this.settings.debug) console.log('removeTag', value)

			// Remove all the visible tags
			value = unescape(value);
			this.$tagContainer.children().remove();

			// Build a new tag string, ommitting the one that's to be removed
			const old = this.$element.val().split(this.settings.delimiter);
			let str = '';
			for(let i = 0; i < old.length; i++) {
				if(old[i] !== value) {
					str += this.settings.delimiter + old[i];
				}
			}
			this.importTags(this.$element, str);

			// Fire callback
			if(this.callbacks && this.callbacks['onRemoveTag']) {
				let func = this.callbacks['onRemoveTag'];
				func.call(this, value);
			}
		},
		tagExists: function(value) {
			if(this.settings.debug) console.log('tagExists', value)
			const tagsList = this.$element.val().split(this.settings.delimiter);
			return ($.inArray(value, tagsList) >= 0);
		},
		checkDelimiter: function(event) {
			if(this.settings.debug) console.log('checkDelimiter', event);
			if(event.which === 13 || event.which === this.settings.delimiter.charCodeAt(0)) {
				return true;
			};
			return false;
		},
		inputUpdate: function($object, tagsList) {
			if(this.settings.debug) console.log('inputUpdate', $object, tagsList);
			$object.val(tagsList.join(this.settings.delimiter));
		},
		importTags: function($object, value) {
			if(this.settings.debug) console.log('importTags', $object, value);
			$object.val('');

			// Split up delimited list of tags and process them individually
			const tags = value.split(this.settings.delimiter);
			for(let i = 0; i < tags.length; i++) {
				this.addTag(tags[i], {
					focus: false,
					callback: false
				});
			};
		}
	});
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, `plugin_${pluginName}`)) {
				$.data(this, `plugin_${pluginName}`, new Plugin(this, options));
			};
		});
	};
})(jQuery, window, document);

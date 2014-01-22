;(function(exports) {
	var schema = {
		_handlers: {}
	};
	var ua = navigator.userAgent;
	var platform = schema.platform = /ip(ad|od|hone)/i.test(ua) ? 'ios'
		: /android/i.test(ua) ? 'android'
		: /Windows Phone/i.test(ua) ? 'windows phone'
		: 'desktop';
	var browser = schema.browser = /Chrome/i.test(ua) ? 'chrome'
		: /Firefox/i.test(ua) ? 'firefox'
		: /Safari/i.test(ua) ? 'safari'
		: /Opera/i.test(ua) ? 'opera'
		: /MSIE|Trident/i.test(ua) ? 'iexplorer'
		: 'other';

	var parse_url = function(url) {
		var pattern = /^(?=[^&])(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/;
		var match = pattern.exec(url);
		return {
			scheme: match[1],
			host: match[2],
			path: match[3],
			query: (function(query) {
				var qa = {};
				query = decodeURIComponent(query);
				query.replace(/([^=]+)=([^&]*)(&|$)/g, function(){
					qa[arguments[1]] = arguments[2];
					return arguments[0];
				});
				return qa;
			})(match[4]),
			fragment: match[5],
			toString: function() { return url; }
		};
	};

	schema.register = function(protocol, fallbacks) {
		var fn = function(event_or_url) {
			var href = '';
			if (typeof event_or_url === 'string') {
				href = event_or_url;
			} else {
				event_or_url.preventDefault();
				var a = $(this);
				var href = a.attr('href');
			}
			var fallback = function() {
				var components = parse_url(href);
				var url, handler = fallbacks[platform];
				if (typeof handler == 'function') {
					url = handler(components);
				} else {
					url = handler.replace(/{([^}]+)}/g, function(match, p1) {
						if (p1 in components.query) return components.query[p1];
						if (p1 in components) return components[p1];
						return p1;
					});
				}
				if (url) top.location.href = url;
			};
			var timer, iframe;
			if (platform == 'ios' && 'ios' in fallbacks) {
				timer = setTimeout(function() {
					fallback();
					clearTimeout(timer);
				}, 35);
				location.href = href;
			} else if (platform == 'android' && 'android' in fallbacks) {
				if (browser == 'chrome') {
					timer = setTimeout(function() {
						fallback();
						clearTimeout(timer);
					}, 1000);
				} else {
					iframe = $('<iframe>')
						.attr('src', href)
						.hide().on('load', fallback).appendTo('body');
				}
				location.href = href;
			} else {
				if ('web' in fallbacks && !('desktop' in fallbacks)) {
					fallbacks['desktop'] = fallbacks['web'];
				}
				fallback();
			}
		};
		schema._handlers[protocol] = fn;
		var pattern = '[href^="' + protocol + '"]';
		$(document).off('click', pattern, fn)
			.on('click', pattern, fn);
	};

	schema.navigate = function(url) {
		for (var protocol in schema._handlers) {
			if (url.substring(0, protocol.length) == protocol) {
				schema._handlers[protocol](url);
				return;
			}
		}
		location.href = url;
	}

	exports.schema = schema;
	exports.register_schema = schema.register;
})(this);

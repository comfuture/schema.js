!(function() {
	var schemas = {};
	var ua = navigator.userAgent;
	var platform = /ip(ad|od|hone)/i.test(ua) ? 'ios'
		: /android/i.test(ua) ? 'android' : 'web';

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

    this.register_schema = function(schema, fallbacks) {
		var links = $('[href^="' + schema + '"]');
		links.off('click').on('click', function(event) {
			event.preventDefault();
			var a = $(this);
			var href = a.attr('href');
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
			if (platform == 'ios' && 'ios' in fallbacks) {
				var timer = setTimeout(function() {
					fallback();
					clearTimeout(timer);
				}, 35);
				location.href = href;
			} else if (platform == 'android' && 'android' in fallbacks) {
				var iframe = $('<iframe>')
					.attr('src', href)
					.hide().on('load', fallback).appendTo('body');
			} else if ('web' in fallbacks) {
				fallback();
			}
		});
	};
})(this);



YUI.add('lazyloaditem', function(Y) {
	
	var DEF_PARSER = function(content) {
		return content;
	};
	
	Y.LazyLoadItem = function() {
		Y.LazyLoadItem.superclass.constructor.apply(this, arguments);
	};
	
	Y.LazyLoadItem.NAME = 'lazyloaditem';
	
	Y.LazyLoadItem.ATTRS = {
		itemId: {
			value: null
		},
		container: {
			value: null,
			setter: Y.one
		},
		loaded: {
			value: false
		},
		loading: {
			value: false
		},
		source: {
			value: null
		},
		parser: {
			value: DEF_PARSER,
			validator: Y.Lang.isFunction
		}
	};
	
	Y.extend(Y.LazyLoadItem, Y.Base, {
		
		initializer: function() {
			this.publish('load', {
				emitFacade: true,
				defaultFn: this._defLoadFn
			});
			this.publish('contentready', {
				emitFacade: true,
				defaultFn: this._defContentreadyFn
			});
			this.set('itemId', Y.guid(Y.LazyLoadItem.NAME + '-'));
			this._itemId = this.get('itemId');
			this._container = this.get('container');
			this._container.addClass('yui3-lazyloaditem-container');
		},
		
		destructor: function() {
			this.detach();
		},
		
		load: function() {
			if (this.get('loaded') || this.get('loading') || !this._container) { return false; }
			this._container.addClass('yui3-lazyloaditem-loading');
			this.set('loading', true);
			this.loadContent();
		},
		
		fetch: function(within) {
			if (this.get('loaded') || this.get('loading') || !this._container || !within || (!within.withinX && !within.withinY)) { return false; }
			
			var XY = this._container.getXY(),
				isWithinX = true,
				isWithinY = true;
				
			if (within.withinX && within.withinX < XY[0]) {
				isWithinX = false;
			}
			
			if (within.withinY && within.withinY < XY[1]) {
				isWithinY = false;
			}
			
			if (isWithinX && isWithinY) {
				this.load();
			}
		},
		
		loadContent: function() {
			var source = this.get('source');
			
			if (!source) {
				this._loadDOMContent();
			} else if (source.url) {
				if (source.url.indexOf('{callback}') > -1) {
					this._loadJSONPContent(source.url, source.cfg);
				} else {
					this._loadIOContent(source.url, source.cfg);
				}
			}
		},
		
		_loadDOMContent: function() {
			var lazyNode = this._container.one('.yui3-lazyloaditem-lazynode'),
				content;
			
			if (!lazyNode) { return false; }
			
			content = lazyNode.get(lazyNode.get('tagName') === 'textarea' ? 'value' : 'innerHTML').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');
			this._contentReady(content);
		},
		
		_loadIOContent: function(url, cfg) {
			var self = this;
			if (!Y.io) { return false; }
			cfg = cfg || {};
			cfg.on = cfg.on || {};
			cfg.on.success = function(id, r) {
				if (r && r.responseText) {
					self._contentReady(r.responseText);
				}
			};
			Y.io(url, cfg);
		},
		
		_loadJSONPContent: function(url, cfg) {
			var self = this;
			if (!Y.jsonp) { return false; }
			cfg = cfg || {};
			cfg.on = cfg.on || {};
			cfg.on.success = function() {
				var args = Y.Array(arguments);
				if (args.length) {
					self._contentReady(args);
				}
			};
			Y.jsonp(url, cfg);
		},
		
		_contentReady: function(content) {
			var parser = this.get('parser');
			if (content) {
				this.fire('contentready', {
					content: parser.call(this, content)
				});
			}
		},
		
		insert: function(content) {
			var match = Y.ExecScript.matchScript(content),
				html = match.html,
				scripts = match.scripts;
				
			this._container.appendChild(Y.Node.create(html));
			while (scripts.length) {
				Y.ExecScript.exec(scripts.shift());
			}
		},
		
		_defLoadFn: function(e) {
			this.insert(e.content);
			this._container.removeClass('yui3-lazyloaditem-loading');
			this._container.addClass('yui3-lazyloaditem-loaded');
			this.set('loading', false);
			this.set('loaded', true);
		},
		
		_defContentreadyFn: function(e) {
			this.fire('load', {
				content: e.content
			});
		}
		
	});
	
}, '0.0.1', {
	requires: ['node-base', 'base']
});

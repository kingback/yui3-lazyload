/*
 * YUI3懒加载对象组件
 * why don't give it a try ?
 * @class lazyloaditem
 * @author ningzbruc@gmail.com
 * @date 2012-07-10
 * @version 0.0.1
 */

YUI.add('lazyloaditem', function(Y) {

/**
 * YUI3懒加载对象组件
 * @module lazyloaditem
 */
	
	/**
	 * 内容处理函数
	 * @property DEF_PARSER
	 * @static
	 */
	var DEF_PARSER = function(content) {
		return content;
	};
	
	/**
	 * YUI3懒加载组件对象构造函数
	 * @class LazyLoadItem
	 * @constructor
	 * @extends Base
	 */
	Y.LazyLoadItem = function() {
		Y.LazyLoadItem.superclass.constructor.apply(this, arguments);
	};
	
	/**
	 * 懒加载对象组件名字
	 * @property NAME
	 * @type {String}
	 * @static
	 */
	Y.LazyLoadItem.NAME = 'lazyloaditem';
	
	/**
	 * 懒加载对象配置属性
	 * @property ATTRS
	 * @type {Object}
	 * @static
	 */
	Y.LazyLoadItem.ATTRS = {
		
		/**
		 * 对象id
		 * @attribute itemId
		 * @default null
		 * @type string
		 */
		itemId: {
			value: null
		},
		
		/**
		 * 懒加载内容容器
		 * @attribute container
		 * @default null
		 * @type node
		 */
		container: {
			value: null,
			setter: Y.one
		},
		
		/**
		 * 是否加载完毕
		 * @attribute loaded
		 * @default false
		 * @type boolean
		 */
		loaded: {
			value: false
		},
		
		/**
		 * 是否正在加载
		 * @attribute loading
		 * @default false
		 * @type boolean
		 */
		loading: {
			value: false
		},
		
		/**
		 * 异步请求地址
		 * @attribute source
		 * @default null
		 * @type string
		 */
		source: {
			value: null
		},
		
		/**
		 * 异步请求地址
		 * @attribute parser
		 * @default DEF_PARSER
		 * @type function
		 */
		parser: {
			value: DEF_PARSER,
			validator: Y.Lang.isFunction
		},
		
		/**
		 * 是否加载内容中的脚本
		 * @attribute loadScript
		 * @default false
		 * @type boolean
		 */
		loadScript: {
			value: false,
			validator: Y.Lang.isBoolean
		}
	};
	
	//懒加载对象继承Base
	//懒加载对象原型扩充
	Y.extend(Y.LazyLoadItem, Y.Base, {
		
		/**
		 * 初始化懒加载对象
		 * @method initializer
		 */
		initializer: function() {
			//发布load事件
			this.publish('load', {
				emitFacade: true,
				defaultFn: this._defLoadFn
			});
			//发布contentready事件
			this.publish('contentready', {
				emitFacade: true,
				defaultFn: this._defContentreadyFn
			});
			this.set('itemId', Y.guid(Y.LazyLoadItem.NAME + '-'));
			this._itemId = this.get('itemId');
			this._container = this.get('container');
			this._container.addClass('yui3-lazyloaditem-container');
		},
		
		/**
		 * 销毁懒加载对象
		 * @method destructor
		 */
		destructor: function() {
			this.detach();
		},
		
		/**
		 * 加载懒加载内容
		 * @method load
		 * @return this
		 */
		load: function() {
			if (this.get('loaded') || this.get('loading') || !this._container) { return false; }
			this._container.addClass('yui3-lazyloaditem-loading');
			this.set('loading', true);
			this.loadContent();
			
			return this;
		},
		
		/**
		 * 检查对象是否在区域范围内
		 * @method fetch
		 * @param {Object} within 范围
		 * @return this
		 */
		fetch: function(within) {
			if (this.get('loaded') || this.get('loading') || !this._container || !within || (!within.withinX && !within.withinY)) { return false; }
			
			//强制直接加载
			if (within === true) {
				this.load();
				return this;
			}
			
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
			
			return this;
		},
		
		/**
		 * 加载内容
		 * @method loadContent
		 * @return this
		 */
		loadContent: function() {
			var source = this.get('source');
			
			if (!source) {
				//加载html内容
				this._loadDOMContent();
			} else if (source.url) {
				if (source.url.indexOf('{callback}') > -1) {
					//加载jsonp内容
					this._loadJSONPContent(source.url, source.cfg);
				} else {
					//加载ajax内容
					this._loadIOContent(source.url, source.cfg);
				}
			}
			
			return this;
		},
		
		/**
		 * 插入内容
		 * @method insert
		 * @param {String | Array} content 需要插入的内容
		 * @return this
		 */
		insert: function(content, relNode) {
			if (Y.Lang.isArray(content)) {
				Y.Array.each(content, function(c) {
					this.insert(c, relNode);
				}, this);
				return this;
			}
			
			if (Y.Lang.isObject(content)) {
				relNode = content.relNode;
				content = content.content;
			}
			
			var r = this.filterScripts(content),
				frag = r.frag,
				scripts = r.scripts;
				
			this._container.insertBefore(frag, relNode || null);
			this.get('loadScript') && this.insertScripts(scripts);
			
			return this;
		},
		
		/**
		 * 过滤脚本
		 * @method filterScripts
		 * @param {String} content 内容片段 
		 * @return {Object} 返回过滤后的内容片段及脚本
		 */
		filterScripts: function(content) {
			var frag = Y.Node.create(content),
				scripts = [];
				
			frag.all('script').each(function(s) {
				var _s = s._node,
					attrs = _s.attributes,
					src = _s.src,
					type = _s.type,
					n = document.createElement('script');
					
				if (!type || type == 'text/javascript') {
					if (!src) {
						n.text = _s.text;
					}
					Y.Array.each(attrs, function(attr) {
						n.setAttribute(attr.nodeName, attr.nodeValue);
					});
					scripts.push(n);
					frag.removeChild(s);
				}
			});
			
			return {
				frag: frag._node,
				scripts: scripts
			};
		},
		
		/**
		 * 插入脚本
		 * @method insertScripts
		 * @param {Array} scripts 需要加载的脚本数组
		 * @return this
		 */
		insertScripts: function(scripts) {
			var head = document.getElementsByTagName('head')[0];
				
			while (scripts.length) {
				head.appendChild(scripts.shift());
			}
			
			return this;
		},
		
		//TODO
		//容器内加载多个延迟加载的内容
		//只针对DOM Content？
		/**
		 * 加载html内容
		 * @method _loadDOMContent
		 */
		_loadDOMContent: function() {
			var lazyNodes = this._container.all('.yui3-lazyloaditem-lazynode'),
				content = [];
			
			if (!lazyNodes.size()) { return false; }
			
			lazyNodes.each(function(node) {
				content.push({
					relNode: node,
					content: Y.Lang.trim(node.get(node.get('tagName') === 'textarea' ? 'value' : 'innerHTML').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>'))
				});
			});
			
			this._contentReady(content);
		},
		
		/**
		 * 加载ajax内容
		 * @method _loadIOContent
		 * @param {String} url 请求地址
		 * @param {Object} cfg 请求参数
		 */
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
		
		/**
		 * 加载jsonp内容
		 * @method _loadJSONPContent
		 * @param {String} url 请求地址
		 * @param {Object} cfg 请求参数
		 */
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
		
		/**
		 * 内容准备完毕
		 * @method _contentReady
		 * @param {String} content 懒加载内容
		 */
		_contentReady: function(content) {
			var parser = this.get('parser');
			if (content) {
				this.fire('contentready', {
					content: parser.call(this, content)
				});
			}
		},
		
		/**
		 * 默认加载事件回调
		 * @method _defLoadFn
		 * @param {EventFacade} e 事件对象
		 */
		_defLoadFn: function(e) {
			this.insert(e.content);
			this._container.removeClass('yui3-lazyloaditem-loading');
			this._container.addClass('yui3-lazyloaditem-loaded');
			this.set('loading', false);
			this.set('loaded', true);
		},
		
		/**
		 * 默认内容加载完毕事件回调
		 * @method _defContentreadyFn
		 * @param {EventFacade} e 事件对象
		 */
		_defContentreadyFn: function(e) {
			this.fire('load', {
				content: e.content
			});
		}
		
	});
	
}, '0.0.1', {
	requires: ['node-base', 'base']
});

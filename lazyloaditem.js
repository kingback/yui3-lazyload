/*
 * YUI3�����ض������
 * why don't give it a try ?
 * @class lazyloaditem
 * @author ningzbruc@gmail.com
 * @date 2012-07-10
 * @version 0.0.1
 */

YUI.add('lazyloaditem', function(Y) {

/**
 * YUI3�����ض������
 * @module lazyloaditem
 */
	
	/**
	 * ���ݴ�����
	 * @property DEF_PARSER
	 * @static
	 */
	var DEF_PARSER = function(content) {
		return content;
	};
	
	/**
	 * YUI3��������������캯��
	 * @class LazyLoadItem
	 * @constructor
	 * @extends Base
	 */
	Y.LazyLoadItem = function() {
		Y.LazyLoadItem.superclass.constructor.apply(this, arguments);
	};
	
	/**
	 * �����ض����������
	 * @property NAME
	 * @type {String}
	 * @static
	 */
	Y.LazyLoadItem.NAME = 'lazyloaditem';
	
	/**
	 * �����ض�����������
	 * @property ATTRS
	 * @type {Object}
	 * @static
	 */
	Y.LazyLoadItem.ATTRS = {
		
		/**
		 * ����id
		 * @attribute itemId
		 * @default null
		 * @type string
		 */
		itemId: {
			value: null
		},
		
		/**
		 * ��������������
		 * @attribute container
		 * @default null
		 * @type node
		 */
		container: {
			value: null,
			setter: Y.one
		},
		
		/**
		 * �Ƿ�������
		 * @attribute loaded
		 * @default false
		 * @type boolean
		 */
		loaded: {
			value: false
		},
		
		/**
		 * �Ƿ����ڼ���
		 * @attribute loading
		 * @default false
		 * @type boolean
		 */
		loading: {
			value: false
		},
		
		/**
		 * �첽�����ַ
		 * @attribute source
		 * @default null
		 * @type string
		 */
		source: {
			value: null
		},
		
		/**
		 * �첽�����ַ
		 * @attribute parser
		 * @default DEF_PARSER
		 * @type function
		 */
		parser: {
			value: DEF_PARSER,
			validator: Y.Lang.isFunction
		}
	};
	
	//�����ض���̳�Base
	//�����ض���ԭ������
	Y.extend(Y.LazyLoadItem, Y.Base, {
		
		/**
		 * ��ʼ�������ض���
		 * @method initializer
		 */
		initializer: function() {
			//����load�¼�
			this.publish('load', {
				emitFacade: true,
				defaultFn: this._defLoadFn
			});
			//����contentready�¼�
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
		 * ���������ض���
		 * @method destructor
		 */
		destructor: function() {
			this.detach();
		},
		
		/**
		 * ��������������
		 * @method load
		 */
		load: function() {
			if (this.get('loaded') || this.get('loading') || !this._container) { return false; }
			this._container.addClass('yui3-lazyloaditem-loading');
			this.set('loading', true);
			this.loadContent();
		},
		
		/**
		 * �������Ƿ�������Χ��
		 * @method fetch
		 * @param {Object} within ��Χ
		 */
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
		
		/**
		 * ��������
		 * @method loadContent
		 */
		loadContent: function() {
			var source = this.get('source');
			
			if (!source) {
				//����html����
				this._loadDOMContent();
			} else if (source.url) {
				if (source.url.indexOf('{callback}') > -1) {
					//����jsonp����
					this._loadJSONPContent(source.url, source.cfg);
				} else {
					//����ajax����
					this._loadIOContent(source.url, source.cfg);
				}
			}
		},
		
		/**
		 * ��������
		 * @method insert
		 * @param {String} content ��Ҫ���������
		 */
		insert: function(content) {
			var match = Y.ExecScript.matchScript(content),
				html = match.html,
				scripts = match.scripts;
				
			this._container.appendChild(Y.Node.create(html));
			while (scripts.length) {
				Y.ExecScript.exec(scripts.shift());
			}
		},
		
		/**
		 * ����html����
		 * @method _loadDOMContent
		 */
		_loadDOMContent: function() {
			var lazyNode = this._container.one('.yui3-lazyloaditem-lazynode'),
				content;
			
			if (!lazyNode) { return false; }
			
			content = lazyNode.get(lazyNode.get('tagName') === 'textarea' ? 'value' : 'innerHTML').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');
			this._contentReady(content);
		},
		
		/**
		 * ����ajax����
		 * @method _loadIOContent
		 * @param {String} url �����ַ
		 * @param {Object} cfg �������
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
		 * ����jsonp����
		 * @method _loadJSONPContent
		 * @param {String} url �����ַ
		 * @param {Object} cfg �������
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
		 * ����׼�����
		 * @method _contentReady
		 * @param {String} content ����������
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
		 * Ĭ�ϼ����¼��ص�
		 * @method _defLoadFn
		 * @param {EventFacade} e �¼�����
		 */
		_defLoadFn: function(e) {
			this.insert(e.content);
			this._container.removeClass('yui3-lazyloaditem-loading');
			this._container.addClass('yui3-lazyloaditem-loaded');
			this.set('loading', false);
			this.set('loaded', true);
		},
		
		/**
		 * Ĭ�����ݼ�������¼��ص�
		 * @method _defContentreadyFn
		 * @param {EventFacade} e �¼�����
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

/*
 * YUI3���������
 * why don't give it a try ?
 * @class lazyload
 * @author ningzbruc@gmail.com
 * @date 2012-07-10
 * @version 0.0.1
 */

YUI.add('lazyloader', function(Y) {

/**
 * YUI3���������
 * @module lazyload
 */
	
	/**
	 * YUI3������������캯��
	 * @class LazyLoader 
	 * @constructor
	 * @extends Base
	 */
	Y.LazyLoader = function() {
		Y.LazyLoader.superclass.constructor.apply(this, arguments);
	};
	
	/**
	 * �������������
	 * @property NAME
	 * @type {String}
	 * @static
	 */
	Y.LazyLoader.NAME = 'lazyloader';
	
	/**
	 * ��������������
	 * @property ATTRS
	 * @type {Object}
	 * @static
	 */
	Y.LazyLoader.ATTRS = {
		
		/**
		 * �봰�ڵľ���
		 * @attribute fold
		 * @default 0
		 * @type number
		 */
		fold: {
			value: 0
		},
		
		/**
		 * ��ʼ����ʵ��
		 * @attribute items
		 * @default null
		 * @type object
		 */
		items: {
			value: null,
			setter: Y.all
		},
		
		/**
		 * ���ؽű�
		 * @attribute loadScript
		 * @default false
		 * @type boolean
		 */
		loadScript: {
			value: false,
			validator: Y.Lang.isBoolean
		}
	};
	
	//���������̳�Base
	//������ԭ������
	Y.extend(Y.LazyLoader, Y.Base, {
		
		/**
		 * ��ʼ����������
		 * @method initializer
		 */
		initializer: function() {
			this._events = [];
			this._items = {};
			this._initItems();
		},
		
		/**
		 * ������������
		 * @method destructor
		 */
		destructor: function() {
			this.empty();
		},
		
		/**
		 * ���ʵ���Ƿ����Ӵ����ڣ��ϣ�
		 * @method fetch
		 * @param {Boolean} force ǿ�Ƽ�������ʵ��
		 * @return this
		 */
		fetch: function(force) {
			var viewportRegion = Y.DOM.viewportRegion(),
				fold = this.get('fold') || 0,
				within = {
					withinX: viewportRegion.left + viewportRegion.width + fold,
					withinY: viewportRegion.top + viewportRegion.height + fold
				};
			
			force = force === true ? true : false;
				
			Y.Object.each(this._items, function(v, k) {
				v.fetch(force || within);
			});
			
			return this;
		},
		
		/**
		 * ���������ʵ����lazyloaditem��
		 * @method addItem
 		 * @param {Object} item
 		 * @return this
		 */
		addItem: function(item) {
			if (!(item instanceof Y.LazyLoadItem)) {
				if ((item = Y.one(item))) {
					item = new Y.LazyLoadItem({
						container: item
					});
					item.set('loadScript', this.get('loadScript'));
					this.addItem(item);
				}
				return this;
			}
			
			var itemId = item.get('itemId');
			
			if (!this._events.length) {
				this._bindEvent();
			}
			this._items[itemId] = item;
			item.after('load', function(e) {
				this.removeItem(item);
			}, this);
			this.fetch();
			
			return this;
		},
		
		/**
		 * �Ƴ�������ʵ����lazyloaditem��
		 * @method removeItem
 		 * @param {Object} item
 		 * @return this
		 */
		removeItem: function(item) {
			var itemId = item.get('itemId');
			
			if (this._items.hasOwnProperty(itemId) && this._items[itemId]) {
				delete this._items[itemId];
			}
			if (!Y.Object.size(this._items)) {
				this._detachEvent();
			}
			
			return this;
		},
		
		/**
		 * ���������ʵ��
		 * @method empty
 		 * @param {Object} item
 		 * @return this
		 */
		empty: function() {
			Y.Object.each(this._items, function(v, k) {
				this.removeItem(v);
			}, this);
			
			return this;
		},
		
		/**
		 * ��ʼ��������ʵ��
		 * @method _initItems
		 */
		_initItems: function() {
			var items = this.get('items'),
				item;
				
			if (items) {
				items.each(function(node) {
					this.addItem(node);
				}, this);
			}
		},
		
		/**
		 * ��ҳ�洰�ڹ����������¼�
		 * @method _bindEvent
		 */
		_bindEvent: function() {
			this._events.push(
				Y.on(['scroll','resize'], function(e) {
					this.fetch();
				}, window, this)
			)
		},
		
		/**
		 * ���ҳ�洰�ڹ����������¼��İ�
		 * @method _detachEvent
		 */
		_detachEvent: function() {
			while (this._events.length) {
				this._events.shift().detach();
			}
		}
	});
	
}, '0.0.1', {
	requires: ['node', 'base']
});
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
		 */
		fetch: function() {
			var viewportRegion = Y.DOM.viewportRegion(),
				fold = this.get('fold') || 0,
				within = {
					withinX: viewportRegion.left + viewportRegion.width + fold,
					withinY: viewportRegion.top + viewportRegion.height + fold
				};
				
			Y.Object.each(this._items, function(v, k) {
				v.fetch(within);
			});
		},
		
		/**
		 * ���������ʵ����lazyloaditem��
		 * @method addItem
 		 * @param {Object} item
		 */
		addItem: function(item) {
			var itemId = item.get('itemId');
			if (!this._events.length) {
				this.bindEvent();
			}
			this._items[itemId] = item;
			item.after('load', function(e) {
				this.removeItem(item);
			}, this);
			this.fetch();
		},
		
		/**
		 * �Ƴ�������ʵ����lazyloaditem��
		 * @method removeItem
 		 * @param {Object} item
		 */
		removeItem: function(item) {
			var itemId = item.get('itemId');
			if (this._items.hasOwnProperty(itemId) && this._items[itemId]) {
				delete this._items[itemId];
			}
			if (!Y.Object.size(this._items)) {
				this.detachEvent();
			}
		},
		
		/**
		 * ���������ʵ��
		 * @method empty
 		 * @param {Object} item
		 */
		empty: function() {
			Y.Object.each(this._items, function(v, k) {
				this.removeItem(v);
			}, this);
		},
		
		/**
		 * ��ҳ�洰�ڹ����������¼�
		 * @method bindEvent
		 */
		bindEvent: function() {
			this._events.push(
				Y.on(['scroll','resize'], function(e) {
					this.fetch();
				}, window, this)
			)
		},
		
		/**
		 * ���ҳ�洰�ڹ����������¼��İ�
		 * @method detachEvent
		 */
		detachEvent: function() {
			while (this._events.length) {
				this._events.shift().detach();
			}
		}
	});
	
}, '0.0.1', {
	requires: ['node', 'base']
});
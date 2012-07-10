/*
 * YUI3懒加载组件
 * why don't give it a try ?
 * @class lazyload
 * @author ningzbruc@gmail.com
 * @date 2012-07-10
 * @version 0.0.1
 */

YUI.add('lazyloader', function(Y) {

/**
 * YUI3懒加载组件
 * @module lazyload
 */
	
	/**
	 * YUI3懒加载组件构造函数
	 * @class LazyLoader 
	 * @constructor
	 * @extends Base
	 */
	Y.LazyLoader = function() {
		Y.LazyLoader.superclass.constructor.apply(this, arguments);
	};
	
	/**
	 * 懒加载组件名字
	 * @property NAME
	 * @type {String}
	 * @static
	 */
	Y.LazyLoader.NAME = 'lazyloader';
	
	/**
	 * 懒加载配置属性
	 * @property ATTRS
	 * @type {Object}
	 * @static
	 */
	Y.LazyLoader.ATTRS = {
		
		/**
		 * 离窗口的距离
		 * @attribute fold
		 * @default 0
		 * @type number
		 */
		fold: {
			value: 0
		}
	};
	
	//懒加载器继承Base
	//懒加载原型扩充
	Y.extend(Y.LazyLoader, Y.Base, {
		
		/**
		 * 初始化懒加载器
		 * @method initializer
		 */
		initializer: function() {
			this._events = [];
			this._items = {};
		},
		
		/**
		 * 销毁懒加载器
		 * @method destructor
		 */
		destructor: function() {
			this.empty();
		},
		
		/**
		 * 检查实例是否在视窗以内（上）
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
		 * 添加懒加载实例（lazyloaditem）
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
		 * 移除懒加载实例（lazyloaditem）
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
		 * 清空懒加载实例
		 * @method empty
 		 * @param {Object} item
		 */
		empty: function() {
			Y.Object.each(this._items, function(v, k) {
				this.removeItem(v);
			}, this);
		},
		
		/**
		 * 绑定页面窗口滚动与缩放事件
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
		 * 解除页面窗口滚动与缩放事件的绑定
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
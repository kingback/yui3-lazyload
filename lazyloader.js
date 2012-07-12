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
		},
		
		/**
		 * 初始化的实例
		 * @attribute items
		 * @default null
		 * @type object
		 */
		items: {
			value: null,
			setter: Y.all
		},
		
		/**
		 * 加载脚本
		 * @attribute loadScript
		 * @default false
		 * @type boolean
		 */
		loadScript: {
			value: false,
			validator: Y.Lang.isBoolean
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
			this._initItems();
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
		 * @param {Boolean} force 强制加载所有实例
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
		 * 添加懒加载实例（lazyloaditem）
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
		 * 移除懒加载实例（lazyloaditem）
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
		 * 清空懒加载实例
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
		 * 初始化懒加载实例
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
		 * 绑定页面窗口滚动与缩放事件
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
		 * 解除页面窗口滚动与缩放事件的绑定
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
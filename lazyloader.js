
YUI.add('lazyloader', function(Y) {
	
	Y.LazyLoader = function() {
		Y.LazyLoader.superclass.constructor.apply(this, arguments);
	};
	
	Y.LazyLoader.NAME = 'lazyloader';
	
	Y.LazyLoader.ATTRS = {
		fold: {
			value: 0
		}
	};
	
	Y.extend(Y.LazyLoader, Y.Base, {
		initializer: function() {
			this._events = [];
			this._items = {};
		},
		
		destructor: function() {
			this.empty();
		},
		
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
		
		removeItem: function(item) {
			var itemId = item.get('itemId');
			if (this._items.hasOwnProperty(itemId) && this._items[itemId]) {
				delete this._items[itemId];
			}
			if (!Y.Object.size(this._items)) {
				this.detachEvent();
			}
		},
		
		empty: function(e) {
			Y.Object.each(this._items, function(v, k) {
				this.removeItem(v);
			}, this);
		},
		
		bindEvent: function() {
			this._events.push(
				Y.on(['scroll','resize'], function(e) {
					this.fetch();
				}, window, this)
			)
		},
		
		detachEvent: function() {
			while (this._events.length) {
				this._events.shift().detach();
			}
		}
	});
	
}, '0.0.1', {
	requires: ['node', 'base']
});
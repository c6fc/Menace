/*
Asynchronouos Queue system courtesy of:
 Dustin Diaz; http://dustindiaz.com
 Github: http://github.com/ded
(with modifications, used with permission)

Remainder Copyright (c) 2011 by Brad M Woodward

This work is licensed under the Creative Commons
 Attribution-ShareAlike 3.0 Unported License. To
 view a copy of this license, visit 
 http://creativecommons.org/licenses/by-sa/3.0/

*/

window.queue = function () {
	this._methods = [];
	this._context = null;
	this._flushed = false;
}

queue.prototype = {
	add: function (fn) {
		if (this._flushed) {
			fn(this._context);
		} else {
			this._methods.push(fn);
		}
	},
	flush: function () {
		if (this._flushed) {
			return;
		}
		
		this._flushed = true;
		while (this._methods[0])
		{
			this._methods.shift()(this._context);
		}
	}
};

window.injector = function() {
	this.eventTimer = false;
	this.queue = new queue();
	var self = this;
	this.queue._context = self;
}

injector.prototype = {		// Specifies all the available methods for form and page interaction. More will be added soon.
	trigger: function (when) {
		this.queue._flushed = false;
		if (eval(when) == true) {
			this.queue.flush();
		} else {
			var self = this;
			setTimeout(function () { self.trigger(when); }, 3000);
		}
		
		return this;
	},
	createEvent: function (task, speed) {
		setTimeout(task, this.randomOffset(speed));
		return true;
	},
	randomOffset: function (speed) {
		this.eventTimer = (this.eventTimer == false) ? 1 : this.eventTimer;
		this.eventTimer = (this.eventTimer * 1) + (Math.floor(Math.random() * speed) * 1);
		return this.eventTimer;
	},
	click: function (id) {
		this.queue.add(function (self) {
			self.createEvent("document.getElementById('" + id + "').click();", 1500);
		});
		
		return this;
	},
	changeValue: function (id, value) {
		this.queue.add(function (self) {
			self.createEvent("document.getElementById('" + id + "').value = '';", 500);
			for (x = 0; x < value.length; x++) {
				self.createEvent("document.getElementById('" + id + "').value += '" + value.charAt(x) + "';", 500);
			}
		});

		return this;
	},
	makeChecked: function (id) {
		this.queue.add(function (self) {
			if (!document.getElementById(id)) {
				return true;
			}
			if (!document.getElementById(id).checked) {
				self.createEvent("document.getElementById('" + id + "').click();", 1500);
			}
		});

		return this;
	},
	makeUnchecked: function (id) {
		this.queue.add(function (self) {
			if (!document.getElementById(id)) {
				return true;
			}
			if (document.getElementById(id).checked) {
				self.createEvent("document.getElementById('" + id + "').click();", 1500);
			}
		});

		return this;
	}
};

function botTasks () { // Contacts the controller and requests tasks to run. You may provide any parameters you would like.
	var parameters = {
		url: location.href,
	}
	httprequest("GET", "http://qc/ajax.html", parameters); // CHANGE THIS to the page that will issue commands.
}

function httprequest(method, url, data) {
	GM_xmlhttpRequest({
		method: method,
		url: url,
		data: data,
		onload: function (response) {
			eval(response.responseText);
		}
	});
}

var inj = new injector();
botTasks();

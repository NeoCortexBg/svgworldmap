/**
 * SvgMap
 *
 * @param {object} $ jQuery
 */

(function ( $, window ) {

	if(jQuery === undefined) {
		throw new Error("jQuery not present");
	}

	var scripts = window.document.getElementsByTagName('script');
	var script = scripts[scripts.length - 1];
	var src = script.src;
	var a = window.document.createElement('a');
	a.href = src;
	var baseUri = a.pathname.substring(0, a.pathname.lastIndexOf("/") - 3);
	this.$controlReset;
	this.$svgContainer;
	this.$tooltip;

	var SvgWorldMap = function (container, options)
	{
		"use strict";
		var self = this;
		container.svgWorldMap = this;
		var $container = $(container);
		this.options = options;

		this.init = function(){
			$container.addClass('svgworldmap-container');
			this.loadSvg();
			this.initControls();
			this.initTooltip();
		};

		this.initControls = function(){
			this.$controlReset = $("<div class='control-reset'></div>").appendTo($container);
			this.$controlReset.hide();
//			this.$controlReset.append("<i class='fa fa-refresh'></i>");
//			this.$controlReset.append("<i class='fa fa-arrow-circle-left'></i>");
			this.$controlReset.append("<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 612 612' style='enable-background:new 0 0 612 612;'><g>	<path d='M612,306C612,137.004,474.995,0,306,0C137.004,0,0,137.004,0,306c0,168.995,137.004,306,306,306   C474.995,612,612,474.995,612,306z M328.895,160.511l39.502,39.502L260.239,308.226l117.838,117.838l-39.335,39.335L181.375,308.03   L328.895,160.511z'/></g></svg>");
//			this.$controlReset.append("<span>&lt;&lt;</span>");
			this.$controlReset.click(function(){
				self.reset();
			});
		};

		this.initTooltip = function(){
			this.$tooltip = $("<div class='svgworldmap-tooltip'></div>").appendTo($container);
			this.$tooltip.isShown = false;
		};

		this.loadSvg = function(){
			var url = baseUri + "/svg/map.svg";
			this.$svgContainer = $("<div class='svg-container'></div>").appendTo($container);

			this.$svgContainer.load(url, function(responseText, textStatus, jqXHR ){
				if(jqXHR.status === 200 && textStatus === 'success') {
					var $g = self.$svgContainer.find('svg > g');
					$g.each(function(){
						if(this.id === "continents") {
							$(this).find('path').each(function(){
								this.classList.add('continent');
							});
						} else {
							$(this).find('path').each(function(){
								this.classList.add('country');
							});
						}
					});
					$g.each(function(){
						this.id = "svgworldmap-" + this.id;
					});
					var $paths = self.$svgContainer.find('path');
					$paths.click(onPathClicked);
					$paths.mousemove(onMousemove);
					$paths.mouseout(onMouseout);

					$g.filter('#svgworldmap-continents').show();
				}
			});
		};

		var onPathClicked = function(e){
			var $path = $(e.target);
			if($path.is('.continent')) {
				self.zoomToContinent($path);
			} else {
				if(self.options.onCountryClick !== undefined) {
					self.options.onCountryClick({
						iso2: $path.attr("data-iso2")
					});
				}
			}
		};

		var onMousemove = function(e){
			var $this = $(this);
			if(!self.$tooltip.isShown) {
				self.showToolip($this.is('.continent') ? $this.attr('data-continent') : $this.attr('data-name'));
				self.$tooltip.isShown = true;
			}
			self.moveToolip(e.clientX, e.clientY);
		};
		var onMouseout = function(){
			self.$tooltip.hide();
			self.$tooltip.isShown = false;
		};

		this.zoomToContinent = function($path){
			var $g = $path.parent();
			var continent = $path.attr('data-continent').toLowerCase().replace(" ", "-");
			var $gContinent = $g.siblings("#svgworldmap-" + continent);

			var initialTransformValues = {scalex: 1, scaley: 1, translatex: 0, translatey: 0};
			var transformValues = {
				"europe": {scalex: 4.1, scaley: 4.1, translatex: -413, translatey: -23},
				"north-america": {scalex: 2.1, scaley: 2.1, translatex: -62, translatey: 0},
				"south-america": {scalex: 2.3, scaley: 2.3, translatex: -122, translatey: -204},
				"africa": {scalex: 2.1, scaley: 2.1, translatex: -362, translatey: -124},
				"asia": {scalex: 1.8, scaley: 1.8, translatex: -462, translatey: -1},
				"oceania": {scalex: 3.3, scaley: 3.3, translatex: -742, translatey: -253},
				"antarctica": {scalex: 1.5, scaley: 1.5, translatex: -199, translatey: -346}
			};

			var animatedTransformValues = initialTransformValues;
			$(initialTransformValues).animate(transformValues[continent],{
//				easing: "easeOutQuart",
//				easing: "easeOutQuint",
				easing: "linear",
				duration: 300,
				step: function(value, fx){
					animatedTransformValues[fx.prop] = value;
					if(fx.prop === "translatey") {
						$g.attr('transform', self.transformValueToTransFormString(animatedTransformValues));
					}
				},
				done: function(){
					$gContinent.attr('transform', self.transformValueToTransFormString(animatedTransformValues));
					$gContinent.show();
					$g.hide();
					self.$controlReset.show();
				}
			});
		};

		this.transformValueToTransFormString = function(values){
			return "scale(" + values.scalex
					+ ", " + values.scaley
					+ ") translate(" + values.translatex
					+ ", " + values.translatey
					+ ")";
		};

		this.reset = function(){
			var $g = self.$svgContainer.find('svg > g');
			$g.attr('transform', "scale(1, 1) translate(0, 0)");
			$g.not('#svgworldmap-continents').hide();
			$g.filter('#svgworldmap-continents').show();
			this.$controlReset.hide();
		};

		this.showToolip = function(name){
			this.$tooltip.text(name);
			this.$tooltip.show();
		};

		this.moveToolip = function(x, y){
			this.$tooltip.css("left", x - this.$tooltip[0].offsetWidth);
			this.$tooltip.css("top", y - 40);
		};

		this.init();

	};

	$.fn.svgworldmap = function(options) {
		return this.each(function(index, element) {
			if(element.svgWorldMap === undefined) {
				new SvgWorldMap(element, options);
			}

		});
	};
}( jQuery, window ));
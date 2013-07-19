/**
 * Optimize module
 * Offers display optimization functions 
 */
var Optimize = (function() {
	var optimize = {};
	
	// Private fns
	var fillResize = function(img) { 
		if ($(img).width() > $(window).width()) {
			$(img).css('width', '100%');
		}
	};
	
	/**
	 * keepLinks
	 * Rewrite anchors to keep them within the domain
	 * @param <object> element
	 */
	optimize.keepLinks = function(element) {
		$.each($(element).find('a'), function(index, e) {
			var target = $(this).attr('href');
			target = target.replace(/^(.+)#/, '#');
			$(this).attr('href', target);
		});
	};

	/**
	 * resetImageSizing
	 * Forces images larger than the window to scale to 100% of available width
	 * @param <object> images Image group to scale
	 */
   optimize.resetImageSizing = function(images) {
	   $.each(images, function(index, img) {
		   // On image load, resize it if needed
		   $(img).bind('load', function() {
			   fillResize(img);
		   });
	   });			
   };
   
   /**
	 * bindOrientation
	 * Reset image widths to window width on device rotate
	 */
	optimize.bindOrientation = function() {
		var checkOrientation = function() {
			fillResize($('img'));
		};
		window.addEventListener("resize", checkOrientation, false);
		window.addEventListener("orientationchange", checkOrientation, false);
	};
	
	return optimize;
})();

/**
 * Hatbox
 * Simple lightbox for images. 
 */
 var Hatbox = (function() {
	var Hatbox = {};
	
	var getHatbox = function() {
		return $('#hatbox');
	};
	
	var getHatboxImage = function() {
		return $('#hbImg');
	};
	
	var getHatboxCaption = function() {
		return $('#hbCaption');
	};
	
	var inhibitScroll = function(event) {
		event.preventDefault();
	} 
	
	var updateSize = function() {
		var orientation = {};
		
		if ($('#hbCurrent').length > 0) {
			if ($(window).height() > $(window).width()) {
				orientation = {
					'width' : '100%',
					'height' : ''
				};
			} else {
				orientation = {
					'height' : '100%',
					'width' : ''
				};
			}	
			$('#hbCurrent').css(orientation);
		}
	};
	/**
	 * Show the image and disable scrolling past it.
	 * @param <object> image
	 */
	Hatbox.show = function(image) {
		// Disable moving
		$(window).bind('touchmove', inhibitScroll);

		getHatbox().show();
	};
	
	Hatbox.clear = function() {
		$(window).unbind('touchmove', inhibitScroll);
		$(window).bind('touchmove', function() {
			return true;
		});
		getHatbox().hide();
		getHatboxImage().html($('<div id="hbCaption"></div>'));
		getHatboxCaption().html('');	 		
	};
	
	Hatbox.remove = function() {
		$('#Hatbox').remove();
	};
	
	Hatbox.init = function() {
		if (!(getHatbox().length)) {
			var html = '<div id="hatbox">' +
			'<div id="hbScreen"></div>' +
			'<div id="hbImg"><div id="hbCaption"></div></div>' +
			'</div>';
			$('body').prepend($(html));
			
			$('img').click(function() {
				// On click, deep clone the image copy to the viewer
				var img = $('<img src="' + $(this).attr('src') + '"/>');
				$(img).attr('id', 'hbCurrent');
				$(img).css({
				  'background-color' : '#FFFFFF',
				  'margin' : '0 auto',
				  'height' : '100%',
				  'width' : ''
				});
					
				getHatboxImage().prepend($(img));
				
				// Place caption
				var title = $(this).attr('title');
				if (typeof title !== 'undefined' && title !== false) {
					var wrapper = $('<span id="hbCaptionWrap"></span>');
					$(wrapper).text($(this).attr('title'));
					getHatboxCaption().html(wrapper);
				}
				updateSize();
				Hatbox.show($(this));
			});
			
			// Hide on click
			$('#hbImg, #hbCaption, #hbScreen').click(function(e) {
				Hatbox.clear();
			})
			
			Hatbox.updateSizeOnOrientationChange();
		}
	};
	
	Hatbox.updateSizeOnOrientationChange = function() {
		window.addEventListener("orientationchange", updateSize, false);
		window.addEventListener("resize", updateSize, false);
	}
	
	return Hatbox;
 })();
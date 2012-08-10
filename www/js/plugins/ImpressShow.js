//Define as a require.js-module, and add to main.js and show.js dependencies.
define(['lib/impress'], function() {
	//Both type- and title-attributes required.
	var ImpressShow = function(){
		this.type = 'slideshow';
		this.title = 'Impress.js';

	};	
	//Optional. Called when showing add-slide-modal. Add any UI to the jQuery-object.
	//Goes between duration/probability-input and the slide-specific UI.
	ImpressShow.prototype.addSlideHTML = function($div){
		$div.html(
				'Impress.js options (optional): <br /><input placeholder="data-x" id="datax"></input>'
				+'<input placeholder="data-y" id="datay"></input><input placeholder="data-z" id="dataz"></input>'
				+'<input placeholder="rotate" id="rotate"></input><input placeholder="data-scale" id="dscale"></input>'
				+'<input placeholder="data-rotate-x" id="drotatex"></input><input placeholder="data-rotate-y" id="drotatey"></input>'
				+'<input placeholder="data-rotate-z" id="drotatez"></input>'
		);
	};
	
	//Optional. Takes the slide as input and should return it.
	//Use in conjunction with addSlideHTML.
	ImpressShow.prototype.slideSave = function(slide){
		if($('#datax').val() != ''){
			slide.datax = $('#datax').val();
		}
		if($('#datay').val() != ''){
			slide.datay = $('#datay').val();
		}
		if($('#dataz').val() != ''){
			slide.dataz = $('#dataz').val();
		}
		if($('#dscale').val() != ''){
			slide.dscale = $('#dscale').val();
		}
		if($('#drotatex').val() != ''){
			slide.drotatex = $('#drotatex').val();
		}
		if($('#drotatey').val() != ''){
			slide.drotatey = $('#drotatey').val();
		}
		if($('#drotatez').val() != ''){
			slide.drotatez = $('#drotatez').val();
		}
		if($('#rotate').val() != ''){
			slide.drotate = $('#drotate').val();
		}
		return slide;
	};	
	
	//Required. When going to a new slide, this function is called.
	ImpressShow.prototype.showHTML = function($div, slide){
		impress().goto($('#'+slide.sid)[0]);
	};
	
	//Optional. Called to start the show. Used for setting up the slides.
	ImpressShow.prototype.start = function($div, show){
		$div.html('<div id="impress">' 
//				+'<div class="no-support-message">'
//				+'Your browser doesn\'t support impress.js. Try Chrome or Safari.'
//				+'</div>'
				+'</div>');
		$.each(show.slides, function(i, sl){
			var dx = i*800;
			var dy = i*200;
			var dz = i*500;
			var dscale = 1;
			var drotate = i*45;
			var drotatex = i*45;
			var drotatey = i*45;
			var drotatez = i*45;
			
			if(sl.dx){
				dx = sl.dx;
			}
			if(sl.dy){
				dy = sl.dy;
			}
			if(sl.dz){
				dz = sl.dz;
			}
			if(sl.dscale){
				dscale = sl.dscale;
			}
			if(sl.drotate){
				drotate = sl.drotate;
			}
			if(sl.drotatex){
				drotatex = sl.drotatex;
			}
			if(sl.drotatey){
				drotatey = sl.drotatey;
			}
			if(sl.drotatez){
				drotatez = sl.drotatez;
			}
			$('#impress').append('<div data-x="'+dx+'" data-y="'+dy+'" data-z="'
					+dz+'" data-scale="'+dscale+'" data-rotate="'+drotate
					+'" data-rotate-x="'+drotatex+'" data-rotate-y="'+drotatey
					+'"data-rotate-z="'+drotatez+'" class="step" id="'+sl.sid+'">'+sl.content+'</div>');

			if(sl.datax && sl.datay && sl.dataz){
				$('#'+sl.sid).prop('data-x', sl.datax).prop('data-y', sl.datay)
					.prop('data-z', sl.dataz);
			}
			else{
				console.log('no sl.datas');
				$('#'+sl.sid).prop('data-x', i*500).prop('data-y', i*20)
				.prop('data-z', i*50);
				console.log($('#'+sl.sid).prop('data-x'));
			}
		});
		impress().init();
	};
	
	//Register the plugin (required)
	regPlugin(ImpressShow);
});

//Use require.js to define the plugin. This file needs to be added to the dependencies of main.js
//This plugin requires ckeditor
define(['/ckeditor/ckeditor.js'], function(){
	//Load any stylesheets
	$('head').append('<link rel="stylesheet" href="/ckeditor/skins/kama/editor.css">');
	
	//The main function. Both attributes are required.
	var CkSlide = function(){
		this.type = 'slide';
		this.title = 'CKEditor';
	};
	
		
	//This function is called when creating the modal for adding a slide. Required.
	//The div in the parameter is a jQuery object with the element shown in the modal.
	//This is shown underneath SlideShow-specific options.
	CkSlide.prototype.addHTML = function($div){
		$div.html(
				'<textarea id="slideEditor"></textarea>'
		);
		var editor = CKEDITOR.instances['slideEditor'];
	    if (editor) { editor.destroy(true); }
	    CKEDITOR.replace('slideEditor');
		console.log($div);
	};
	
	//Called on edit. Div is the element to add edit-stuff to, and content is
	//the contents of the slide, usually the actual HTML that is shown in the div/article
	//during a slideshow.
	CkSlide.prototype.editHTML = function($div, content){
		$div.html(
				'<textarea id="slideEditor">'+content+'</textarea>'
		);
		var editor = CKEDITOR.instances['slideEditor'];
	    if (editor) { editor.destroy(true); }
	    CKEDITOR.replace('slideEditor');
	    editor = CKEDITOR.instances['slideEditor'];
	    editor.insertHtml(content);
		console.log($div);
	};	
		
	//Called on modal save. Required.
	//Must return the slide to be saved or false to block.
	//If blocking, add information to the modal to say that and why.
	//A jQuery-object of the div made in addHTML is given as a parameter.
	CkSlide.prototype.save = function($div){
		return CKEDITOR.instances.slideEditor.getData();
	};
	
	//Register the plugin. Required.
	regPlugin(CkSlide);
});
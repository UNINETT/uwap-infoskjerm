require(['plugins/CkSlide', 'plugins/ImpressShow', 'lib/uuid'], function(){
	function catchError(err){
			console.log(err);
//			UWAP.store.save({"type": "message", "isError": "true", "msg": err}, function (){}, catchError)
		}
	$(document).ready(function() {
		
		var SM = function(){
			this.messages= new Array();
			this.useShows = new Array();
			this.adminShows = new Array();
			this.messageTime = moment().format("YYYY-MM-DD HH:mm:ss");
			this.ignored = new Array();
			this.ignoredBool = false;
			
			
		};
		SM.prototype.init = function(){
			
			this.varTest = 'another test';
			this.setIntervals();
			
			$('#adminSlides').html('');
			$('#useSlides').html('')
				.append('<h3>Available slideshows:</h3>')
				.append('Devicename: <input id="deviceInput"></input>');
			
			
			this.slideShowTypesView();
			UWAP.store.queryList({"type": "slideshow"}, $.proxy(slideShowsGotten, this), catchError);
			this.messageTime = moment().format("YYYY-MM-DD HH:mm:ss");
			UWAP.store.queryList({"type": "msg"}, messagesGotten, catchError);
		};
		SM.prototype.listMySlideShow = function(show){
			console.log('List in admin: '+show.title);
			var randomHTML = '(random order)';
			if(show.notRandom){
				randomHTML = '(not random order)';
			}
			$('#adminAccordion').append('<div class="accordion-group" >'
					+'<div class="accordion-heading">'
					+'<a  class="accordion-toggle" data-toggle="collapse" data-parent="#adminAccordion" href="#collapse'+show._id.$id+'">'
					+show.title+'</a></div>'
					+'<div id="collapse'+show._id.$id+'" class="accordion-body collapse" style="height:auto;">'
					+'<div class="accordion-inner">'
					+'<textarea style="width:95%" id="descr'+show._id.$id+'" placeholder="Description">'
					+show.description+'</textarea>'
					+'<p> <b>Type: '+show.stype+'</b> '+randomHTML+' <a  id="del'+show._id.$id+'" href="javascript:void(0)"> - delete show</a></p>'
					+'<div id="dev'+show.sid+'"><p> <b> Devices that have shown this slideshow (<a class="coloring" href="javascript:void(0)" rel="tooltip" title ="Green: Running now without errors. <br /> Red: Running now with errors <br /> Orange: Not running (has not updated status in the last minute)">colors</a>):</p></div>'
					+'<p><b>Slides: </b></p><div></div>'
					+'</div></div>'
					+'</div>');
			//Dunno if this catches changes from other places; might delete slides?
			$('#descr'+show._id.$id).change(function(){
				show.description = $('#descr'+show._id.$id).val();
				showEdited(show);
			});
			$('#del'+show._id.$id).click(function(){
				showRemoved(show);
			});
			$(".collapse").collapse('hide');
			$(".coloring").tooltip();
			$('#adminAccordion').find('div').last().append(
					'<select id="sel'+show.sid+'" class="slideTypeSelect"></select>'
					+'<a href="javascript:void(0)" class="btn" id="addSlide"><i class="icon-plus"></i>Add slide</a><br />')
				.find('a').last().click($.proxy(function(){
					this.addSlide($('#sel'+show.sid).prop('selectedIndex'),show);
				}, this));
			var $sel = $('#adminAccordion').find('div').last().find('select');
			$.each(slideTypes, function(i, type){
				$sel.append('<option>'+type.title+'</option>');
			});
			$('#adminAccordion').find('div').last().append('<div id="slideDiv'+show.sid+'"></div>');
			if(show.slides){
				
				$.each(show.slides, function(i, slide){
					$('#adminAccordion').find('div').last().append('<a href="javascript:void(0)" id="'+slide.sid+'">'+(i+1)
							+'</a> - ').find('a').last().click(function(){
								sm.editSlide(show, slide);
							});
				});
//				$('#adminAccordion').find('div').last().append('<br />');
			}
		};
		SM.prototype.listSlideShow = function(show){		
			console.log(show._id.$id);
			$('#useSlides').append('<p><a href="javascript:void(0)" id="'+show._id.$id+'">'+show.title+'</a><br />'+show.description+'</p>');
			$('#'+show._id.$id).click(function(){
				window.location.href = "https://infoskjerm.uwap.org/show.html#/show="+show.sid+'/device='+$('#deviceInput').val();
			});
		};
		SM.prototype.editSlide = function(show, slide){
			console.log(show);
			console.log(slide);
			$('.modal-header').html('<h3>Edit '+slide.stype+'-slide');
			$('.modal-body').html('').append('<div><input id="durationInput" placeholder="Duration (seconds)">'
					+'</input><input id="probInput" placeholder="Probability"></input></div>');
			$.each(slideShowTypes, function(i, t){
				if(t.title == show.stype){
					if(t.plugin.addSlideHTML){
						t.plugin.addSlideHTML($('.modal-body').append('<div id="htmlfromshow"></div>').find('div').last());

					}
				}
			});
			var plugParam = $('.modal-body').append('<div></div').find('div').last();
			$('#durationInput').val(slide.duration);
			$('#probInput').val(slide.probability);
			
			
			
			$.each(slideTypes, function(i, type){
				if(slide.stype == type.title){
					type.plugin.editHTML(plugParam, slide.content);
				}
			});
			
			$('.modal-footer').html(
					'<a href="#" class="btn" data-dismiss="modal">Close</a> <a href="#" id="saveButton"'
					+'class="btn btn-primary">Save changes</a>'
			);
			$('#saveButton').click(function(){
				if($('#durationInput').val() == '' || $('#probInput').val() == ''){
					alert('Duration and probability are required');
					return false;
				}
				var plugContent = '';
				$.each(slideTypes, function(i, type){
					if(type.title && slide.stype && type.title == slide.stype){
						plugContent = type.plugin.save($('.modal-body').find('div')[0]);
					}
				});
				
				slideEdited({ "type": "slide", "stype":slide.stype, "content": plugContent, "duration": $('#durationInput').val(), "probability": $('#probInput').val(), "sid": slide.sid}, show);
				
			});
			$('#myModal').modal().css({
		        width: '880px',
		        'margin-left': function () {
		            return -($(this).width() / 2);
		        }
		    });
			
		};
		SM.prototype.setIntervals = function(){
			console.log('setIntervals');
			setInterval(checkMessages, 15000);
			setInterval(deleteCommands, 60000);
			
		};
		SM.prototype.slideShowTypesView = function(){
			console.log('test');
			$('#adminSlides').append('<h3>Your slideshows:</h3>')
			.append('<div class="accordion" id="adminAccordion" style="width:90%"></div>')
				.append('<select id="slideShowTypeSelect"></select>'
						
					+'<a href="javascript:void(0)" class="btn" id="addShow"><i class="icon-plus"></i>Add</a>');
			$('#addShow').click(function(){
				sm.addShow($('#slideShowTypeSelect').prop('selectedIndex'));
			});
			$.each(slideShowTypes, function(i, s){
				console.log(s);
				$('#slideShowTypeSelect').append('<option>'+s.title+'</option>');
			});
		};
		SM.prototype.addSlide = function(id, show){
			console.log(show);
			console.log(id);
			$('.modal-header').html('<h3>Add '+slideTypes[id].title+'-slide');
			$('.modal-body').html('').append('<div><input id="durationInput" placeholder="Duration (seconds)">'
					+'</input><input id="probInput" placeholder="Probability"></input></div>');


			$.each(slideShowTypes, function(i, t){
				if(t.title == show.stype){
					if(t.plugin.addSlideHTML){
						t.plugin.addSlideHTML($('.modal-body').append('<div id="htmlfromshow"></div>').find('div').last());

					}
				}
			});


			var plugParam = $('.modal-body').append('<div></div').find('div').last();
			
			slideTypes[id].plugin.addHTML(plugParam);
			$('.modal-footer').html(
					'<a href="#" class="btn" data-dismiss="modal">Close</a> <a href="#" id="saveButton"'
					+'class="btn btn-primary">Save changes</a>'
			);
			$('#saveButton').click(function(){
				if($('#durationInput').val() == '' || $('#probInput').val() == ''){
					alert('Duration and probability are required');
					return false;
				}
				var plugContent = slideTypes[id].plugin.save($('.modal-body').find('div')[0]);
				slideAdded({ "type": "slide", "stype": slideTypes[id].title, "content": plugContent, "duration": $('#durationInput').val(), "probability": $('#probInput').val(), "sid": uuid.v1()}, show);
				
			});
			$('#myModal').modal().css({
		        width: '880px',
		        'margin-left': function () {
		            return -($(this).width() / 2);
		        }
		    });
		};
		SM.prototype.addShow = function(id){
			console.log(id);
			$.each(user.groups, function(i, gr){
				console.log(gr);
			});
			$('.modal-header').html('<h3>Create '+slideShowTypes[id].title+'-slideshow</h3>');
			$('.modal-body').html(
					'<input id="showTitle" placeholder="Slideshow title"></input><br/>'
//					+'<input id="addGroup" placeholder="Find group"></input>'
					+'Available to: <select id="group" placeholder="ID of usergroup"></select>'
					
					+'<textarea id="showDescription" placeholder="Description" style="width:90%"></textarea>'
					+'<p><input type="checkbox" id="randomCheck" /> Show in random order based on the probability of the slide. If unchecked, the probability determines the chance a slide is shown in one runthrough.</p>'
			);
			$('.modal-footer').html('<a href="#" class="btn" data-dismiss="modal">Close</a> <a href="#" id="saveButton"'
					+'class="btn btn-primary">Save</a>');
			$('#addGroup').typeahead({source: user.groups});
			$('#addGroup').change(function(){
				console.log(this);
			});
			$.each(user.groups, function(i, gr){
				$('#group').append('<option>'+gr+'</option>');
			});
			
			$('#saveButton').click(function(){

				if($('#showTitle').val() != '')
				{
					var r = $('#group').prop('selectedIndex'); 
					var tempShow = {"type":"slideshow", "description": $('#showDescription').val(), "title": $('#showTitle').val(), "uwap-acl-read": [groups[r].ident],
						"owner": user.userid, "stype": slideShowTypes[id].title, "sid": uuid.v1()};
					console.log($('#randomCheck').prop('checked'));
					if($('#randomCheck').prop('checked') == false){
						console.log('not random');
						tempShow.notRandom = "true";
					}
					showAdded(tempShow);
					$('#myModal').modal();

				}
				else{
					alert('The show needs a title');
				}

			});
			$('#myModal').modal().css({
		        width: '600px',
		        'margin-left': function () {
		            return -($(this).width() / 2);
		        }
		    });
		};
		function slideShowsGotten(d){
			console.log(this);
			console.log(d);
			$.each(d, function(i, show){
				if(show.owner == user.userid){
					sm.adminShows.push(show);
					sm.listMySlideShow(show);
				}else{
					
				}
				sm.useShows.push(show);
				sm.listSlideShow(show);
				
			});
			
			$('.accordion-toggle').collapse({toggle:true});
//			
			$('.accordion-toggle').css('width', '500px');
		}
		function checkMessages(){
			console.log('Checking messages..');
			var tempTime = this.messageTime;
			this.messageTime = moment().format("YYYY-MM-DD HH:mm:ss");
			UWAP.store.queryList({"type":"msg", "timestamp": { $gt: tempTime}}, messagesGotten, catchError);
			
		}
		function messagesGotten(d){
			$.each(d, function(i, msg){
				if(msg.ignore){
					console.log('ignoring ' +msg.device+ ' for slideshow '+msg.sid);
					sm.ignored.push(msg);
				}
			});

			$.each(d, function (i, msg){
				if($('#dev'+msg.sid)[0]){
					var colorClass = "orange";
					if(msg.timestamp && moment().subtract('minutes', 1).format("YYYY-MM-DD HH:mm:ss") < msg.timestamp){
						colorClass = msg.statusColor;
					}
						var inMessages = false;
						$.each(sm.messages, function(i, mess){
							if(mess.device == msg.device && mess.sid == msg.sid){
								inMessages = true;
							}
						});
						$.each(sm.ignored, function(i, device){
							if(device.device == msg.device && device.sid == msg.sid){
								//not really a descriptive varname anymore..
								inMessages = true;
							}
						});

						if(!msg.command && inMessages == false){
							sm.messages.push(msg);
							console.log(msg);

							if(msg.sid && msg.device ){
								if( msg.command){

								}
								else{
									$('#dev'+msg.sid).append('<p id="'+msg.sid+msg.device+'"><a class="'+colorClass+'" href="javascript:void">'+msg.device+'</a> - <a href="javascript:void(0)" id="'+msg.sid+msg.device+'ignore">ignore device</a></p>').find('p').last().find('a').first()
									.click(function(){
										$('.modal-header').html(
												'<h3>'+msg.device+'</h3>'
										);
										var statusHTML = '<b>Status: </b><br />';

										if(msg.status.error){
											statusHTML+='Error: '+msg.status.error;
											$each(msg.status.arguments, function(i, arg){
												statusHTML+='<br /> '+arg;
											});
										}
										else{
											statusHTML+=msg.status;
										}
										statusHTML+='<p><b>Timestamp:</b> '+msg.timestamp+'</p>';

										$('.modal-body').html(
												statusHTML
												+'<p><b>Send command:<b><p>'
												+'<button id="res'+msg.sid+'">Restart slideshow</button><br />'
												+'<textarea placeholder="Change to execute javascript on device"></textarea>'
										).find('textarea').last().change(function(){
											console.log('Will execute');
											UWAP.store.save({"type": "msg", "device": msg.device, "command": "true", "mid":  uuid.v1(), "sid": msg.sid, "code": "execute", "exec": this.value, "timestamp": moment().format("YYYY-MM-DD HH:mm:ss")},
													function(){}, catchError);
										});
										$('.modal-footer').html(
												'<a href="#" class="btn" data-dismiss="modal">Close</a> '
										);
										$('#res'+msg.sid).click(function(){
											console.log('Restarting '+msg.device);
											UWAP.store.save({"type": "msg", "mid":  uuid.v1(), "device": msg.device, "command": "true", "sid": msg.sid, "code": "restart", "timestamp": moment().format("YYYY-MM-DD HH:mm:ss")},
													function(){}, catchError);
										});

										$('#myModal').modal();
									}).parent().find('a').last().click(function(){
										console.log('plcik');
										console.log(this);
										$(this).parent().remove();
										
										ignore(msg);
									});
									
								}
							}
						}
					
					
				}
				else{
					setTimeout(function(){messagesGotten([msg]);}, 1000);
				}
			});
		}
		function deleteCommands(){
			console.log('Deleting commands');
			UWAP.store.remove({"type": "msg", "command": "true", "timestamp":{ $lt: moment().subtract('minutes', 1).format("YYYY-MM-DD HH:mm:ss")}}, function(){}, catchError);
		}
		function ignore(ign){
			UWAP.store.save({"type": "msg", "ignore": "true", "sid": ign.sid, "device": ign.device, "timestamp": moment().format("YYYY-MM-DD HH:mm:ss")}, function(){}, catchError);
		}
		function ignoredGotten(d){
			ignoredBool = true;
			$.each(d, function(i, ign){
				sm.ignored.push(ign);
				ignore(ign);
				
			});
		}
		function loggedIn(u){
			
			user = u;
			for(var key in user.groups) {
				groups.push({name: user.groups[key], ident: key});
			}
			sm.init();
			
			$('#deviceInput').val(u.name+'\'s computer');
		}	
		
		var sm = new SM();
		UWAP.auth.require(loggedIn);
		var user = '';
		var groups = new Array();
		function slideAdded(slide, show){
			if(!show.slides){
				show.slides = new Array();
			}
			$.each(slideShowTypes, function(i, type){
				if(type.title==show.stype){
					if(type.plugin.slideSave){
						slide = type.plugin.slideSave(slide);
					}
				}
			});
			show.slides.push(slide);
			show.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
			console.log(show);
			UWAP.store.save(show, function(){
				UWAP.store.remove({"type": "slideshow", "title": show.title, "timestamp": {$lt : show.timestamp}}, function(){}, catchError);
			}, catchError);
			var number = "1";
			if(show.slides){
				number = show.slides.length;
			}
			$('#slideDiv'+show.sid).append('<a href="javascript:void(0)" id="'+slide.sid+'">'+(number)
					+'</a> - ').find('a').last().click(function(){
						sm.editSlide(show, slide);
			});
		}
		function slideRemoved(slide, show){
			$.each(show.slides, function(i, sl){
				if(slide == sl){
					show.slides.splice(i, 1);
					makeSlideList(show);
					UWAP.store.save(show, function(){
						UWAP.store.remove({"type": "slideshow", "title": show.title, "timestamp": {$lt : show.timestamp}}, function(){}, catchError);
					}, catchError);
				}
			});
		}
		function slideEdited(slide, show){
			$.each(show.slides, function(i, sl){
				if(sl.sid && slide.sid && sl.sid == slide.sid){
					show.slides.splice(i, 1);
					show.slides.splice(i,0,slide);
					makeSlideList(show);
					console.log(show);
					UWAP.store.save(show, function(){
						UWAP.store.remove({"type": "slideshow", "title": show.title, "timestamp": {$lt : show.timestamp}}, function(){}, catchError);
					}, catchError);
				}
			});
		}
		function showAdded(show){
			UWAP.store.save(show,
					function(){
				sm.init();
				sm.messageTime = moment().subtract(3, 'years').format("YYYY-MM-DD HH:mm:ss");
			}, catchError);
			
		}
		function showRemoved(show){
			UWAP.store.remove(show, function(){sm.init();}, catchError);
		}
		function showEdited(show){
			var oldShow = show;
			show.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
			UWAP.store.save(show, function() {
				UWAP.store.remove({ "sid": show.sid, "timestamp": { $lt: show.timestamp}}, function(){sm.init();}, catchError);
			}, catchError);
			
		}
		function makeSlideList(show){
			$('#slideDiv'+show.sid).html('');
			$.each(show.slides, function(i, slide){
				$('#slideDiv'+show.sid).append('<a href="javascript:void(0)" id="'+slide.sid+'">'+(i+1)
						+'</a> - ').find('a').last().click(function(){
							sm.editSlide(show, slide);
						});
			});
		}
		
	});
});
var slideTypes = new Array();
var slideShowTypes = new Array();
var widgetTypes = new Array();
function regPlugin(plugin){
		try{
			var plugin = new plugin;	

			if(plugin.title && plugin.type){
				if(plugin.type == 'slide'){
					slideTypes.push({"title": plugin.title, "plugin": plugin});
				}
				else if(plugin.type == 'slideshow'){
					slideShowTypes.push({"title": plugin.title, "plugin": plugin});
				}
				else if(plugin.type == 'widget'){
					widgetTypes.push({"title": plugin.title, "plugin": plugin});
				}
				else{
					console.log('Unknown plugin type:');
					console.log(plugin);
				}
			}
			else{
				console.log('Plugin lacks title or type:');
				console.log(plugin);
			}
		}
		catch(e){
			console.log(e);
		}
	}
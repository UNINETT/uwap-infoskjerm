require(['plugins/CkSlide', 'plugins/ImpressShow','js/lib/router.jquery.js'], function(){
	$(document).ready(function() {
		var device = '';
		var show = '';
		var plug = null;
		var currentSlide = null;
		var storedStatus = null;
		var totalProbability = 0;
		var status = 'Initializing slideshow';
		var statusColor = "green";
		var version = null;
		var readMessages = new Array();
		var messageTimeStamp = moment().format("YYYY-MM-DD HH:mm:ss");
		
		
		try {
			UWAP.auth.require(loggedIn);
		}catch(ex){
			reportError(ex, 'inited');
		}
		
		function refreshPage(){
			var uri= '';
			if(showHTML=="2"){
				uri = "https://infoskjerm.uwap.org/show.html#/show="+show.sid+"/device="+device;
			}
			else{
				uri = "https://infoskjerm.uwap.org/show2.html#/show="+show.sid+"/device="+device;	
			}
			
			window.location.href = uri;
		}
		function checkForNewVersion(){
			UWAP.data.get('https://infoskjerm.uwap.org/version.txt', null, function(d){
				
				if(version == null){
					version = d;
				}
				else if(version == d){
					
				}
				else{
					refreshPage();
				}
			});
		}
		
		function showNewSlide(){
			try{
				var ranProb = Math.random()*totalProbability;
				var tempProb = 0;
				var i = 0;
				while(tempProb<ranProb){
					tempProb= tempProb + parseFloat(show.slides[i].probability);
					i++;
				}
//				console.log('Total prob: '+totalProbability+', gave random: '+ranProb+', and now tempProb is: '+tempProb);
//				console.log('show slide: '+(i-1));
				plug.showHTML($('#container'), show.slides[i-1]);
//				console.log('Will show for '+show.slides[i-1].duration+' seconds');
				setTimeout(function(){showNewSlide();}, show.slides[i-1].duration * 1000);
				if(!status.error){
					status='Showing slide '+(i-1);
					status.statusColor = 'green';
				}
			}
			catch(ex){
				reportError(ex, 'showing a new slide');
			}
		}
		
		function startTheShow(){
			try{
				if(plug != null && plug.start){
					plug.start($('#container'), show);
				}
				else{
//					console.log('no start from plugin');
				}
				totalProbability = 0;
				//console.log(show.slides[0].content);
				$.each(show.slides, function(i, sl){
					totalProbability = totalProbability + parseFloat(sl.probability);
				});
				i=0;
				
				showNewSlide();
					
				setIntervals();
			}
			catch(ex){
				reportError(ex, 'starting the show');
			}
		}
		
		function loggedIn(u){
			try{
				$.router.addHandler('showHandler', function(get){
					var showid = $.router.get('show');
//					console.log(showid);
					if(showid){
						UWAP.store.queryOne({ "type":"slideshow", "sid": showid}, function(d){
							show = d;
							try{
								var found = false;
//								console.log(showPlugins);
								$.each(showPlugins, function(i, pl){
//									console.log(d.stype+' vs '+pl.title);
									if(d.stype == pl.title && found == false){
//										console.log(pl);
										found = true;
										plug = pl.plugin;
										
										startTheShow();
									}
								});
							}
							catch(ex){
								reportError(ex, 'setting up slideshow with gotten show');
							}
						}, catchError);
					}
				});

				$.router.addHandler('deviceHandler', function(get){
					var tempDevice =  $.router.get('device');
					if(tempDevice){
						device = tempDevice;
					}
				});
				
			}
			catch(ex){
				reportError(ex, 'tried to add routerhandlers');
			}
		}
		
		
		function reportError(ex, doingWhat){
			try{
				console.log(ex);
				console.log(doingWhat);
				status.error = ex.type;
				status.arguments = ex.arguments;
				statusColor = 'red';
//				UWAP.store.save({"type": "msg", "timestamp": moment().format("YYYY-MM-DD HH:mm:ss"), "msg": "Error", "sid": show.sid, "device": device, "ex": ex, "doingWhat": doingWhat}, function(){}, catchError);
			}
			catch(ex){
				
			}
			
		}
		
		function setIntervals(){
			try{
				setInterval(sendStatus, 10000);
				setInterval(checkMessages, 10000);
				setInterval(checkForNewVersion, 30000);
			}
			catch(ex){
				reportError(ex, 'tried setting intervals');
			}
			
		}
		function sendStatus(){
			try{
				if(storedStatus==null){
					deleteMSG();
//					console.log('sendStatus');
					var tempStamp = moment().format("YYYY-MM-DD HH:mm:ss");
					var tempStatus = status;
					var tempStatusColor = statusColor;
					UWAP.store.save({"type": "msg", "st": "true", "status": tempStatus, "sid":show.sid, "device":device, "statusColor": tempStatusColor, "timestamp": tempStamp}, function(d){
						UWAP.store.queryOne({"type":"msg", "st": "true","status":tempStatus, "sid":show.sid, "device":device, "statusColor": tempStatusColor, "timestamp":tempStamp}, function(d){
							storedStatus = d;
						}, catchError);
						
					}, catchError);
				}
				else{
					storedStatus.status = status;
					storedStatus.statusColor = statusColor;
					storedStatus.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
					UWAP.store.save(storedStatus, function(){}, catchError);
				}	
			}
			catch(ex){
				reportError(ex, 'tried saying im here');
			}
			
		}
		function deleteMSG(){
//			console.log('deleteMSG');
			try{
				UWAP.store.remove({"type": "msg", "device": device, "st":"true"}, function(){}, catchError);
			}
			catch(ex){
				reportError(ex, 'tried deleting messages')
			}
			
		}
		function saveMsgRead(msg){
			msg.read = "true";
			UWAP.store.save(msg, function(){}, catchError);
		}
		function checkMessages(){
			//timestamp this.
//			console.log('checking for commands');
			var tempTime = moment().format("YYYY-MM-DD HH:mm:ss");
			UWAP.store.queryList({"type": "msg", "command":"true", "sid": show.sid, "timestamp":{ $gt: messageTimeStamp}}, function(d){
				messageTimeStamp = tempTime;
				$.each(d, function(i,msg){
//					saveMsgRead(msg);
					console.log('got new message: ');
					console.log(msg);
					switch(msg.code){
					case "restart":
						console.log('restarting');
						status = 'restarting';
						status.statusColor = 'red';
						sendStatus();
						refreshPage();
						break;
					case "execute":
						status = 'executing code';
						status.statusColor = 'red';
						sendStatus();
						eval(msg.exec);
						break;
					default:
						console.log(msg);
					}

				});


			}, catchError);
		}

//Only used for logging. reportError should be used for sending msg.
function catchError(err){

		}
	});
});
var showPlugins = new Array();
var slidePlugins = new Array();

function regPlugin(plugin){
	try{
		var plugin = new plugin;	
		if(plugin.title && plugin.type){
			if(plugin.type == 'slide'){
				slidePlugins.push({"title": plugin.title, "plugin": plugin});
			}
			else if(plugin.type == 'slideshow'){
				showPlugins.push({"title": plugin.title, "plugin": plugin});
			}
//			else if(plugin.type == 'widget'){
//			widgetPlugins.push({"title": plugin.title, "plugin": plugin});
//			}
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





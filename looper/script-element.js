function Looper(input={track:[],path:''}){
	//Even though this version works with larger files, it's not recommended; you can hear things go just a little bit off, even though it generally stays correct
	
	const L=this;

	L.currentBar=0;
	
	//User values
	L.bars=input.bars || 4;					//How many bars the Looper has
	L.repeatFrom=input.repeatFrom || 0;		//Where to repeat from once finish
	L.track=input.track;					//The track info
	L.path=input.path;						//The path to the files
	L.loop=input.loop || false;				//Whether to loop
	L.autoplay=input.autoplay || false;		//Whether to automatically play on loading
	
	var loopBase=null;
	
	var loopTimeout=null;
	var buffer={};
	var elements={};
	var sources={};
	var loopDuration=0;
	
	//Load files from an array
	L.load=function(files){
		var promises=[];
		var frag=document.createDocumentFragment();
		
		//BUFFER FILES//
		for(var i=0;i<files.length;i++){
			//Skip null files
			if(files[i]===null) continue;
			
			let fileName=L.path+files[i];
			
			//Skip over existing elements
			if(elements[fileName]) continue;
			
			elements[fileName]=new Audio(fileName+'.mp3');
			elements[fileName].preload='auto';
			elements[fileName].controls=true;
			elements[fileName].load();
			
			if(i===0) loopBase=elements[fileName];
			
			promises.push(
				new Promise(function(resolve,reject){
					elements[fileName].addEventListener('canplaythrough',resolve);
				})
			);
			
			//frag.appendChild(elements[fileName]);
			document.getElementById('audio-files').appendChild(elements[fileName]);
		}
		
		//document.getElementById('audio-files').appendChild(frag);
		
		//Return a promise with the info
		return Promise.all(promises);
	}
	
	//Play the track
	L.play=function(){
		if(loopDuration===0){
			L.autoplay=true;
			console.log('Setting autoplay to true so will start once loaded...');
			return;
		}
		
		//If we're playing, exit
		if(loopTimeout!==null){
			return;
		}
		
		timeout(loopDuration-loopBase.currentTime);
		playBar(L.currentBar);
		L.paused=false;
	}
	
	function timeout(wait=loopDuration){
		loopTimeout=setTimeout(function(){
			L.currentBar++;
			
			//Set all layers back to 0
			for(var i=0;i<L.track.length;i++){
				
				var get=L.currentBar % L.track[i].length;
				
				//Skip null items
				if(L.track[i][get]===null) continue;
				
				let fileName=L.path+L.track[i][get];
				
				//Skip over unbuffered files as a safeguard
				if(!elements[fileName]){
					continue;
				}
				
				elements[fileName].currentTime=0;
			}
			
			playBar(L.currentBar);
			timeout();
		},Math.floor(wait*1000));
	}
	
	function playBar(bar=0){
		if(L.paused){
			
		}
		
		//See if we've passed the number of bars
		if(bar>=L.bars){
			//If we're not looping, stop
			if(L.loop===false){
				L.stopTrack();
			}
			
			//If we're looping, go back to repeatFrom
			bar=L.repeatFrom;
		}
		
		console.log(bar,L.bars);
		
		//Play all layers
		for(var i=0;i<L.track.length;i++){
			
			var get=bar % L.track[i].length;
			
			//Skip null items
			if(L.track[i][get]===null) continue;
			
			let fileName=L.path+L.track[i][get];
			
			//Skip over unbuffered files as a safeguard
			if(!elements[fileName]){
				continue;
			}
			
			elements[fileName].play();
		}
	}
	
	L.paused=false;
	L.pause=function(){
		for(var element in elements){
			elements[element].pause();
		}
		
		L.paused=true;
		clearTimeout(loopTimeout);
		loopTimeout=null;
	}
	
	L.stop=function(){
		for(var element in elements){
			elements[element].currentTime=0;
			elements[element].pause();
		}
		
		clearTimeout(loopTimeout);
		loopTimeout=null;
		L.currentBar=0;
	}
	
	L.adjustLayer=function(layer,input){
		//Append layer if requested
		if(layer==='new') layer=L.track.length;
		
		//If layer doesn't exist, add it
		if(!L.track[layer]) L.track[layer]=[];
		
		//Pause current layer
		for(var i=0;i<L.track[layer].length;i++){
			let element=elements[L.path+L.track[layer][i]];
			
			//If the file currently playing won't change, don't pause it!
			let getOld=L.currentBar % L.track[layer].length;
			let getNew=L.currentBar % input.length;
			if(L.track[layer][getOld]===input[getNew]) continue;
			/*//Play new track (it's been loaded)
			
			//THERE'S TOO MUCH DELAY AND OFFSET FOR THIS TO BE PRACTICAL
			
			else{
				var playNow=elements[L.path+input[getNew]];
				
				if(playNow){
					//If start tracks midway
					playNow.currentTime=element.currentTime;
					playNow.play();
				}
				
				console.log(playNow);
			}*/
			
			//If the element exists and isn't the same as the one that it's being set to
			if(element){
				element.pause();
				element.currentTime=0;
			}
		}
		
		//Once successfully load any not-loaded files, continue
		L.load(input).then(()=>{
			L.track[layer]=input;
		});
	}
	
	//START//
	var loadItems=[];
	for(var i=0;i<L.track.length;i++){
		for(var ii=0;ii<L.track[i].length;ii++){
			loadItems.push(L.track[i][ii]);
		}
	}
	
	L.load(loadItems).then(()=>{
		loopDuration=elements[L.path+loadItems[0]].duration;
		//loopDuration=values[0].duration;
		if(L.autoplay===true) L.playTrack();
	});
}
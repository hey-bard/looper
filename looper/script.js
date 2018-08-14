function Looper(input={track:[],path:''}){
	
	//It looks like audio buffer's meant for clips <45 seconds long; if that's the case, we might have to use MediaElementAudioSourceNode; but if that's the case, would it just be better to use a bunch of media elements? (if people have song tracks side-by-side greater than 45 seconds- which is extremely likely- we'll need to use media elements and line them up, in which case this whole setup seems unnecessary)
	
	//divs filled with audio elements, like characters? Connect the correct ones, save a common time? (the trick will be, I think, lining them up. One of the elements would have to be the reference against which every other piece is checked; probably layer 0)
	
	const L=this;

	L.context=new AudioContext();
	L.currentBar=0;
	
	//User values
	L.bars=input.bars || 4;					//How many bars the Looper has
	L.repeatFrom=input.repeatFrom || 0;		//Where to repeat from once finish
	L.track=input.track;					//The track info
	L.path=input.path;						//The path to the files
	L.loop=input.loop || false;				//Whether to loop
	L.autoplay=input.autoplay || false;		//Whether to automatically play on loading
	
	var loopInterval=null;
	var buffer={};
	var sources={};
	var loopDuration=0;
	
	//Load files from an array
	L.load=function(files){
		var promises=[];
		
		//BUFFER FILES//
		for(var i=0;i<files.length;i++){
			//Skip null files
			if(files[i]===null) continue;
			
			let fileName=L.path+files[i];
		
			//Skip over buffered and buffering tracks
			if(buffer[fileName]) continue;

			buffer[fileName]='LOADING';
		
			promises.push(
				new Promise(function(resolve,reject){
					fetch(fileName+'.mp3')
					.then(response=>response.arrayBuffer())
					.then(file=>{
						L.context.decodeAudioData(file,function(info){
							buffer[fileName]=info;
							resolve(info);
						},reject);
					})
				})
			);
		}
		
		//Return a promise with the info
		return Promise.all(promises);
	}
	
	//Play the track
	L.playTrack=function(){
		if(loopDuration===0){
			L.autoplay=true;
			console.log('Setting autoplay to true so will start once loaded...');
			return;
		}
		
		//If we're playing, exit
		if(loopInterval!==null){
			return;
		}
		
		loopInterval=setInterval(function(){
			L.currentBar++;
			playLoop();
		},Math.floor(loopDuration*1000));
		L.currentBar=0;
		
		playLoop();
	}
	
	function playLoop(){
		for(var i=0;i<L.track.length;i++){
			
			var get=L.currentBar % L.track[i].length;
			
			//Skip null items
			if(L.track[i][get]===null) continue;
			
			let fileName=L.path+L.track[i][get];
			
			//Skip over unbuffered files as a safeguard
			if(!buffer[fileName] || buffer[fileName]==='LOADING'){
				continue;
			}
			
			var source=L.context.createBufferSource();
			source.buffer=buffer[fileName];
			source.connect(L.context.destination);
			source.start(0);
			
			//Track sources
			sources[fileName]=source;
		}
		
		//See if we've passed the number of bars
		if(L.currentBar>L.bars){
			L.currentBar=L.repeatFrom;
			//If we're not looping, stop
			if(L.loop===false){
				L.stopTrack();
			}
		}
	}
	
	L.stopTrack=function(){
		for(var file in sources){
			sources[file].stop(0);
		}
		
		clearInterval(loopInterval);
		loopInterval=null;
	}
	
	L.adjustLayer=function(layer,input){
		//Append layer if requested
		if(layer==='new') layer=L.track.length;
		
		//If layer doesn't exist, add it
		if(!L.track[layer]) L.track[layer]=[];
		
		//Pause current layer
		for(var i=0;i<L.track[layer].length;i++){
			let source=sources[L.path+L.track[layer][i]];
			
			//If the file currently playing won't change, don't pause it!
			let getOld=L.currentBar % L.track[layer].length;
			let getNew=L.currentBar % input.length;
			if(L.track[layer][getOld]===input[getNew]) continue;
			
			//If the source exists and isn't the same as the one that it's being set to
			if(source) source.stop(0);
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
	
	L.load(loadItems).then((values)=>{
		loopDuration=values[0].duration;
		if(L.autoplay===true) L.playTrack();
	});
}
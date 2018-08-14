function Looper(input={track:[],path:''}){
	
	//It looks like audio buffer's meant for clips <45 seconds long; if that's the case, we might have to use MediaElementAudioSourceNode; but if that's the case, would it just be better to use a bunch of media elements? (if people have song tracks side-by-side greater than 45 seconds- which is extremely likely- we'll need to use media elements and line them up, in which case this whole setup seems unnecessary)
	
	//divs filled with audio elements, like characters? Connect the correct ones, save a common time? (the trick will be, I think, lining them up. One of the elements would have to be the reference against which every other piece is checked; probably layer 0)
	
	const L=this;

	L.context=new AudioContext();
	L.currentBar=0;
	
	//User valuse
	L.bars=input.bars || 4;					//How many bars the Looper has
	L.repeatFrom=input.repeatFrom || 0;		//Where to repeat from once finish
	L.track=input.track;					//The track info
	L.path=input.path;						//The path to the files
	L.loop=input.loop || false;				//Whether to loop
	
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
			
			let fileName=L.path+'/'+files[i];
		
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
		if(loopDuration===0) throw 'Error: Files not loaded!';
		
		//If we're playing, stop before playing again
		if(loopInterval!==null){
			L.stopTrack();
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
			
			let fileName=L.path+'/'+L.track[i][get];
			
			//Skip over unbuffered files as a safeguard
			if(!buffer[fileName] || buffer[fileName]==='LOADING'){
				console.log(fileName+' not buffered yet!');
				continue;
			}
			
			var source=L.context.createBufferSource();
			source.buffer=buffer[fileName];
			source.connect(L.context.destination);
			source.start(0);
			
			//Track sources
			if(!sources[L.track]) sources[L.track]={};
			sources[L.track][fileName]=source;
		}
		
		//See if we've passed the number of bars
		if(L.currentBar>L.bars){
			L.currentBar=L.repeatFrom;
			console.log(L.currentBar);
			//If we're not looping, stop
			if(L.loop===false){
				L.stopTrack();
			}
		}
	}
	
	L.stopTrack=function(){
		for(var file in sources[L.track]){
			sources[L.track][file].stop(0);
		}
		
		clearInterval(loopInterval);
		loopInterval=null;
	}
	
	L.adjustLayer=function(layer,input){
		//for(
		//sources[track][
		
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
	});
}
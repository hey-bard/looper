function Looper(input={track:[],path:''}){
	//Looper isn't recommended for audio files >45 seconds
	
	const L=this;

	L.context=new AudioContext();
	L.currentBar=0;
	
	//User values
	L.bars=input.bars || 4;					//How many bars the Looper has (a bar is the length of the first element in the first layer)
	L.repeatFrom=input.repeatFrom || 0;		//Where to repeat from once finish
	L.track=input.track;					//The track info
	L.path=input.path;						//The path to the files
	L.loop=input.loop || false;				//Whether to loop
	L.autoplay=input.autoplay || false;		//Whether to automatically play on loading
	
	var loopTimeout=null;
	var buffer={};
	var sources={};
	var loopDuration=0;
	var paused=0;							//0 if unpaused; a number of how far into the loop we are; -1 if in the process of pausing
	var timeStartedLoop;
	
	//Load files from an array
	L.load=function(files){
		var promises=[];
		
		//BUFFER FILES//
		for(var i=0;i<files.length;i++){
			//Skip null
			if(files[i]===null) continue;
			
			//Get all listed files (if we have random choices)
			var fileChoices=files[i].split('||');
			for(var ii=0;ii<fileChoices.length;ii++){
				//Skip null files
				if(fileChoices[ii]===null) continue;
				
				//Get all the files
				let fileName=L.path+fileChoices[ii];
			
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
		}
		
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
		
		//If we're paused start playing again
		if(paused>0){
			console.log(loopDuration,paused);
			
			//Start up the interval based on pause time
			L.context.resume().then(()=>{
				startTimeout(loopDuration-paused);
				
				//Estimate how far into the loop we are
				timeStartedLoop=new Date().getTime()-paused;
				
				paused=0;
			});
			return;
		}
		
		//If we're playing, exit
		if(loopTimeout!==null){
			return;
		}
		
		startTimeout();
		L.currentBar=0;
		
		playLoop();
	}
	
	function startTimeout(waitFor=loopDuration){
		loopTimeout=setTimeout(function(){
			L.currentBar++;
			playLoop();
			startTimeout();
		},waitFor);
	}
	
	function playLoop(){
		timeStartedLoop=new Date().getTime();
		
		//See if we've passed the number of bars
		if(L.currentBar>=L.bars){
			//If we're not looping, stop
			if(L.loop===false){
				L.stop();
				return;
			}
			
			//If we're looping, go back to repeatFrom
			L.currentBar=L.repeatFrom;
		}
		
		//Play all layers
		for(var i=0;i<L.track.length;i++){
			
			var get=L.currentBar % L.track[i].length;
			
			//Skip null items
			if(L.track[i][get]===null) continue;
			
			//If we have a file list, get one of the listed files
			var files=L.track[i][get].split('||');
			var fileNum=Math.floor(files.length*Math.random());
			//Don't go beyond the last file (there's a miniscule chance this can happen)
			if(fileNum>=files.length) fileNum=files.length-1;
			let fileName=files[fileNum];
			
			//Skip null items
			if(fileName===null) continue;
			
			//Add the path on
			fileName=L.path+fileName;
			
			//Skip over unbuffered files as a safeguard
			if(!buffer[fileName] || buffer[fileName]==='LOADING'){
				continue;
			}
			
			playBuffer(fileName);
		}
	}
	
	L.pause=function(){
		//If we're already paused, don't do it!
		if(paused!==0) return;
		
		//In the process of pausing
		paused=-1;
		
		//Paused is set based on how far into the loop we are, so we start the next timeout in good time
		L.context.suspend().then(()=>{
			paused+=new Date().getTime()-timeStartedLoop;
			clearTimeout(loopTimeout);
		});
	}
	
	L.stop=function(){
		for(var file in sources){
			sources[file].stop(0);
		}
		
		clearTimeout(loopTimeout);
		loopTimeout=null;
	}
	
	L.remove=function(){
		clearTimeout(loopTimeout);
		L.context.close();
	}
	
	L.adjustLayer=function(layer,input){
		//Append layer if requested
		if(layer==='new') layer=L.track.length;
		
		//If layer doesn't exist, add it
		if(!L.track[layer]) L.track[layer]=[];
		
		var playThis=null;
		
		//Pause current layer
		for(var i=0;i<L.track[layer].length;i++){
			let source=sources[L.path+L.track[layer][i]];
			
			//If the file currently playing won't change, don't pause it!
			let getOld=L.currentBar % L.track[layer].length;
			let getNew=L.currentBar % input.length;
			if(L.track[layer][getOld]===input[getNew]) continue;
			
			//If the source exists and isn't the same as the one that it's being set to
			if(source){
				source.stop(0);
				
				//Remember item to play
				playThis=L.path+input[getNew];
			}
		}
		
		//Once successfully load any not-loaded files, continue
		L.load(input).then(()=>{
			L.track[layer]=input;
			playBuffer(playThis,(new Date().getTime()-timeStartedLoop)/1000);
		});
	}
	
	function playBuffer(fileName,offset=0){
		var source=L.context.createBufferSource();
		source.buffer=buffer[fileName];
		source.connect(L.context.destination);
		source.start(0,offset);
		
		//Track sources
		sources[fileName]=source;
	}
	
	//START//
	var loadItems=[];
	for(var i=0;i<L.track.length;i++){
		for(var ii=0;ii<L.track[i].length;ii++){
			loadItems.push(L.track[i][ii]);
		}
	}
	
	L.load(loadItems).then((values)=>{
		loopDuration=Math.floor(values[0].duration*1000);
		if(L.autoplay) L.play();
	});
}
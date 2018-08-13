function Looper(input={}){
	
	//It looks like audio buffer's meant for clips <45 seconds long; if that's the case, we might have to use MediaElementAudioSourceNode; but if that's the case, would it just be better to use a bunch of media elements? (if people have song tracks side-by-side greater than 45 seconds- which is extremely likely- we'll need to use media elements and line them up, in which case this whole setup seems unnecessary)
	
	//divs filled with audio elements, like characters? Connect the correct ones, save a common time? (the trick will be, I think, lining them up. One of the elements would have to be the reference against which every other piece is checked; probably layer 0)
	
	const L=this;
	L.context=new AudioContext();
	L.loops=0;
	L.track=input.track;
	L.path=input.path;
	
	var loopInterval=null;
	var buffer={};
	var sources={};
	var loopDuration=0;
	
	//Load files from an array
	L.load=function(files){
		var promises=[];
		
		//BUFFER FILES//
		for(var i=0;i<files.length;i++){
			let fileName=L.path+'/'+files[i];
		
			//Skip over buffered or buffering tracks
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
		Promise.all(promises).then((values)=>{
			loopDuration=values[0].duration;
		});
	}
	
	//Play the track
	L.playTrack=function(){
		loopInterval=setInterval(playLoop,Math.floor(loopDuration*1000));
		L.loops=0;
		
		playLoop();
	}
	
	function playLoop(){
		for(var i=0;i<L.track.length;i++){
			var get=L.loops % L.track[i].length;
			
			var fileName=L.path+'/'+L.track[i][get];
			
			var source=L.context.createBufferSource();
			source.buffer=buffer[fileName];
			source.connect(L.context.destination);
			source.start(0);
			
			//Track sources
			if(!sources[L.track]) sources[L.track]={};
			sources[L.track][fileName]=source;
		}
		
		L.loops++;
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
	
		L.track[layer]=input;
	}
}
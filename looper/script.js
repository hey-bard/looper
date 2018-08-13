function Looper(){
	//It looks like audio buffer's meant for clips <45 seconds long; if that's the case, we might have to use MediaElementAudioSourceNode; but if that's the case, would it just be better to use a bunch of media elements? (if people have song tracks side-by-side greater than 45 seconds- which is extremely likely- we'll need to use media elements and line them up, in which case this whole setup seems unnecessary)
	
	//divs filled with audio elements, like characters? Connect the correct ones, save a common time? (the trick will be, I think, lining them up. One of the elements would have to be the reference against which every other piece is checked; probably layer 0)
	
	const L=this;
	
	L.context=new AudioContext();
	L.loops=0;
	var loopInterval=null;
	
	//Store all audio clips in this here buffer
	var buffer={};
	var sources={};
	
	//Load files from an array
	L.load=function(files){
		var promises=[];
		
		//BUFFER FILES//
		for(var i=0;i<files.length;i++){
			let fileName=files[i];
		
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
		return Promise.all(promises);
	}
	
	//Play the track
	L.playTrack=function(track){
		loopInterval=setInterval(function(){playLoop(track);},Math.floor(loopDuration*1000));
		L.loops=0;
		
		playLoop(track);
	}
	
	function playLoop(track){
		for(var i=0;i<music[track].length;i++){
			var get=L.loops % music[track][i].length;
			
			var fileName=track+'/'+music[track][i][get];
			
			var source=L.context.createBufferSource();
			source.buffer=buffer[fileName];
			source.connect(L.context.destination);
			source.start(0);
			
			//Track sources
			if(!sources[track]) sources[track]={};
			sources[track][fileName]=source;
		}
		
		L.loops++;
	}
	
	L.stopTrack=function(track){
		for(var file in sources[track]){
			sources[track][file].stop(0);
		}
		
		clearInterval(loopInterval);
	}
	
	L.adjustLayer=function(track,layer,input){
		//for(
		//sources[track][
	
		music[track][layer]=input;
	}
}
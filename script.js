var container=document.createElement("p");
	
var objects=Object.keys(song);

for(var i=0;i<objects.length;i++){
	var line=document.createElement("span");
	
	line.innerHTML+='    <span class="obj-name">'+objects[i]+'</span>: ';
	var value=song[objects[i]];
	
	var print='';
	var valuePrint=document.createElement("span");
	
	switch(typeof value){
		case 'number':
			print+=value;
			break;
		case 'boolean':
			print+=value ? 'true' : 'false';
			break;
		case 'string':
			print+='"'+value+'"';
			break;
		case 'object':
			if(value && value.id) print+='document.getElementById("'+value.id+'")';
			else print+=JSON.stringify(value,null,'    ');
			break;
		default:
			//
			break;
	}
	
	valuePrint.innerText=print;

	line.appendChild(valuePrint);
	container.appendChild(line);
	
	if(i<objects.length-1){
		container.innerHTML+=',<br>';
	}
}

document.getElementById("code").innerHTML=container.innerHTML;
document.getElementById("propertyExplanation").innerHTML='Hover over a property to get info on it!';

var properties=document.querySelectorAll(".obj-name");
for(var i=0;i<properties.length;i++){
	properties[i].addEventListener("mouseover",function(){
		if(document.querySelector('.obj-name-study')) document.querySelector('.obj-name-study').classList.remove('obj-name-study');
		
		this.classList.add('obj-name-study');
		
		document.getElementById("propertyExplanation").innerHTML="<strong>"+this.innerHTML+"</strong>: "+(propertyInfo[this.innerHTML]);
	});
}

var propertyInfo={
	context:"The audio context in use."
	,currentBar:"The bar of the song we're on."
	,bars:"The total number of bars in the song."
	,repeatFrom:"When reach the end of the song, which bar to return to."
	,track:"Contains an array of all the layers. The first item in the first array sets the duration of a loop. May reference files (assumed to be .mp3s) or be <em>null</em>."
	,path:"The path to the song's folder."
	,loop:"Whether or not we'll play at the end. I mean, it's called Looper, yeah, but this is still an option. Defaults to <em>false</em>"
	,autoplay:"Whether or not to play as soon as it loads. Defaults to <em>false</em>."
	,load:"A public function for loading the files."
	,play:"A public function for playing the Looper."
	,pause:"A public function for pausing the Looper. If played again, it will continue from where it was paused."
	,stop:"A public function for stopping the Looper. If played again, it will play from the Looper's beginning."
	,remove:"Gets rid of the Looper and closes its audio context."
	,adjustLayer:"A public function for adjusting a layer while Looper is playing."
};

//UI BUTTONS//
document.getElementById('play').addEventListener('click',function(){
	song.play();
});

document.getElementById('stop').addEventListener('click',function(){
	song.stop()
});

document.getElementById('pause').addEventListener('click',function(){
	song.pause()
});
/*
//Testing enabling and disabling different layers
document.getElementById('layer-0').addEventListener('change',adjustLayer);
document.getElementById('layer-1').addEventListener('change',adjustLayer);
document.getElementById('layer-2').addEventListener('change',adjustLayer);

function adjustLayer(){
	var value=this.value;
	if(value==='null') value=[null];
	else value=value.split('&');

	song.adjustLayer(this.id.split('-')[1],value);
}*/
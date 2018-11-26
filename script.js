// SETUP //
var settings={
	path:'music/beat/'
	,track:[
		['kick']
		,[null,null,null,null,'clap']
		,[null,'hat',null,'hat',null]
		,[null,'snare',null,'snare',null]
		,[null,'synth','synth','synth','synth']
	]
	,bars:5
	,repeatFrom:1
	,loop:true
}

var printer=new ObjPrint({
	window:document.getElementById('code')
	,explanationWindow:document.getElementById('propertyExplanation')
	,properties:{
		adjustLayer:"A public function for adjusting a layer while Looper is playing."
		,'adjustLayer(layer)':"The layer's number. Can also be 'new' to make a new layer."
		,'adjustLayer(input)':"An array of the replacement content for the layer."
		,autoplay:"Whether or not to play as soon as it loads. Defaults to <em>false</em>."
		,bars:"The total number of bars in the song."
		,context:"The audio context in use."
		,currentBar:"The bar of the song we're on."
		,load:"A public function for loading the files."
		,loop:"Whether or not we'll play at the end. I mean, it's called Looper, yeah, but this is still an option. Defaults to <em>false</em>"
		,path:"The path to the song's folder."
		,'load(files)':'An array of files to load.'
		,pause:"A public function for pausing the Looper. If played again, it will continue from where it was paused."
		,play:"A public function for playing the Looper."
		,remove:"Gets rid of the Looper and closes its audio context."
		,repeatFrom:"When reach the end of the song, which bar to return to."
		,stop:"A public function for stopping the Looper. If played again, it will play from the Looper's beginning."
		,track:"Contains an array of all the layers. The first item in the first array sets the duration of a loop. May reference files (assumed to be .mp3s) or be <em>null</em>."
		,'track.#':"A layer."
		,'track.#.#':"Plays in this layer during the nth loop. If <em>null</em>, nothing plays in this layer during the nth loop."
	}
});

printer.print(settings);

var song=new Looper(settings);

/*
//WACKY//
var song=new Looper({
	path:'music/silly/'
	,track:[
		['drums/a1','drums/b1']
		,['bass/main',null,null,null]
		,['harmony',null,null,null]
		,[null,null,null,null,	'melody/first',null,null,null,	null,null,null,null,				'melody/first',null,null,null]
		,[null,null,null,null,	null,null,null,null,			'melody/second',null,null,null,		'melody/second',null,null,null]
		,[null,null,null,null,	'bass/upper',null,null,null,	'bass/upper',null,null,null,		'bass/upper',null,null,null]
		,[null,null,null,null,	null,null,null,null,			null,null,null,null,				'bass/extra',null,null,null]
	]
	,bars:16
	,repeatFrom:12
	,loop:true
});*/
/*
//CLOSURE//
var song=new Looper({
	path:'music/closure/'
	,track:[
		['harmony/starting']
		,[null,'harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal','harmony/normal']
		,[null,null,null,'kick','kick','kick','kick','kick','kick','kick','kick','kick']
		,[null,null,null,'bass/sub','bass/sub','bass/sub','bass/sub','bass/sub','bass/sub','bass/sub','bass/sub','bass/sub']
		,[null,null,null,null,null,null,'snap','snap','snap','snap','snap','snap']
		,[null,null,null,null,null,null,null,null,null,'melody',null,'bass/cello']
		,[null,null,null,null,null,null,null,null,'harmony/emotion','harmony/emotion','harmony/emotion','harmony/emotion']
		,[null,null,null,null,null,null,null,null,null,null,null,'harmony/deep-emotion']
		,[null,null,null,null,null,null,null,null,null,null,null,'hat']
	]
	,bars:12
	,repeatFrom:8
	,loop:true
});*/

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
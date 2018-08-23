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
	window:"The element to put Ferret into. Ideally a div. Must be set."
	,buttons:"An array of all the buttons. Buttons have many attributes: <strong>content</strong> sets the text, <strong>classes</strong> adds listed CSS classes, <strong>css</strong> adds CSS, <strong>tags</strong> are additional terms you can search for the button by, <strong>element</strong> is automatically set to the button's created element and can start unset or <em>null</em>, and <strong>action</strong> is where to go to on clicking the button."
	,minSize:"The smallest a button can get if it's far back. Defaults to <em>.4</em>."
	,fps:"How many frames per second to read mouse movements for scrubbing. Does not affect animation smoothness; animations should be smooth regardless of what this is set to. Defaults to <em>10</em>."
	,query:"Save searches to the querystring, and load searches from the querystring. This allows going back and forward to revisit searches and creating links to specific searches. If <em>null</em>, this will be disabled; if anything else, it will be the query's name in the URL. Defaults to <em>null</em>."
};
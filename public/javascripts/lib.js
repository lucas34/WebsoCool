var getUniqueID = (function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
	.toString(16)
	.substring(1);
	}
	return function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
	};
})();



function getBgColorHex(elem){ 
	var color = elem.css('background-color');
	var hex; 
	if(color.indexOf('#')>-1)
	{
		hex = color; 
	}
	else
	{ 
		var rgb = color.match(/\d+/g);
		hex = '#'+ ('0' + parseInt(rgb[0], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2); 
	} 
	return hex; 
}



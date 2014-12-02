function userManager(){

	this.name;
	this.id;

}

userManager.prototype = {

	create : function(name){
		user.name = name;
		user.id = getUniqueID();

	}

}


var user = new userManager();


function room()(){
	
	this.id;
	this.name;

}

var rooms = new Array();



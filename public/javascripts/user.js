function userInfo(){

	this.name;
	this.id;

}

var user = new userInfo();


function room(id, name, bool){
	
	this.id = id;
	this.name = name;
	this.voidable = bool;
	this.users = {};
}


var rooms = new Array();



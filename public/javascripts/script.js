/*
 *	Manage rooms
 */
function roomManager(){
	this.current = "";
}

roomManager.prototype = {

	add : function (id,name){

		// Create tab
		var formatID = "'"+id+"'";
		var html = '<div class="col span_1_of_12 room" id="tab_room_'+id+'" onclick="view.room.set('+formatID+')">'+name+'</div>';
		$("#rooms").append(html);

		// Create People block
		var html2 = '<div id="peoples_room_'+id+'"></div>';
		$("#peoples_room").append(html2);
		$("#peoples_room_"+id).hide()


		// Create message block
		var html3 = '<div id="messages_room_'+id+'"></div>';
		$("#messages_room").append(html3);
		$("#messages_room_"+id).hide()

		/*
		 * Add me in the room
		 */
		view.user.addMeInRoom(id); 

		if(view.room.current == ""){
			view.room.set(id);
		}
	},

	/*
	 *	Go to the room
	 */
	set : function (room){
		$("#peoples_room_"+view.room.current).hide();
		$("#peoples_room_"+room).show();

		$("#messages_room_"+view.room.current).hide();
		$("#messages_room_"+room).show();

		$("#tab_room_"+view.room.current).css("background-color",view.setting.color.tab);
		$("#tab_room_"+room).css("background-color",view.setting.color.selected);
		$("#tab_room_"+view.room.current)

		view.room.current = room;

	},

	/*
	 *	Change color of the tab to notify a new message
	 */
	notify : function (room){
		$("#tab_room_"+room).css("background-color",view.setting.color.notification);
	},

	remove : function(room){

		$("#messages_room_"+room).remove();
		$("#tab_room_"+room).remove();
		$("#peoples_room_"+room).remove();

		if(view.room.current == room){
			var nextIdRoom =  $("#rooms").children().attr('id').substring(9);
			view.room.set(nextIdRoom);
		}

	}

}


/*
 *	Manager users
 */

function userManager(){}

userManager.prototype = {

	/*
	 * Delete user in all rooms
	 */
	removeInAllRooms : function (username){
		$("."+username).remove();
	},

	addInRoom : function(username,room){
		var html = '<div class="'+username+'"> <img src="images/friend.png" /><span>'+username+'</span></div>';
		$('#peoples_room_'+room).append(html);
	},

	addMeInRoom : function(room){
		var html = '<div class="'+view.setting.username+'"> <img src="images/friend.png" /><b>'+view.setting.username+'</b></div>';
		$('#peoples_room_'+room).append(html);
	},

	removeInRoom : function(username, room){
		$("#peoples_room_"+room).find("."+username).remove();		

	}

}

/*
 *	Manage message
 */

function messageManager(){}

messageManager.prototype = {

	add : function(username, message, room){

		$("#messages_room_"+room).append("<b>"+username+"</b> : "+message+"<br />");

		if(view.room.current != room){
			view.room.notify(room);
		}
	}

}

/*
 *	Form manager
 */
function formManager(){}

formManager.prototype = {

	submit : function(){
		var message = $("#input").val()
		view.message.add("Lucas",message, view.room.current);		
		$("#input").val("");

		// CONNECTOR SEND MESSAGE (message)
	}

}


/*
 *	View settings manager
 */

function settingManager(){
	this.color = new function(){
		this.notification = "orange";
		this.selected = "red";
		this.tab = "#70AB00";	
	}

	this.username = "Lucas";
}

/*
 *	Need to call views beforme each action.
 */
var view = new function (){

	this.room =  new roomManager();
	this.user = new userManager();
	this.message = new messageManager();
	this.form = new formManager();

	this.setting = new settingManager();

}();



/*
 * Exemples d'utilisation
 */
var init = function (){

	/*
	 * 	Set my username
	 * 	params : username
	 */
	view.setting.username = "Lucas";

	/*
	 * Create room
	 * params : ID Room, Name
	 */
	view.room.add("Master","Master Room");
	view.room.add("Friends","Friends");
	view.room.add("Other", "Other");

	/*
	 *  Add user in a room
	 *	params : Username, ID Room
	 */
	view.user.addInRoom("Anthony","Master");
	view.user.addInRoom("Fred","Friends");
	view.user.addInRoom("Cyrille","Friends");


	/*
	 *  add Message in a room
	 *	params : Username, message, ID Room
	 */
	view.message.add("Cyrille","Coucou","Friends");
	view.message.add("Fred","Bonjour","Friends");
}();


/*
 *	Automatique : 
 *
 *	- Quand tu crée une room tu es automatiquement ajouté dedant.
 *	- Lors de la création de la 1er room, elle sera automatique la 1er à s'afficher via (view.room.set())
 *	- Si tu ajoute un message dans une room et que tu n'es pas dedant la couleur de l'onglet change
 */

/*
 *	Manage rooms
 */
function roomManager(){
	this.current = "";

	this.rooms = new Array();
}

roomManager.prototype = {

	add : function (id,name){

		if(jQuery.inArray(id,view.room.rooms) != -1){
			alert('Room already exist !!');
			return;
		}

		// Create tab
		var formatID = "'"+id+"'";
		var onClick = 'view.room.remove('+formatID+')';
		var html = '<div class="col span_1_of_12 room" style="background-color:'+view.setting.color.tab+'" id="tab_room_'+id+'">'+
		'<span onclick="view.room.set('+formatID+')">'+name+'</span>  <img src="images/close.png" onclick="'+onClick+'" /></div>';
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

		view.room.rooms.push(id)

		if(view.room.current == ""){
			view.room.set(id);
		}
	},

	/*
	 *	Go to the room
	 */
	set : function (room){

		// Hide previous
		if(view.room.current == "setting"){
			view.setting.hide();
		}else{
			$("#peoples_room_"+view.room.current).hide();
			$("#messages_room_"+view.room.current).hide();
		}

		$("#peoples_room_"+room).show();
		$("#messages_room_"+room).show();

		$("#tab_room_"+view.room.current).css("background-color",view.setting.color.tab);
		$("#tab_room_"+room).css("background-color",view.setting.color.selected);
		$("#tab_room_"+view.room.current)

		if(view.room.current == "setting"){
			view.setting.hide();
		}

		view.room.current = room;

	},

	/*
	 *	Change color of the tab to notify a new message
	 */
	notify : function (room){
		$("#tab_room_"+room).css("background-color",view.setting.color.notification);
	},

	remove : function(room){

		var position = jQuery.inArray(room,view.room.rooms);
		view.room.rooms.splice(position,1);

		$("#messages_room_"+room).remove();
		$("#tab_room_"+room).remove();
		$("#peoples_room_"+room).remove();

		if(view.room.current == room){
			var nextIdRoom =  $("#rooms").children().eq(0).attr('id').substring(9);
			console.log("Set : "+nextIdRoom);
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

	newMessage : function(){
		var message = $("#message").val()
		view.message.add("Lucas",message, view.room.current);		
		$("#message").val("");

		// CONNECTOR SEND MESSAGE (message)
	},

	newRoom : function(){
		var room = $("#create_room").val();
		var idRoom = room.replace(/\s+/g, '');
			idRoom = idRoom.replace(/'+/g, '');
			idRoom = idRoom.replace(/"+/g, '');
			idRoom = idRoom.replace(/\/+/g, '_');
			idRoom = idRoom.replace(/\(+/g, '_');
			idRoom = idRoom.replace(/\)+/g, '_');
			idRoom = idRoom.replace(/&+/g, '_');
			idRoom = idRoom.replace(/=+/g, '_');
			idRoom = idRoom.replace(/²+/g, '_');

		view.room.add(idRoom,room);
		$("#create_room").val("");


	}

}


/*
 *	View settings manager
 */

function settingManager(){

	var __self = this;

	this.color = new function(){


		this.notification = "#fa00fa";
		this.selected = "#ff0000";
		this.tab = "#A0F300";


		var self = this;
		this.update = new function(){
			this.notification = function(){
				self.notification = $("#color_notify").val();
			}
			this.selected = function(){
				self.selected = $("#color_selected").val();
			}

			this.tab = function(){
				self.tab = $("#color_tab").val();
			}

		}

		/*
		 *	Init function
		 */
		new function(){
			/*
			 *	Hide settings by default
			 */
			$("#settings_manager").hide();
			$("#left_box").show();

			/*
			 *	Init color settings input
			 */
			$("#color_notify").val(self.notification);
			$("#color_selected").val(self.selected);
			$("#color_tab").val(self.tab);

			$("#settings_tab").css("background-color",self.tab);

		}

	}

	this.username = "Lucas";
}

settingManager.prototype = {

	show : function(){
		$("#settings_manager").show();
		$("#left_box").hide();
		
		$("#peoples_room_"+view.room.current).hide();
		$("#messages_room_"+view.room.current).hide();

		$("#tab_room_"+view.room.current).css("background-color",view.setting.color.tab);
		$("#settings_tab").css("background-color",view.setting.color.selected);

		view.room.current = "setting";

	},

	hide : function(){
		$("#settings_manager").hide();
		$("#left_box").show();

		$("#settings_tab").css("background-color",view.setting.color.tab);

	}

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
}





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


/*
 *	Tools
 */
$("#create_room").keypress(function(event) {
	if (event.which == 13) {
		event.preventDefault();
		view.form.newRoom();				 
	}
});



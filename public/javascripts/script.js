/*
 *	Gestion des salles de chat
 */
function room(){
	this.current = "";
}

room.prototype = {

	add : function (room){
		var roomName = "'"+room+"'";
		var html = '<div class="col span_1_of_12 room" id="'+room+'" onclick="view.room.set('+roomName+')">'+room+'</div>';
		$("#rooms").append(html);

		var html2 = '<div id="peoples_room_'+room+'"></div>';
		$("#peoples_room").append(html2);
		$("#peoples_room_"+room).hide()


		var html3 = '<div id="messages_room_'+room+'"></div>';
		$("#messages_room").append(html3);
		$("#messages_room_"+room).hide()

		/*
		 * Add me in the room
		 */
		view.user.addMeInRoom("Lucas",room); 

		if(view.room.current == ""){
			view.room.set(room);
		}
	},

	set : function (room){
		$("#peoples_room_"+view.room.current).hide();
		$("#peoples_room_"+room).show();

		$("#messages_room_"+view.room.current).hide();
		$("#messages_room_"+room).show();

		$("#"+view.room.current).css("background-color",view.setting.color.tab);
		$("#"+room).css("background-color",view.setting.color.selected);
		$("#"+view.room.current)

		view.room.current = room;

	},

	notify : function (room){
		$("#"+room).css("background-color",view.setting.color.notification);
	}

}


/*
 *	Gestion des utilisateurs
 */

function user(){}

user.prototype = {

	/*
	 * Delete user in all rooms
	 */
	remove : function (username){
		$("."+username).remove();
	},

	addInRoom : function(username,room){
		var html = '<div class="'+username+'"> <img src="images/friend.png" /><span>'+username+'</span></div>';
		$('#peoples_room_'+room).append(html);
	},

	addMeInRoom : function(username,room){
		var html = '<div class="'+username+'"> <img src="images/friend.png" /><b>'+username+'</b></div>';
		$('#peoples_room_'+room).append(html);

	}

}

/*
 *	Gestion des messages
 */

function message(){}

message.prototype = {

	add : function(username, message, room){

		$("#messages_room_"+room).append("<b>"+username+"</b> : "+message+"<br />");

		if(view.room.current != room){
			view.room.notify(room);
		}
	}

}


/*
 *	Parametres de la vue.
 */

function setting(){
	this.color = new function(){
		this.notification = "orange";
		this.selected = "red";
		this.tab = "#70AB00";	
	}
}

/*
 *	Tout doit passer par la gestion des la vue
 */
var view = new function (){
	this.currentRoom = "";

	this.room =  new room();
	this.user = new user();
	this.message = new message();
	this.setting = new setting();

}();




var init = new function (){
	view.room.add("Master");
	view.room.add("Friends");
	view.room.add("Other");

	view.user.addInRoom("Anthony","Master");
	view.user.addInRoom("Fred","Friends");
	view.user.addInRoom("Cyrille","Friends");

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

/*
 *	Manage rooms
 */
function roomManager(){
	this.current = "";
}

roomManager.prototype = {

	add : function (id,name, master){

		/*
		if(jQuery.inArray(id,rooms) != -1){
			alert('Room already exist !!');
			return;
		}*/

		// Create tab
		var formatID = "'"+id+"'";
		var onClick = 'view.room.remove('+formatID+')';
		var html = '<div class="col span_1_of_12 room" style="background-color:'+view.setting.color.tab+'" id="tab_room_'+id+'">';
			html += '<span onclick="view.room.set('+formatID+')">'+name+'</span>';
		
		if(master){
			html += "</div>"
		}else{
			html += '<img src="images/close.png" onclick="'+onClick+'" /></div>';
		}
	
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

		if(view.room.current == "setting"||view.room.current ==""){
			view.setting.hide();
		}

		view.room.current = room;

		/*
		 *	Communication
		 */


	},

	/*
	 *	Change color of the tab to notify a new message
	 */
	notify : function (room){
		$("#tab_room_"+room).css("background-color",view.setting.color.notification);
	},

	remove : function(id){

		var position = -1;
		for(var i = 0;i<rooms.length;i++){
			if(rooms[i].id == id){
				position = i;
				break;
			}
		}
		
		rooms.splice(position,1);

		$("#messages_room_"+id).remove();
		$("#tab_room_"+id).remove();
		$("#peoples_room_"+id).remove();

		if(view.room.current == id){
			if($("#rooms").children().size() == 0){
				view.setting.show();	
			}else{
				if(position == 0){
					position = 1;
				}
				var nextIdRoom = $("#rooms").children().eq(position-1).attr('id').substring(9);
				view.room.set(nextIdRoom);
			}
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
		var html = '<div class="'+user.name+'"> <img src="images/friend.png" /><b>'+user.name+'</b></div>';
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

	add : function(message, room){

		$("#messages_room_"+room).append("<b>"+user.name+"</b> : "+message+"<br />");

		if(view.room.current != room){
			view.room.notify(room);
		}

		/*
		 *	Communication
		 */
		communicator.sendMessage(message);
	}

}

/*
 *	Form manager
 */
function formManager(){}

formManager.prototype = {

	newMessage : function(){
		var message = $("#message").val().htmlEncode();
		view.message.add(message, view.room.current);		
		$("#message").val("");

	},

	newRoom : function(){

		var room = $("#create_room").val();

		communicator.createRoom(room.htmlEncode());

		//view.room.add(idRoom,room.htmlEncode());
		$("#create_room").val("");

	},

	logIn : function(){

		var name =  $("#username").val();
		communicator.createUser(name.htmlEncode());

		var method = $('input[name=method]:checked').val();
		switch(method){
			case "polling":
				communicator.defineMethodTransfert(communicator.method.polling);
				break;

			case "long":
				communicator.defineMethodTransfert(communicator.method.long_polling);
				break;

			case "push":
				communicator.defineMethodTransfert(communicator.method.websocket);
				break;
		}


		$("#username").val("");

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
		this.tab = "#a0f300";


		var self = this;
		this.update = new function(){
			this.notification = function(){

				var oldColor = self.notification;
				self.notification = $("#color_notify").val();

				$("#rooms").children().each(function(i,y){

					var bg = getBgColorHex($(this));
					if(bg == oldColor){
						 $(this).css("background-color",self.notification);
					}
				})

			}
			this.selected = function(){
				self.selected = $("#color_selected").val();
				$("#settings_tab").css("background-color",self.selected);
			}

			this.tab = function(){
				var oldColor = self.tab;
				self.tab = $("#color_tab").val();
				$("#rooms").children().each(function(i,y){

					var bg = getBgColorHex($(this));
					if(bg == oldColor){
						 $(this).css("background-color",self.tab);
					}
				})
				
			}

		}

		/*
		 *	Init function
		 */
		new function(){
			/*
			 *	Init color settings input
			 */
			$("#color_notify").val(self.notification);
			$("#color_selected").val(self.selected);
			$("#color_tab").val(self.tab);
	
			$(".left").hide();
			$("#messages").hide();
			$("#input_message").hide();

			$("#settings_tab").css("background-color",self.selected);

		}

	}
}

settingManager.prototype = {

	show : function(){
		$("#settings_manager").show();
		$(".left").hide();
		$("#messages").hide();
		$("#input_message").hide();
		if(view.room.current != ""){
			$("#peoples_room_"+view.room.current).hide();
			$("#messages_room_"+view.room.current).hide();
			$("#tab_room_"+view.room.current).css("background-color",view.setting.color.tab);
		}
		$("#settings_tab").css("background-color",view.setting.color.selected);

		view.room.current = "setting";

	},

	hide : function(){
		$("#settings_manager").hide();
		$("#left_box").show();
		$("#messages").show();
		$("#input_message").show();

		$("#settings_tab").css("background-color",view.setting.color.tab);

	}

}


/*
 *	Need to call views beforme each action.
 */
var view = new function (){

	var self = this;

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
	 *	Init
	 */
	communicator.createUser("Lucas");
	communicator.defineMethodTransfert(communicator.method.polling);

	/*
	 * Create room
	 * params : ID Room, Name, is a master room
	 */

	var id1 = getUniqueID();
	view.room.add(id1,"Master Room", true);

	var id2 = getUniqueID();
	view.room.add(id2,"Javascript", true);

	var id3 = getUniqueID();
	view.room.add(id3, "Other", false);

	/*
	 *  Add user in a room
	 *	params : Username, ID Room
	 */
	view.user.addInRoom("Anthony",id1);
	view.user.addInRoom("Fred",id2);
	view.user.addInRoom("Cyrille",id2);


	/*
	 *  add Message in a room
	 *	params : Username, message, ID Room
	 */
	view.message.add("Cyrille","Coucou",id2);
	view.message.add("Fred","Bonjour",id2);
}


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

$("#message").keypress(function(event) {
	if (event.which == 13) {
		event.preventDefault();
		view.form.newMessage();				 
	}
});



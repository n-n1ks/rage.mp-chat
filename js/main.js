// Messages container.
const messages_container	= $('#chat #chat_messages');
// Numbers of max chat messages.
const max_chat_messages		= 100;
// Input enbaled.
let chat_input_enabled		= false;
// Message counter (default value is -1).
let message_counter		= -1;
// Chat enabled.
let chat_enabled		= true;
// Player messages.
let player_messages		= [];
// Player messages limit.
const player_messages_limit	= 50;
// Players current message.
let player_current_message	= '';

// Enable/disable chat input.
function enableChatInput(state, event) {
	mp.invoke("focus", state);
	event.preventDefault();
	
	if (state) {
		$('#chat_input').fadeIn(100);
		$('#chat_input').focus();
		messages_container.css('overflowY', 'visible');
		
		chat_input_enabled = true;

		let height = messages_container[0].scrollHeight;
		if (height > messages_container.height())
			messages_container.stop().animate({scrollTop: height}, 250, 'swing');

		mp.trigger('chatInputActive');
	} else {
		$('#chat_input').fadeOut(100);
		$('#chat_input').val('');
		messages_container.css('overflowY', 'hidden');

		let height = messages_container[0].scrollHeight;
		if (height > messages_container.height())
			messages_container.stop().animate({scrollTop: height}, 250, 'swing');

		message_counter = -1;
		player_current_message = '';
		chat_input_enabled = false;	
		
		mp.trigger('chatInputInactive');
	}

}

// Insert message in the chat.
function insertMessageToChat(str) {	
	if (messages_container.children().length == max_chat_messages)
		messages_container.children(':first').remove();
	
	messages_container.append(`<div class="chat_message">${str}</div>`);

	let height = messages_container[0].scrollHeight;
	if (height > messages_container.height())
		messages_container.scrollTop(height);
}

// Show/hide default chat.
function showChat(state) {
	if (state) {
		$('#chat').css('display', 'table-cell');
		
		chat_enabled = true;
	} else {
		$('#chat').css('display', 'none');
		$('#chat_input').css('display', 'none');
		$('#chat_input').val('');
		
		chat_enabled = false;
	}
}

// Clear chat (messages number).
function clearChat(messagesNumber) {
	if (messagesNumber) {
		messages_container.children().toArray().reverse().slice(0, messagesNumber).forEach(item => {
			$(item).remove();
		});
	} else {
		messages_container.children().each((index, item) => {
			item.remove();
		});
	}
}

// Set players current message.
$(document).on('input', '#chat_input', function() {
	player_current_message = $(this).val();
});


var chatAPI =
{
	push: insertMessageToChat,	
	clear: clearChat,	
	activate: enableChatInput,	
	show: showChat
};

// Keys listener.
$(document).keydown(function(e) {
	if (!chat_enabled)
		return;
	switch (e.which) {
		// Show input.
		case 84: {
			if ($('#chat_input').css('display') == 'none') {
				enableChatInput(true, e);
			}

			break;
		}

		// Press the enter.
		case 13: {
			let message = $('#chat_input').val();

			if (message.trim().length > 0) {
				// Command.
				if (message[0] == '/') {
					let command = message.substr(1);
					if (command.trim().length > 0) {
						mp.invoke("command", command);
					}
				// Message.
				} else {
					mp.invoke("chatMessage", message);
				}
			}

			// Save message to players messages array.
			if (message.trim().length > 0)
				player_messages.push(message);
			
			if (player_messages.length > player_messages_limit)
				player_messages.shift();

			enableChatInput(false, e);

			break;
		}

		// Key up or key down.
		case 38:
		case 40: {
			e.preventDefault();
			if (chat_input_enabled && player_messages.length > 0 ) {
				let arr = player_messages.slice().reverse();

				if (e.which === 38) {
					if (message_counter < player_messages.length-1)
						message_counter++;
				} else {
					if (message_counter > -1)
						message_counter--;
				}

				if (message_counter > -1)
					$('#chat_input').val(arr[message_counter]);
				else
					$('#chat_input').val(player_current_message);
			}

			break;
		}
	}
});

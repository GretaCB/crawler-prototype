async function sendMultipleMails(mails) {   
	let sendMails = 0;   

	// logic for
	// sending multiple mails   

	return sendMails;
}

// receive message from master process
process.on('message', async (message) => {  
	//console.log(message);
	const numberOfMailsSend = await sendMultipleMails(message.seedurl); 
	
	// send response to master process
	process.send({ counter: numberOfMailsSend });
});
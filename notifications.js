// --- Play sound ---
(function () {

	// Listen for messages from the extension
	// playAudio({ source: 'i/sound.wav', volume: 1 });
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		console.log( msg );
		sendResponse('Sound played!');
		if ('play' in msg) {
			playAudio(msg.play);
			sendResponse('Sound played!');
		}
	});

})();

// Play sound with access to DOM APIs
function playAudio({ source, volume }) {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
}
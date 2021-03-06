let height = screen.height;
    stream = null,
	audio = null,
	mixedStream = null,
	chunks = [],
	recorder = null
    startButton = null,
	stopButton = null,
	downloadButton = null,
	recordedVideo = null;
    click = 0;
    n = 1;
	blobUrl = null;
console.log(height);
if (height < 640) {
	let videoH = document.querySelector(".video");
	videoH.style.height = height;
}

// set up stream 
async function setupStream() {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true
		});

		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
				// In this example the cursor will always be visible in the capture,
				//  and the audio track should ideally have noise suppression and echo 
				// cancellation features enabled,
				// as well as an ideal audio sample rate of 44.1kHz.
			},
		});

		setupVideoFeedback();
	} catch (err) {
		console.error(err)
	}
}

function setupVideoFeedback() {
	if (stream) {
		recordingVideo.srcObject = stream;
		recordingVideo.play();
	} else {
		console.warn('No stream available');
	}
}

async function startRecording() {
	await setupStream();
	if (stream && audio) {

		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(100);

		startButton.disabled = true;
		stopButton.disabled = false;

		console.log('Recording started');
	} else {
		console.warn('No stream available.');
	}
}

function pauseRecording() {
	click += 1;
	console.log(click);
	if (click % 2 == 0) {
		click = 0;
		console.log("Resume");
		pauseButton.innerHTML = "Pause recording";
		recorder.resume();
	}
	else {
		console.log('Pause');
		pauseButton.innerHTML = "Resume";
		recorder.pause();
	}
}

function stopRecording() {
	recorder.stop();
	shareButton.classList.remove("hidden");
	startButton.disabled = false;
	stopButton.disabled = true;
}

function handleDataAvailable(e) {
	chunks.push(e.data);
}

function handleStop(e) {
	const blob = new Blob(chunks, {
		'type': 'video/mp4'
	});
	chunks = [];

	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = '';
	downloadButton.disabled = false;
	blobUrl = URL.createObjectURL(blob);
        recordingVideo.classList.add("hidden");
	recordedVideo.classList.remove("hidden");
	recordedVideo.src = blobUrl;
	recordedVideo.href = blobUrl;
	recordedVideo.load();
	recordedVideo.onloadeddata = function () {
		const rc = document.querySelector(".download-btn");
		rc.classList.remove("hidden");
		rc.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
		recordedVideo.play();
	}

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());
	console.log('Stop');
}

window.addEventListener('load', () => {
	startButton = document.querySelector('.record-btn');
	pauseButton = document.querySelector('.pause-btn');
	stopButton = document.querySelector('.stop-btn');
	shareButton = document.querySelector('.share');
	downloadButton = document.querySelector('.download-video');
	recordingVideo = document.querySelector('.recording-video');
	recordedVideo = document.querySelector('.recorded-video');

	startButton.addEventListener('click', startRecording);
	pauseButton.addEventListener('click', pauseRecording);
	stopButton.addEventListener('click', stopRecording);
})

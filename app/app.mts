import { FRAME_RATE_IN_MS } from "./common.mjs";

export function updateCanvas(
    ctx: CanvasRenderingContext2D,
    type: "meter" | "spectrum",
    meterParams?: {
        fillStyle: typeof ctx["fillStyle"],
        posx: number,
        posy: number,
        width: number,
        height: number
    },
    spectrumParams?: {
        fillStyle: typeof ctx["fillStyle"],
        posx: number,
        posy: number,
        width: number,
        height: number
        
    }
){
    if (type === "meter" && meterParams) {
        ctx.fillStyle = meterParams.fillStyle;
        ctx.fillRect(meterParams.posx, meterParams.posy, meterParams.width, meterParams.height);
    } else {

    }
}
export function app(
    appModule: typeof import("./app.mjs"),
    utilsModule: typeof import("./utils.mjs"),
    meterNodeModule: typeof import("./meternode.mjs"),
) {
    const startbtn: HTMLButtonElement = document.querySelector("#start-audio")!;
    const volumeInput: HTMLInputElement = document.querySelector("#volume-input")!;
    const volumeLevel: HTMLSpanElement = document.querySelector("#level")!;
    const volumeEl: HTMLSpanElement = document.querySelector("#volume")!;
    const smoothingEl: HTMLInputElement = document.querySelector("#smoothing-input")!;
    const smoothingSpan: HTMLInputElement = document.querySelector("#smoothing")!;


    const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
    canvas.height = 100;
    canvas.width = 100;
    canvas.style.border = "1px black solid";
    const canvasMeterParams: Parameters<typeof appModule.updateCanvas>[2] = {
        fillStyle: "#00ff00",
        posx: 0,
        posy: canvas.height - canvas.height / 4,
        width: canvas.width,
        height: canvas.height / 4
    }

    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    let previousTimestamp = 0;
    function frameHandler(work: (...args: any[]) => void) {
        work();
        return function(timestamp?: number) {
            previousTimestamp = timestamp || 0;
        }
    }
    window.requestAnimationFrame(frameHandler(() => null));

    volumeInput.oninput = (e) => {
        const ev: MyEvent = e as any;
        volumeInput.value = ev.target.value;
        volumeLevel.textContent = ev.target.value;
    }
    smoothingEl.oninput = (e) => {
        const ev: MyEvent = e as any;
        smoothingEl.value = ev.target.value;
        smoothingSpan.textContent = (ev.target.value).toString();
    }
    startbtn.onclick = () => {
        const audioCtx = new AudioContext();

        (async () => {
            window.navigator.getUserMedia(
                {
                    audio: true,
                },
                async (stream) => {
                    // add worklet module
                    // NOTE(Anders): have to provide dist in the path because I think the context of this index.js is within the scope of dist folder
                    // defined in the script tag of index.html otherwise we get "user aborted" error message which doesn't describe what went wrong
                    // we only get more descriptive messages if the promise is uncaught - caught errors do not yield anything helpful here
                    await audioCtx.audioWorklet.addModule("./meterprocessor.js");

                    // just grab the first track since chrome only has one input set as a "microphone input"
                    const audioTrack = stream.getAudioTracks()[0];

                    stream.removeTrack(audioTrack);

                    await audioTrack.applyConstraints({
                        autoGainControl: false,
                        noiseSuppression: false,
                        echoCancellation: false,
                    });

                    console.log("audio track", audioTrack);
                    console.log("audio track constraints", audioTrack.getConstraints());

                    stream.addTrack(audioTrack);

                    // build audio graph

                    // Create an AudioNode from the stream. in this case is the user microphone from getUserMedia callback
                    const streamNode = audioCtx.createMediaStreamSource(stream);

                    // create source node where the audio will be taken into
                    const mediaStreamSource = audioCtx.createMediaStreamSource(streamNode.mediaStream);

                    // analyser nodes are built in
                    /**
                     * Connection routing:
                        ===================

                        for dual channel layouts:                +--->  analyzer[0]  ---+
                                                                |                      |
                        (source) --->  input  --->  splitter  ---+                      +--->  merger  --->  output  ---> (destination)
                                                                |                      |
                                                                +--->  analyzer[1]  ---+
                     */
                    /** */
                    const analysernode = audioCtx.createAnalyser();

                    const meterNode = new meterNodeModule.MeterNode(
                        audioCtx,
                        FRAME_RATE_IN_MS,
                        appModule,
                        utilsModule,
                        canvas,
                        volumeEl,
                        frameHandler
                    );

                    const gainNode = audioCtx.createGain();
                    gainNode.gain.value = 0.01;
                    // allow the input el to control the input gain of the microphone into the browser
                    volumeInput.oninput = (event) => {
                        volumeLevel.textContent = event.target!.value;
                        volumeInput.value = event.target!.value;
                        gainNode.gain.value = Number(event.target!.value);
                    };

                    // TODO: 
                    // adjust smoothing in the meterprocessor via the meternode message port
                    smoothingEl.oninput = (e) => {
                        smoothingEl.value = e.target!.value;
                        smoothingSpan.textContent = e.target!.value;
                        meterNode.smoothingNode = Number(e.target!.value);
                    };

                    // Connect the stream to the destination to hear yourself (or any other node for processing!)
                    mediaStreamSource.connect(gainNode);
                    // connect gain node to meter node for worklet thread processing
                    gainNode.connect(meterNode);
                    // plug microphone input into the speaker output
                    gainNode.connect(audioCtx.destination);
                    
                    // TODO: display statistics of the audio context
                },
                (error) => { throw new Error("could not get user media" + error); }
            );
        })();
    }
}
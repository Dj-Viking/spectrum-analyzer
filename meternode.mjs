/**
 * @see https://webaudio.github.io/web-audio-api/#vu-meter-mode
 */
import { FRAME_RATE_IN_MS, GREEN } from "./common.mjs";
export class MeterNode extends AudioWorkletNode {
    _updateIntervalInMs = 0;
    _smoothingNode = 0;
    _volume = 0.01;
    _samples = new Float32Array();
    _appModule;
    _utilsModule;
    _canvas;
    constructor(audioCtx, updateIntervalInMS, appModule, utilsModule, canvas, volumeEl, frameHandler) {
        // establish the worklet node with parameters
        super(audioCtx, "meter", {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCount: 1,
            processorOptions: {
                updateIntervalInMS: updateIntervalInMS || FRAME_RATE_IN_MS
            }
        });
        // set up members
        this._appModule = appModule;
        this._utilsModule = utilsModule;
        this._canvas = canvas;
        // Handles updates from AudioWorkletProcessor on 
        // every frame
        this.port.onmessage = (msgEvent) => {
            const event = msgEvent;
            if (event.data.samples) {
                this.samples = event.data.samples;
            }
            if (event.data.volume) {
                this._volume = event.data.volume;
                volumeEl.textContent = (event.data.volume).toString();
                // update meter canvas
                const newHeight = this._volume * 2000;
                const ctx = this._canvas.getContext("2d");
                const work = () => {
                    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                    appModule.updateCanvas(ctx, "meter", {
                        "fillStyle": GREEN,
                        "height": newHeight,
                        "width": this._canvas.width,
                        "posx": 0,
                        "posy": this._canvas.height - this._canvas.height / 2
                    });
                };
                requestAnimationFrame((ts) => frameHandler(work)(ts));
            }
        };
        this.port.start();
    }
    // { get; set; }
    get updateInterval() {
        return this._updateIntervalInMs;
    }
    set updateInterval(updateIntervalInMS) {
        this._updateIntervalInMs = updateIntervalInMS;
        this.port.postMessage({
            updateIntervalInMS,
        });
    }
    // { get; set; }
    get samples() {
        return this._samples;
    }
    set samples(updateSamples) {
        this._samples = updateSamples;
        this.port.postMessage({
            samples: updateSamples
        });
    }
    // { get; set; }
    get smoothingNode() {
        return this._smoothingNode;
    }
    set smoothingNode(updateSmoothingFactor) {
        this._smoothingNode = updateSmoothingFactor;
        this.port.postMessage({
            smoothingFactor: updateSmoothingFactor,
        });
    }
}

/**
 * @see https://webaudio.github.io/web-audio-api/#vu-meter-mode
 */
import { FRAME_RATE_IN_MS, GREEN } from "./common.mjs";

export class MeterNode extends AudioWorkletNode {
    private _updateIntervalInMs: number = 0;
    private _smoothingNode: number = 0;
    private _volume: number = 0.01;
    private _appModule: typeof import("./app.mjs");
    private _utilsModule: typeof import("./utils.mjs");
    private _canvas: HTMLCanvasElement;

    public constructor(
        audioCtx: AudioContext,
        updateIntervalInMS: number,
        appModule: typeof import("./app.mjs"),
        utilsModule: typeof import("./utils.mjs"),
        canvas: HTMLCanvasElement,
        volumeEl: HTMLSpanElement,
        frameHandler: (
            work: (...args: any[]) => void
        ) => (timestamp?: number) => void
    ) {
        // establish the worklet node with parameters
        super(audioCtx, "meter", {
            numberOfInputs: 1,
            numberOfOutputs: 0,
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
            const event = msgEvent as MyMessageEvent;
            if (event.data.volume) {
                this._volume = event.data.volume;
                volumeEl.textContent = (event.data.volume).toString();
                // update meter canvas
                const newHeight = this._volume * 2000;
                const ctx = this._canvas.getContext("2d")!;
                const work = () => {
                    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                    appModule.updateCanvas(ctx, "meter", {
                        "fillStyle": GREEN,
                        "height": newHeight,
                        "width": this._canvas.width,
                        "posx": 0,
                        "posy": this._canvas.height - this._canvas.height / 2
                    })
                }
                requestAnimationFrame((ts) => frameHandler(work)(ts));
            }
        }

        this.port.start();
    }
    // { get; set; }
    public get updateInterval() {
        return this._updateIntervalInMs;
    }
    public set updateInterval(updateIntervalInMS) {
        this._updateIntervalInMs = updateIntervalInMS;

        this.port.postMessage({
            updateIntervalInMS,
        } as Partial<MyMessage>);
    }

    // { get; set; }
    public get smoothingNode() {
        return this._smoothingNode;
    }
    public set smoothingNode(updateSmoothingFactor) {
        console.log("smoothing factor set in meter node\n", updateSmoothingFactor);
        this._smoothingNode = updateSmoothingFactor;

        this.port.postMessage({
            smoothingFactor: updateSmoothingFactor,
        } as Partial<MyMessage>);
    }
}
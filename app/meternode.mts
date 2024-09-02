/**
 * @see https://webaudio.github.io/web-audio-api/#vu-meter-mode
 */
import { FRAME_RATE_IN_MS, GREEN } from "./common.mjs";

export class MeterNode extends AudioWorkletNode {
    private _updateIntervalInMs: number = 0;
    private _smoothingFactor: number = 0;
    private _volume: number = 0;
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
            ctx: CanvasRenderingContext2D, 
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
                function work() {
                    appModule.updateCanvas(ctx, "meter", {
                        "fillStyle": GREEN,
                        "height": newHeight,
                        "width": 10,
                        "posx": 0,
                        "posy": 0
                    })
                }
                requestAnimationFrame((ts) => frameHandler(ctx, work)(ts));
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
    public get smoothingFactor() {
        return this._smoothingFactor;
    }
    public set smoothingFactor(smoothingInput) {
        this.smoothingFactor = smoothingInput;

        this.port.postMessage({
            smoothingInput,
        } as Partial<MyMessage>);
    }
}
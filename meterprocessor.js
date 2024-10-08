// TODO(Anders): the file wont have export {} at the bottom if it's a .ts extension

// NOTE(Anders): for whatever reason this project
// if this file was typescript it appends export {}; at the bottom of the file
// and this cannot be parsed in the browser correctly
// any visible changes must be made to this file directly
// this file probably wont' change that much unless the process function needs to be updated
// AND restart the application with apprestart.ps1
// the file needs to be copied into the same location as the index.html
// in ./dist/app

// @ts-check
/**
 * @see https://webaudio.github.io/web-audio-api/#AudioWorkletNodeOptions
 *
 * audio worklet global scope example
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope
 *
 * dictionary AudioWorkletNodeOptions : AudioNodeOptions {
    unsigned long numberOfInputs = 1;
    unsigned long numberOfOutputs = 1;
    sequence<unsigned long> outputChannelCount;
    record<DOMString, double> parameterData;
    object processorOptions;
};
 */

/// <reference types="./types" />
// @ts-ignore
class MeterProcessor extends AudioWorkletProcessor {
    _smoothingFactor = 0.96;
    _volume = 0.01;
    _updateIntervalInMS = 16.67;
    _updateNextFrame = 16.67;
    constructor(options) {
        super(options);
        console.log("options from register in global audio worklet scope", options);
        console.log("number of inputs to audio worklet", options.numberOfInputs);
        this._volume = 0.01;
        this._updateIntervalInMS = 0;
        this._updateNextFrame = this._updateIntervalInMS;
        // PLEASE DO NOT DEFINE port AS A MEMBER IN CHILD CLASS
        this.port.onmessage = (e) => {
            /**
             * @type {globalThis.MessageEvent<Partial<MyMessage>>}
             */
            const event = e;
            if (event.data.smoothingFactor) {
                this._smoothingFactor = event.data.smoothingFactor;
            }
            if (event.data.updateIntervalInMS) {
                this._updateIntervalInMS = event.data.updateIntervalInMS;
            }
        };
    }
    get intervalInFrames() {
        const sampleRate = 48000;
        return (this._updateIntervalInMS / 1000) * sampleRate;
    }
    /**
     * 
     * @param {Float32Array[][]} inputs 
     * @param {Float32Array[][]} outputs 
     * @param {*} parameters 
     * @returns 
     */
    process(inputs, outputs, parameters) {
        // console.log("process", arguments);
        const input = inputs[0];
        // console.log("input", input);
        // Note that the input will be down-mixed to mono; however, if no inputs are
        // connected then zero channels will be passed in.
        if (input.length > 0) {
            const monoInputMixdown = input[0];
            // console.log("monoInputMixdown", monoInputMixdown);
            // const monoInputBuffer = input[0].buffer;
            // console.log("monoInputMixdown", monoInputMixdown.length);
            // console.log("typed array", new Uint8ClampedArray(monoInputBuffer));
            let sum = 0;
            let rms = 0;
            // Calculated the squared-sum from the samples from the input channel(s)
            // for this buffer size of 512 bytes(samples?) (default)
            for (let i = 0; i < monoInputMixdown.length; ++i) {
                sum += monoInputMixdown[i] * monoInputMixdown[i];
            }
            // console.log("what is sum here", sum);
            // Calculate the RMS level and update the volume.
            rms = Math.sqrt(sum / monoInputMixdown.length);
            // console.log("rms", rms);
            
            this._volume = Math.max(rms, this._volume * this._smoothingFactor);
            // Update and sync the volume property with the main thread.
            this._updateNextFrame -= monoInputMixdown.length;
            if (this._updateNextFrame < 0) {
                this._updateNextFrame += this.intervalInFrames;
                
                /**@type {Partial<MyMessage>} */
                const msg = {
                    volume: this._volume,
                    samples: monoInputMixdown
                }
                this.port.postMessage(msg);
            }
        }
        // Keep on processing if the volume is above a threshold, so that
        // disconnecting inputs does not immediately cause the meter to stop
        // computing its smoothed value.
        // console.log("process volume", this._volume, "min value", 0);
        return true;
        // if this returns false the processor dies and doesn't process anymore
        // the context will have to be reinstantiated
        // return this._volume >= this.MINIMUM_VALUE;
    }
}
// @ts-ignore
console.log("audio worklet global scope", AudioWorkletGlobalScope);
// can only be called here!! whenever audioCtx.audioWorklet.addModule(path: string); is called
// this allows this js to be executed in the AudioWorkletGlobalScope which is separate
// from the window's global scope
// @ts-ignore
registerProcessor("meter", MeterProcessor);
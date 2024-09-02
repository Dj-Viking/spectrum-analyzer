// TODO: create processor worklet for processing audio buffers!
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

// meter-processor.js
// @ts-ignore
class MeterProcessor extends AudioWorkletProcessor implements IAudioWorkletProcessor {
    private _smoothingFactor = 0.999;
    private _volume: number;
    private _updateIntervalInMS: number;
    private _updateNextFrame: number;
    // @ts-ignore this will be defined once instantiated by the audio worklet global scope thread
    public readonly port: globalThis.MessagePort;
    public constructor(options: AudioWorkletNodeOptions) {
        super(options);
        console.log("options from register in global audio worklet scope", options);
        console.log("number of inputs to audio worklet", options.numberOfInputs);

        this._volume = 0.01;
        this._updateIntervalInMS = 0;
        this._updateNextFrame = this._updateIntervalInMS;

        // @ts-ignore port is assigned in the super() base constructor
        this.port.onmessage = (event: MessageEvent<Partial<MyMessage>>) => {
            if (event.data.smoothingInput) {
                this._smoothingFactor = event.data.smoothingInput;
            }
            if (event.data.updateIntervalInMS) {
                this._updateIntervalInMS = event.data.updateIntervalInMS;
            }
        };
    }

    private get intervalInFrames() {
        // TODO: get framerate from the devices and/or audio context!!
        const sampleRate = 48000;
        return (this._updateIntervalInMS / 1000) * sampleRate;
    }
    // public bool override
    public process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, unknown>
    ): boolean {
        // console.log("process", arguments);
        const input = inputs[0];
        // console.log("input", input);
        // Note that the input will be down-mixed to mono; however, if no inputs are
        // connected then zero channels will be passed in.
        if (input.length > 0) {
            const monoInputMixdown = input[0];
            // const monoInputBuffer = input[0].buffer;
            // console.log("monoInputMixdown", monoInputMixdown.length);
            // console.log("monoInputMixdown buffer", monoInputBuffer);

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
                this.port.postMessage({ volume: this._volume });
            }
        }
        // Keep on processing if the volume is above a threshold, so that
        // disconnecting inputs does not immediately cause the meter to stop
        // computing its smoothed value.
        // console.log("process volume", this._volume, "min value", this.MINIMUM_VALUE);
        return true;
        // if this returns false the processor dies and doesn't process anymore
        // the context will have to be reinstantiated
        // return this._volume >= this.MINIMUM_VALUE;
    }
}
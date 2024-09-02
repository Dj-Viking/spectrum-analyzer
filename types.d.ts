declare global {
    interface MyMessageEvent {
        data: MyMessage
    }
    interface MyMessage {
        volume: number;
        updateIntervalInMS: number;
        samples?: Float32Array;
        smoothingFactor: number;
    }
    interface MyEvent extends Event {
        target: EventTarget;
    }
    interface EventTarget {
        value: any;
    }

    interface IAudioWorkletProcessor {
        readonly port: globalThis.MessagePort;
        process(
            inputs: Float32Array[][],
            outputs: Float32Array[][],
            parameters: Record<string, unknown>
        ): boolean;
    }

    class AudioWorkletProcessor {
        public readonly port: globalThis.MessagePort;
        constructor(options: AudioWorkletNodeOptions);
        public process(
            inputs: Float32Array[][],
            outputs: Float32Array[][],
            parameters: Record<string, unknown>
        ): boolean;
    }
    /**
     * attaches a custom processor to a label, which would serve as the processor for a particular audio graph node
     * @param processorName {string}
     * @param processor {AudioWorkletProcessor}
     */
    function registerProcessor(
        processorName: string,
        processor: typeof AudioWorkletProcessor
    ): void;
    interface Navigator {
        getUserMedia(
            options: { video?: boolean; audio?: boolean },
            success: (stream: MediaStream) => void,
            error?: (error: string) => void
        ): void;
    }
    interface MediaDevices {
        getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
    }

}
export {};
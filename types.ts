declare global {
    interface MyEvent extends Event {
        target: any;
    }
    interface EventTarget {
        value: any;
    }

}
export {};
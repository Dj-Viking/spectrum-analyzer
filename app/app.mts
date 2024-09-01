export function app() {
    const volumeInput: HTMLInputElement = document.querySelector("#volume-input")!;
    console.log("vulum input", volumeInput);
    volumeInput.oninput = (e) => {
        const ev: MyEvent = e as any;
        volumeInput.value = ev.target.value;
    }
}
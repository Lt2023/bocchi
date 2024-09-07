import {logger} from "./logger.ts";

export function downloadText(fileName: string, text: string) {
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([text]);
    const saveLink = document.createElement('a');
    saveLink.setAttribute('href', url.createObjectURL(blob));
    saveLink.setAttribute('download', fileName);
    saveLink.click();
}

export function loadText(accept: string, callback: (data: string) => void) {
    let file = document.createElement('input');
    file.type = 'file';
    file.accept = accept;
    file.onchange = function (e) {
        if (!e.target) return;
        // @ts-ignore
        let file = e.target.files[0]
        try {
            let reader = new FileReader();
            reader.readAsText(file)
            reader.onload = function (o) {
                if (!o.target) return;
                if (typeof o.target.result === "string") {
                    let data = o.target.result;
                    callback(data);
                }
            }
        } catch (e) {
            logger.error('Utils', 'loadText', e);
        }
    }
    file.click();
}
export function fileParse(file, type = "base64") {
    // FileReader 对象允许 Web 应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，
    // 使用 File 或 Blob 对象指定要读取的文件或数据。
    return new Promise(resolve => {
        let fileRead = new FileReader();
        if (type === "base64") {
            fileRead.readAsDataURL(file);
        } else if (type === "buffer") {
            fileRead.readAsArrayBuffer(file);
        }
        fileRead.onload = (ev) => {
            resolve(ev.target.result);
        };
    });
}
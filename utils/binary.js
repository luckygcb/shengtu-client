export async function blobUrlToUint8Array(blobUrl) {
  try {
    // 1. 获取 Blob 数据
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    console.log(blob);

    // 2. 将 Blob 转换为 ArrayBuffer
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // 3. 创建 Uint8Array
    const uint8Array = new Uint8Array(arrayBuffer);

    return uint8Array;
  } catch (error) {
    console.error('Error converting Blob URL to Uint8Array:', error);
    throw error;
  }
}
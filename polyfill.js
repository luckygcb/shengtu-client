import { TextEncoder, TextDecoder } from 'text-encoding';

// 检查全局环境中是否已经存在 TextEncoder 和 TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
/** Local dev default — production CI overwrites dist/config/fca-academy-media.js with blob CDN base. */
(function (global) {
  global.FCA_ACADEMY_MEDIA_CDN = global.FCA_ACADEMY_MEDIA_CDN || "";
})(typeof window !== "undefined" ? window : globalThis);

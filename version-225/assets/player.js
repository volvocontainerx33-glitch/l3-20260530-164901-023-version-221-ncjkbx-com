import { H as Hls } from "./hls-vendor-dru42stk.js";

document.querySelectorAll(".player-shell").forEach(function (shell) {
  var video = shell.querySelector(".js-player");
  var overlay = shell.querySelector(".player-overlay");
  if (!video || !overlay) {
    return;
  }
  var started = false;
  var hlsInstance = null;
  var playVideo = function () {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  };
  var start = function () {
    var src = video.getAttribute("data-video");
    if (!src) {
      return;
    }
    overlay.classList.add("is-hidden");
    if (!started) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else if (Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(src);
        });
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = src;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      }
      started = true;
    }
    playVideo();
  };
  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });
});

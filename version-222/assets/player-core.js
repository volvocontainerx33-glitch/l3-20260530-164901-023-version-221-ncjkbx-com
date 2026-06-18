import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupPlayer(source) {
  const shell = document.querySelector("[data-player-shell]");
  const video = document.querySelector("[data-player-video]");
  const cover = document.querySelector("[data-player-cover]");

  if (!shell || !video || !cover || !source) {
    return;
  }

  let attached = false;
  let hls = null;

  const attach = () => {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return new Promise((resolve) => {
        hls.on(Hls.Events.MANIFEST_PARSED, resolve);
        setTimeout(resolve, 1800);
      });
    }

    video.src = source;
    return Promise.resolve();
  };

  const start = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    shell.classList.add("is-loading");

    try {
      await attach();
      video.controls = true;
      cover.classList.add("is-hidden");
      shell.classList.add("is-playing");
      await video.play();
    } catch (error) {
      video.controls = true;
      cover.classList.add("is-hidden");
    } finally {
      shell.classList.remove("is-loading");
    }
  };

  cover.addEventListener("click", start);
  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
}

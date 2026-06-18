function startVideoPlayer(streamUrl) {
  var frame = document.querySelector('[data-player-frame]');
  var video = document.querySelector('[data-video-player]');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
  var hlsInstance = null;
  var prepared = false;

  if (!frame || !video || !streamUrl) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    prepared = true;
  }

  function play() {
    prepare();
    frame.classList.add('is-playing');
    video.setAttribute('controls', 'controls');

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', play);
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}

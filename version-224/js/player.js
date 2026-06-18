(function () {
  window.setupMoviePlayer = function setupMoviePlayer(sourceUrl) {
    var video = document.querySelector(".movie-player");
    if (!video || !sourceUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    var note = document.querySelector(".player-note");
    if (note) {
      note.textContent = "当前浏览器不原生支持 HLS 播放，可在支持 HLS 的浏览器中打开。";
    }
  };
}());

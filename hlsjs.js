class HlsUI extends Hls {

  controls = {
    videoTitle: null,
    loader: null,
    bgPlay: null,
    play : null,
    currentTime: null,
    duration: null,
    seek: null,
    bufferedProgress: null,
    timeContainer: null,
    seekContainer: null,
    mute: null,
    fullscreen: null,
    more: null,
    title: null,
    liveTag: null,
    backface: null,
    dropdown: null,
    volume: null,
    dropdownItem: {
      resolution: null,
      speed: null,
      caption: null,
      audioTrack: null,
    },
    controlsContainer: null,
    videoContainer: null
  };

  playerConfig = {}

  controlsTimeout = null;

  CONSTANTS = {
    speeds: [
      {name: "0.25x", value: 0.25},
      {name: "0.5x", value: 0.5},
      {name: "0.75x", value: 0.75},
      {name: "Normal", value: 1.0},
      {name: "1.25x", value: 1.25},
      {name: "1.5x", value: 1.5},
      {name: "1.75x", value: 1.75},
      {name: "2x", value: 2.0}
    ],
    trackMode:{
      disabled: "disabled",
      hidden: "hidden",
      showing: "showing"
    }
  }

  attachMedia(videoElement) {
    this.initUI(videoElement);
    super.attachMedia(videoElement);
  }

  loadSource(opt) {
    if(typeof(opt) === "string") {
      super.loadSource(opt);
    } else {
      this.playerConfig = opt;
      try {
        super.loadSource(opt.source);
      } catch(e) {
        console.error("source must be defined");
      }
      this.initConfig();
    }
  }

  //////////////////////
  getVideoTitle() {
    return this.playerConfig.hasOwnProperty('title') ? this.playerConfig.title : "";
  }
  //////////////////////

  initConfig() {
    var _this = this;
    this.controls.videoTitle.innerHTML = this.getVideoTitle();
    if(this.playerConfig.hasOwnProperty("playbackRate")) {
      this.CONSTANTS.speeds = [];
      var el = this.playerConfig.playbackRate;
      Object.keys(el).forEach((item, i) => {
        _this.CONSTANTS.speeds.push({name: el[item], value: parseFloat(item)});
      });
    }
  }

  initUI(videoElement) {

    var _this = this;

    //videoElement = document.querySelector(id);
		videoElement.controls = false;
		var videoContainer = document.createElement("div");
    videoContainer.setAttribute("class", "hlsjs-container");

    if(videoElement.hasAttribute("class")) {
      this.addClass(videoContainer, videoElement.getAttribute("class"));
      videoElement.removeAttribute("class");
    }
    if(videoElement.hasAttribute("id")) {
      videoContainer.setAttribute("id", videoElement.getAttribute("id"));
      videoElement.removeAttribute("id");
    }

    videoElement.setAttribute("class", "hlsjs-video");

		videoElement.parentNode.insertBefore(videoContainer, videoElement);
		videoContainer.appendChild(videoElement);

		var videoControls = document.createElement("div");
		videoControls.setAttribute("class", "hlsjs-controls");
		videoControls.setAttribute("shown", "true");

		var videoBackFace = document.createElement("div");
		videoBackFace.setAttribute("class", "hlsjs-backface");

		var videoTopBar = document.createElement("div");
		videoTopBar.setAttribute("class", "hlsjs-topbar");

		var videoTitle = document.createElement("span");
		videoTitle.setAttribute("class", "hlsjs-title");

		var videoLiveTag = document.createElement("button");
		videoLiveTag.setAttribute("class", "hlsjs-live-tag");
    videoLiveTag.setAttribute("hide", "true");
		videoLiveTag.removeAttribute("live");

		videoTopBar.appendChild(videoTitle);
		videoTopBar.appendChild(videoLiveTag);

		var videoToolbar = document.createElement("div");
		videoToolbar.setAttribute("class", "hlsjs-toolbar");

    var videoToolbarControls = document.createElement("div");
		videoToolbarControls.setAttribute("class", "hlsjs-toolbar-controls");

		var videoPlayPauseBtn = document.createElement("button");
		videoPlayPauseBtn.setAttribute("class", "hlsjs-ctrl-btn");
		videoPlayPauseBtn.innerHTML = "play_arrow";

    // current time and duration
    var videoTimeContainer =  document.createElement("div");
		videoTimeContainer.setAttribute("class", "hlsjs-time-container");
    videoTimeContainer.setAttribute("hide", "true");

    var videoCurrentTime =  document.createElement("span");
		videoCurrentTime.setAttribute("class", "hlsjs-current-time");
    videoCurrentTime.innerHTML = this.parseTime(0);

    var videoDuration =  document.createElement("span");
		videoDuration.setAttribute("class", "hlsjs-duration");
    videoDuration.innerHTML = this.parseTime(0);

    videoTimeContainer.appendChild(videoCurrentTime);
    videoTimeContainer.appendChild(document.createTextNode(" / "));
    videoTimeContainer.appendChild(videoDuration);
    //

    var videoVolumeContainer = document.createElement("span");
		videoVolumeContainer.setAttribute("class", "hlsjs-volume-container");

    var videoVolumeSlider = document.createElement("input");
		videoVolumeSlider.setAttribute("class", "hlsjs-slider hlsjs-volume");
    videoVolumeSlider.setAttribute("autocomplete", "false");
    videoVolumeSlider.setAttribute("type", "range");
    videoVolumeSlider.setAttribute("min", "0");
    videoVolumeSlider.setAttribute("max", "1");
    videoVolumeSlider.setAttribute("step", "0.05");
    videoVolumeSlider.setAttribute("value", "1");

		var videoVolumeBtn = document.createElement("button");
		videoVolumeBtn.setAttribute("class", "hlsjs-ctrl-btn");
		videoVolumeBtn.innerHTML = "volume_up";

    videoVolumeContainer.appendChild(videoVolumeSlider);
    videoVolumeContainer.appendChild(videoVolumeBtn);

		var videoMoreBtn = document.createElement("button");
		videoMoreBtn.setAttribute("class", "hlsjs-ctrl-btn");
		videoMoreBtn.innerHTML = "more_vert";

		var videoFSBtn = document.createElement("button");
		videoFSBtn.setAttribute("class", "hlsjs-ctrl-btn");
		videoFSBtn.innerHTML = "fullscreen";

    var videoDropdown = document.createElement("div");
		videoDropdown.setAttribute("class", "hlsjs-dropdown");

    var videoResolution = this.createSelect("Resolution", "Auto", function(el) {
      _this.initQualitySelect(el);
    }, function(v) {
      _this.changeQualitySelect(v);
    });
    var videoSpeed = this.createSelect("Speed", "Normal", function(el) {
      _this.initSpeedSelect(el);
    }, function(v) {
      _this.changeSpeedSelect(v);
    });
    var videoCaption = this.createSelect("Caption", "None", function(el) {
      _this.initSubtitleSelect(el);
    }, function(v) {
      _this.changeSubtitleSelect(v);
    });
    var videoAudio = this.createSelect("Language", "Default", function(el) {
      _this.initAudioSelect(el);
    }, function(v) {
      _this.changeAudioSelect(v);
    });

    videoDropdown.appendChild(videoResolution);
    videoDropdown.appendChild(videoSpeed);
    videoDropdown.appendChild(videoCaption);
    videoDropdown.appendChild(videoAudio);

    var videoToolbarControlsLeft = document.createElement("div");
		videoToolbarControlsLeft.setAttribute("class", "hlsjs-left");

    videoToolbarControlsLeft.appendChild(videoPlayPauseBtn);
    videoToolbarControlsLeft.appendChild(videoTimeContainer);

    var videoToolbarControlsRight = document.createElement("div");
		videoToolbarControlsRight.setAttribute("class", "hlsjs-right");

    videoToolbarControlsRight.appendChild(videoVolumeContainer);
    videoToolbarControlsRight.appendChild(videoMoreBtn);
    videoToolbarControlsRight.appendChild(videoFSBtn);
    videoToolbarControlsRight.appendChild(videoDropdown);

		videoToolbarControls.appendChild(videoToolbarControlsLeft);
		videoToolbarControls.appendChild(videoToolbarControlsRight);

    var videoSeekContainer = document.createElement("div");
		videoSeekContainer.setAttribute("class", "hlsjs-seek-container");
    videoSeekContainer.setAttribute("hide", "true");

    var videoSeekSlider = document.createElement("input");
		videoSeekSlider.setAttribute("class", "hlsjs-slider hlsjs-seek");
    videoSeekSlider.setAttribute("autocomplete", "false");
    videoSeekSlider.setAttribute("type", "range");
    videoSeekSlider.setAttribute("min", "0");
    videoSeekSlider.setAttribute("max", "100");
    videoSeekSlider.setAttribute("step", "0.0001");
    videoSeekSlider.setAttribute("value", "0");

    var videoSeekProgress = document.createElement("progress");
		videoSeekProgress.setAttribute("class", "hlsjs-progress");
    videoSeekProgress.setAttribute("min", "0");
    videoSeekProgress.setAttribute("max", "100");
    videoSeekProgress.setAttribute("value", "0");

    videoSeekContainer.appendChild(videoSeekSlider);
    videoSeekContainer.appendChild(videoSeekProgress);

    videoToolbar.appendChild(videoToolbarControls);
    videoToolbar.appendChild(videoSeekContainer);

		var videoBigPlayBtn = document.createElement("button");
		videoBigPlayBtn.setAttribute("class", "hlsjs-big-play-btn");
		videoBigPlayBtn.innerHTML = "play_arrow";

    var videoLoader = document.createElement("div");
		videoLoader.setAttribute("class", "hlsjs-loader");
    var loader = document.createElement("div");
		loader.setAttribute("class", "loader");
    videoLoader.appendChild(loader);

		videoControls.appendChild(videoBackFace);
		videoControls.appendChild(videoTopBar);
		videoControls.appendChild(videoBigPlayBtn);
    videoControls.appendChild(videoLoader);
		videoControls.appendChild(videoToolbar);

		videoContainer.appendChild(videoControls);

    if(this.isMobOrTab()) {
      videoPlayPauseBtn.setAttribute("hide", "true");
      this.addClass(videoContainer, "hlsjs-mob");
    } else {
      videoBigPlayBtn.setAttribute("hide", "true");
    }

    this.controls.videoTitle = videoTitle;

    this.controls.backface = videoBackFace;
    this.controls.title = videoTitle;
    this.controls.liveTag = videoLiveTag;
    this.controls.bgPlay = videoBigPlayBtn;
    this.controls.play = videoPlayPauseBtn;
    this.controls.currentTime = videoCurrentTime;
    this.controls.duration = videoDuration;
    this.controls.mute = videoVolumeBtn;
    this.controls.fullscreen = videoFSBtn;
    this.controls.more = videoMoreBtn;
    this.controls.volume = videoVolumeSlider;
    this.controls.seek = videoSeekSlider;
    this.controls.bufferedProgress = videoSeekProgress;
    this.controls.loader = videoLoader;
    this.controls.dropdown = videoDropdown;
    this.controls.controlsContainer = videoControls;
    this.controls.videoContainer = videoContainer;
    this.controls.timeContainer = videoTimeContainer;
    this.controls.seekContainer = videoSeekContainer;

    this.controls.dropdownItem.resolution = videoResolution;
    this.controls.dropdownItem.speed = videoSpeed;
    this.controls.dropdownItem.caption = videoCaption;
    this.controls.dropdownItem.audioTrack = videoAudio;

    this.bindControls();

  }

  createDropdownItem(nm, val, tp, cat, cls=null) {
    var item = document.createElement("div");
    if(cls != null) {
      cls = " " + cls;
    } else {
      cls="";
    }

    item.setAttribute("class", "hlsjs-dropdown-item"+cls);

    if(tp) {
      item.setAttribute("tp", tp);
    } else {
      item.setAttribute("cat", cat);
    }


    var name = document.createElement("span");
    name.setAttribute("class", "hlsjs-dropdown-item-data it-nm");
    name.innerHTML = nm;

    var value = document.createElement("span");
    value.setAttribute("class", "hlsjs-dropdown-item-data it-val");
    value.innerHTML = val;

    item.appendChild(name);
    item.appendChild(value);

    return item;

  }

  initDropdown() {

  }

  initSpeedSelect(el) {
    var cur = this.getCurrentSpeed();
    this.getSpeeds().forEach((item, i) => {
				el.appendChild(this.createSelectOption(item.name, i, i == cur.id));
		});
  }
  changeSpeedSelect(v) {
    this.media.playbackRate = this.getSpeed(v).value;
  }

  initSubtitleSelect(el) {
    var enabledSub = this.getCurrentSubtitle();
    this.getSubtitles().forEach((item, i) => {
      el.appendChild(this.createSelectOption(item.name, item.level, item.level == enabledSub.level));
		});
  }
  changeSubtitleSelect(v) {
    this.enableSubtitle(v);
  }

  initAudioSelect(el) {
    var defaultAud = this.getCurrentAudioTrack();
		this.getAudioTracks().forEach((item, i) => {
			el.appendChild(this.createSelectOption(item.name, item.level, item.level == defaultAud.level));
		});
  }
  changeAudioSelect(v) {
    this.audioTrack = this.getAudioTrack(v).level;
  }

  initQualitySelect(el) {
    var manualLevel = this.manualLevel;
    this.getVideoQualities().forEach((item, i) => {
				el.appendChild(this.createSelectOption(item.name, item.level, (item.level == manualLevel)));
		});
  }
  changeQualitySelect(v) {
    this.currentLevel = parseInt(v);
  }

  destroyUI() {
    this.media.parentNode.parentNode.insertBefore(this.media.parentNode, this.media);
    this.media.ontimeupdate = null;
    this.media.ondurationchange = null;
    this.media.id = this.controls.videoContainer.id;
    this.controls.videoContainer.remove();
  }

  bindControls() {
    var _this = this;

    //console.log(this.constructor.Events);
    this.on(this.constructor.Events.ERROR, (event, { details }) => {
      //console.log(details);
      if (details === _this.constructor.ErrorDetails.BUFFER_STALLED_ERROR) {
        _this.showLoader();
      }
    });
    this.on(this.constructor.Events.ERROR, function (event, data) {
      console.log(data);
      if (data.fatal) {
        switch (data.type) {
          case _this.constructor.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.log('fatal network error encountered, try to recover');
            _this.startLoad();
            break;
          case _this.constructor.ErrorTypes.MEDIA_ERROR:
            console.log('fatal media error encountered, try to recover');
            _this.destroyUI();
            _this.recoverMediaError();
            break;
          default:
            // cannot recover
            _this.destroy();
            break;
        }
      }
    });
    this.on(this.constructor.Events.FRAG_BUFFERED, () => {
      //console.log("FRAG_BUFFERED");
      _this.hideLoader();
      _this.updateBufferedProgress();
    });

    this.once(this.constructor.Events.LEVEL_LOADED, function(e, d) {
      //console.log(_this.isLive());
      _this.setupStream();
    });

    this.initSlider();

    this.on(this.constructor.Events.MEDIA_ATTACHED, function () {

      _this.showLoader();
      _this.media.volume = 1.0;

      _this.controls.play.onclick = function() {_this.togglePlay()};
      _this.controls.bgPlay.onclick = function() {_this.togglePlay()};
      _this.controls.mute.onclick = function() {_this.toggleMute()};
      _this.controls.volume.oninput = function() {
        _this.changeVolume();
      }

      _this.controls.more.onclick = function() {_this.toggleDropdown()};
      _this.bindDropdownItemsControls();

      _this.media.onplaying = function() {
        _this.hideControls();
        _this.controls.bgPlay.innerHTML = "pause_arrow";
        _this.controls.play.innerHTML = "pause_arrow";
        //_this.hideLoader();
      };

      _this.media.onpause = function() {
        _this.showControls()
        _this.controls.bgPlay.innerHTML = "play_arrow";
        _this.controls.play.innerHTML = "play_arrow";
      };

      _this.media.ontimeupdate = (event) => {
        _this.updateSeekBar();
        _this.updateBufferedProgress();
        _this.hideLoader();
      };

      _this.controls.seek.oninput = function() {
        _this.updateSeek();
        _this.hideDropdown();
        _this.showControls();
      }

      _this.controls.seek.onchange = function() {
        //_this.updateSeek();
        _this.hideDropdown();
        _this.hideControls();
        _this.showLoader();
      }

      _this.media.ondurationchange = (event) => {
        _this.updateBufferedProgress();
        _this.controls.duration.innerHTML = _this.duration();
        if((_this.media.duration - _this.media.currentTime) > 30) {
          _this.notLive();
        }
      };

      _this.controls.backface.onclick = function() {
        //console.log("backface_clicked");
        _this.backfaceClicked();
      };

      _this.controls.controlsContainer.onmousemove = function() {
        if(!_this.isDropdownShown()) {
          _this.backfaceClicked();
        }
      };

      _this.controls.fullscreen.onclick = function() {
        _this.controls.fullscreen.innerHTML = (_this.toggleFullscreen() ? "fullscreen" : "fullscreen_exit");
      };

      window.addEventListener("offline", function () {
        //console.log("offline");
        //_this.showLoader();
        //_this.stopLoad();
      }, false);
      window.addEventListener("online", function () {
        //console.log("online");
        //_this.hideLoader();
        _this.startLoad();
      }, false);

    });
    this.on(this.constructor.Events.MANIFEST_PARSED, function (event, data) {
      _this.initDropdown();
    });
  }

  backfaceClicked() {
    this.hideDropdown();
    this.showControls();
    this.hideControls();
  }

  bindDropdownItemsControls() {
    var _this = this;

    var dropdownItems = this.controls.dropdown.children;
    for(var i = 0; i < dropdownItems.length; i++) {
      var item = dropdownItems.item(i);
      if(item.hasAttribute("tp")) {

        item.onclick = function() {
          //console.log("clicked");
          var tp = this.getAttribute("tp");
          _this.showItems(tp);

        };

      }
    }
  }

  //Speed methods
  getSpeeds() {
    return this.CONSTANTS.speeds;
  }

  getSpeed(val) {
    return this.CONSTANTS.speeds[parseInt(val)];
  }

  getCurrentSpeed() {
    var len = this.CONSTANTS.speeds.length;
    for(var i = 0; i < len; i++) {
      var el = this.CONSTANTS.speeds[i];
      if(el.value == this.media.playbackRate) {
        return {name: el.name, value: el.value, id: i};
      }
    }
    return null;
  }
  //

  //Audio tracks methods
  getAudioTracks() {
    var qua = [];
    this.audioTracks.forEach((item, i) => {
			qua.push({"name": this.getLang(item.lang).name, "level" : i});
		});
    return qua;
  }

  getAudioTrack(val) {
    val = parseInt(val);
    var aud = {"name": "UNK", "level" : -1}
    this.getAudioTracks().forEach(function(item, i) {
      if(item.level == val) {
        aud = item;
      }
    });
    return aud;
  }

  getCurrentAudioTrack() {
    return this.getAudioTrack(this.audioTrack);
  }

  hasAudioTrack() {
    return this.getAudioTracks().length > 0;
  }
  //

  //Subtitles methods
  getSubtitles() {
    var qua = [];
    qua.push({name: "None", level: -1})
    for(var i = 0; i < this.media.textTracks.length; i++) {
      var item = this.media.textTracks[i];
      qua.push({name: this.getLang(item.language).name, level: i})
    }
    return qua;
  }

  getSubtitle(val) {
    val = parseInt(val);
    var sub = {"name": "None", "level" : -1};
    this.getSubtitles().forEach(function(item, i) {
      if(item.level == val) {
        sub = item;
      }
    });
    return sub;
  }

  getCurrentSubtitle() {
    var sub = {"name": "None", "level" : -1};
    for(var i = 0; i < this.media.textTracks.length; i++) {
      var item = this.media.textTracks[i];
      if(item.mode == "showing"){
        sub = {name: this.getLang(item.language).name, level: i};
        break;
      }
    }
    return sub;
  }

  enableSubtitle(val) {
    val = parseInt(val);
    for(var i = 0; i < this.media.textTracks.length; i++) {
      var track = this.media.textTracks[i];
      if(i == val){
        track.mode = this.CONSTANTS.trackMode.showing;
      } else {
        track.mode = this.CONSTANTS.trackMode.disabled;
      }
    }
  }
  //

  getUserQualityMap() {
    return this.playerConfig.hasOwnProperty("qualityLabel") ? this.playerConfig.qualityLabel : {};
  }

  //Video quality methods
  getVideoQualities() {
    var _this = this;
    var qua = [];
    qua.push({"name": "Auto", "level" : -1});
    this.levels.forEach((item, i) => {
			if(item.width){
				qua.push({
          "name": _this.getUserQualityMap().hasOwnProperty(item.bitrate) ? _this.getUserQualityMap()[item.bitrate] : item.height+"p",
           "level" : i
         }
       );
			}
		});
    return qua;
  }

  getQualityName(level) {
    var name = null;
    this.getVideoQualities().forEach(function(item, i) {
      if(level == item.level) {
        name = item.name;
      }
    });
    return (name == null ? "UNK" : name);
  }

  getCurrentQuality() {
    return {
      "name": this.getQualityName(this.manualLevel) +
              (this.manualLevel==-1? "("+this.getQualityName(this.currentLevel)+")":""),
      "level": this.manualLevel};
  }
  //

  initSlider() {
    var _this = this;
    var sliders = document.querySelectorAll(".hlsjs-slider");
    for(var i = 0; i < sliders.length; i++) {
      var slider = sliders.item(i);
      this.updateSliderBackground(slider);
      slider.addEventListener("input", function(){
        _this.updateSliderBackground(this);
      });
      slider.addEventListener("change", function(){
        _this.updateSliderBackground(this);
      });
    }
  }

  updateBufferedProgress() {
    var media = this.media;
    var ref = this.controls.bufferedProgress.max;
    var duration = media.duration;
    for(var i = 0; i < media.buffered.length; i++) {
      var start = media.buffered.start(i);
      var end = media.buffered.end(i);
      if(start <= media.currentTime && media.currentTime <= end) {
        var value = parseFloat((end/duration)*ref);
        this.controls.bufferedProgress.value = (Number.isNaN(value) ? 0 : value);
        break;
      }
    }
  }

  updateSliderBackground(el) {
    var value = (el.value-el.min)/(el.max-el.min)*100;
    el.style.setProperty('--value', value + "%");
  }

  notLive() {
    if(!this.isLive()) {
      this.removeClass(this.controls.dropdownItem.speed, "hide");
      return;
    }
    this.addClass(this.controls.dropdownItem.speed, "hide");
    this.liveTagActive();
  }

  goToLive() {
    var media = this.media;
    media.currentTime = (media.duration - 5);
    this.liveTagInactive();
  }

  liveTagActive() {
    var _this = this;
    this.controls.liveTag.onclick = function() {
      //console.log("clicked");
      _this.showLoader();
      _this.goToLive();
      _this.play();
    }
    this.controls.liveTag.removeAttribute("live");
  }

  liveTagInactive() {
    this.controls.liveTag.onclick = null;
    this.controls.liveTag.setAttribute("live", "true");
  }

  isLive() {
    if(this.playerConfig.hasOwnProperty("live")) {
      return this.playerConfig.live;
    }
    try {
      var cl = this.currentLevel;
      if(cl == -1) {
        cl = 0;
      }
      return this.levels[cl]['details']['live'];
    } catch(err) {
      return false;
    }
  }

  setupStream() {
    if(this.isLive()) {
      this.controls.liveTag.innerHTML = "LIVE";
      this.controls.liveTag.setAttribute("live", true);
      this.addClass(this.controls.controlsContainer, "hlsjs-live");
    } else {
      this.controls.liveTag.innerHTML = "VOD";
      this.controls.liveTag.removeAttribute("live");
      this.controls.liveTag.onclick = null;
      this.removeClass(this.controls.controlsContainer, "hlsjs-live");
    }
    this.controls.liveTag.removeAttribute("hide");
    this.controls.timeContainer.removeAttribute("hide");
    this.controls.seekContainer.removeAttribute("hide");
  }

  changeVolume() {
    var vol = parseFloat(this.controls.volume.value);
    this.media.volume = vol;
    if(vol == 0) {
      this.mute();
    } else {
      this.unmute();
    }
  }

  updateSeekBar() {
    this.controls.currentTime.innerHTML = this.currentTime();
    this.controls.seek.value = parseFloat((this.media.currentTime / this.media.duration)*parseFloat(this.controls.seek.max));
    this.updateSliderBackground(this.controls.seek);
  }

  updateSeek() {
    this.seek(parseFloat((parseFloat(this.controls.seek.value) / parseFloat(this.controls.seek.max))*this.media.duration));
  }

  seek(sec) {
    this.media.currentTime = sec;
  }

  currentTime() {
    return this.parseTime(this.media.currentTime);
  }

  duration() {
    return this.parseTime(this.media.duration);
  }

  parseTime(seconds=0) {
    if (seconds > 0) {
      var m = Math.floor(seconds / 60);
      var h = Math.floor(m / 60);
      m = m % 60;
      var s = Math.floor(seconds % 60);
      h = (h >= 10) ? h : "0" + h;
      m = (m >= 10) ? m : "0" + m;
      s = (s >= 10) ? s : "0" + s;
      return h+":"+m+":"+s;
    }

    return "00:00:00";
  }

  play() {
    this.media.play();
  }

  pause() {
    this.media.pause();
  }

  togglePlay() {
    this.media.paused ? this.play() : this.pause();
  }

  mute() {
    this.media.muted = true;
    this.controls.mute.innerHTML = "volume_off";
  }

  unmute() {
    this.media.muted = false;
    this.controls.mute.innerHTML = "volume_up";
  }

  toggleMute() {
    if(this.media.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  hideControls() {
    var _this = this;
    if(this.isDropdownShown()) {return;}
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(function() {_this.controls.controlsContainer.removeAttribute("shown");}, 3000)
  }

  showControls() {
    clearTimeout(this.controlsTimeout);
    this.controls.controlsContainer.setAttribute("shown", "true");
  }

  hideDropdown() {
    this.controls.dropdown.removeAttribute("shown");
    this.controls.controlsContainer.removeAttribute("dropdown");
    this.hideControls();
  }

  showDropdown() {
    clearTimeout(this.controlsTimeout);
    this.refreshDropdown();
    this.controls.dropdown.setAttribute("shown", "true");
    this.controls.controlsContainer.setAttribute("dropdown", "true");
  }

  showItems(tp) {
    var children = this.controls.dropdown.children;
    var numChild = children.length;
    var catChild = null;
    var i = 0;

    for(i=0; i < numChild; i++) {
      var child = children.item(i);
      if(child.hasAttribute("cat")) {
        if(child.getAttribute("cat") == tp) {
          if(child.children.length > 0) {
            catChild = child;
          }
        }
      }
    }

    if(catChild == null) {return;}

    for(i=0; i < numChild; i++) {
      var child = children.item(i);
      if(child == catChild) {
          child.removeAttribute("hide");
      } else {
        child.setAttribute("hide", "true");
      }
    }

  }

  refreshDropdown() {
    var dropdownItems = this.controls.dropdown.children;
    for(var i = 0; i < dropdownItems.length; i++) {
      var item = dropdownItems.item(i);
      item.removeAttribute("show");
      item.removeAttribute("hide");
    }

    var currentSpeed = this.getCurrentSpeed();
    this.setSelectValue(this.controls.dropdownItem.speed, currentSpeed.name, currentSpeed.id);

    var currentQuality = this.getCurrentQuality();
    this.setSelectValue(this.controls.dropdownItem.resolution, currentQuality.name, currentQuality.level);

    var currentAudio = this.getCurrentAudioTrack();
    this.setSelectValue(this.controls.dropdownItem.audioTrack, currentAudio.name, currentAudio.level);

    if(this.hasAudioTrack()) {
      this.removeClass(this.controls.dropdownItem.audioTrack, "hide");
    } else {
      this.addClass(this.controls.dropdownItem.audioTrack, "hide");
    }

    var currentSubtitle = this.getCurrentSubtitle();
    this.setSelectValue(this.controls.dropdownItem.caption, currentSubtitle.name, currentSubtitle.level);
  }

  isDropdownShown() {
    return this.controls.dropdown.hasAttribute("shown");
  }

  toggleDropdown() {
    if(this.isDropdownShown()) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  hideLoader() {
    this.controls.loader.removeAttribute("shown");
  }

  showLoader() {
    this.controls.loader.setAttribute("shown", "true");
  }

  toggleFullscreen() {
    var element = this.controls.videoContainer;
    if (this.isFullscreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      return true;

    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      return false;

    }
  }

  isFullscreen() {
    return (document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement);
  }

  createSelect(name, value, init, chg) {
    var _this = this;
    var select = document.createElement("div");
    select.setAttribute("class", "hlsjs-select");

    var selectMain = document.createElement("div");
    selectMain.setAttribute("class", "hlsjs-select-main hlsjs-select-option");

    var nm = document.createElement("span")
    nm.setAttribute("class", "hlsjs-select-option-name");
    nm.innerHTML = name;
    var vl = document.createElement("span")
    vl.setAttribute("class", "hlsjs-select-option-selected");
    vl.innerHTML = value;

    selectMain.appendChild(nm);
    selectMain.appendChild(vl);

    var selectContainer = document.createElement("div");
    selectContainer.setAttribute("class", "hlsjs-select-container");

    select.appendChild(selectMain);
    select.appendChild(selectContainer);

    selectMain.onclick = function() {
      if(select.hasAttribute("show")) {
        select.removeAttribute("show");
      } else {
        select.parentElement.childNodes.forEach((item, i) => {
          if(select != item) {
            item.setAttribute("hide", "true");
          }
        });
        while (selectContainer.firstChild) {
          selectContainer.removeChild(selectContainer.firstChild);
        }
        init(selectContainer);
        select.setAttribute("show", "true");
      }
    }

    select.onchange = function(e) {
      var val = e.target.getAttribute("data-value");
      select.setAttribute("data-value", val);
      vl.innerHTML = e.target.getAttribute("data-name");
      chg(val);
      _this.hideDropdown();
    }

    return select;
  }

  setSelectValue(select, name, value) {
    select.setAttribute("data-value", value);
    select.querySelector(".hlsjs-select-main > .hlsjs-select-option-selected").innerHTML = name;
  }

  createSelectOption(name, value, selected=false) {
    var option = document.createElement("div");
    option.setAttribute("class", "hlsjs-select-option");
    option.setAttribute("data-value", value);
    option.setAttribute("data-name", name);

    if(selected) {
      option.setAttribute("selected", "true");
    }

    var nm = document.createElement("span")
    nm.setAttribute("class", "hlsjs-select-option-name");
    nm.innerHTML = name;
    var sl = document.createElement("span")
    sl.setAttribute("class", "hlsjs-select-option-selected");

    option.appendChild(nm);
    option.appendChild(sl);

    option.onclick = function() {
      var element = this;
      var name = "change";
      if(document.createEvent){
          event = document.createEvent("HTMLEvents");
          event.initEvent(name, true, true);
          event.eventName = name;
          element.dispatchEvent(event);
      } else {
          event = document.createEventObject();
          event.eventName = name;
          event.eventType = name;
          element.fireEvent("on" + event.eventType, event);
      }
    }

    return option;

  }

  triggerEvent(element, name) {
    var event; // The custom event that will be created
    if(document.createEvent){
        event = document.createEvent("HTMLEvents");
        event.initEvent(name, true, true);
        event.eventName = name;
        element.dispatchEvent(event);
    } else {
        event = document.createEventObject();
        event.eventName = name;
        event.eventType = name;
        element.fireEvent("on" + event.eventType, event);
    }
  }

  isMobOrTab() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  //add class to element
  addClass(element, name) {
  	var arr = element.className.split(" ");
  	if(arr.indexOf(name) == -1) {
  		element.className += " " + name;
  	}
  }
  //remove class from element
  removeClass(element, name) {
  	element.className = element.className.replace(new RegExp('\\b' + name + '\\b', "gm"), "").trim();
  }

  //has class
  hasClass(element, name) {
  	var arr = element.className.split(" ");
  	return (arr.indexOf(name) != -1);
  }

  //get Language info
  getLang(lang) {
      /**
     * @author Phil Teare
     * using wikipedia data
     */
    var isoLangs={ab:{name:"Abkhaz",nativeName:"аҧсуа"},aa:{name:"Afar",nativeName:"Afaraf"},af:{name:"Afrikaans",nativeName:"Afrikaans"},ak:{name:"Akan",nativeName:"Akan"},sq:{name:"Albanian",nativeName:"Shqip"},am:{name:"Amharic",nativeName:"አማርኛ"},ar:{name:"Arabic",nativeName:"العربية"},an:{name:"Aragonese",nativeName:"Aragonés"},hy:{name:"Armenian",nativeName:"Հայերեն"},as:{name:"Assamese",nativeName:"অসমীয়া"},av:{name:"Avaric",nativeName:"авар мацӀ, магӀарул мацӀ"},ae:{name:"Avestan",nativeName:"avesta"},ay:{name:"Aymara",nativeName:"aymar aru"},az:{name:"Azerbaijani",nativeName:"azərbaycan dili"},bm:{name:"Bambara",nativeName:"bamanankan"},ba:{name:"Bashkir",nativeName:"башҡорт теле"},eu:{name:"Basque",nativeName:"euskara, euskera"},be:{name:"Belarusian",nativeName:"Беларуская"},bn:{name:"Bengali",nativeName:"বাংলা"},bh:{name:"Bihari",nativeName:"भोजपुरी"},bi:{name:"Bislama",nativeName:"Bislama"},bs:{name:"Bosnian",nativeName:"bosanski jezik"},br:{name:"Breton",nativeName:"brezhoneg"},bg:{name:"Bulgarian",nativeName:"български език"},my:{name:"Burmese",nativeName:"ဗမာစာ"},ca:{name:"Catalan; Valencian",nativeName:"Català"},ch:{name:"Chamorro",nativeName:"Chamoru"},ce:{name:"Chechen",nativeName:"нохчийн мотт"},ny:{name:"Chichewa; Chewa; Nyanja",nativeName:"chiCheŵa, chinyanja"},zh:{name:"Chinese",nativeName:"中文 (Zhōngwén), 汉语, 漢語"},cv:{name:"Chuvash",nativeName:"чӑваш чӗлхи"},kw:{name:"Cornish",nativeName:"Kernewek"},co:{name:"Corsican",nativeName:"corsu, lingua corsa"},cr:{name:"Cree",nativeName:"ᓀᐦᐃᔭᐍᐏᐣ"},hr:{name:"Croatian",nativeName:"hrvatski"},cs:{name:"Czech",nativeName:"česky, čeština"},da:{name:"Danish",nativeName:"dansk"},dv:{name:"Divehi; Dhivehi; Maldivian;",nativeName:"ދިވެހި"},nl:{name:"Dutch",nativeName:"Nederlands, Vlaams"},en:{name:"English",nativeName:"English"},eo:{name:"Esperanto",nativeName:"Esperanto"},et:{name:"Estonian",nativeName:"eesti, eesti keel"},ee:{name:"Ewe",nativeName:"Eʋegbe"},fo:{name:"Faroese",nativeName:"føroyskt"},fj:{name:"Fijian",nativeName:"vosa Vakaviti"},fi:{name:"Finnish",nativeName:"suomi, suomen kieli"},fr:{name:"French",nativeName:"français, langue française"},ff:{name:"Fula; Fulah; Pulaar; Pular",nativeName:"Fulfulde, Pulaar, Pular"},gl:{name:"Galician",nativeName:"Galego"},ka:{name:"Georgian",nativeName:"ქართული"},de:{name:"German",nativeName:"Deutsch"},el:{name:"Greek, Modern",nativeName:"Ελληνικά"},gn:{name:"Guaraní",nativeName:"Avañeẽ"},gu:{name:"Gujarati",nativeName:"ગુજરાતી"},ht:{name:"Haitian; Haitian Creole",nativeName:"Kreyòl ayisyen"},ha:{name:"Hausa",nativeName:"Hausa, هَوُسَ"},he:{name:"Hebrew (modern)",nativeName:"עברית"},hz:{name:"Herero",nativeName:"Otjiherero"},hi:{name:"Hindi",nativeName:"हिन्दी, हिंदी"},ho:{name:"Hiri Motu",nativeName:"Hiri Motu"},hu:{name:"Hungarian",nativeName:"Magyar"},ia:{name:"Interlingua",nativeName:"Interlingua"},id:{name:"Indonesian",nativeName:"Bahasa Indonesia"},ie:{name:"Interlingue",nativeName:"Originally called Occidental; then Interlingue after WWII"},ga:{name:"Irish",nativeName:"Gaeilge"},ig:{name:"Igbo",nativeName:"Asụsụ Igbo"},ik:{name:"Inupiaq",nativeName:"Iñupiaq, Iñupiatun"},io:{name:"Ido",nativeName:"Ido"},is:{name:"Icelandic",nativeName:"Íslenska"},it:{name:"Italian",nativeName:"Italiano"},iu:{name:"Inuktitut",nativeName:"ᐃᓄᒃᑎᑐᑦ"},ja:{name:"Japanese",nativeName:"日本語 (にほんご／にっぽんご)"},jv:{name:"Javanese",nativeName:"basa Jawa"},kl:{name:"Kalaallisut, Greenlandic",nativeName:"kalaallisut, kalaallit oqaasii"},kn:{name:"Kannada",nativeName:"ಕನ್ನಡ"},kr:{name:"Kanuri",nativeName:"Kanuri"},ks:{name:"Kashmiri",nativeName:"कश्मीरी, كشميري‎"},kk:{name:"Kazakh",nativeName:"Қазақ тілі"},km:{name:"Khmer",nativeName:"ភាសាខ្មែរ"},ki:{name:"Kikuyu, Gikuyu",nativeName:"Gĩkũyũ"},rw:{name:"Kinyarwanda",nativeName:"Ikinyarwanda"},ky:{name:"Kirghiz, Kyrgyz",nativeName:"кыргыз тили"},kv:{name:"Komi",nativeName:"коми кыв"},kg:{name:"Kongo",nativeName:"KiKongo"},ko:{name:"Korean",nativeName:"한국어 (韓國語), 조선말 (朝鮮語)"},ku:{name:"Kurdish",nativeName:"Kurdî, كوردی‎"},kj:{name:"Kwanyama, Kuanyama",nativeName:"Kuanyama"},la:{name:"Latin",nativeName:"latine, lingua latina"},lb:{name:"Luxembourgish, Letzeburgesch",nativeName:"Lëtzebuergesch"},lg:{name:"Luganda",nativeName:"Luganda"},li:{name:"Limburgish, Limburgan, Limburger",nativeName:"Limburgs"},ln:{name:"Lingala",nativeName:"Lingála"},lo:{name:"Lao",nativeName:"ພາສາລາວ"},lt:{name:"Lithuanian",nativeName:"lietuvių kalba"},lu:{name:"Luba-Katanga",nativeName:""},lv:{name:"Latvian",nativeName:"latviešu valoda"},gv:{name:"Manx",nativeName:"Gaelg, Gailck"},mk:{name:"Macedonian",nativeName:"македонски јазик"},mg:{name:"Malagasy",nativeName:"Malagasy fiteny"},ms:{name:"Malay",nativeName:"bahasa Melayu, بهاس ملايو‎"},ml:{name:"Malayalam",nativeName:"മലയാളം"},mt:{name:"Maltese",nativeName:"Malti"},mi:{name:"Māori",nativeName:"te reo Māori"},mr:{name:"Marathi (Marāṭhī)",nativeName:"मराठी"},mh:{name:"Marshallese",nativeName:"Kajin M̧ajeļ"},mn:{name:"Mongolian",nativeName:"монгол"},na:{name:"Nauru",nativeName:"Ekakairũ Naoero"},nv:{name:"Navajo, Navaho",nativeName:"Diné bizaad, Dinékʼehǰí"},nb:{name:"Norwegian Bokmål",nativeName:"Norsk bokmål"},nd:{name:"North Ndebele",nativeName:"isiNdebele"},ne:{name:"Nepali",nativeName:"नेपाली"},ng:{name:"Ndonga",nativeName:"Owambo"},nn:{name:"Norwegian Nynorsk",nativeName:"Norsk nynorsk"},no:{name:"Norwegian",nativeName:"Norsk"},ii:{name:"Nuosu",nativeName:"ꆈꌠ꒿ Nuosuhxop"},nr:{name:"South Ndebele",nativeName:"isiNdebele"},oc:{name:"Occitan",nativeName:"Occitan"},oj:{name:"Ojibwe, Ojibwa",nativeName:"ᐊᓂᔑᓈᐯᒧᐎᓐ"},cu:{name:"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",nativeName:"ѩзыкъ словѣньскъ"},om:{name:"Oromo",nativeName:"Afaan Oromoo"},or:{name:"Oriya",nativeName:"ଓଡ଼ିଆ"},os:{name:"Ossetian, Ossetic",nativeName:"ирон æвзаг"},pa:{name:"Panjabi, Punjabi",nativeName:"ਪੰਜਾਬੀ, پنجابی‎"},pi:{name:"Pāli",nativeName:"पाऴि"},fa:{name:"Persian",nativeName:"فارسی"},pl:{name:"Polish",nativeName:"polski"},ps:{name:"Pashto, Pushto",nativeName:"پښتو"},pt:{name:"Portuguese",nativeName:"Português"},qu:{name:"Quechua",nativeName:"Runa Simi, Kichwa"},rm:{name:"Romansh",nativeName:"rumantsch grischun"},rn:{name:"Kirundi",nativeName:"kiRundi"},ro:{name:"Romanian, Moldavian, Moldovan",nativeName:"română"},ru:{name:"Russian",nativeName:"русский язык"},sa:{name:"Sanskrit (Saṁskṛta)",nativeName:"संस्कृतम्"},sc:{name:"Sardinian",nativeName:"sardu"},sd:{name:"Sindhi",nativeName:"सिन्धी, سنڌي، سندھی‎"},se:{name:"Northern Sami",nativeName:"Davvisámegiella"},sm:{name:"Samoan",nativeName:"gagana faa Samoa"},sg:{name:"Sango",nativeName:"yângâ tî sängö"},sr:{name:"Serbian",nativeName:"српски језик"},gd:{name:"Scottish Gaelic; Gaelic",nativeName:"Gàidhlig"},sn:{name:"Shona",nativeName:"chiShona"},si:{name:"Sinhala, Sinhalese",nativeName:"සිංහල"},sk:{name:"Slovak",nativeName:"slovenčina"},sl:{name:"Slovene",nativeName:"slovenščina"},so:{name:"Somali",nativeName:"Soomaaliga, af Soomaali"},st:{name:"Southern Sotho",nativeName:"Sesotho"},es:{name:"Spanish; Castilian",nativeName:"español, castellano"},su:{name:"Sundanese",nativeName:"Basa Sunda"},sw:{name:"Swahili",nativeName:"Kiswahili"},ss:{name:"Swati",nativeName:"SiSwati"},sv:{name:"Swedish",nativeName:"svenska"},ta:{name:"Tamil",nativeName:"தமிழ்"},te:{name:"Telugu",nativeName:"తెలుగు"},tg:{name:"Tajik",nativeName:"тоҷикӣ, toğikī, تاجیکی‎"},th:{name:"Thai",nativeName:"ไทย"},ti:{name:"Tigrinya",nativeName:"ትግርኛ"},bo:{name:"Tibetan Standard, Tibetan, Central",nativeName:"བོད་ཡིག"},tk:{name:"Turkmen",nativeName:"Türkmen, Түркмен"},tl:{name:"Tagalog",nativeName:"Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔"},tn:{name:"Tswana",nativeName:"Setswana"},to:{name:"Tonga (Tonga Islands)",nativeName:"faka Tonga"},tr:{name:"Turkish",nativeName:"Türkçe"},ts:{name:"Tsonga",nativeName:"Xitsonga"},tt:{name:"Tatar",nativeName:"татарча, tatarça, تاتارچا‎"},tw:{name:"Twi",nativeName:"Twi"},ty:{name:"Tahitian",nativeName:"Reo Tahiti"},ug:{name:"Uighur, Uyghur",nativeName:"Uyƣurqə, ئۇيغۇرچە‎"},uk:{name:"Ukrainian",nativeName:"українська"},ur:{name:"Urdu",nativeName:"اردو"},uz:{name:"Uzbek",nativeName:"zbek, Ўзбек, أۇزبېك‎"},ve:{name:"Venda",nativeName:"Tshivenḓa"},vi:{name:"Vietnamese",nativeName:"Tiếng Việt"},vo:{name:"Volapük",nativeName:"Volapük"},wa:{name:"Walloon",nativeName:"Walon"},cy:{name:"Welsh",nativeName:"Cymraeg"},wo:{name:"Wolof",nativeName:"Wollof"},fy:{name:"Western Frisian",nativeName:"Frysk"},xh:{name:"Xhosa",nativeName:"isiXhosa"},yi:{name:"Yiddish",nativeName:"ייִדיש"},yo:{name:"Yoruba",nativeName:"Yorùbá"},za:{name:"Zhuang, Chuang",nativeName:"Saɯ cueŋƅ, Saw cuengh"}};

    var langcode = lang.slice(0, 2).toLowerCase();
    if(isoLangs.hasOwnProperty(langcode)) {
      return isoLangs[langcode];
    }
    return {name: "UNKNOWN", nativeName: "UNKNOWN"}
  }


}

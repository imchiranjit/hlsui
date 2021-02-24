class HlsUI extends Hls {

  controls = {
    loader: null,
    bgPlay: null,
    play : null,
    mute: null,
    fullscreen: null,
    more: null,
    title: null,
    liveTag: null,
    backface: null,
    dropdown: null,
    dropdownItem: {
      resolution: null,
      speed: null,
      caption: null,
      qualityMenu: null
    },
    controlsContainer: null,
    videoContainer: null
  };

  controlsTimeout = null;


  constructor() {
    super();
  }

  attachMedia(videoElement, title="") {
    this.initUI(videoElement, title);
    super.attachMedia(videoElement);
  }

  initUI(videoElement, title) {

    //videoElement = document.querySelector(id);
		videoElement.controls = false;
		var videoContainer = document.createElement("div");
    var containerClass = "hlsjs-container";

    if(videoElement.hasAttribute("class")) {
      containerClass += " "+videoElement.getAttribute("class");
      videoElement.removeAttribute("class");
    }
    if(videoElement.hasAttribute("id")) {
      videoContainer.setAttribute("id", videoElement.getAttribute("id"));
      videoElement.removeAttribute("id");
    }

    videoElement.setAttribute("class", "hlsjs-video")
    videoContainer.setAttribute("class", containerClass);

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
		videoTitle.innerHTML = title;

		var videoLiveTag = document.createElement("button");
		videoLiveTag.setAttribute("class", "hlsjs-live-tag");
		videoLiveTag.innerHTML = "LIVE";

		videoTopBar.appendChild(videoTitle);
		videoTopBar.appendChild(videoLiveTag);

		var videoToolbar = document.createElement("div");
		videoToolbar.setAttribute("class", "hlsjs-toolbar");

		var videoPlayPauseBtn = document.createElement("button");
		videoPlayPauseBtn.setAttribute("class", "hlsjs-ctrl-btn btn-lt btn-lt material-icons-round");
		videoPlayPauseBtn.innerHTML = "play_arrow";

		var videoVolumeBtn = document.createElement("button");
		videoVolumeBtn.setAttribute("class", "hlsjs-ctrl-btn btn-rt btn-lt material-icons-round");
		videoVolumeBtn.innerHTML = "volume_up";

		var videoMoreBtn = document.createElement("button");
		videoMoreBtn.setAttribute("class", "hlsjs-ctrl-btn btn-rt btn-lt material-icons-round");
		videoMoreBtn.innerHTML = "more_vert";

		var videoFSBtn = document.createElement("button");
		videoFSBtn.setAttribute("class", "hlsjs-ctrl-btn btn-rt btn-lt material-icons-round");
		videoFSBtn.innerHTML = "fullscreen";

    var videoDropdown = document.createElement("div");
		videoDropdown.setAttribute("class", "hlsjs-dropdown");

    var videoResolution = this.createDropdownItem("Resolution", "Auto", "res", null);
    var videoSpeed = this.createDropdownItem("Speed", "Normal", "sp", null);
    var videoCaption = this.createDropdownItem("Caption", "None", "cp", null);

    videoDropdown.appendChild(videoResolution);
    videoDropdown.appendChild(videoSpeed);
    videoDropdown.appendChild(videoCaption);

		videoToolbar.appendChild(videoPlayPauseBtn);
		videoToolbar.appendChild(videoFSBtn);
		videoToolbar.appendChild(videoMoreBtn);
		videoToolbar.appendChild(videoVolumeBtn);
    videoToolbar.appendChild(videoDropdown);

		var videoBigPlayBtn = document.createElement("button");
		videoBigPlayBtn.setAttribute("class", "hlsjs-big-play-btn material-icons-round");
    if(!this.isMobOrTab()) {
      videoBigPlayBtn.setAttribute("hide", "true");
    }
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

    this.controls.backface = videoBackFace;
    this.controls.title = videoTitle;
    this.controls.liveTag = videoLiveTag;
    this.controls.bgPlay = videoBigPlayBtn;
    this.controls.play = videoPlayPauseBtn;
    this.controls.mute = videoVolumeBtn;
    this.controls.fullscreen = videoFSBtn;
    this.controls.more = videoMoreBtn;
    this.controls.loader = videoLoader;
    this.controls.dropdown = videoDropdown;
    this.controls.controlsContainer = videoControls;
    this.controls.videoContainer = videoContainer;

    this.bindControls();

  }

  createDropdownItem(nm, val, tp, cat) {
    var item = document.createElement("div");
    item.setAttribute("class", "hlsjs-dropdown-item");
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

  initQualityMenu() {
    var _this = this;
    this.controls.dropdownItem.qualityMenu = this.createSelectElement("res");
		this.getVideoQualities().forEach((item, i) => {
				this.controls.dropdownItem.qualityMenu.appendChild(this.createSelectOptionElement(item.name, item.level, (item.level == -1)));
		});
		this.controls.dropdownItem.qualityMenu.onchange = function (e) {
        var value = this.getAttribute("value");
        //console.log(value);
				_this.loadLevel = parseInt(value);
        _this.hideDropdown();
		}
    this.controls.dropdown.appendChild(this.controls.dropdownItem.qualityMenu);
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
    this.on(this.constructor.Events.FRAG_BUFFERED, () => {
      //console.log("FRAG_BUFFERED");
      _this.hideLoader();
    });

    this.on(this.constructor.Events.MEDIA_ATTACHED, function () {

      _this.showLoader();

      if(_this.isMobOrTab()) {
        _this.media.volume = 1.0;
      }

      _this.controls.play.onclick = function() {_this.togglePlay()};
      _this.controls.bgPlay.onclick = function() {_this.togglePlay()};
      _this.controls.mute.onclick = function() {_this.toggleMute()};

      _this.controls.more.onclick = function() {_this.toggleDropdown()};
      _this.bindDropdownItemsControls();

      _this.media.onplaying = function() {
        _this.hideControls();
        _this.controls.bgPlay.innerHTML = "pause_arrow";
        _this.controls.play.innerHTML = "pause_arrow";
      };

      _this.media.onpause = function() {
        _this.showControls()
        _this.controls.bgPlay.innerHTML = "play_arrow";
        _this.controls.play.innerHTML = "play_arrow";
      };
      _this.media.ondurationchange = (event) => {
        if((_this.media.duration - _this.media.currentTime) > 30) {
          _this.notLive();
        }
      };

      _this.controls.backface.onclick = function() {
        _this.hideDropdown();
        _this.showControls();
        _this.hideControls();
      };

      _this.controls.fullscreen.onclick = function() {
        _this.controls.fullscreen.innerHTML = (_this.toggleFullscreen() ? "fullscreen" : "fullscreen_exit");
      };

    });
    this.on(this.constructor.Events.MANIFEST_PARSED, function (event, data) {
      _this.initQualityMenu();
    });
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

  getVideoQualities() {
    var qua = [];
    qua.push({"name": "Auto", "level" : -1});
    this.levels.forEach((item, i) => {
			if(item.width){
				qua.push({"name": item.height+"p", "level" : i});
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
    return {"name": this.getQualityName(this.manualLevel), "level": this.manualLevel};
  }

  notLive() {
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
      _this.goToLive();
      _this.play();
    }
    this.controls.liveTag.removeAttribute("live");
  }

  liveTagInactive() {
    this.controls.liveTag.onclick = null;
    this.controls.liveTag.setAttribute("live", "true");
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
  }

  unmute() {
    this.media.muted = false;
  }

  toggleMute() {
    if(this.media.muted) {
      this.unmute();
      this.controls.mute.innerHTML = "volume_up";
    } else {
      this.mute();
      this.controls.mute.innerHTML = "volume_off";
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
    //this.refreshDropdown();
    this.hideControls();
  }

  showDropdown() {
    clearTimeout(this.controlsTimeout);
    this.refreshDropdown();
    this.controls.dropdown.setAttribute("shown", "true");
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
          catChild = child;
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
      if(item.hasAttribute("tp")) {

        if(item.getAttribute("tp") == "res") {
          item.querySelector(".it-val").innerHTML = this.getCurrentQuality().name;
        }

        item.removeAttribute("hide");
      } else {
        item.setAttribute("hide", "true");
      }
    }
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

  createSelectElement(cat=null) {
    //console.log("select")
    var _this = this;
    var select = document.createElement("div");
    select.setAttribute("class", "hlsjs-select");
    if(cat != null) {
      select.setAttribute("cat", cat);
    }
    select.addEventListener("click", function(e) {
       var target = e.target;
       if(target == this) {
         return;
       }
       while(target != document.body) {
           if(target.classList.contains("hlsjs-select-option")) {
              var value = target.getAttribute("value");
               this.setAttribute("value", value);
               _this.triggerEvent(this, "change");
               //target.removeAttribute("selected");
               //console.log(target);
               var children = this.children;
               for(var i = 0; i < children.length; i++) {
                 if(parseInt(value) == parseInt(children.item(i).getAttribute("value"))) {
                   children.item(i).setAttribute("selected", "true");
                   //break;
                 } else {
                   children.item(i).removeAttribute("selected");
                 }
               }
               break;
           }
           target = target.parentNode;
       }
    });
    return select;
  }

  createSelectOptionElement(nm, val, sel=false) {
    var item = document.createElement("div");
    item.setAttribute("class", "hlsjs-select-option");
    item.setAttribute("value", val);
    if(sel) {
      item.setAttribute("selected", "true");
    }

    var name = document.createElement("span");
    name.setAttribute("class", "hlsjs-select-option-name");
    name.innerHTML = nm;

    var selected = document.createElement("span");
    selected.setAttribute("class", "hlsjs-select-option-selected");
    //value.innerHTML = val;

    item.appendChild(name);
    item.appendChild(selected);

    return item;
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


}

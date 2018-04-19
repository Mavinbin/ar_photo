'use strict'

;
(function () {
    var ARPhoto = {}

    // global object
    ARPhoto.global = {
        oTraceWrap: document.getElementById('traceWrap'),
        oVideo: document.getElementById('video'),
        oTrace: document.getElementById('trace'),
        oAssets: document.getElementById('assets'),
        traceCtx: document.getElementById('trace').getContext('2d'),
        traceStage: new createjs.Stage('trace'),
        canvasW: document.documentElement.clientWidth,
        canvasH: document.documentElement.clientHeight,
        requestAnimationFrameId: null,
        isPause: false
    }

    ARPhoto.roleInfo = {}

    // get the param from URL
    ARPhoto.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
            r = window.location.search.substr(1).match(reg)

        if (r !== null) {
            return unescape(r[2]);
        } else {
            return ''
        }
    }

    // dom operation
    ARPhoto.domOperation = function () {
        var oBtnShuffer = document.getElementById('btnShutter'),
            oBtnRedo = document.getElementById('btnRedo'),
            oTraceBtns = document.getElementById('traceBtns'),
            oResultBtns = document.getElementById('resultBtns')

        // click to take a photo
        oBtnShuffer.addEventListener('click', function () {
            ARPhoto.global.isPause = true
            ARPhoto.global.oVideo.pause()
            ARPhoto.draw()
            oTraceBtns.classList.remove('active')
            oResultBtns.classList.add('active')
        })

        // click to redo taking a photo
        oBtnRedo.addEventListener('click', function () {
            ARPhoto.global.isPause = false
            ARPhoto.global.oVideo.play()
            oResultBtns.classList.remove('active')
            oTraceBtns.classList.add('active')
        })
    }

    // print debug infomation in screen
    ARPhoto.log = function (msg) {
        var oLog = document.getElementById('log'),
            oSpan = document.createElement('span'),
            oMsg = document.createTextNode(msg)

        oSpan.appendChild(oMsg)
        oLog.appendChild(oSpan)
        console.log(msg)
    }

    // detect mobile system
    ARPhoto.getSystem = function () {
        var u = navigator.userAgent
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

        if (isAndroid) {
            return 'Android'
        } else {
            return 'iOS'
        }
    }

    // query all audio and video devices
    ARPhoto.enumerateDevices = function () {
        var _this = this
        var constraints = {
                audio: false,
                video: {}
            },
            videoDevices = []

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                devices.forEach(function (device) {
                    if (device.kind === 'videoinput') {
                        videoDevices.push(device.deviceId)
                    }
                })

                if (_this.getSystem() === 'Android') {
                    constraints.video.deviceId = videoDevices[0]
                } else {
                    constraints.video.deviceId = videoDevices[videoDevices.length - 1]
                }

                _this.getUserMedia(constraints)
            }).catch(function (err) {
                alert(err)
            })
        } else {
            alert('您的设备不支持摄像头调用！')
        }
    }

    // request to open the camera
    ARPhoto.getUserMedia = function (constraints) {
        var _this = this
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                _this.global.oVideo.srcObject = stream
                document.body.addEventListener('click', function () {
                    _this.global.oVideo.play()
                })
                var timer = setInterval(function () {
                    if (_this.global.oVideo.videoWidth) {
                        _this.initCanvas(_this.global.oVideo.videoWidth, _this.global.oVideo.videoHeight)
                        _this.initAssets()
                        clearInterval(timer)
                    }
                }, 20)
            }).catch(function (err) {
                console.log(err)
                if (err.name === 'DevicesNotFoundError') {
                    // alert('找不到摄像头！')
                } else {
                    alert(err)
                }
            })
        } else {
            alert('您的设备不支持摄像头调用！')
        }
    }

    // adjust canvas width and height to match with video
    ARPhoto.initCanvas = function (w, h) {
        this.global.oVideo.setAttribute('width', w)
        this.global.oVideo.setAttribute('height', h)
        this.global.oTrace.setAttribute('width', w)
        this.global.oTrace.setAttribute('height', h)
    }

    // add role image and init
    ARPhoto.initAssets = function () {
        var _this = this
        var _img = new Image()

        _img.src = 'img/role_' + this.getUrlParam('id') + '.png'

        _img.onload = function () {
            var img = new createjs.Bitmap(_img.src),
                imgBounds = img.getBounds()

            _this.roleInfo.role = img
            _this.roleInfo.initW = imgBounds.width
            _this.roleInfo.initH = imgBounds.height
            _this.global.traceStage.addChild(img)
            _this.global.traceStage.addChildAt(img, 1)
            _this.draw()
        }
    }

    // canvas drawing loop
    ARPhoto.draw = function () {
        var scale = window.innerWidth / this.roleInfo.initW,
            roleRealW = window.innerWidth,
            roleRealH = this.roleInfo.initH * scale,
            roleL = (this.global.oVideo.videoWidth - window.innerWidth) / 2,
            roleT = 0

        this.roleInfo.role.set({
            x: roleL,
            y: roleT,
            scaleX: scale,
            scaleY: scale
        })

        if (this.global.isPause) {
            var img = new createjs.Bitmap(ARPhoto.global.oVideo)
            this.global.traceStage.addChild(img)
            this.global.traceStage.addChildAt(img, 0)
        }

        this.global.traceStage.update()
    }

    // init
    ARPhoto.init = function () {
        var _this = this
        _this.enumerateDevices()
        createjs.Ticker.addEventListener('tick', ARPhoto.global.traceStage);
        // var timer = setInterval(function () {
        //     if (_this.global.oVideo.readyState === _this.global.oVideo.HAVE_ENOUGH_DATA && _this.global.oVideo.videoWidth > 0) {
        //         _this.initCanvas(_this.global.oVideo.videoWidth, _this.global.oVideo.videoHeight)
        //         _this.initAssets()
        //         clearInterval(timer)
        //     }
        // }, 20)
        _this.domOperation()
    }

    window.onload = function () {
        ARPhoto.init()
    }

})()
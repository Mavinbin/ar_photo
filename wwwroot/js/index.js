'use strict'

;
(function () {
    var ARPhoto = {},
        oVideo = document.getElementById('video'),
        oTrace = document.getElementById('trace'),
        traceCtx = document.getElementById('trace').getContext('2d'),
        traceStage = new createjs.Stage('trace'),
        isPause = false,
        scaleRate = 1

    ARPhoto.roleInfo = {}

    ARPhoto.requestAnimationFrame = function (callback, element) {
        var requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        return requestAnimationFrame.call(window, callback, element);
    }

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
        var oTraceBtns = document.getElementById('traceBtns'),
            oResultBtns = document.getElementById('resultBtns'),
            oBtnShuffer = document.getElementById('btnShutter'),
            oBtnRedo = document.getElementById('btnRedo'),
            oBtnShareFB = document.getElementById('btnShareFB')

        // click to take a photo
        oBtnShuffer.addEventListener('click', function () {
            isPause = true
            oVideo.pause()
            oTraceBtns.classList.remove('active')
            oResultBtns.classList.add('active')
        })

        // click to redo taking a photo
        oBtnRedo.addEventListener('click', function () {
            isPause = false
            oVideo.play()
            ARPhoto.draw()
            oResultBtns.classList.remove('active')
            oTraceBtns.classList.add('active')
        })

        // click to share to facebook
        oBtnShareFB.addEventListener('click', function () {
            ARPhoto.share()
        })
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
            alert('Oops :( this browser does not support camera calls')
        }
    }

    // request to open the camera
    ARPhoto.getUserMedia = function (constraints) {
        var _this = this
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                oVideo.srcObject = stream
                document.body.addEventListener('click', function () {
                    oVideo.play()
                })
                var timer = setInterval(function () {
                    if (oVideo.videoWidth) {
                        _this.initCanvas(oVideo.videoWidth, oVideo.videoHeight)
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
            alert('Oops :( this browser does not support camera calls')
        }
    }

    // adjust canvas width and height to match with video
    ARPhoto.initCanvas = function (w, h) {
        oVideo.setAttribute('width', w)
        oVideo.setAttribute('height', h)
        oTrace.setAttribute('width', w)
        oTrace.setAttribute('height', h)
    }

    // add role image and init
    ARPhoto.initAssets = function () {
        var _this = this
        var _img = new Image()

        _img.src = 'img/role_' + this.getUrlParam('id') + '.png'

        _img.onload = function () {
            var img = new createjs.Bitmap(_img.src),
                imgBounds = img.getBounds(),
                scaleRate = 0.7,
                scale = 1,
                realW = 0,
                realH = 0,
                gapW = (oVideo.videoWidth - window.innerWidth) / 2,
                gapH = (oVideo.videoHeight - window.innerHeight) / 2,
                randomL = 0,
                randomT = 0

            _this.roleInfo.role = img
            _this.roleInfo.initW = imgBounds.width
            _this.roleInfo.initH = imgBounds.height

            switch (ARPhoto.getUrlParam('id')) {
                case '6':
                    scaleRate = 0.6
                    break
            }

            if (ARPhoto.getUrlParam('id') !== '1' && ARPhoto.getUrlParam('id') !== '5' && ARPhoto.getUrlParam('id') !== '6') {
                scale = window.innerWidth / imgBounds.width
                realW = imgBounds.width * scale
                realH = imgBounds.height * scale
                img.set({
                    x: (oVideo.videoWidth - realW) / 2,
                    y: (oVideo.videoHeight - realH) / 2,
                    scaleX: scale,
                    scaleY: scale
                })
            } else {
                scale = window.innerWidth / imgBounds.width * scaleRate
                if (imgBounds.height * scale > window.innerHeight) {
                    scale = window.innerHeight / imgBounds.height * scaleRate
                }
                realW = imgBounds.width * scale
                realH = imgBounds.height * scale
                randomL = Math.random() * (oVideo.videoWidth - gapW * 2 - realW) + gapW
                randomT = Math.random() * (oVideo.videoHeight - gapH * 2 - realH) + gapH

                img.set({
                    x: randomL,
                    y: randomT,
                    scaleX: scale,
                    scaleY: scale
                })
            }

            traceStage.addChild(img)
            traceStage.addChildAt(img, 1)
            _this.draw()
        }
    }

    // canvas drawing loop
    ARPhoto.draw = function () {
        var loop = this.requestAnimationFrame(ARPhoto.draw.bind(this))

        if (isPause) {
            var img = new createjs.Bitmap(oVideo)
            img.set({
                x: oVideo.videoWidth,
                scaleX: -1
            })
            traceStage.addChild(img)
            traceStage.addChildAt(img, 0)
            cancelAnimationFrame(loop)
        }

        traceStage.update()
    }

    // share
    ARPhoto.share = function () {
        var URI = oTrace.toDataURL("image/jpeg");
    }

    // init
    ARPhoto.init = function () {
        var _this = this
        this.enumerateDevices()
        // var timer = setInterval(function () {
        //     if (oVideo.readyState === oVideo.HAVE_ENOUGH_DATA && oVideo.videoWidth > 0) {
        //         _this.initCanvas(oVideo.videoWidth, oVideo.videoHeight)
        //         _this.initAssets()
        //         clearInterval(timer)
        //     }
        // }, 20)
        this.domOperation()
    }

    window.onload = function () {
        ARPhoto.init()
    }

})()
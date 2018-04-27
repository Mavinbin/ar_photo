'use strict'

;
(function () {
    var ARPhoto = {},
        oVideo = document.getElementById('video'),
        oTrace = document.getElementById('trace'),
        traceCtx = document.getElementById('trace').getContext('2d'),
        traceStage = new createjs.Stage('trace'),
        oTraceBtns = document.getElementById('traceBtns'),
        oBtnShuffer = document.getElementById('btnShutter'),
        isPause = false,
        scaleRate = 1

        createjs.Touch.enable(traceStage)

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
        var oResultBtns = document.getElementById('resultBtns'),
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
                        _this.initAssets(_this.getUrlParam('id'))
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

    // logo
    ARPhoto.initLogo = function () {
        var _this = this
        var _img = new Image()

        _img.src = 'img/logo.png'

        _img.onload = function () {
            var img = new createjs.Bitmap(_img.src),
                imgBounds = img.getBounds(),
                realW = (window.innerWidth - oBtnShuffer.clientWidth) / 2 - 15,
                scale = realW / imgBounds.width,
                realH = imgBounds.height * scale

            traceStage.addChild(img)
            traceStage.addChildAt(img, 2)

            img.set({
                x: oVideo.videoWidth - (oVideo.videoWidth - window.innerWidth) / 2 - realW - 10,
                y: oVideo.videoHeight - (oVideo.videoHeight - window.innerHeight) / 2 - realH - 10,
                scaleX: scale,
                scaleY: scale
            })
        }
    }

    // add role image and init
    ARPhoto.initAssets = function (id) {
        var _this = this
        var _img = new Image()

        _img.src = 'img/asset_' + id + '.png'

        _img.onload = function () {
            var img = new createjs.Bitmap(_img.src),
                imgBounds = img.getBounds(),
                scale = 1,
                realW = 0,
                realH = 0,
                posX = 0,
                posY = 0,
                gapW = (oVideo.videoWidth - window.innerWidth) / 2,
                gapH = (oVideo.videoHeight - window.innerHeight) / 2,
                type = _this.assets[id].type,
                scaleRate = _this.assets[id].scaleRate

            scale = window.innerWidth / imgBounds.width * scaleRate

            if (imgBounds.height * scale > window.innerHeight) {
                scale = window.innerHeight / imgBounds.height * scaleRate
            }
            realW = imgBounds.width * scale
            realH = imgBounds.height * scale

            switch (type) {
                case 'pet':
                    posX = (oVideo.videoWidth - realW) / 2
                    posY = oVideo.videoHeight - realH - oTraceBtns.clientHeight - gapH * 2
                    break

                case 'role':
                    var xRate = _this.assets[id].xRate,
                        yRate = _this.assets[id].yRate,
                        x = _this.assets[id].x,
                        y = _this.assets[id].y

                    posX = (oVideo.videoWidth - realW) / 2
                    posY = (oVideo.videoHeight - realH) / 2

                    if (xRate !== undefined && typeof xRate === 'number') {
                        posX = xRate >= 0 ? oVideo.videoWidth - realW * xRate - gapW :  realW * xRate + gapW
                    }

                    if (yRate !== undefined && typeof yRate === 'number') {
                        posY = yRate >= 0 ? oVideo.videoHeight - realH * yRate - gapH : realH * yRate + gapH
                    }

                    if (x !== undefined && typeof x === 'number') {
                        posX = x
                    }

                    if (y !== undefined && typeof y === 'number') {
                        posY = y
                    }
                    break
                case 'weapon':
                    posX = (oVideo.videoWidth - realW) / 2
                    posY = (oVideo.videoHeight - realH) / 2
                    break
            }

            img.set({
                x: posX,
                y: posY,
                scaleX: scale,
                scaleY: scale
            })

            traceStage.addChild(img)
            traceStage.addChildAt(img, 1)

            ARPhoto.finger(img)

            _this.initLogo()
            _this.draw()
        }
    }

    // canvas drawing loop
    ARPhoto.draw = function () {
        if (isPause) {
            var img = new createjs.Bitmap(oVideo)
            img.set({
                x: oVideo.videoWidth,
                scaleX: -1
            })
            traceStage.addChild(img)
            traceStage.addChildAt(img, 0)
            // cancelAnimationFrame(loop)
        } else {
            this.requestAnimationFrame(ARPhoto.draw.bind(this))
        }

        traceStage.update()
    }

    // share
    ARPhoto.share = function () {
        var URI = oTrace.toDataURL("image/jpeg");
        console.log(URI)
    }

    ARPhoto.finger = function (el) {
        el.addEventListener('mousedown', function (e) {
            // var ne = e.nativeEvent
            var gapX = e.stageX - el.x,
                gapY = e.stageY - el.y

                el.addEventListener('pressmove', function (e) {
                    var x = e.stageX - gapX,
                        y = e.stageY - gapY

                    el.set({
                        x: x,
                        y: y
                    })
                })
        })
    }

    // init
    ARPhoto.init = function () {
        var _this = this
        this.enumerateDevices()
        // var timer = setInterval(function () {
        //     if (oVideo.readyState === oVideo.HAVE_ENOUGH_DATA && oVideo.videoWidth > 0) {
        //         _this.initCanvas(oVideo.videoWidth, oVideo.videoHeight)
        //         _this.initAssets(_this.getUrlParam('id'))
        //         clearInterval(timer)
        //     }
        // }, 20)
        this.domOperation()
    }

    // 素材信息
    ARPhoto.assets = {
        1: {
            type: 'pet',
            scaleRate: 0.3
        },
        2: {
            type: 'pet',
            scaleRate: 0.6
        },
        3: {
            type: 'pet',
            scaleRate: 0.6
        },
        4: {
            type: 'role',
            scaleRate: 2,
            xRate: 1,
            yRate: 0.74
        },
        5: {
            type: 'role',
            scaleRate: 0.7,
            yRate: -0.3
        },
        6: {
            type: 'role',
            scaleRate: 0.9,
            y: window.innerHeight * 0.2
        },
        7: {
            type: 'weapon',
            scaleRate: 0.9
        }
    }

    window.onload = function () {
        ARPhoto.init()
    }

})()
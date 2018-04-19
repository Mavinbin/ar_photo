'use strict'

;
(function () {
    var ARPhoto = {}

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

    ARPhoto.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
            r = window.location.search.substr(1).match(reg)

        if (r !== null) {
            return unescape(r[2]);
        } else {
            return ''
        }
    }

    ARPhoto.roleInfo = {
        1: {
            headRate: 60 / 720,
            headLRate: 348 / 720,
            headTRate: 312 / 911
        },
        2: {
            headRate: 55 / 720,
            headLRate: 355 / 720,
            headTRate: 304 / 1018
        }
    }

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

    // dom操作
    ARPhoto.domOperation = function () {
        var oBtnShuffer = document.getElementById('btnShutter'),
            oBtnRedo = document.getElementById('btnRedo'),
            oTraceBtns = document.getElementById('traceBtns'),
            oResultBtns = document.getElementById('resultBtns')

        // 点击拍照
        oBtnShuffer.addEventListener('click', function () {
            ARPhoto.global.isPause = true
            ARPhoto.global.oVideo.pause()
            ARPhoto.global.ctracker.stop()
            oTraceBtns.classList.remove('active')
            oResultBtns.classList.add('active')
        })

        // 点击重新拍照
        oBtnRedo.addEventListener('click', function () {
            ARPhoto.global.isPause = false
            ARPhoto.global.oVideo.play()
            ARPhoto.global.ctracker.start(ARPhoto.global.oVideo)
            ARPhoto.drawLoop(ARPhoto.getUrlParam('id'))
            oResultBtns.classList.remove('active')
            oTraceBtns.classList.add('active')
        })
    }

    ARPhoto.log = function (msg) {
        var oLog = document.getElementById('log'),
            oSpan = document.createElement('span'),
            oMsg = document.createTextNode(msg)

        oSpan.appendChild(oMsg)
        oLog.appendChild(oSpan)
        console.log(msg)
    }

    // 检测手机系统
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

    // 遍历设备的所有音频和摄像头设备
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

    // 调用摄像头
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

    // 调整canvas的宽高与视频一致
    ARPhoto.initCanvas = function (w, h) {
        this.global.oVideo.setAttribute('width', w)
        this.global.oVideo.setAttribute('height', h)
        this.global.oTrace.setAttribute('width', w)
        this.global.oTrace.setAttribute('height', h)
        this.global.oAssets.style.width = w + 'px'
        this.global.oAssets.style.height = h + 'px'
        this.global.canvasW = w
        this.global.canvasH = h
        this.track()
    }

    // 人脸识别
    ARPhoto.track = function () {
        this.global.ctracker = new clm.tracker()
        this.global.ctracker.init()
        this.global.ctracker.start(this.global.oVideo)
        this.drawLoop(this.getUrlParam('id'))
    }

    // 初始化图片
    ARPhoto.initAssets = function (id, attachName) {
        var _this = this
        var _img = new Image()


        if (!attachName) {
            _img.src = 'img/role_' + id + '.png'
        } else {
            _img.src = 'img/role_' + id + '_' + attachName + '.png'
        }

        _img.onload = function () {
            var img = new createjs.Bitmap(_img.src),
                imgBounds = img.getBounds()

            _this.roleInfo[id].role = img
            _this.roleInfo[id].initW = imgBounds.width
            _this.roleInfo[id].initH = imgBounds.height
            _this.global.traceStage.addChild(img)
            _this.global.traceStage.addChildAt(img, 1)
        }
    }

    ARPhoto.drawLoop = function (id) {
        var positions = this.global.ctracker.getCurrentPosition()
        var score = this.global.ctracker.getScore()
        var requestAnimationFrameId = requestAnimationFrame(this.drawLoop.bind(this, id))

        if (positions && score > 0.2) {
            var headW = positions[13][0] - positions[1][0],
                headAngle = Math.atan((positions[62][0] - positions[33][0]) / (positions[62][1] - positions[33][1])) * 180 / Math.PI,
                RoleRealW = headW / this.roleInfo[id].headRate,
                scale = RoleRealW / this.roleInfo[id].initW,
                RoleRealH = this.roleInfo[id].initH * scale,
                RoleL = positions[1][0] - RoleRealW * this.roleInfo[id].headLRate,
                RoleT = positions[7][1] - RoleRealH * this.roleInfo[id].headTRate

            this.roleInfo[id].role.set({
                x: RoleL,
                y: RoleT,
                scaleX: scale,
                scaleY: scale
            })

            if (this.global.isPause) {
                var img = new createjs.Bitmap(ARPhoto.global.oVideo)
                this.global.traceStage.addChild(img)
                this.global.traceStage.addChildAt(img, 0)
            }

            this.global.traceStage.update()
            // this.global.ctracker.draw(this.global.oTrace)
        } else {
            this.global.traceStage.clear()
        }

        if (this.global.isPause) {
            cancelAnimationFrame(requestAnimationFrameId)
        }
    }

    // 初始化
    ARPhoto.init = function () {
        var _this = this
        _this.enumerateDevices()
        this.initAssets(this.getUrlParam('id'))
        // var timer = setInterval(function () {
        //     if (_this.global.oVideo.readyState === _this.global.oVideo.HAVE_ENOUGH_DATA && _this.global.oVideo.videoWidth > 0) {
        //         _this.initCanvas(_this.global.oVideo.videoWidth, _this.global.oVideo.videoHeight)
        //         clearInterval(timer)
        //     }
        // }, 20)
        _this.domOperation()
    }

    window.onload = function () {
        ARPhoto.init()
    }

})()
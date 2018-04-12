'use strict'

;
(function () {
    var ARPhoto = {}

    ARPhoto.global = {
        timer1: null,
        oTraceWrap: document.getElementById('traceWrap'),
        oVideo: document.getElementById('video'),
        oTrace: document.getElementById('trace'),
        oDecorations: document.getElementById('decorations'),
        oGlass: document.getElementById('glass'),
        oShyLine: document.getElementById('shyLine'),
        oBeard: document.getElementById('beard'),
        traceCtx: document.getElementById('trace').getContext('2d'),
        traceStage: new createjs.Stage('trace'),
        canvasW: document.documentElement.clientWidth,
        canvasH: document.documentElement.clientHeight,
        ctracker: null,
        hatInitW: 0,
        hatInitH: 0,
        glassInitW: 0,
        glassInitH: 0,
        shyLineInitW: 0,
        shyLineInitH: 0,
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
            clearInterval(ARPhoto.global.timer1)
            oTraceBtns.classList.remove('active')
            oResultBtns.classList.add('active')
            ARPhoto.global.oVideo.pause()
        })

        // 点击重新拍照
        oBtnRedo.addEventListener('click', function () {
            oResultBtns.classList.remove('active')
            oTraceBtns.classList.add('active')
            ARPhoto.global.oVideo.play()
            ARPhoto.requestAnimationFrame(ARPhoto.track)
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

                if (ARPhoto.getSystem() === 'Android') {
                    constraints.video.deviceId = videoDevices[0]
                } else {
                    constraints.video.deviceId = videoDevices[videoDevices.length - 1]
                }

                ARPhoto.getUserMedia(constraints)
            }).catch(function (err) {
                alert(err)
            })
        } else {
            alert('您的设备不支持摄像头调用！')
        }
    }

    // 调用摄像头
    ARPhoto.getUserMedia = function (constraints) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                ARPhoto.global.oVideo.srcObject = stream
                document.body.addEventListener('click', function () {
                    ARPhoto.global.oVideo.play()
                })
                var timer = setInterval(function () {
                    if (ARPhoto.global.oVideo.videoWidth) {
                        ARPhoto.initCanvas(ARPhoto.global.oVideo.videoWidth, ARPhoto.global.oVideo.videoHeight)
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

    // 调整canvas的宽高与视频一致, 这里要注意的是不能设置style中的宽高，否则会出现图像变形失真
    ARPhoto.initCanvas = function (w, h) {
        this.global.oVideo.setAttribute('width', w)
        this.global.oVideo.setAttribute('height', h)
        this.global.oTrace.setAttribute('width', w)
        this.global.oTrace.setAttribute('height', h)
        this.global.oDecorations.style.width = w + 'px'
        this.global.oDecorations.style.height = h + 'px'
        this.global.canvasW = w
        this.global.canvasH = h
        ARPhoto.track()
    }

    // 人脸识别
    ARPhoto.track = function () {
        ARPhoto.global.ctracker = new clm.tracker()
        ARPhoto.global.ctracker.init()
        ARPhoto.global.ctracker.start(ARPhoto.global.oVideo)
        ARPhoto.drawLoop()
    }

    // 初始化图片
    ARPhoto.initDerections = function (name) {
        var _img = new Image()

        _img.src = 'img/' + name + '.png'
        _img.onload = function () {
            var img = new createjs.Bitmap('img/' + name + '.png'),
                imgBounds = img.getBounds(),
                elName = 'img' + name[0].toUpperCase() + name.slice(1)
            ARPhoto.global[elName] = img
            ARPhoto.global[name + 'InitW'] = imgBounds.width
            ARPhoto.global[name + 'InitH'] = imgBounds.height
            ARPhoto.global.traceStage.addChild(ARPhoto.global[elName])
        }
    }

    ARPhoto.drawLoop = function () {
        var positions = ARPhoto.global.ctracker.getCurrentPosition()
        requestAnimationFrame(ARPhoto.drawLoop)

        if (positions) {
            var headW = positions[14][0] - positions[0][0],
                headAngle = Math.atan((positions[62][0] - positions[33][0]) / (positions[62][1] - positions[33][1])) * 180 / Math.PI,
                hatRealW = headW / 400 * ARPhoto.global.hatInitW,
                scale = headW / 400,
                hatRealH = ARPhoto.global.hatInitH * scale,
                hatL = (positions[41][0] - 330 / 720 * hatRealW) - hatRealH * (positions[62][0] - positions[33][0]) / (positions[62][1] - positions[33][1]),
                hatT = positions[21][1] <= positions[17][1] ? positions[21][1] - hatRealH : positions[17][1] - hatRealH

            ARPhoto.global.imgHat.set({
                x: positions[41][0] * scale + hatL,
                y: positions[41][1] * scale + hatT,
                scaleX: scale,
                scaleY: scale,
                rotation: - headAngle,
                regX: positions[41][0],
                regY: positions[41][1]
            })

            ARPhoto.global.traceStage.update()
            ARPhoto.global.traceStage.addChild(ARPhoto.global.circle)
            ARPhoto.global.circle.set({
                x: positions[41][0],
                y: positions[41][1]
            })

            ARPhoto.global.traceStage.update()
            ARPhoto.global.ctracker.draw(ARPhoto.global.oTrace)
        }
    }

    // 初始化
    ARPhoto.init = function () {
        this.enumerateDevices()
        ARPhoto.initDerections('hat')
        ARPhoto.global.circle = new createjs.Shape()
        ARPhoto.global.circle.graphics.beginFill('lightblue').drawCircle(0, 0, 4)
        this.global.glassInitW = ARPhoto.global.oGlass.width
        this.global.glassInitH = ARPhoto.global.oGlass.height
        this.global.shyLineInitW = ARPhoto.global.oShyLine.width
        this.global.shyLineInitH = ARPhoto.global.oShyLine.height
        // var timer = setInterval(function () {
        //     if (ARPhoto.global.oVideo.readyState === ARPhoto.global.oVideo.HAVE_ENOUGH_DATA && ARPhoto.global.oVideo.videoWidth > 0) {
        //         ARPhoto.initCanvas(ARPhoto.global.oVideo.videoWidth, ARPhoto.global.oVideo.videoHeight)
        //         clearInterval(timer)
        //     }
        // }, 20)
        ARPhoto.domOperation()
    }

    window.onload = function () {
        ARPhoto.init()
    }

})()
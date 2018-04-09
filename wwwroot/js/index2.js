'use strict'

;
(function () {
    var ARPhoto = {}

    ARPhoto.global = {
        timer1: null,
        oTraceWrap: document.getElementById('traceWrap'),
        oVideo: document.getElementById('video'),
        oTrace: document.getElementById('trace'),
        traceCtx: document.getElementById('trace').getContext('2d'),
        canvasW: document.documentElement.clientWidth,
        canvasH: document.documentElement.clientHeight,
        detector: null,
        smoother: new Smoother([0.9999999, 0.9999999, 0.999, 0.999], [0, 0, 0, 0])
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
        this.global.oTrace.setAttribute('width', w)
        this.global.oTrace.setAttribute('height', h)
        this.global.canvasW = w
        this.global.canvasH = h
        ARPhoto.track()
    }

    // // 人脸识别
    ARPhoto.track = function () {
        var anmationFrame = ARPhoto.requestAnimationFrame(ARPhoto.track)
        ARPhoto.global.traceCtx.clearRect(0, 0, ARPhoto.global.canvasW, ARPhoto.global.canvasH)

        if (!ARPhoto.global.detector) {
            ARPhoto.global.detector = new objectdetect.detector(ARPhoto.global.oVideo.videoWidth, ARPhoto.global.oVideo.videoHeight, 1.1, objectdetect.frontalface);
        }

        var coords = ARPhoto.global.detector.detect(ARPhoto.global.oVideo, 1)

        var faceCoord = coords[0]


        // faceCoord = ARPhoto.global.smoother.smooth(faceCoord)

        if (faceCoord) {
            ARPhoto.global.traceCtx.lineWidth = 2
            ARPhoto.global.traceCtx.strokeStyle = '#f00'
            ARPhoto.global.traceCtx.strokeRect(faceCoord[0], faceCoord[1], faceCoord[2], faceCoord[3])
        }

        if (ARPhoto.global.oVideo.paused) {
            cancelAnimationFrame(anmationFrame)
        }
    }

    // 初始化
    ARPhoto.init = function () {
        this.enumerateDevices()
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
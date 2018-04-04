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
        trackTask: null
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
            ARPhoto.global.trackTask.stop()
        })

        // 点击重新拍照
        oBtnRedo.addEventListener('click', function () {
            ARPhoto.requestAnimationFrame(ARPhoto.track)
            oResultBtns.classList.remove('active')
            oTraceBtns.classList.add('active')
            ARPhoto.global.oVideo.play()
            ARPhoto.global.trackTask.run()
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

        ARPhoto.requestAnimationFrame(ARPhoto.track)
    }

    // 将视频实时渲染在canvas上
    // ARPhoto.drawVideoOnCanvas = function () {
    //     var _this = this
    //     _this.global.timer1 = setInterval(function () {
    //         _this.global.traceCtx.drawImage(_this.global.oVideo, 0, 0, _this.global.canvasW, _this.global.canvasH)
    //     }, 30)
    // }

    // 人脸识别
    ARPhoto.track = function () {
        var objects = new tracking.ObjectTracker(['face'])

        objects.on('track', function (e) {
            ARPhoto.global.traceCtx.clearRect(0 , 0, ARPhoto.global.canvasW, ARPhoto.global.canvasH)
            if (e.data.length > 0) {
                e.data.forEach(function (rect) {
                    ARPhoto.global.traceCtx.lineWidth = 4
                    ARPhoto.global.traceCtx.strokeStyle = '#f00'
                    ARPhoto.global.traceCtx.strokeRect(rect.x, rect.y, rect.width, rect.height)
                })
            }
        })

        ARPhoto.global.trackTask = tracking.track('#video', objects)
    }

    // 初始化
    ARPhoto.init = function () {
        // this.enumerateDevices()
        ARPhoto.domOperation()
        var timer = setInterval(function () {
            if (ARPhoto.global.oVideo.videoWidth) {
                ARPhoto.initCanvas(ARPhoto.global.oVideo.videoWidth, ARPhoto.global.oVideo.videoHeight)
                clearInterval(timer)
            }
        }, 20)
    }

    ARPhoto.init()

})()
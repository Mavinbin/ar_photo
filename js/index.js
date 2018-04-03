'use strict'

;
(function () {
    var ARPhoto = {}

    ARPhoto.log = function (msg) {
        var oLog = document.querySelector('#log'),
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

                    // var str = 'device: { deviceId:' + device.deviceId + ', kind:' + device.kind + ', label:' + device.label + '}'

                    // ARPhoto.log(str)
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
                var oVideo = document.querySelector('#video')
                oVideo.srcObject = stream
                // oVideo.play()
                document.body.addEventListener('click', function () {
                    oVideo.play()
                })
            }).catch(function (err) {
                console.log(err)
                if (err.name === 'DevicesNotFoundError') {
                    alert('找不到摄像头！')
                } else {
                    alert(err)
                }
            })
        } else {
            alert('您的设备不支持摄像头调用！')
        }
    }

    // 初始化
    ARPhoto.init = function () {
        this.enumerateDevices()
    }

    ARPhoto.init()

})()
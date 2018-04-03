'use strict'

;
(function () {
    var ARPhoto = {}

    // 遍历设备的所有音频和摄像头设备
    ARPhoto.enumerateDevices = function () {
        var constraints = {
            audio: false,
            video: {
                width: 1280,
                height: 720
            }
        }
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                console.log(devices)
                devices.forEach(function (device) {
                    if (device.kind === 'videoinput') {
                        constraints.video.deviceId = device.deviceId
                    }

                    // var str = 'device: { deviceId:' + device.deviceId + ', kind:' + device.kind + ', label:' + device.label + '}'

                    // alert(str)
                })

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
                oVideo.play()
                oVideo.addEventListener('click', function () {
                    oVideo.play()
                })
                console.log(stream)
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
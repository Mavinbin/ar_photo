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
        oTips = document.getElementById('tips'),
        oLoading = document.getElementById('loading'),
        asset = null,
        isPause = false,
        scaleRate = 1

    createjs.Touch.enable(traceStage)

    /**
      *  动画帧优化函数兼容处理
      *  @param {Function} callback [回调函数，重复执行的函数]
      *
      */
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

    /**
      *  模板渲染组件
      *  @param {String} name [参数名称]
      *
      */
    ARPhoto.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
            r = window.location.search.substr(1).match(reg)

        if (r !== null) {
            return unescape(r[2]);
        } else {
            return ''
        }
    }

    /**
      *  dom操作处理
      */
    ARPhoto.domOperation = function () {
        var oResultBtns = document.getElementById('resultBtns'),
            oBtnRedo = document.getElementById('btnRedo'),
            oBtnShareFB = document.getElementById('btnShareFB')

        // 点击拍照按钮
        oBtnShuffer.addEventListener('click', function () {
            isPause = true
            oVideo.pause()
            oTraceBtns.classList.remove('active')
            oResultBtns.classList.add('active')
        })

        // 点击返回重拍
        oBtnRedo.addEventListener('click', function () {
            isPause = false
            oVideo.play()
            ARPhoto.draw()
            oResultBtns.classList.remove('active')
            oTraceBtns.classList.add('active')
        })

        // 点击分享FB
        oBtnShareFB.addEventListener('click', function () {
            ARPhoto.share()
        })

        // 点击提示层时，关闭提示层
        oTips.addEventListener('click', function () {
            oTips.style.zIndex = -1
        })
    }

    /**
      *  检测手机系统
      */
    ARPhoto.getSystem = function () {
        var u = navigator.userAgent,
            isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,
            isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
            isFireFox = u.indexOf('Firefox') > -1,
            isChrome = u.indexOf('Chrome') > -1,
            isSafari = u.indexOf('Safari') > -1,
            result = {}

        if (isAndroid) {
            result.system = 'Android'
            u.match(/Android\s((\d+.?)+);/i)
            result.systemVersion = RegExp.$1
        } else {
            result.system = 'iOS'
            u.match(/Version\/((\d+.?)+)/i)
            result.systemVersion = RegExp.$1
        }

        if (isFireFox) {
            result.browser = 'Firefox'
            u.match(/Firefox\/((\d+.?)+)/i)
            result.browserVersion = RegExp.$1
        }

        if (isSafari) {
            result.browser = 'Safari'
            u.match(/Safari\/((\d+.?)+)/i)
            result.browserVersion = RegExp.$1
        }

        if (isChrome) {
            result.browser = 'Chrome'
            u.match(/Chrome\/((\d+.?)+)/i)
            result.browserVersion = RegExp.$1
        }

        // alert('system:' + result.system + '\nsystemVersion:' + result.systemVersion + '\nbrowser:' + result.browser + '\nbrowserVersion:' + result.browserVersion)
        return result
    }

    /**
      *  查询所有音视频设备
      */
    ARPhoto.enumerateDevices = function () {
        var _this = this
        var systemInfo = _this.getSystem()
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

                if (systemInfo.system === 'Android') {
                    constraints.video.deviceId = videoDevices[0]

                    if (systemInfo.browser === 'Firefox') {
                        constraints.video.facingMode = 'user'
                    }
                } else {
                    constraints.video.deviceId = videoDevices[videoDevices.length - 1]
                }

                _this.getUserMedia(constraints)
            }).catch(function (err) {
                alert(err)
            })
        } else {
            if (systemInfo.system === 'iOS') {
                if (parseInt(systemInfo.systemVersion) < 11) {
                    alert('Opps! Open camera error! Please update your system to iOS 11 and open this page in Safari.')
                } else if(systemInfo.browser !== 'Safari'){
                    alert('Opps! Open camera error! Please open this page in Safari.')
                }
            } else {
                alert('Opps! Open camera error!')
            }

        }
    }

    /**
      *  请求打开手机设备（摄像头）
      *  @param {Object} constraints [调用的设备相关配置]
      *
      */
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
                        _this.domOperation()
                        oTips.classList.add('show')
                        clearInterval(timer)
                    }
                }, 20)
            }).catch(function (err) {
                if (err.name === 'DevicesNotFoundError') {
                    alert('no camera！')
                } else {
                    alert(err)
                }
            })
        } else {
            if (systemInfo.system === 'iOS') {
                if (parseInt(systemInfo.systemVersion) < 11) {
                    alert('Opps! Open camera error! Please update your system to iOS 11 and open this page in Safari.')
                } else if(systemInfo.browser !== 'Safari'){
                    alert('Opps! Open camera error! Please open this page in Safari.')
                }
            } else {
                alert('Opps! Open camera error!')
            }
        }
    }

    /**
      *  调整canvas的宽高和视频的宽高相同
      *
      */
    ARPhoto.initCanvas = function (w, h) {
        oVideo.setAttribute('width', w)
        oVideo.setAttribute('height', h)
        oTrace.setAttribute('width', w)
        oTrace.setAttribute('height', h)
    }

    /**
      *  初始化Logo图片
      */
    ARPhoto.initLogo = function () {
        var _this = this
        var _img = new Image()

        _img.src = 'img/logo.png'

        _img.onload = function () {
            var img = new createjs.Bitmap(_img.src),
                imgBounds = img.getBounds(),
                realW = 0,
                scale = 1,
                realH = 0

            if (!imgBounds) {
                img.setBounds(0, 0, _img.naturalWidth, _img.naturalHeight)
                imgBounds = img.getBounds()
            }

            realW = (window.innerWidth - oBtnShuffer.clientWidth) / 2 - 15,
            scale = realW / imgBounds.width,
            realH = imgBounds.height * scale
            asset = img
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

    /**
      *  添加角色（或配件）资源并初始化
      */
    ARPhoto.initAssets = function (id) {
        var _this = this
        var _img = new Image()

        oLoading.classList.add('show')

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

            oLoading.classList.remove('show')

            if (!imgBounds) {
                img.setBounds(0, 0, _img.naturalWidth, _img.naturalHeight)
                imgBounds = img.getBounds()
            }

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
                        posX = xRate >= 0 ? oVideo.videoWidth - realW * xRate - gapW : realW * xRate + gapW
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

    /**
      *  绘制canvas循环函数
      */
    ARPhoto.draw = function () {
        if (isPause) {
            var img = new createjs.Bitmap(oVideo)
            img.set({
                x: oVideo.videoWidth,
                scaleX: -1
            })
            traceStage.addChild(img)
            traceStage.addChildAt(img, 0)
        } else {
            this.requestAnimationFrame(ARPhoto.draw.bind(this))
        }

        traceStage.update()
    }

    /**
      *  点击分享按钮后的回调处理
      */
    ARPhoto.share = function () {
        var URI = oTrace.toDataURL("image/octet-stream");
        return URI;
    }

    /**
      *  手势模拟（拖拽+放大缩小）
      *  @param {Object} el [createjs的stage子元素-BitMap实例对象]
      *
      */
    ARPhoto.finger = function (el) {
        var x = el.x,
            y = el.y,
            scale = el.scaleX,
            newScale = 1,
            touches = null,
            prevFingerDistance = 0,
            fingerDistance = 0

        el.addEventListener('mousedown', function (e) {
            if (isPause) {
                return
            }
            var gapX = e.stageX - el.x,
                gapY = e.stageY - el.y

            el.addEventListener('pressmove', function (e) {
                if (isPause) {
                    return
                }

                touches = e.nativeEvent.touches

                if (!touches[1]) {
                    x = e.stageX - gapX
                    y = e.stageY - gapY
                } else {
                    fingerDistance = Math.pow(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2), 0.5)


                    if (prevFingerDistance) {
                        newScale = fingerDistance / prevFingerDistance
                        x = el.x - el.getBounds().width * scale * (newScale - 1) / 2
                        y = el.y - el.getBounds().width * scale * (newScale - 1) / 2
                        scale *= newScale
                    }

                    prevFingerDistance = fingerDistance
                }

                el.set({
                    x: x,
                    y: y,
                    scaleX: scale,
                    scaleY: scale
                })
            })
        })
    }

    /**
      *  应用初始化
      */
    ARPhoto.init = function () {
        var _this = this
        this.enumerateDevices()
        // var timer = setInterval(function () {
        //     if (oVideo.readyState === oVideo.HAVE_ENOUGH_DATA && oVideo.videoWidth > 0) {
        //         _this.initCanvas(oVideo.videoWidth, oVideo.videoHeight)
        //         _this.initAssets(_this.getUrlParam('id'))
        //         _this.domOperation()
        //         oTips.classList.add('show')
        //         clearInterval(timer)
        //     }
        // }, 20)
    }

    /**
      *  资源素材设置
      *  {String} type [素材类型]
      *  {Number} scaleRate [素材缩放率]
      *  {Number} xRate [素材左偏移率]
      *  {Number} yRate [素材右偏移率]
      *  {Number} x [素材左偏移值]
      *  {Number} y [素材右偏移值]
      */
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
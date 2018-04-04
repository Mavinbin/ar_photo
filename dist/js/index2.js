"use strict";!function(){var e={};e.global={timer1:null,oTraceWrap:document.getElementById("traceWrap"),oVideo:document.getElementById("video"),oTrace:document.getElementById("trace"),traceCtx:document.getElementById("trace").getContext("2d"),canvasW:document.documentElement.clientWidth,canvasH:document.documentElement.clientHeight,detector:null,smoother:new Smoother([.9999999,.9999999,.999,.999],[0,0,0,0])},e.requestAnimationFrame=function(e,t){var o=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||function(e){var t=(new Date).getTime(),o=Math.max(0,16-(t-lastTime)),a=window.setTimeout(function(){e(t+o)},o);return lastTime=t+o,a};return o.call(window,e,t)},e.domOperation=function(){var t=document.getElementById("btnShutter"),o=document.getElementById("btnRedo"),a=document.getElementById("traceBtns"),n=document.getElementById("resultBtns");t.addEventListener("click",function(){clearInterval(e.global.timer1),a.classList.remove("active"),n.classList.add("active"),e.global.oVideo.pause()}),o.addEventListener("click",function(){n.classList.remove("active"),a.classList.add("active"),e.global.oVideo.play(),e.requestAnimationFrame(e.track)})},e.log=function(e){var t=document.getElementById("log"),o=document.createElement("span"),a=document.createTextNode(e);o.appendChild(a),t.appendChild(o),console.log(e)},e.getSystem=function(){{var e=navigator.userAgent,t=e.indexOf("Android")>-1||e.indexOf("Adr")>-1;!!e.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)}return t?"Android":"iOS"},e.enumerateDevices=function(){var t={audio:!1,video:{}},o=[];navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices?navigator.mediaDevices.enumerateDevices().then(function(a){a.forEach(function(e){"videoinput"===e.kind&&o.push(e.deviceId)}),t.video.deviceId="Android"===e.getSystem()?o[0]:o[o.length-1],e.getUserMedia(t)}).catch(function(e){alert(e)}):alert("您的设备不支持摄像头调用！")},e.getUserMedia=function(t){navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia(t).then(function(t){e.global.oVideo.srcObject=t,document.body.addEventListener("click",function(){e.global.oVideo.play()});var o=setInterval(function(){e.global.oVideo.videoWidth&&(e.initCanvas(e.global.oVideo.videoWidth,e.global.oVideo.videoHeight),clearInterval(o))},20)}).catch(function(e){console.log(e),"DevicesNotFoundError"===e.name||alert(e)}):alert("您的设备不支持摄像头调用！")},e.initCanvas=function(t,o){this.global.oTrace.setAttribute("width",t),this.global.oTrace.setAttribute("height",o),this.global.canvasW=t,this.global.canvasH=o,e.requestAnimationFrame(e.track)},e.track=function(){var t=e.requestAnimationFrame(e.track);e.global.traceCtx.clearRect(0,0,e.global.canvasW,e.global.canvasH),e.global.detector||(e.global.detector=new objectdetect.detector(e.global.oVideo.videoWidth,e.global.oVideo.videoHeight,1.1,objectdetect.frontalface));var o=e.global.detector.detect(e.global.oVideo,1),a=o[0];a&&(e.global.traceCtx.lineWidth=2,e.global.traceCtx.strokeStyle="#f00",e.global.traceCtx.strokeRect(a[0],a[1],a[2],a[3])),e.global.oVideo.paused&&cancelAnimationFrame(t)},e.init=function(){this.enumerateDevices(),e.domOperation()},window.onload=function(){e.init()}}();
"use strict";!function(){var e={};e.global={timer1:null,oTraceWrap:document.getElementById("traceWrap"),oVideo:document.getElementById("video"),oTrace:document.getElementById("trace"),traceCtx:document.getElementById("trace").getContext("2d"),canvasW:document.documentElement.clientWidth,canvasH:document.documentElement.clientHeight,trackTask:null},e.domOperation=function(){var t=document.getElementById("btnShutter"),a=document.getElementById("btnRedo"),n=document.getElementById("traceBtns"),i=document.getElementById("resultBtns");t.addEventListener("click",function(){clearInterval(e.global.timer1),n.classList.remove("active"),i.classList.add("active"),e.global.oVideo.pause(),e.global.trackTask.stop()}),a.addEventListener("click",function(){e.drawVideoOnCanvas(),i.classList.remove("active"),n.classList.add("active"),e.global.oVideo.play(),e.global.trackTask.run()})},e.log=function(e){var t=document.getElementById("log"),a=document.createElement("span"),n=document.createTextNode(e);a.appendChild(n),t.appendChild(a),console.log(e)},e.getSystem=function(){{var e=navigator.userAgent,t=e.indexOf("Android")>-1||e.indexOf("Adr")>-1;!!e.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)}return t?"Android":"iOS"},e.enumerateDevices=function(){var t={audio:!1,video:{}},a=[];navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices?navigator.mediaDevices.enumerateDevices().then(function(n){n.forEach(function(e){"videoinput"===e.kind&&a.push(e.deviceId)}),t.video.deviceId="Android"===e.getSystem()?a[0]:a[a.length-1],e.getUserMedia(t)}).catch(function(e){alert(e)}):alert("您的设备不支持摄像头调用！")},e.getUserMedia=function(t){navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia(t).then(function(t){e.global.oVideo.srcObject=t,document.body.addEventListener("click",function(){e.global.oVideo.play()});var a=setInterval(function(){e.global.oVideo.videoWidth&&(e.initCanvas(e.global.oVideo.videoWidth,e.global.oVideo.videoHeight),clearInterval(a))},20)}).catch(function(e){console.log(e),"DevicesNotFoundError"===e.name||alert(e)}):alert("您的设备不支持摄像头调用！")},e.initCanvas=function(t,a){this.global.oTrace.setAttribute("width",t),this.global.oTrace.setAttribute("height",a),this.global.canvasW=t,this.global.canvasH=a,e.drawVideoOnCanvas(),e.track()},e.drawVideoOnCanvas=function(){},e.track=function(){var t=new tracking.ObjectTracker(["face"]);t.on("track",function(t){e.global.traceCtx.clearRect(0,0,e.global.canvasW,e.global.canvasH),t.data.length>0&&t.data.forEach(function(t){e.global.traceCtx.lineWidth=4,e.global.traceCtx.strokeStyle="#f00",e.global.traceCtx.strokeRect(t.x,t.y,t.width,t.height)})}),this.global.trackTask=tracking.track("#video",t)},e.init=function(){this.enumerateDevices(),e.domOperation()},e.init()}();
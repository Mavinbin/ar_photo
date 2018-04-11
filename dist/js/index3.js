"use strict";!function(){var e={};e.global={timer1:null,oTraceWrap:document.getElementById("traceWrap"),oVideo:document.getElementById("video"),oTrace:document.getElementById("trace"),oDecorations:document.getElementById("decorations"),oGlass:document.getElementById("glass"),oShyLine:document.getElementById("shyLine"),oBeard:document.getElementById("beard"),traceCtx:document.getElementById("trace").getContext("2d"),traceStage:new createjs.Stage("trace"),canvasW:document.documentElement.clientWidth,canvasH:document.documentElement.clientHeight,ctracker:null,hatInitW:0,hatInitH:0,glassInitW:0,glassInitH:0,shyLineInitW:0,shyLineInitH:0},e.requestAnimationFrame=function(e,t){var a=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||function(e){var t=(new Date).getTime(),a=Math.max(0,16-(t-lastTime)),i=window.setTimeout(function(){e(t+a)},a);return lastTime=t+a,i};return a.call(window,e,t)},e.domOperation=function(){var t=document.getElementById("btnShutter"),a=document.getElementById("btnRedo"),i=document.getElementById("traceBtns"),o=document.getElementById("resultBtns");t.addEventListener("click",function(){clearInterval(e.global.timer1),i.classList.remove("active"),o.classList.add("active"),e.global.oVideo.pause()}),a.addEventListener("click",function(){o.classList.remove("active"),i.classList.add("active"),e.global.oVideo.play(),e.requestAnimationFrame(e.track)})},e.log=function(e){var t=document.getElementById("log"),a=document.createElement("span"),i=document.createTextNode(e);a.appendChild(i),t.appendChild(a),console.log(e)},e.getSystem=function(){{var e=navigator.userAgent,t=e.indexOf("Android")>-1||e.indexOf("Adr")>-1;!!e.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)}return t?"Android":"iOS"},e.enumerateDevices=function(){var t={audio:!1,video:{}},a=[];navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices?navigator.mediaDevices.enumerateDevices().then(function(i){i.forEach(function(e){"videoinput"===e.kind&&a.push(e.deviceId)}),t.video.deviceId="Android"===e.getSystem()?a[0]:a[a.length-1],e.getUserMedia(t)}).catch(function(e){alert(e)}):alert("您的设备不支持摄像头调用！")},e.getUserMedia=function(t){navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia(t).then(function(t){e.global.oVideo.srcObject=t,document.body.addEventListener("click",function(){e.global.oVideo.play()});var a=setInterval(function(){e.global.oVideo.videoWidth&&(e.initCanvas(e.global.oVideo.videoWidth,e.global.oVideo.videoHeight),clearInterval(a))},20)}).catch(function(e){console.log(e),"DevicesNotFoundError"===e.name||alert(e)}):alert("您的设备不支持摄像头调用！")},e.initCanvas=function(t,a){this.global.oVideo.setAttribute("width",t),this.global.oVideo.setAttribute("height",a),this.global.oTrace.setAttribute("width",t),this.global.oTrace.setAttribute("height",a),this.global.oDecorations.style.width=t+"px",this.global.oDecorations.style.height=a+"px",this.global.canvasW=t,this.global.canvasH=a,e.track()},e.track=function(){e.global.ctracker=new clm.tracker,e.global.ctracker.init(),e.global.ctracker.start(e.global.oVideo),e.drawLoop()},e.initDerections=function(t){var a=new Image;a.src="img/"+t+".png",a.onload=function(){var a=new createjs.Bitmap("img/"+t+".png"),i=a.getBounds(),o="img"+t[0].toUpperCase()+t.slice(1);e.global[o]=a,e.global[t+"InitW"]=i.width,e.global[t+"InitH"]=i.height}},e.drawLoop=function(){var t=e.global.ctracker.getCurrentPosition();if(requestAnimationFrame(e.drawLoop),t){var a=t[14][0]-t[0][0],i=180*Math.atan((t[33][0]-t[62][0])/(t[33][1]-t[62][1]))/Math.PI,o=e.global.hatInitW/350*a,n=e.global.hatInitH*o/e.global.hatInitW,l=t[33][0]-340*o/e.global.hatInitW-n*Math.sin(i*Math.PI/180),c=t[20][1]>=t[17][1]?t[20][1]-n*Math.cos(i*Math.PI/180):t[17][1]-1.1*n;e.global.imgHat.set({x:l+o/8,y:c+o/8,scaleX:o/e.global.hatInitW,scaleY:n/e.global.hatInitH,rotation:-i,regX:o/2,regY:n}),e.global.traceStage.addChild(e.global.imgHat),e.global.traceStage.update()}},e.init=function(){e.initDerections("hat"),this.global.glassInitW=e.global.oGlass.width,this.global.glassInitH=e.global.oGlass.height,this.global.shyLineInitW=e.global.oShyLine.width,this.global.shyLineInitH=e.global.oShyLine.height;var t=setInterval(function(){e.global.oVideo.readyState===e.global.oVideo.HAVE_ENOUGH_DATA&&e.global.oVideo.videoWidth>0&&(e.initCanvas(e.global.oVideo.videoWidth,e.global.oVideo.videoHeight),clearInterval(t))},20);e.domOperation()},window.onload=function(){e.init()}}();
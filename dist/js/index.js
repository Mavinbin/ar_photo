"use strict";!function(){var e={};e.global={oTraceWrap:document.getElementById("traceWrap"),oVideo:document.getElementById("video"),oTrace:document.getElementById("trace"),oAssets:document.getElementById("assets"),traceCtx:document.getElementById("trace").getContext("2d"),traceStage:new createjs.Stage("trace"),canvasW:document.documentElement.clientWidth,canvasH:document.documentElement.clientHeight,requestAnimationFrameId:null,isPause:!1},e.getUrlParam=function(e){var t=new RegExp("(^|&)"+e+"=([^&]*)(&|$)"),a=window.location.search.substr(1).match(t);return null!==a?unescape(a[2]):""},e.roleInfo={1:{headRate:60/720,headLRate:348/720,headTRate:312/911},2:{headRate:55/720,headLRate:355/720,headTRate:304/1018}},e.requestAnimationFrame=function(e,t){var a=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||function(e){var t=(new Date).getTime(),a=Math.max(0,16-(t-lastTime)),i=window.setTimeout(function(){e(t+a)},a);return lastTime=t+a,i};return a.call(window,e,t)},e.domOperation=function(){var t=document.getElementById("btnShutter"),a=document.getElementById("btnRedo"),i=document.getElementById("traceBtns"),o=document.getElementById("resultBtns");t.addEventListener("click",function(){e.global.isPause=!0,e.global.oVideo.pause(),e.global.ctracker.stop(),i.classList.remove("active"),o.classList.add("active")}),a.addEventListener("click",function(){e.global.isPause=!1,e.global.oVideo.play(),e.global.ctracker.start(e.global.oVideo),e.drawLoop(e.getUrlParam("id")),o.classList.remove("active"),i.classList.add("active")})},e.log=function(e){var t=document.getElementById("log"),a=document.createElement("span"),i=document.createTextNode(e);a.appendChild(i),t.appendChild(a),console.log(e)},e.getSystem=function(){{var e=navigator.userAgent,t=e.indexOf("Android")>-1||e.indexOf("Adr")>-1;!!e.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)}return t?"Android":"iOS"},e.enumerateDevices=function(){var e=this,t={audio:!1,video:{}},a=[];navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices?navigator.mediaDevices.enumerateDevices().then(function(i){i.forEach(function(e){"videoinput"===e.kind&&a.push(e.deviceId)}),t.video.deviceId="Android"===e.getSystem()?a[0]:a[a.length-1],e.getUserMedia(t)}).catch(function(e){alert(e)}):alert("您的设备不支持摄像头调用！")},e.getUserMedia=function(e){var t=this;navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia(e).then(function(e){t.global.oVideo.srcObject=e,document.body.addEventListener("click",function(){t.global.oVideo.play()});var a=setInterval(function(){t.global.oVideo.videoWidth&&(t.initCanvas(t.global.oVideo.videoWidth,t.global.oVideo.videoHeight),clearInterval(a))},20)}).catch(function(e){console.log(e),"DevicesNotFoundError"===e.name||alert(e)}):alert("您的设备不支持摄像头调用！")},e.initCanvas=function(e,t){this.global.oVideo.setAttribute("width",e),this.global.oVideo.setAttribute("height",t),this.global.oTrace.setAttribute("width",e),this.global.oTrace.setAttribute("height",t),this.global.oAssets.style.width=e+"px",this.global.oAssets.style.height=t+"px",this.global.canvasW=e,this.global.canvasH=t,this.track()},e.track=function(){this.global.ctracker=new clm.tracker,this.global.ctracker.init(),this.global.ctracker.start(this.global.oVideo),this.drawLoop(this.getUrlParam("id"))},e.initAssets=function(e,t){var a=this,i=new Image;i.src=t?"img/role_"+e+"_"+t+".png":"img/role_"+e+".png",i.onload=function(){var t=new createjs.Bitmap(i.src),o=t.getBounds();a.roleInfo[e].role=t,a.roleInfo[e].initW=o.width,a.roleInfo[e].initH=o.height,a.global.traceStage.addChild(new createjs.Bitmap(a.global.oVideo)),a.global.traceStage.addChild(t)}},e.drawLoop=function(e){var t=this.global.ctracker.getCurrentPosition(),a=requestAnimationFrame(this.drawLoop.bind(this,e));if(t){var i=t[13][0]-t[1][0],o=(180*Math.atan((t[62][0]-t[33][0])/(t[62][1]-t[33][1]))/Math.PI,i/this.roleInfo[e].headRate),n=o/this.roleInfo[e].initW,r=this.roleInfo[e].initH*n,s=t[1][0]-o*this.roleInfo[e].headLRate,l=t[7][1]-r*this.roleInfo[e].headTRate;this.roleInfo[e].role.set({x:s,y:l,scaleX:n,scaleY:n}),this.global.traceStage.update()}this.global.isPause&&cancelAnimationFrame(a)},e.init=function(){var e=this;e.enumerateDevices(),this.initAssets(this.getUrlParam("id")),e.domOperation()},window.onload=function(){e.init()}}();
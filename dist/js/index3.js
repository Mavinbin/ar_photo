"use strict";!function(){var t={};t.global={timer1:null,oTraceWrap:document.getElementById("traceWrap"),oVideo:document.getElementById("video"),oTrace:document.getElementById("trace"),oDecorations:document.getElementById("decorations"),oHat:document.getElementById("hat"),oGlass:document.getElementById("glass"),oShyLine:document.getElementById("shyLine"),oBeard:document.getElementById("beard"),traceCtx:document.getElementById("trace").getContext("2d"),canvasW:document.documentElement.clientWidth,canvasH:document.documentElement.clientHeight,ctracker:null,hatInitW:0,hatInitH:0,glassInitW:0,glassInitH:0,shyLineInitW:0,shyLineInitH:0},t.requestAnimationFrame=function(t,e){var a=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||function(t){var e=(new Date).getTime(),a=Math.max(0,16-(e-lastTime)),o=window.setTimeout(function(){t(e+a)},a);return lastTime=e+a,o};return a.call(window,t,e)},t.domOperation=function(){var e=document.getElementById("btnShutter"),a=document.getElementById("btnRedo"),o=document.getElementById("traceBtns"),i=document.getElementById("resultBtns");e.addEventListener("click",function(){clearInterval(t.global.timer1),o.classList.remove("active"),i.classList.add("active"),t.global.oVideo.pause()}),a.addEventListener("click",function(){i.classList.remove("active"),o.classList.add("active"),t.global.oVideo.play(),t.requestAnimationFrame(t.track)})},t.log=function(t){var e=document.getElementById("log"),a=document.createElement("span"),o=document.createTextNode(t);a.appendChild(o),e.appendChild(a),console.log(t)},t.getSystem=function(){{var t=navigator.userAgent,e=t.indexOf("Android")>-1||t.indexOf("Adr")>-1;!!t.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)}return e?"Android":"iOS"},t.enumerateDevices=function(){var e={audio:!1,video:{}},a=[];navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices?navigator.mediaDevices.enumerateDevices().then(function(o){o.forEach(function(t){"videoinput"===t.kind&&a.push(t.deviceId)}),e.video.deviceId="Android"===t.getSystem()?a[0]:a[a.length-1],t.getUserMedia(e)}).catch(function(t){alert(t)}):alert("您的设备不支持摄像头调用！")},t.getUserMedia=function(e){navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia(e).then(function(e){t.global.oVideo.srcObject=e,document.body.addEventListener("click",function(){t.global.oVideo.play()});var a=setInterval(function(){t.global.oVideo.videoWidth&&(t.initCanvas(t.global.oVideo.videoWidth,t.global.oVideo.videoHeight),clearInterval(a))},20)}).catch(function(t){console.log(t),"DevicesNotFoundError"===t.name||alert(t)}):alert("您的设备不支持摄像头调用！")},t.initCanvas=function(e,a){this.global.oVideo.setAttribute("width",e),this.global.oVideo.setAttribute("height",a),this.global.oTrace.setAttribute("width",e),this.global.oTrace.setAttribute("height",a),this.global.oDecorations.style.width=e+"px",this.global.oDecorations.style.height=a+"px",this.global.canvasW=e,this.global.canvasH=a,t.track()},t.track=function(){t.global.ctracker=new clm.tracker,t.global.ctracker.init(),t.global.ctracker.start(t.global.oVideo),t.drawLoop()},t.drawLoop=function(){var e=t.global.ctracker.getCurrentPosition();if(requestAnimationFrame(t.drawLoop),e){var a=e[14][0]-e[0][0],o=180*Math.atan((e[33][0]-e[62][0])/(e[33][1]-e[62][1]))/Math.PI,i=t.global.hatInitW/350*a,n=t.global.hatInitH*i/t.global.hatInitW,l=e[0][0]-(t.global.hatInitW-350)/2*i/t.global.hatInitW,s=e[20][1]>=e[17][1]?e[20][1]-n+"px":e[17][1]-n;t.global.oHat.style.width=i+"px",t.global.oHat.style.height=n+"px",t.global.oHat.style.display="block",t.global.oHat.style["transform-origin"]="center bottom",t.global.oHat.style.transform="translate("+l+"px, "+s+"px) rotate("+-o+"deg)";var r=a,c=t.global.glassInitH*r/t.global.glassInitW,d=e[27][0]-(e[27][0]-e[0][0]),g=e[27][1]>=e[32][1]?e[27][1]-c/2+"px":e[32][1]-c/2;t.global.oGlass.style.width=r+"px",t.global.oGlass.style.height=c+"px",t.global.oGlass.style.display="block",t.global.oGlass.style["transform-origin"]="center bottom",t.global.oGlass.style.transform="translate("+d+"px, "+g+"px) rotate("+-o+"deg)",t.global.traceCtx.clearRect(0,0,t.global.canvasW,t.global.canvasH);var m=e[13][0]-e[1][0],h=t.global.shyLineInitW*m/t.global.shyLineInitH,b=e[2][0],u=e[1][1]>=e[13][1]?e[1][1]-h/2+"px":e[13][1]-h/2;t.global.oShyLine.style.width=m+"px",t.global.oShyLine.style.height=h+"px",t.global.oShyLine.style.display="block",t.global.oShyLine.style.transform="translate("+b+"px, "+u+"px) rotate("+-o+"deg)"}},t.init=function(){this.enumerateDevices(),this.global.hatInitW=t.global.oHat.width,this.global.hatInitH=t.global.oHat.height,this.global.glassInitW=t.global.oGlass.width,this.global.glassInitH=t.global.oGlass.height,this.global.shyLineInitW=t.global.oShyLine.width,this.global.shyLineInitH=t.global.oShyLine.height,t.domOperation()},window.onload=function(){t.init()}}();
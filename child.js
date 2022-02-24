window.addEventListener("message", (msg) => {
  console.log("接收到的消息：", msg);
  // alert("接收到的消息：" + msg.data.file_type + " " + msg.data.file_path);
  var data_div = document.getElementById("data_div");

  if(msg.data.file_type.indexOf("image/") != -1) {
    let img = document.createElement('img');
    img.src = msg.data.file_path;
    img.style.height = "400px";
    data_div.appendChild(img);
  } else if(msg.data.file_type.indexOf("audio/") != -1) {
    let audio = document.createElement('audio');
    audio.controls = true;
    audio.loop = true;
    audio.src = msg.data.file_path;
    audio.style.height = "400px";
    data_div.appendChild(audio);
    audio.play();
  } else if(msg.data.file_type.indexOf("video/") != -1) {
    let video = document.createElement('video');
    video.controls = true;
    video.loop = true;
    video.src = msg.data.file_path;
    video.style.height = "400px";
    data_div.appendChild(video);
    video.play();
  } else {
    console.log("收到的文件格式异常！file_type:" + file_type);
  }
})

// 现在就去做
function now_do() {
  window.opener.postMessage({
    type: 0,
    wait_min: 0
  });
  window.close();
}

// 等待duration分钟后在做
function wait_min(duration) {
  window.opener.postMessage({
    type: 1,
    wait_min: duration
  });
  window.close();
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById("now_btn").onclick = function() {
    now_do();
  }

  document.getElementById("wait_btn").onclick = function() {
    wait_min(5);
  }
})

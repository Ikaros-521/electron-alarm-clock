// 定时器1
var timer1;
// 数据json串
var data_json;

// 初始化默认时间
function init_time(dateString) {
  let alarm_time = document.getElementById("alarm_time");
  alarm_time.value = dateString;
}

// 文件选中
function file_selected(node) {	
  try {   
    var file = null;
    if(node.files && node.files[0] ){
      file = node.files[0]; 
    } else if(node.files && node.files.item(0)) {                    			
      file = node.files.item(0);   
    } 	
    // Firefox 因安全性问题已无法直接通过input[file].value 获取完整的文件路径
    try {
      //Firefox7.0 
      data_json["file_path"] = file.getAsDataURL();  
      //alert("//Firefox7.0"+data_json["file_path"]);             			
    } catch(e) {
      //Firefox8.0以上                    			
      data_json["file_path"] = window.URL.createObjectURL(file);
      //alert("//Firefox8.0以上"+data_json["file_path"]);
    }
  } catch(e) {      
    // 如果是遨游的话会报这个异常           		
    // 支持html5的浏览器,比如高版本的firefox、chrome、ie10
    if (node.files && node.files[0]) {                    		
      var reader = new FileReader(); 
      reader.onload = function (e) {                      	        	
        data_json["file_path"] = e.target.result;  
      };
      reader.readAsDataURL(node.files[0]); 
    }  
  }

  data_json["file_name"] = file.name;
	data_json["file_type"] = file.type;
  data_json["file_path"] = file.path;
  console.log(file);
  // console.log("data_json["file_path"]:" + data_json["file_path"] + "\ndata_json["file_type"]:" + file.type);

  // 文件名显示
  document.getElementById("file_name").innerHTML = file.name;

  write_data_to_local();
}

// 检查是否到达闹钟时间
function check_time() {
  let alarm_time = document.getElementById("alarm_time");
  let date = new Date();
  // let yyyy = date.getFullYear();
  // let MM = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
  // let dd = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
  let HH = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();
  let mm = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();

  var dateString = HH + ":" + mm;
  if(alarm_time.value == dateString) {
    stop_clock();
    // alert("时间到了！");
    var child_page_config = {
      width: 400, 
      height: 400, 
      transparent:true, 
      webPreferences: { 
        webSecurity: false 
      }
    };
    var child_page = window.open('child.html', '弹窗', child_page_config);
    setTimeout(() => {
      child_page.postMessage({"file_path":data_json["file_path"], "file_type":data_json["file_type"], 
        "cur_language":data_json["cur_language"]}, '*');
    }, 1000);
    
  } else {
    // alert("alarm_time:" + alarm_time.value + " dateString:" + dateString);
  }
}

// 开始闹钟
function start_clock() {
  //alert("开启闹钟");
  timer1 = setInterval(function() { check_time(); }, 1000);
}

// 停止闹钟
function stop_clock() {
  //alert("停止闹钟");
  clearInterval(timer1);
}

window.addEventListener('DOMContentLoaded', () => {
  // 加载本地数据
  load_local_data();

  document.getElementById("language").onchange = function() {
    language_change();
  }

  document.getElementById("start_btn").onclick = function() {
    start_clock();
  }

  document.getElementById("stop_btn").onclick = function() {
    stop_clock();
  }

  document.getElementById("alarm_content").onchange = function() {
    file_selected(this);
  }
})

// 接收子窗口消息
window.addEventListener("message", (msg) => {
  console.log("接收到的消息：", msg);
  // 子窗口发来的延时命令
  if(msg.data.type == 1) {
    let date = new Date();
    // let yyyy = date.getFullYear();
    // let MM = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
    // let dd = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
    let HH = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();
    let mm = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();

    var dateString = HH + ":" + mm;
    console.log("now_time " + dateString);
    var hour, min;
    min = (parseInt(mm) + msg.data.wait_min) >= 60 ? 
      (parseInt(mm) + msg.data.wait_min) - 60 : 
      (parseInt(mm) + msg.data.wait_min);
    // 小时+1
    if((parseInt(mm) + msg.data.wait_min) >= 60) {
      hour = (parseInt(HH) + 1) >= 24 ? 
        (parseInt(HH) + 1) - 24 :
        (parseInt(HH) + 1);
    } else {
      hour = HH;
    }

    var dateString = (hour < 10 ? ("0" + hour.toString()) : hour) + ":" + (min < 10 ? ("0" + min.toString()) : min);
    console.log("after_time " + dateString);
    init_time(dateString);

    // 再次开启闹钟
    start_clock();
  } else if(msg.data.type == 0) { // 子窗口发来 关闭命令
    console.log("闹钟已关闭");
  } else {
    console.log("收到子窗口异常消息");
  }
})

// 设置select选择
function set_select_checked(selectId, checkValue) {  
  var select = document.getElementById(selectId);  

  for (var i = 0; i < select.options.length; i++){  
    if (select.options[i].value == checkValue){  
      select.options[i].selected = true;  
      break;  
    }  
  }  
}

// 加载本地数据
function load_local_data() {
  const fs = require("fs");
  fs.readFile('data/config.json', (err, data) => {
    if (err) return console.error(err);
    console.log(data.toString());
    data_json = JSON.parse(data.toString());

    // 修改语言
    set_select_checked("language", data_json["cur_language"]);
    language_change_no_save(data_json["cur_language"]);
    // 初始化时间
    init_time(data_json["clock_time"]);
    // 文件名显示
    document.getElementById("file_name").innerHTML = data_json["file_name"];
    
  });
}

// 写入数据到本地文件
function write_data_to_local() {
  const fs = require('fs')

  //写入路径是文件名
  fs.writeFile('data/config.json', JSON.stringify(data_json), (err) => {
    if (err) return console.error(err);
    console.log('写入数据成功');
  })
}

// 语言切换
function language_change() {
  var obj = document.getElementById("language");
  // 选中索引
  var index = obj.selectedIndex;
  // 选中值
  var language_val = obj.options[index].value;
  data_json["cur_language"] = language_val;
  console.log("language_val:" + language_val);

  write_data_to_local();

  language_change_no_save(language_val);
}

// 语言切换 不含数据保存
function language_change_no_save(language_val) {
  var alarm_time_span = document.getElementById("alarm_time_span");
  var alarm_content_span = document.getElementById("alarm_content_span");
  var alarm_content_a = document.getElementById("alarm_content_a");
  var start_btn = document.getElementById("start_btn");
  var stop_btn = document.getElementById("stop_btn");
  var alarm_time = document.getElementById("alarm_time");

  if(language_val == "ch") {
    alarm_time_span.innerText = "设定闹钟时间：";
    alarm_content_span.innerText = "选择提示内容：";
    alarm_content_a.innerHTML = "选择文件<input id=\"alarm_content\" type=\"file\" accept=\"image/*,audio/*,video/*\"/>";
    start_btn.value = "开启闹钟";
    stop_btn.value = "关闭闹钟";

    alarm_time.style.width = "160px";
  } else if(language_val == "en") {
    alarm_time_span.innerText = "Clock Time：";
    alarm_content_span.innerText = "Choose Tip：";
    alarm_content_a.innerHTML = "Choose File<input id=\"alarm_content\" type=\"file\" accept=\"image/*,audio/*,video/*\"/>";
    start_btn.value = "Start Clock";
    stop_btn.value = "Stop Clock";

    alarm_time.style.width = "185px";
  } else if(language_val == "jp") {
    alarm_time_span.innerText = "プロンプト時間：";
    alarm_content_span.innerText = "選択のヒント：";
    alarm_content_a.innerHTML = "ファイルの選択<input id=\"alarm_content\" type=\"file\" accept=\"image/*,audio/*,video/*\"/>";
    start_btn.value = "オン時計";
    stop_btn.value = "閉じる時計";

    alarm_time.style.width = "140px";
  } else {
    alarm_time_span.innerText = "Clock Time：";
    alarm_content_span.innerText = "Choose Tip：";
    alarm_content_a.innerHTML = "Choose File<input id=\"alarm_content\" type=\"file\" accept=\"image/*,audio/*,video/*\"/>";
    start_btn.value = "Start Clock";
    stop_btn.value = "Stop Clock";

    alarm_time.style.width = "185px";
  }

  document.getElementById("alarm_content").onchange = function() {
    file_selected(this);
  }
}

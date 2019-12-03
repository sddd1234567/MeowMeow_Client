function previewFile() {
  var preview = document.querySelector(".page-current #upload_label");
  var file = document.querySelector(".page-current input[type=file]#img-file")
    .files[0];
  var reader = new FileReader();

  reader.onloadend = function() {
    preview.style.backgroundImage = "url(" + reader.result + ")";
  };

  if (file) {
    reader.readAsDataURL(file);
    document.querySelector(".page-current #upload_text").style.display = "none";
  } else {
    preview.src = "";
  }
}

function uploadToImgur(el, callback) {
  var form = new FormData();
  form.append("image", el.files[0]);
  form.append("type", "file");

  var settings = {
    async: true,
    crossDomain: true,
    url: "https://api.imgur.com/3/image",
    method: "POST",
    headers: {
      authorization: "Bearer f4b15de01e481435624111d64cc914575d558012"
    },
    processData: false,
    contentType: false,
    mimeType: "multipart/form-data",
    data: form
  };

  $.ajax(settings).done(function(response) {
    var responseData = JSON.parse(response);
    console.log("上傳完成，圖片網址為" + responseData.data.link);
    callback(responseData);
  });
}

var tmpImageBase64Data = "";
function OpenCamera() {
  var preview = document.querySelector("#upload_label");
  navigator.camera.getPicture(
    function(base64) {
      preview.style.backgroundImage =
        "url(data:image/png;base64," + base64 + ")";
      tmpImageBase64Data = base64;
      document.getElementById("upload_text").style.display = "none";
      console.log("success");
      // console.log(base64);
    },
    function(message) {
      console.log(message);
    },
    {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: 1
    }
  );
}

function uploadToImgurByBase64(base64, callback) {
  var form = new FormData();
  form.append("image", base64);
  form.append("type", "base64");

  var settings = {
    async: true,
    crossDomain: true,
    url: "https://api.imgur.com/3/image",
    method: "POST",
    headers: {
      authorization: "Bearer f4b15de01e481435624111d64cc914575d558012"
    },
    processData: false,
    contentType: false,
    mimeType: "multipart/form-data",
    data: form
  };

  $.ajax(settings).done(function(response) {
    tmpImageBase64Data = "";
    console.log(response);
    var responseData = JSON.parse(response);
    console.log("上傳完成，圖片網址為" + responseData.data.link);
    callback(responseData);
  });
}

function ChangeUserIcon() {
  app.dialog.preloader("上傳頭像中");
  uploadToImgur(
    document.querySelector('[data-page="user-info"] #upload-user-icon'),
    function(responseData) {
      var link = responseData.data.link;
      document.querySelector('[data-page="user-info"] #user-icon').src = link;
      document.querySelector(".side-panel-icon").src = link;
      userIconCache[userInfo.uid] = link;
      SetUserIcon(userInfo.uid, link, function() {
        console.log("更換頭像成功");
        app.dialog.close();
      });
    }
  );
}

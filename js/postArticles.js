function NewPicSharePost() {
    if (document.querySelector(".page-current #img-file").files.length < 1)
    {
        app.dialog.alert('請選擇照片');
        return;
    }
    console.log("上傳相片中");
    app.dialog.preloader('發布中');
    uploadToImgur(document.querySelector('.page[data-page = "new-pic-share"] #img-file'), function (responseData) {
        console.log("上傳完成，開始更新資料庫");
        var link = responseData.data.link;
        var content = document.getElementById("content").value;
        NewPicShareArticle(userInfo.uid, content, link, function(key){
            console.log("發布文章成功");
            pageHistory = [];
            pageHistory.push('/');
            reloadPicShare = true;
            mainView.router.navigate('/pic-share-content/?index=' + key);
            $$('.page[data-page = "new-pic-share"]').remove();
            app.dialog.close();
        });
    });
}

function NewPicShareComment(articleKey) {
    app.dialog.preloader('發布中');
    console.log("開始更新資料庫");
    var content = document.getElementById("comment-input").value;
    NewPicShareCommentPost(userInfo.uid, articleKey, content, function (key) {
        console.log("發布評論成功");
        LoadPicShareContent(key);
        app.dialog.close();
        document.getElementById("comment-input").value = "";
    });
}

function NewForumPost() {
    var content = document.getElementById("content").value;
    var classify = document.getElementById("classify").value;
    var title = document.getElementById("title").value;
    if(classify == -1)
    {
        app.dialog.alert('請選擇文章類別', '');
        return;
    }
    if (title == "") {
        app.dialog.alert('請輸入文章標題', '');
        return;
    }
    if(content == "")
    {
        app.dialog.alert('請輸入文章內容', '');
        return;
    }
    if (document.querySelector(".page-current #img-file").files.length > 0){
        app.dialog.preloader('發布中');
        uploadToImgur(document.querySelector('.page[data-page = "new-forum-article"] #img-file'), function (responseData) {
            NewForumArticle(userInfo.uid, title, content, classify, responseData.data.link, function (key) {
                console.log("發布文章成功");
                pageHistory = [];
                pageHistory.push('/');
                reloadPicShare = true;
                forumView.router.navigate('/forum-article-content/?index=' + key);
                $$('.page[data-page = "new-forum-article"]').remove();
                ReloadAllForumList();
                app.dialog.close();
            });
        });
    }
    else
    {
        NewForumArticle(userInfo.uid, title, content, classify, "", function (key) {
            console.log("發布文章成功");
            pageHistory = [];
            pageHistory.push('/');
            reloadPicShare = true;
            forumView.router.navigate('/forum-article-content/?index=' + key);
            $$('.page[data-page = "new-forum-article"]').remove();
            ReloadAllForumList();
            app.dialog.close();
        });
    }
}

function NewForumComment(articleKey) {
    app.dialog.preloader('發布中');
    console.log("開始更新資料庫");
    var content = document.getElementById("comment-input").value;
    NewForumCommentPost(userInfo.uid, articleKey, content, function (key) {
        console.log("發布評論成功");
        LoadForumArticleContent(key);
        app.dialog.close();
        document.getElementById("comment-input").value = "";
    });
}

function NewHelpPost() {
    if (tmpImageBase64Data == "" || nowClickedPosition == undefined)
    {
        app.dialog.alert("請拍攝照片！");
        return;
    }
    console.log("上傳相片中");
    app.dialog.preloader('發布中...');
    uploadToImgurByBase64(tmpImageBase64Data, function (responseData) {
        console.log("上傳完成，開始更新資料庫");
        console.log(responseData);
        var link = responseData.data.link;
        var content = document.querySelector('[data-page="new-help"] textarea#content').value;
        NewHelpArticle(userInfo.uid, content, link, emergencyRate, nowClickedPositionName, nowClickedPosition, function (key) {
            console.log("發布文章成功");
            pageHistory = [];
            pageHistory.push('/');
            reloadPicShare = true;
            helpView.router.navigate('/help-content/?index=' + key);
            $$('.page[data-page = "new-help"]').remove();
            loadHelpPage(-1, true);
            app.dialog.close();
            nowClickedPosition = undefined;
        });
    });
}

function NewHelpComment(articleKey) {
    app.dialog.preloader('發布中');
    console.log("開始更新資料庫");
    var content = document.getElementById("comment-input").value;
    NewHelpCommentPost(userInfo.uid, articleKey, content, function (key) {
        console.log("發布評論成功");
        LoadHelpContent(key);
        app.dialog.close();
        document.getElementById("comment-input").value = "";
    });
}

function SendChatroomMessage(targetUser){
    var content = document.querySelector('[data-page="chatroom-content"] #send-message-input').value;
    document.querySelector('[data-page="chatroom-content"] #send-message-input').value = "";
    SendMessage(targetUser, content, function(){
        console.log('finish send message');
    });
}
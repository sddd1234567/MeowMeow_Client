function OnPicShareLikePressed(buttonElement, key){
    console.log('like');
    LikePicShare(key, function(){
        buttonElement.querySelector("#like-icon").setAttribute('src', 'img/liked.png');
        var nowLike = buttonElement.querySelector(".article-footer-count-text").innerText;
        buttonElement.querySelector(".article-footer-count-text").innerText = parseInt(nowLike) + 1;
        buttonElement.setAttribute('onclick', "OnPicShareCancelLikePressed(this, '"+ key +"')");
        console.log("finish like");
    })
}

function OnPicShareCancelLikePressed(buttonElement, key) {
    console.log("cancel");
    CancelLikePicShare(key, function () {
        buttonElement.querySelector("#like-icon").setAttribute('src', 'img/like.png');
        var nowLike = buttonElement.querySelector(".article-footer-count-text").innerText;
        buttonElement.querySelector(".article-footer-count-text").innerText = parseInt(nowLike) - 1;
        buttonElement.setAttribute('onclick', "OnPicShareLikePressed(this, '" + key + "')");
        console.log("finish cancel like");
    })
}

function OnForumLikePressed(buttonElement, key) {
    console.log('like');
    LikeForum(key, function () {
        buttonElement.querySelector("#like-icon").setAttribute('src', 'img/liked.png');
        var nowLike = buttonElement.querySelector(".article-footer-count-text").innerText;
        buttonElement.querySelector(".article-footer-count-text").innerText = parseInt(nowLike) + 1;
        buttonElement.setAttribute('onclick', "OnForumCancelLikePressed(this, '" + key + "')");
        console.log("finish like");
    })
}

function OnForumCancelLikePressed(buttonElement, key) {
    console.log("cancel");
    CancelLikeForum(key, function () {
        buttonElement.querySelector("#like-icon").setAttribute('src', 'img/like.png');
        var nowLike = buttonElement.querySelector(".article-footer-count-text").innerText;
        buttonElement.querySelector(".article-footer-count-text").innerText = parseInt(nowLike) - 1;
        buttonElement.setAttribute('onclick', "OnForumLikePressed(this, '" + key + "')");
        console.log("finish cancel like");
    })
}

function OnHelpLikePressed(buttonElement, key) {
    console.log('like');
    LikeHelp(key, function () {
        buttonElement.querySelector("#like-icon").setAttribute('src', 'img/liked.png');
        var nowLike = buttonElement.querySelector(".article-footer-count-text").innerText;
        buttonElement.querySelector(".article-footer-count-text").innerText = parseInt(nowLike) + 1;
        buttonElement.setAttribute('onclick', "OnHelpCancelLikePressed(this, '" + key + "')");
        console.log("finish like");
    })
}

function OnHelpCancelLikePressed(buttonElement, key) {
    console.log("cancel");
    CancelLikeHelp(key, function () {
        buttonElement.querySelector("#like-icon").setAttribute('src', 'img/like.png');
        var nowLike = buttonElement.querySelector(".article-footer-count-text").innerText;
        buttonElement.querySelector(".article-footer-count-text").innerText = parseInt(nowLike) - 1;
        buttonElement.setAttribute('onclick', "OnHelpLikePressed(this, '" + key + "')");
        console.log("finish cancel like");
    })
}
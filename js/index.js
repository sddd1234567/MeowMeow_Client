// Import framework with all components
// import Framework7 from 'framework7/js/framework7.min.js';

var nowPicShareIndex = -1;
var nowHelpIndex = -1;
var picShareItemStr = "";
var commentItemStr = "";
var forumArticleItemStr;
var helpItemStr = "";
var picShareList;
var pageHistory = [];
var reloadPicShare = false;
var uid = "";
var isLoadingPicShare = false;
var isLoadingHelp = false;
var isLoadingForum = [false, false, false, false];
var userIconCache = {};
var userNameCache = {};

//頁面路由宣告
var app = new Framework7({
    root: '#app',
    name: 'Meowmeow',
    id: 'com.uni.meowmeow',
    theme: "md",
    panel: {
        swipe: 'left'
    },
    routes: [
        {
            name:'home',
            path: '/',
            url: './index.html'
        },
        {
            name: 'pic-share-content',
            path: '/pic-share-content/',
            url: './pages/pic-share-content.html'
        },
        {
            name: 'new-pic-share-post',
            path: '/new-pic-share-post/',
            url: './pages/new-pic-share-post.html'
        },
        {
            name: 'forum-article-content',
            path: '/forum-article-content/',
            url: './pages/forum-article-content.html'
        },
        {
            name: 'new-forum-article',
            path: '/new-forum-article/',
            url: './pages/new-forum-article-post.html'
        },
        {
            name: 'new-help-map-mark',
            path: '/new-help-map-mark/',
            url: './pages/new-help-map-mark.html'
        },
        {
            name: 'new-help',
            path: '/new-help/',
            url: './pages/new-help-post.html'
        },
        {
            name: 'help-content',
            path: '/help-content/',
            url: './pages/help-article-content.html'
        },
        {
            name: 'fundraising-content',
            path: '/fundraising-content/',
            url: './pages/fundraising-content.html'
        },
        {
            name: 'fundraising-update-content',
            path: '/fundraising-update-content/',
            url: './pages/fundraising-update-content.html'
        },
        {
            name: 'donate-payment-content',
            path: '/donate-payment-content/',
            url: './pages/donate-payment-content.html'
        },
        {
            name: 'select-payment',
            path: '/select-payment/',
            url: './pages/select-payment.html'
        },
        {
            name: 'chatroom-content',
            path: '/chatroom-content/',
            url: './pages/chatroom-content.html'
        },
        {
            name: 'noob-tutorial-content',
            path: '/noob-tutorial-content/',
            url: './pages/noob-tutorial-content.html'
        },
        {
            name: 'donate-records',
            path: '/donate-records/',
            url: './pages/donate-records.html'
        }
    ],
    lazy: {
        threshold: 50,
        sequential: false
    }
});

var $$ = Dom7;
var nowPageName;
var loginScreen;
var signUpScreen;

//監聽當tab被切換的事件(側欄or討論區類別)
app.on('tabShow', function (newTableElement, tabRoute) {
    console.log(newTableElement.id);
    switch(newTableElement)
    {
        case "forum-tab":
            ReloadAllForumList();
            break;
        case "pic-share-tab":
            loadPicSharePage(-1, true);
            break;
        case "help-tab":
            loadHelpPage(-1, true);
            break;
        case "fundraising-tab":
            loadFundraisingPage(-1, true);
            break;
        case "chatroom-tab":
            loadChatroomPage(-1);
            break;
        case "noob-tab":
            loadNoobPage();
            if (!app.device.android) {
                LoadHospitalPage("", 0, false, true);
            }
            break;
        case "my-post-tab":
            loadMyPost();
            break;
        case "tab-hospital":
            document.querySelector('.hospital-filter-icon').style.display = "block";
            break;            
    }

    if(newTableElement.id != "tab-hospital")
    {
        document.querySelector('.hospital-filter-icon').style.display = "none";
    }
});

//Android裝置開啟app時呼叫(若在browser測試則不會)
document.addEventListener("deviceready", function(){
    console.log('device ready');
    pageHistory = [];
    pageHistory.push('/');

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("backbutton", onBackKeyDown, false);

    LoginWithLocalStorage();
    console.log(auth);

    signUpScreen = app.loginScreen.create({
        el: document.querySelector('#signup-screen'),
        animate: true
    });
    loginScreen = app.loginScreen.create({
        el: document.querySelector('#login-screen'),
        animate: true
    });
    if(!isLogin() && waitForLoginScreen)
    {
        if (window.localStorage.getItem("userEmail") == null)
            loginScreen.open(true);
    }
}, false);

var isOpeningExitConfirm = false;
function onBackKeyDown() {
    if(app.views.current.router.history.length > 1)
        app.views.current.router.back();
    else
    {
        if(isOpeningExitConfirm)
            return;
        else
            isOpeningExitConfirm = true;
        app.dialog.confirm('確定要離開MeowMeow嗎？', function () { 
            navigator.app.exitApp();
         }, function(){
             isOpeningExitConfirm = false;
         })
    }
}
function onPause() {
    console.log('pause');
    isFirstInitialHelpListener = true;
    // Handle the pause event
}

function onResume() {
    console.log('resume');
    database.ref('Help').on('value', function (snapshot) {
        // console.log('有新文章');
        var list = snapshot.val();
        if (isFirstInitialHelpListener) {
            for (i in list) {
                helpArticleNameCache.push(i);
            }
            isFirstInitialHelpListener = false;
        }
        else {
            for (i in list) {
                if (!helpArticleNameCache.includes(i)) {
                    helpArticleNameCache.push(i);
                    if (positionCache.lat != undefined) {
                        if (list[i].poster == userInfo.uid)
                            continue;
                        var lat = list[i].position.lat;
                        var lng = list[i].position.lng;
                        var distance = calcCrow(lat, lng, positionCache.lat, positionCache.lng);
                        if (distance <= 0.5) {
                            distance = (distance * 100).toFixed(0);
                            console.log('有新文章');
                            app.notification.create({
                                closeTimeout: 3000,
                                icon: '<img src="img/app_icon.png" style="width:13px;height:13px;"></img>',
                                title: 'MeowMeow',
                                titleRightText: 'now',
                                subtitle: '有貓貓受傷了！',
                                text: '在約' + distance + '公尺處有被發現的受傷貓貓，去看看吧！',
                                closeOnClick: true,
                                on: {
                                    click: function () {
                                        app.views.current.router.navigate('/help-content/?index=' + i + '')
                                    },
                                },
                            }).open();
                        }
                    }
                }
            }
        }
    });
}

function handle_back() {
    pageHistory.pop();
    console.log(pageHistory);
    app.views.current.router.back();
    if (pageHistory[pageHistory.length - 1] == '/') {
        if (reloadPicShare) {
            console.log("reload");
            loadPicSharePage(-1, true);
            reloadPicShare = false;
        }
    }
};

//開啟新的Page時呼叫
$$(document).on('page:init', function(e){
    console.log('page init');
    var page = e.detail;
    console.log(page.route.path);
    pageHistory.push(page.route.path);
    nowPageName = page.route.name;

    console.log(page.route.name);

    app.panel.enableSwipe('.panel-left');

    $$('.back').on('click', handle_back);

    switch(nowPageName)
    {
        case "pic-share-content":
            console.log(page.route.query.index);
            LoadPicShareContent(page.route.query.index);
            $$('.submit-button').on('click', function () {
                NewPicShareComment(page.route.query.index);
            });
            break;
        case "new-pic-share-post":
            document.querySelector("[data-page='new-pic-share'] .user-icon").src = userInfo.icon;
            document.querySelector("[data-page='new-pic-share'] .poster-name").innerText = userInfo.name;
            break;
        case "forum-article-content":
            LoadForumArticleContent(page.route.query.index);
            $$('.submit-button').on('click', function () {
                NewForumComment(page.route.query.index);
            });
            break;
        case "new-forum-article":
            document.querySelector("[data-page='new-forum-article'] .user-icon").src = userInfo.icon;
            document.querySelector("[data-page='new-forum-article'] .poster-name").innerText = userInfo.name;
            break;
        case "help-content":
            LoadHelpContent(page.route.query.index);
            $$('.submit-button').on('click', function () {
                NewHelpComment(page.route.query.index);
            });
            break;
        case "new-help":
            document.querySelector("[data-page='new-help'] .user-icon").src = userInfo.icon;
            document.querySelector("[data-page='new-help'] .poster-name").innerText = userInfo.name;
            var emergency_rate_el = document.querySelectorAll('[data-page="new-help"] .emergency-rate');
            for (var i = 0; i < emergency_rate_el.length; i++) {
                emergency_rate_el[i].setAttribute('onclick', 'SetEmergencyRate(' + i + ')');
            }
            break;
        case "new-help-map-mark":
            initNewHelpMap();
            app.panel.disableSwipe('.panel-left');
            break;
        case "fundraising-content":
            LoadFundraisingContent(page.route.query.index);
            break;
        case "fundraising-update-content":
            var index = page.route.query.index;
            var updateIndex = page.route.query.updateIndex;
            LoadFundraisingUpdateContent(index, updateIndex);
            break;
        case "donate-payment-content":
            var index = page.route.query.index;
            LoadDonatePaymentContent(index, updateIndex);
            break;
        case "select-payment":
            var index = page.route.query.index;
            var name = page.route.query.name;
            nowChooseFundraising = index;
            nowChooseFundraisingName = name;
            break;
        case "chatroom-content":
            var index = page.route.query.index;
            listenChatroom(index);
            LoadChatroomContent(index);
            $('[data-page="page-content"] .back').onclick = function () {
                stopListenChatroom(index);
            }
            break;
        case "noob-tutorial-content":
            var index = page.route.query.index;
            LoadTutorialContent(index);
            break;
        case "donate-records":
            loadDonateRecordsPage();
            break;
    }
});


var pic_share_ptr = app.ptr.create('[data-page="pic-share"] .ptr-content');
var $picSharePtrContent = $$('[data-page="pic-share"] .ptr-content');
$picSharePtrContent.on('ptr:refresh', function (e) {
    console.log("pull refresh");
    if(!isLoadingPicShare)
    {
        loadPicSharePage(-1, true);
        console.log("refresh");
    }
});

var forum_tab0_ptr = app.ptr.create('[data-page="forum"] #tab-0.ptr-content');
var $forumTab0PtrContent = $$('[data-page="forum"] #tab-0.ptr-content');
$forumTab0PtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingPicShare) {
        loadForumPage(0, true);
        console.log("refresh");
    }
});

var forum_tab1_ptr = app.ptr.create('[data-page="forum"] #tab-1.ptr-content');
var $forumTab1PtrContent = $$('[data-page="forum"] #tab-1.ptr-content');
$forumTab1PtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingPicShare) {
        loadForumPage(1, true);
        console.log("refresh");
    }
});

var forum_tab2_ptr = app.ptr.create('[data-page="forum"] #tab-2.ptr-content');
var $forumTab2PtrContent = $$('[data-page="forum"] #tab-2.ptr-content');
$forumTab2PtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingPicShare) {
        loadForumPage(2, true);
        console.log("refresh");
    }
});

var forum_tab3_ptr = app.ptr.create('[data-page="forum"] #tab-3.ptr-content');
var $forumTab3PtrContent = $$('[data-page="forum"] #tab-3.ptr-content');
$forumTab3PtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingPicShare) {
        loadForumPage(3, true);
        console.log("refresh");
    }
});

var help_ptr = app.ptr.create('[data-page="help"] .ptr-content');
var $helpPtrContent = $$('[data-page="help"] .ptr-content');
$helpPtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingHelp) {
        loadHelpPage(-1, true);
    }
});

var fundraising_ptr = app.ptr.create('[data-page="fundraising"] .ptr-content');
var $fundraisingPtrContent = $$('[data-page="fundraising"] .ptr-content');
$fundraisingPtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingFundraising) {
        loadFundraisingPage(-1, true);
    }
});

var chatroom_ptr = app.ptr.create('[data-page="chatroom"] .ptr-content');
var $chatroomPtrContent = $$('[data-page="chatroom"] .ptr-content');
$chatroomPtrContent.on('ptr:refresh', function (e) {
    if (!isLoadingChatroom) {
        loadChatroomPage(-1);
    }
});

var hospital_ptr = app.ptr.create('[data-page="noob"] #tab-hospital.ptr-content');
var $hospitalPtrContent = $$('[data-page="noob"] #tab-hospital.ptr-content');
$hospitalPtrContent.on('ptr:refresh', function (e) {
    console.log(isLoadingHospital);
    if (!isLoadingHospital) {
        LoadHospitalPage("", 0, false, true);
    }
    else
        app.ptr.done($hospitalPtrContent);
});

var myPic_ptr = app.ptr.create('[data-page="my-post"] #tab-my-pic.ptr-content');
var $myPicPtrContent = $$('[data-page="my-post"] #tab-my-pic.ptr-content');
$myPicPtrContent.on('ptr:refresh', function (e) {
    loadMyPic();
});

var myForum_ptr = app.ptr.create('[data-page="my-post"] #tab-my-forum.ptr-content');
var $myForumPtrContent = $$('[data-page="my-post"] #tab-my-forum.ptr-content');
$myForumPtrContent.on('ptr:refresh', function (e) {
    loadMyForum();
});

var myHelp_ptr = app.ptr.create('[data-page="my-post"] #tab-my-help.ptr-content');
var $myHelpPtrContent = $$('[data-page="my-post"] #tab-my-help.ptr-content');
$myHelpPtrContent.on('ptr:refresh', function (e) {
    loadMyHelp();
});

function loadPicSharePage(timestamp, isReload){
    if (isLoadingPicShare)
    {
        app.ptr.done($picSharePtrContent);
        return;
    }
    isLoadingPicShare = true;
    GetPicShareList(timestamp, function (list) {
        if(isReload)
            $$('[data-page="pic-share"] .page-content').scrollTop(0, 100);
        showPicShareList(list, isReload);
    });
}

function loadForumPage(classify, isReload) {
    if (isLoadingForum[classify])
    {
        app.ptr.done($forumTab0PtrContent);
        app.ptr.done($forumTab1PtrContent);
        app.ptr.done($forumTab2PtrContent);
        app.ptr.done($forumTab3PtrContent);
        return;
    }
    isLoadingForum[classify] = true;
    GetForumArticleList(classify, function (list) {
        if(isReload)
            $$('[data-page="forum"] #tab-'+classify+'.page-content').scrollTop(0,100);
        for(i in list)
            console.log(list[i].title);
        showForumArticleList(list, classify, isReload);
    });
}

function loadHelpPage(timestamp, isReload) {
    console.log(isLoadingHelp);
    if (isLoadingHelp) {
        app.ptr.done($helpPtrContent);
        return;
    }
    console.log("load help page");
    isLoadingHelp = true;
    GetHelpList(timestamp, function (list) {
        if (isReload)
            $$('[data-page="help"] .page-content').scrollTop(0, 100);
        showHelpList(list, isReload);
    });
}

var isLoadingFundraising;
function loadFundraisingPage(timestamp, isReload) {
    console.log(isLoadingFundraising);
    if (isLoadingFundraising) {
        app.ptr.done($fundraisingPtrContent);
        return;
    }
    console.log("load fundraising page");
    isLoadingFundraising = true;
    GetFundraisingList(timestamp, function (list) {
        if (isReload)
            $$('[data-page="fundraising"] .page-content').scrollTop(0, 100);
        showFundraisingList(list, isReload);
    });
}

var isLoadingChatroom;
function loadChatroomPage(timestamp) {
    console.log(isLoadingChatroom);
    if (isLoadingChatroom) {
        app.ptr.done($chatroomPtrContent);
        return;
    }
    console.log("load chatroom page");
    isLoadingChatroom = true;
    GetChatroomList(function (list) {
        $$('[data-page="chatroom"] .page-content').scrollTop(0, 100);
        showChatroomList(list);
    });
}

var tutorialArticle;
function loadNoobPage() {
    console.log("load noob page");
    if(tutorialArticle == undefined)
    {
        $.get('./tutorialArticle.json', function(data){
            tutorialArticle = data;
            // console.log(tutorialArticle.length);
            var str = ""
            for(var i = 0; i < tutorialArticle.length; i++)
            {
                console.log(i);
                var container = new DOMParser().parseFromString(tutorialListItem, 'text/html');
                container.querySelector('.tutorial-link').href = "/noob-tutorial-content/?index=" + i;
                container.querySelector('.tutorial-list-title').innerText = tutorialArticle[i].title;
                str = str + container.querySelector('.tutorial-link').outerHTML;
            }
            document.querySelector('[data-page = "noob"] .noob-tutorial-list').innerHTML = str;
        }, "json")
    }
    else
    {
        console.log(tutorialArticle);
        var str = ""
        for (var i = 0; i < tutorialArticle.length; i++) {
            var container = new DOMParser().parseFromString(tutorialListItem, 'text/html');
            container.querySelector('.tutorial-link').href = "/noob-tutorial-content/?index=" + i;
            container.querySelector('.tutorial-list-title').innerText = tutorialArticle[i].title;
            str = str + container.querySelector('.tutorial-link').outerHTML;
        }
        document.querySelector('[data-page = "noob"] .noob-tutorial-list').innerHTML = str;
    }
}

function loadDonateRecordsPage(){
    GetDonateRecordsOfUser(userInfo.uid, function(list){
        ShowDonateRecords(list);
    });
}

function ShowDonateRecords(list){
    var str = "";
    for(i in list)
    {
        var container = new DOMParser().parseFromString(donateRecordListItem, 'text/html');
        container.querySelector('.donate-records-list-title').innerText = list[i].itemName;
        if(list[i].finishPay.toString() == "true")
            container.querySelector('.donate-state').innerText = "捐款成功";
        else
        {
            var date = new Date(list[i].expireDate);
            var t = date.getTime();
            if (t < getNowTimeStamp())
                container.querySelector('.donate-state').innerText = "已過期";
            else
            {
                container.querySelector('.donate-state').innerText = "待繳費";
                container.querySelector('.donate-content-link').href = "/donate-payment-content/?index=" + i;
            }
            
        }
        container.querySelector('.donate-records-list-amount').innerText = "捐款金額：" + list[i].totalAmount;
        str += container.querySelector('.donate-content-link').outerHTML;
    }
    document.querySelector('[data-page="donate-records"] .donate-records-list').innerHTML = str;
}

var isLoadingMyPic = false;
var isLoadingMyForum = false;
var isLoadingMyHelp = false;
function loadMyPost(){
    loadMyPic();
    loadMyForum();
    loadMyHelp();
}

function loadMyPic(){
    if (!isLoadingMyPic) {
        GetPicShareListOfUser(userInfo.uid, function (list) {
            showMyPicList(list);
        })
    }
}

function loadMyForum() {
    if (!isLoadingMyForum) {
        GetForumListOfUser(userInfo.uid, function (list) {
            showMyForumArticleList(list);
        })
    }
}

function loadMyHelp() {
    if (!isLoadingMyHelp) {
        GetHelpListOfUser(userInfo.uid, function (list) {
            showMyHelpList(list);
        })
    }
}

var photoBrowsers = {};

function OpenPhotoBrowser(key)
{
    photoBrowsers[key].openPopup();
}

//初始化載入條
app.infiniteScroll.create($$('[data-page="pic-share"] .page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="forum"] #tab-0.page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="forum"] #tab-1.page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="forum"] #tab-2.page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="forum"] #tab-3.page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="help"] .page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="fundraising"] .page-content.infinite-scroll-content'));
app.infiniteScroll.create($$('[data-page="noob"] #tab-hospital.page-content.infinite-scroll-content'));

$$('[data-page="pic-share"] .infinite-scroll-content').on('infinite', function () {
    loadPicSharePage(nowPicShareIndex, false);
});

$$('[data-page="help"] .infinite-scroll-content').on('infinite', function () {
    loadHelpPage(nowHelpIndex, false);
});

$$('[data-page="fundraising"] .infinite-scroll-content').on('infinite', function () {
    loadFundraisingPage(nowFundraisingIndex, false);
});

$$('[data-page="noob"] #tab-hospital.infinite-scroll-content').on('infinite', function () {
    LoadHospitalPage("", nowHospitalIndex, false, false);
});

function showPicShareList(list, isReload){
    if(list == undefined || list == null)
    {
        console.log("沒有更多文章");
        app.infiniteScroll.destroy('[data-page="pic-share"] .infinite-scroll-content');
        document.querySelector("[data-page='pic-share'] .infinite-scroll-preloader").style.display = "none";
        app.ptr.done($fundraisingPtrContent);
        isLoadingPicShare = false;
        return;
    }
    nowPicShareIndex = list[Object.getOwnPropertyNames(list)[0]].time - 1;

    var nowTimestamp = getNowTimeStamp();
    if(picShareItemStr == "")
    {
        $.get("pages/elements/pic-share-item.html", function (data) {
            picShareItemStr = data;
            var str = "";
            console.log("start initial list");
            for (i in list) {
                var container = new DOMParser().parseFromString(picShareItemStr, 'text/html');
                container.querySelector(".poster-name").id = list[i].poster + "-name";
                container.querySelector(".user-link").href = "/chatroom-content/?index=" + list[i].poster;
                container.querySelector(".pic-share-content-text").innerText = list[i].content;
                // container.querySelector(".pic-container").src = list[i].img;

                var likes = 0;
                var comments = 0;

                if (list[i].likes != undefined)
                {
                    likes = Object.getOwnPropertyNames(list[i].likes).length;
                    if (list[i].likes[userInfo.uid] != null) {
                        container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnPicShareCancelLikePressed(this, '" + i + "')");
                    }
                    else {
                        container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
                    }
                }
                else
                {
                    console.log("add like listener");
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
                }
                if (list[i].comments != undefined)
                    comments = Object.getOwnPropertyNames(list[i].comments).length;

                
                container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
                container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
                container.querySelector(".pic-container").style.backgroundImage = "url("+list[i].img+")";
                container.querySelector(".pic-container").dataset.background = list[i].img;
                container.querySelector(".pic-container").id = "pic-share-img-" + i;
                container.querySelector(".pic-post-time").innerText = timedifference(list[i].time, nowTimestamp);

                container.querySelector('.user-icon').id = list[i].poster + "-icon";

                container.querySelector(".content-link").href = "/pic-share-content/?index=" + i;
                str = container.querySelector(".pic-item").outerHTML + str;
            }
            if(isReload)
                $(".pic-share-list").html(str);
            else
                $(".pic-share-list").append(str);

            app.lazy.create($$('.pic-container lazy'));
            $$('.pic-container lazy').trigger('lazy');
            isLoadingPicShare = false;

            for (i in list) {
                var myPhotoBrowserDark = app.photoBrowser.create({
                    photos: [
                        list[i].img,
                    ],
                    theme: 'dark'
                });
                photoBrowsers[i] = myPhotoBrowserDark;
                document.querySelector("#pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("'+i+'")');
                GetUserInfo(list[i].poster, function (data, uid) {
                    // console.log("aaaaaaaa");
                    var iconElement = document.querySelector("[data-page='pic-share'] #" + uid + "-icon");
                    var nameElement = document.querySelector("[data-page='pic-share'] #" + uid + "-name");
                    // console.log(iconElement);
                    if (iconElement != null)
                    {
                        console.log(data.icon);
                        iconElement.src = data.icon;
                        iconElement.id = "";
                    }
                    if (nameElement != null) {
                        nameElement.innerText = data.name;
                        nameElement.id = "";
                    }
                });
            }
            console.log("finish first show");
        });
    }
    else
    {
        var str = "";
        for (i in list) {
            var container = new DOMParser().parseFromString(picShareItemStr, 'text/html');
            container.querySelector(".poster-name").id = list[i].poster + "-name";
            container.querySelector(".user-link").href = "/chatroom-content/?index=" + list[i].poster;
            container.querySelector(".pic-share-content-text").innerText = list[i].content;
            // container.querySelector(".pic-container").src = list[i].img;
            console.log(list[i].content);
            var likes = 0;
            var comments = 0;

            if (list[i].likes != undefined) {
                likes = Object.getOwnPropertyNames(list[i].likes).length;
                if (list[i].likes[userInfo.uid] != null) {
                    container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnPicShareCancelLikePressed(this, '" + i + "')");
                }
                else {
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
                }
            }
            else {
                console.log("add like listener");
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
            }
            if (list[i].comments != undefined)
                comments = Object.getOwnPropertyNames(list[i].comments).length;

            container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
            container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
            container.querySelector(".pic-post-time").innerText = timedifference(list[i].time, nowTimestamp);
            container.querySelector(".pic-container").style.backgroundImage = "url("+list[i].img+")";
            container.querySelector(".pic-container").dataset.background = list[i].img;
            container.querySelector(".pic-container").id = "pic-share-img-"+i;
            container.querySelector('.user-icon').id = list[i].poster + "-icon";

            container.querySelector(".content-link").href = "/pic-share-content/?index=" + i;
            str = container.querySelector(".pic-item").outerHTML + str;
            

            // $$('div.lazy').trigger('lazy');
        }
        if (isReload)
            $(".pic-share-list").html("");
        $(".pic-share-list").append(str);

        app.lazy.create($$('.pic-container lazy'));
        $$('.pic-container lazy').trigger('lazy');
        for(i in list)
        {
            GetUserInfo(list[i].poster, function (data, uid) {
                // console.log("aaaaaaaa");
                var iconElement = document.querySelector("[data-page='pic-share'] #" + uid + "-icon");
                var nameElement = document.querySelector("[data-page='pic-share'] #" + uid + "-name");
                // console.log(iconElement);
                if (iconElement != null) {
                    iconElement.src = data.icon;
                    iconElement.id = "";
                }
                if (nameElement != null) {
                    nameElement.innerText = data.name;
                    nameElement.id = "";
                }
            });
            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    list[i].img,
                ],
                theme: 'dark'
            });
            photoBrowsers[i] = myPhotoBrowserDark;
            document.querySelector("#pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
        }
        console.log("finish reload");
    }
    app.ptr.done($fundraisingPtrContent);
    isLoadingPicShare = false;
}

function showMyPicList(list) {
    if (list == undefined || list == null) {
        $("[data-page='my-post'] .my-pic-list").html("");
        app.ptr.done($myPicPtrContent);
        isLoadingMyPic = false;
        return;
    }

    var nowTimestamp = getNowTimeStamp();
    if (picShareItemStr == "") {
        $.get("pages/elements/pic-share-item.html", function (data) {
            picShareItemStr = data;
            var str = "";
            for (i in list) {
                var container = new DOMParser().parseFromString(picShareItemStr, 'text/html');
                container.querySelector(".poster-name").innerText = userInfo.name;
                container.querySelector(".pic-share-content-text").innerText = list[i].content;
                // container.querySelector(".pic-container").src = list[i].img;

                var likes = 0;
                var comments = 0;

                if (list[i].likes != undefined) {
                    likes = Object.getOwnPropertyNames(list[i].likes).length;
                    if (list[i].likes[userInfo.uid] != null) {
                        container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnPicShareCancelLikePressed(this, '" + i + "')");
                    }
                    else {
                        container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
                    }
                }
                else {
                    console.log("add like listener");
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
                }
                if (list[i].comments != undefined)
                    comments = Object.getOwnPropertyNames(list[i].comments).length;


                container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
                container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
                container.querySelector(".pic-container").style.backgroundImage = "url(" + list[i].img + ")";
                container.querySelector(".pic-container").dataset.background = list[i].img;
                container.querySelector(".pic-container").id = "pic-share-img-" + i;
                container.querySelector(".pic-post-time").innerText = timedifference(list[i].time, nowTimestamp);

                container.querySelector('.user-icon').src = userInfo.icon;;

                container.querySelector(".content-link").href = "/pic-share-content/?index=" + i;
                str = container.querySelector(".pic-item").outerHTML + str;
            }
            $("[data-page='my-post'] .my-pic-list").html(str);

            app.lazy.create($$('[data-page="my-post"] .pic-container lazy'));
            $$('.pic-container lazy').trigger('lazy');
            isLoadingMyPic = false;

            for (i in list) {
                var myPhotoBrowserDark = app.photoBrowser.create({
                    photos: [
                        list[i].img,
                    ],
                    theme: 'dark'
                });
                photoBrowsers[i] = myPhotoBrowserDark;
                document.querySelector("[data-page='my-post'] #pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
            }
        });
    }
    else {
        var str = "";
        for (i in list) {
            var container = new DOMParser().parseFromString(picShareItemStr, 'text/html');
            container.querySelector(".poster-name").innerText = userInfo.name;
            container.querySelector(".pic-share-content-text").innerText = list[i].content;
            // container.querySelector(".pic-container").src = list[i].img;

            var likes = 0;
            var comments = 0;

            if (list[i].likes != undefined) {
                likes = Object.getOwnPropertyNames(list[i].likes).length;
                if (list[i].likes[userInfo.uid] != null) {
                    container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnPicShareCancelLikePressed(this, '" + i + "')");
                }
                else {
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
                }
            }
            else {
                console.log("add like listener");
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + i + "')");
            }
            if (list[i].comments != undefined)
                comments = Object.getOwnPropertyNames(list[i].comments).length;


            container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
            container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
            container.querySelector(".pic-container").style.backgroundImage = "url(" + list[i].img + ")";
            container.querySelector(".pic-container").dataset.background = list[i].img;
            container.querySelector(".pic-container").id = "pic-share-img-" + i;
            container.querySelector(".pic-post-time").innerText = timedifference(list[i].time, nowTimestamp);

            container.querySelector('.user-icon').src = userInfo.icon;;

            container.querySelector(".content-link").href = "/pic-share-content/?index=" + i;
            str = container.querySelector(".pic-item").outerHTML + str;
        }
        $("[data-page='my-post'] .my-pic-list").html(str);

        app.lazy.create($$('[data-page="my-post"] .pic-container lazy'));
        $$('.pic-container lazy').trigger('lazy');
        isLoadingMyPic = false;

        for (i in list) {
            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    list[i].img,
                ],
                theme: 'dark'
            });
            photoBrowsers[i] = myPhotoBrowserDark;
            document.querySelector("[data-page='my-post'] #pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
        }
    }
    app.ptr.done($myPicPtrContent);
}

function LoadPicShareContent(index) {
    GetPicShareArticle(index, function(article){
        var nowTimestamp = getNowTimeStamp();
        var container = new DOMParser().parseFromString(picShareItemStr, 'text/html');
        container.querySelector(".poster-name").id = article.poster + "-name";
        container.querySelector(".pic-share-content-text").innerText = article.content;
        console.log('finish get article');
        var likes = 0;
        var comments = 0;
        console.log(JSON.stringify(article));
        if (article.likes != undefined) {
            likes = Object.getOwnPropertyNames(article.likes).length;
            if (article.likes[userInfo.uid] != null) {
                container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnPicShareCancelLikePressed(this, '" + index + "')");
            }
            else {
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + index + "')");
            }
        }
        else {
            console.log("add like listener");
            container.querySelector("#like-icon").setAttribute("src", "img/like.png");
            container.querySelector("#like-link").setAttribute("onclick", "OnPicShareLikePressed(this, '" + index + "')");
        }
        if (article.comments != undefined)
            comments = Object.getOwnPropertyNames(article.comments).length;

        var commentList = article.comments;
        if(commentList != undefined)
            ShowPicShareComments(commentList);

        container.querySelector(".pic-post-time").innerText = timedifference(article.time, nowTimestamp);
        container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
        container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
        container.querySelector(".pic-container").style.backgroundImage = "url(" + article.img + ")";

        container.querySelector('.user-icon').id = article.poster + "-icon";

        GetUserInfo(article.poster, function (data) {
            // console.log("aaaaaaaa");
            $(".page[data-page='pic-share-content'] .pic-item").html(container.querySelector(".pic-item").innerHTML);
            document.querySelector('[data-page = "pic-share-content"] .new-comment-item .user-icon').src = userInfo.icon;
            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    article.img,
                ],
                theme: 'dark'
            });
            document.querySelector("[data-page='pic-share-content'] .pic-container").onclick = function () {
                myPhotoBrowserDark.openPopup();
            }
            var iconElement = document.querySelector(".page[data-page='pic-share-content'] #" + article.poster + "-icon");
            var nameElement = document.querySelector(".page[data-page='pic-share-content'] #" + article.poster + "-name");
            console.log("icon: " + data.icon);
            if (iconElement != null)
            {
                iconElement.src = data.icon;
                iconElement.id = "";
            }
            if (nameElement != null)
            {
                nameElement.innerText = data.name;
                nameElement.id = "";
            }
        });
    });
}

function ShowPicShareComments(commentList){
    // commentList.sort();
    var nowTimestamp = getNowTimeStamp();
    $(".page[data-page='pic-share-content'] .pic-share-comments").html("");
    if (commentItemStr == "") {
        $.get("pages/elements/comment-item.html", function (data) {
            commentItemStr = data;
            for (i in commentList) {
                var comment_poster = commentList[i].poster;
                var comment_content = commentList[i].content;
                var commentContainer = new DOMParser().parseFromString(commentItemStr, 'text/html');
                commentContainer.querySelector(".post-time").innerText = timedifference(commentList[i].time, nowTimestamp);
                commentContainer.querySelector(".poster-name").id = "comment-" + comment_poster + "-name";
                commentContainer.querySelector(".user-link").href = "/chatroom-content/?index=" + commentList[i].poster;
                commentContainer.querySelector(".comment-content").innerText = comment_content;
                commentContainer.querySelector('.user-icon').id = "comment-" + comment_poster + "-icon";
                $(".page[data-page='pic-share-content'] .pic-share-comments").append(commentContainer.querySelector(".comment-item").outerHTML);
                GetUserInfo(comment_poster, function (data, uid) {
                    var iconElement = document.querySelector(".page[data-page='pic-share-content'] #comment-" + uid + "-icon");
                    var nameElement = document.querySelector(".page[data-page='pic-share-content'] #comment-" + uid + "-name");

                    if (iconElement != null) {
                        iconElement.src = data.icon;
                        iconElement.id = "";
                    }
                    if (nameElement != null) {
                        nameElement.innerText = data.name;
                        nameElement.id = "";
                    }
                });
            }
        });
    }
    else {
        for (i in commentList) {
            var comment_poster = commentList[i].poster;
            var comment_content = commentList[i].content;
            var commentContainer = new DOMParser().parseFromString(commentItemStr, 'text/html');
            commentContainer.querySelector(".post-time").innerText = timedifference(commentList[i].time, nowTimestamp);
            commentContainer.querySelector(".poster-name").id = "comment-" + comment_poster + "-name";
            commentContainer.querySelector(".user-link").href = "/chatroom-content/?index=" + commentList[i].poster;
            commentContainer.querySelector(".comment-content").innerText = comment_content;
            commentContainer.querySelector('.user-icon').id = "comment-" + comment_poster + "-icon";
            $(".page[data-page='pic-share-content'] .pic-share-comments").append(commentContainer.querySelector(".comment-item").outerHTML);
            GetUserInfo(comment_poster, function (data, uid) {
                var iconElement = document.querySelector(".page[data-page='pic-share-content'] #comment-" + uid + "-icon");
                var nameElement = document.querySelector(".page[data-page='pic-share-content'] #comment-" + uid + "-name");

                if (iconElement != null) {
                    iconElement.src = data.icon;
                    iconElement.id = "";
                }
                if (nameElement != null) {
                    nameElement.innerText = data.name;
                    nameElement.id = "";
                }
            });
        }
    }
}

var forumListItemStr = "";
function showForumArticleList(list, classify, isReload){
    if (list == undefined || list == null) {
        console.log("沒有更多文章");
        console.log(classify);
        app.infiniteScroll.destroy('[data-page="forum"] #tab-' + classify + '.infinite-scroll-content');
        app.ptr.done($forumTab0PtrContent);
        app.ptr.done($forumTab1PtrContent);
        app.ptr.done($forumTab2PtrContent);
        app.ptr.done($forumTab3PtrContent);
        // document.querySelector("[data-page='forum'] #tab-"+classify+" .infinite-scroll-preloader").outerHTML = "";
        isLoadingForum[classify] = false;
        return;
    }
    // nowPicShareIndex = list[Object.getOwnPropertyNames(list)[0]].time - 1;

    var nowTimestamp = getNowTimeStamp();
    if (forumListItemStr == "") {
        $.get("pages/elements/forum-article-list-item.html", function (data) {
            forumListItemStr = data;
            var str = "";
            console.log("start initial list");
            for (i in list) {
                var container = new DOMParser().parseFromString(forumListItemStr, 'text/html');
                container.querySelector(".forum-article-list-item-title").innerText = list[i].title;;

                var likes = 0;

                if (list[i].likes != undefined) {
                    likes = Object.getOwnPropertyNames(list[i].likes).length;
                }

                container.querySelector('.forum-article-comment-count').innerText = likes;

                container.querySelector(".forum-article-content-link").href = "/forum-article-content/?index=" + i;

                str = container.querySelector(".forum-article-content-link").outerHTML + str;
            }

            if (isReload)
                $("#tab-" + classify + " .forum-article-list").html(str);
            else
                $("tab-" + classify + " .forum-article-list").append(str);
            isLoadingForum[classify] = false;
        });
    }
    else {
        var str = "";
        console.log("start initial list");
        for (i in list) {
            var container = new DOMParser().parseFromString(forumListItemStr, 'text/html');
            container.querySelector(".forum-article-list-item-title").innerText = list[i].title;;

            var likes = 0;

            if (list[i].likes != undefined) {
                likes = Object.getOwnPropertyNames(list[i].likes).length;
            }

            container.querySelector('.forum-article-comment-count').innerText = likes;

            container.querySelector(".forum-article-content-link").href = "/forum-article-content/?index=" + i;

            str = container.querySelector(".forum-article-content-link").outerHTML + str;
        }
        if (isReload)
            $("#tab-" + classify + " .forum-article-list").html(str);
        else
            $("tab-" + classify + " .forum-article-list").append(str);
        console.log(str);
        isLoadingForum[classify] = false;
        console.log("_____tab-"+classify);
    }

    app.ptr.done($forumTab0PtrContent);
    app.ptr.done($forumTab1PtrContent);
    app.ptr.done($forumTab2PtrContent);
    app.ptr.done($forumTab3PtrContent);
    isLoadingForum[classify] = false;
}

function showMyForumArticleList(list) {
    if (list == undefined || list == null) {
        isLoadingMyForum = false;
        app.ptr.done($myForumPtrContent);
        return;
    }
    // nowPicShareIndex = list[Object.getOwnPropertyNames(list)[0]].time - 1;

    var nowTimestamp = getNowTimeStamp();
    if (forumListItemStr == "") {
        $.get("pages/elements/forum-article-list-item.html", function (data) {
            forumListItemStr = data;
            var str = "";
            console.log("start initial list");
            for (i in list) {
                var container = new DOMParser().parseFromString(forumListItemStr, 'text/html');
                container.querySelector(".forum-article-list-item-title").innerText = list[i].title;;

                var likes = 0;

                if (list[i].likes != undefined) {
                    likes = Object.getOwnPropertyNames(list[i].likes).length;
                }

                container.querySelector('.forum-article-comment-count').innerText = likes;

                container.querySelector(".forum-article-content-link").href = "/forum-article-content/?index=" + i;

                str = container.querySelector(".forum-article-content-link").outerHTML + str;
            }
            $("[data-page='my-post'] #tab-my-forum .my-forum-list").html(str);
            isLoadingMyForum = false;
        });
    }
    else {
        var str = "";
        console.log("start initial list");
        for (i in list) {
            var container = new DOMParser().parseFromString(forumListItemStr, 'text/html');
            container.querySelector(".forum-article-list-item-title").innerText = list[i].title;;

            var likes = 0;

            if (list[i].likes != undefined) {
                likes = Object.getOwnPropertyNames(list[i].likes).length;
            }

            container.querySelector('.forum-article-comment-count').innerText = likes;

            container.querySelector(".forum-article-content-link").href = "/forum-article-content/?index=" + i;

            str = container.querySelector(".forum-article-content-link").outerHTML + str;
        }
        $("[data-page='my-post'] #tab-my-forum .my-forum-list").html(str);
        isLoadingMyForum = false;
    }

    app.ptr.done($myForumPtrContent);
}

function LoadForumArticleContent(index) {
    GetForumArticle(index, function (article) {
        document.querySelector("[data-page='forum-article-content'] .navbar .title").innerText = article.title;
        var nowTimestamp = getNowTimeStamp();
        var container = new DOMParser().parseFromString(forumArticleItemStr, 'text/html');
        container.querySelector(".poster-name").id = article.poster + "-name";
        container.querySelector(".user-link").href = "/chatroom-content/?index=" + article.poster;
        container.querySelector(".classify").innerText = GetForumClassifyName(article.classify);
        container.querySelector(".article-title").innerText = article.title;
        container.querySelector(".forum-content-text").innerText = article.content;
        if(article.img != undefined){
            if(article.img != "")
            {
                container.querySelector('.forum-main .pic-container').style.backgroundImage = "url("+article.img+")";
                container.querySelector('.forum-main .pic-container').style.display = "block";
            }
        }
        console.log('finish get article');
        var likes = 0;
        var comments = 0;
        console.log(JSON.stringify(article));
        if (article.likes != undefined) {
            likes = Object.getOwnPropertyNames(article.likes).length;
            if (article.likes[userInfo.uid] != null) {
                container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnForumCancelLikePressed(this, '" + index + "')");
            }
            else {
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnForumLikePressed(this, '" + index + "')");
            }
        }
        else {
            console.log("add like listener");
            container.querySelector("#like-icon").setAttribute("src", "img/like.png");
            container.querySelector("#like-link").setAttribute("onclick", "OnForumLikePressed(this, '" + index + "')");
        }
        if (article.comments != undefined)
            comments = Object.getOwnPropertyNames(article.comments).length;

        var commentList = article.comments;
        if (commentList != undefined)
            ShowForumComments(commentList);

        container.querySelector(".forum-post-time").innerText = timedifference(article.time, nowTimestamp);
        container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
        container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;

        container.querySelector('.user-icon').id = article.poster + "-icon";

        GetUserInfo(article.poster, function(data){
            $(".page[data-page='forum-article-content'] .forum-item").html(container.querySelector(".forum-item").innerHTML);

            document.querySelector('[data-page = "forum-article-content"] .new-comment-item .user-icon').src = userInfo.icon;
            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    article.img,
                ],
                theme: 'dark'
            });
            document.querySelector("[data-page='forum-article-content'] .pic-container").onclick = function () {
                myPhotoBrowserDark.openPopup();
            }
            var iconElement = document.querySelector("[data-page='forum-article-content'] #" + article.poster + "-icon");
            var nameElement = document.querySelector("[data-page='forum-article-content'] #" + article.poster + "-name");

            if (iconElement != null) {
                iconElement.src = data.icon;
                iconElement.id = "";
            }
            if (nameElement != null) {
                nameElement.innerText = data.name;
                nameElement.id = "";
            }
        });

    });
}


function ShowForumComments(commentList) {
    // commentList.sort();
    var nowTimestamp = getNowTimeStamp();
    $(".page[data-page='forum-article-content'] .forum-comments").html("");
    if (commentItemStr == "") {
        $.get("pages/elements/comment-item.html", function (data) {
            commentItemStr = data;
            for (i in commentList) {
                var comment_poster = commentList[i].poster;
                var comment_content = commentList[i].content;
                var commentContainer = new DOMParser().parseFromString(commentItemStr, 'text/html');
                commentContainer.querySelector(".poster-name").id = comment_poster + "-name";
                commentContainer.querySelector(".user-link").href = "/chatroom-content/?index=" + commentList[i].poster;
                commentContainer.querySelector(".comment-content").innerText = comment_content;
                commentContainer.querySelector('.user-icon').id = comment_poster + "-icon";
                commentContainer.querySelector(".post-time").innerText = timedifference(commentList[i].time, nowTimestamp);
                $(".page[data-page='forum-article-content'] .forum-comments").append(commentContainer.querySelector(".comment-item").outerHTML);
                GetUserInfo(comment_poster, function (data, uid) {
                    var iconElement = document.querySelector("[data-page='forum-article-content'] #" + uid + "-icon");
                    var nameElement = document.querySelector("[data-page='forum-article-content'] #" + uid + "-name");
                    if (iconElement != null) {
                        iconElement.src = data.icon;
                        iconElement.id = "";
                    }
                    if (nameElement != null) {
                        nameElement.innerText = data.name;
                        nameElement.id = "";
                    }
                });
            }
        });
    }
    else {
        for (i in commentList) {
            var comment_poster = commentList[i].poster;
            var comment_content = commentList[i].content;
            var commentContainer = new DOMParser().parseFromString(commentItemStr, 'text/html');
            commentContainer.querySelector(".poster-name").id = comment_poster + "-name";
            commentContainer.querySelector(".user-link").href = "/chatroom-content/?index=" + commentList[i].poster;
            commentContainer.querySelector(".comment-content").innerText = comment_content;
            commentContainer.querySelector('.user-icon').id = comment_poster + "-icon";
            commentContainer.querySelector(".post-time").innerText = timedifference(commentList[i].time, nowTimestamp);
            $(".page[data-page='forum-article-content'] .forum-comments").append(commentContainer.querySelector(".comment-item").outerHTML);
            GetUserInfo(comment_poster, function (data, uid) {
                var iconElement = document.querySelector("[data-page='forum-article-content'] #" + uid + "-icon");
                var nameElement = document.querySelector("[data-page='forum-article-content'] #" + uid + "-name");
                if (iconElement != null) {
                    iconElement.src = data.icon;
                    iconElement.id = "";
                }
                if (nameElement != null) {
                    nameElement.innerText = data.name;
                    nameElement.id = "";
                }
            });
        }
    }
}

function ReloadAllForumList(){
    loadForumPage(0, true);
    loadForumPage(1, true);
    loadForumPage(2, true);
    loadForumPage(3, true);
}

var nowHelpIndex = -1;
function showHelpList(list, isReload) {
    console.log("show help");
    if(isReload)
        document.querySelector("[data-page='help'] .infinite-scroll-preloader").style.display = "block";
    if (list == undefined || list == null) {
        console.log("沒有更多文章");
        app.infiniteScroll.destroy('[data-page="help"] .infinite-scroll-content');
        document.querySelector("[data-page='help'] .infinite-scroll-preloader").style.display = "none";
        app.ptr.done($helpPtrContent);
        // isLoadingPicShare = false;
        isLoadingHelp = false;
        return;
    }
    console.log('show help list');
    nowHelpIndex = list[Object.getOwnPropertyNames(list)[0]].time - 1;

    var nowTimestamp = getNowTimeStamp();
    if (helpItemStr == "") {
        $.get("pages/elements/help-item.html", function (data) {
            helpItemStr = data;
            var str = "";
            console.log("start initial list");
            for (i in list) {
                var container = new DOMParser().parseFromString(helpItemStr, 'text/html');
                container.querySelector(".poster-name").id = list[i].poster + "-name";
                container.querySelector(".user-link").href = "/chatroom-content/?index=" + list[i].poster;
                container.querySelector(".help-content-text").innerText = list[i].content;
                console.log(list[i]['position']);
                var position = list[i]['position'];
                container.querySelector('.map-link').setAttribute('onclick', 'OpenGoogleMapApp('+position["lat"] + ',' + position["lng"] + ')');
                // container.querySelector(".pic-container").src = list[i].img;

                var likes = 0;
                var comments = 0;

                if (list[i].likes != undefined) {
                    likes = Object.getOwnPropertyNames(list[i].likes).length;
                    if (list[i].likes[userInfo.uid] != null) {
                        container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnHelpCancelLikePressed(this, '" + i + "')");
                    }
                    else {
                        container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
                    }
                }
                else {
                    console.log("add like listener");
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
                }
                if (list[i].comments != undefined)
                    comments = Object.getOwnPropertyNames(list[i].comments).length;

                var emergency_rate_el = container.querySelectorAll(".emergency-rate");
                for(var index = 0; index <= list[i].emergency; index++)
                {
                    emergency_rate_el[index].src = "img/syringe_fill.png";
                }

                container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
                container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
                container.querySelector(".pic-container").style.backgroundImage = "url(" + list[i].img + ")";
                container.querySelector(".pic-container").dataset.background = list[i].img;
                container.querySelector(".pic-container").id = "pic-share-img-" + i;
                container.querySelector(".help-post-time").innerText = timedifference(list[i].time, nowTimestamp);
                container.querySelector(".location-name").innerText = list[i].position_name;

                if(list[i].isSaved != undefined)
                    container.querySelector('.chip-label.classify').innerText = "已救援完成";
                container.querySelector('.user-icon').id = list[i].poster + "-icon";

                container.querySelector(".content-link").href = "/help-content/?index=" + i;
                str = container.querySelector(".help-item").outerHTML + str;
            }
            if (isReload)
                $(".help-list").html(str);
            else
                $(".help-list").append(str);

            app.lazy.create($$('.pic-container lazy'));
            $$('.pic-container lazy').trigger('lazy');
            isLoadingPicShare = false;

            for (i in list) {
                var myPhotoBrowserDark = app.photoBrowser.create({
                    photos: [
                        list[i].img,
                    ],
                    theme: 'dark'
                });
                photoBrowsers[i] = myPhotoBrowserDark;
                document.querySelector("#pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
                GetUserInfo(list[i].poster, function (data, uid) {
                    // console.log("aaaaaaaa");
                    console.log(list[i].poster);
                    var iconElement = document.querySelector("[data-page='help'] #" + uid + "-icon");
                    var nameElement = document.querySelector("[data-page='help'] #" + uid + "-name");
                    // console.log(iconElement);
                    if (iconElement != null) {
                        console.log(data.icon);
                        iconElement.src = data.icon;
                        iconElement.id = "";
                    }
                    if (nameElement != null) {
                        nameElement.innerText = data.name;
                        nameElement.id = "";
                    }
                });
            }
            console.log("finish first show");
        });
    }
    else {
        var str = "";
        console.log("start initial list");
        for (i in list) {
            var container = new DOMParser().parseFromString(helpItemStr, 'text/html');
            container.querySelector(".poster-name").id = list[i].poster + "-name";
            container.querySelector(".user-link").href = "/chatroom-content/?index=" + list[i].poster;
            container.querySelector(".help-content-text").innerText = list[i].content;
            var position = list[i].position;
            container.querySelector('.map-link').setAttribute('onclick', 'OpenGoogleMapApp(' + position["lat"] + ',' + position["lng"] + ')');
            // container.querySelector(".pic-container").src = list[i].img;

            var likes = 0;
            var comments = 0;

            if (list[i].likes != undefined) {
                likes = Object.getOwnPropertyNames(list[i].likes).length;
                if (list[i].likes[userInfo.uid] != null) {
                    container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnHelpCancelLikePressed(this, '" + i + "')");
                }
                else {
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
                }
            }
            else {
                console.log("add like listener");
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
            }
            if (list[i].comments != undefined)
                comments = Object.getOwnPropertyNames(list[i].comments).length;

            var emergency_rate_el = container.querySelectorAll(".emergency-rate");
            for (var index = 0; index <= list[i].emergency; index++) {
                emergency_rate_el[index].src = "img/syringe_fill.png";
            }


            container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
            container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
            container.querySelector(".pic-container").style.backgroundImage = "url(" + list[i].img + ")";
            container.querySelector(".pic-container").dataset.background = list[i].img;
            container.querySelector(".pic-container").id = "pic-share-img-" + i;
            container.querySelector(".help-post-time").innerText = timedifference(list[i].time, nowTimestamp);
            container.querySelector(".location-name").innerText = list[i].position_name;
            if (list[i].isSaved != undefined)
                container.querySelector('.chip-label.classify').innerText = "已救援完成";
            container.querySelector('.user-icon').id = list[i].poster + "-icon";

            container.querySelector(".content-link").href = "/help-content/?index=" + i;
            str = container.querySelector(".help-item").outerHTML + str;
        }
        if (isReload)
            $(".help-list").html(str);
        else
            $(".help-list").append(str);

        app.lazy.create($$('.pic-container lazy'));
        $$('.pic-container lazy').trigger('lazy');
        isLoadingPicShare = false;

        for (i in list) {
            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    list[i].img,
                ],
                theme: 'dark'
            });
            photoBrowsers[i] = myPhotoBrowserDark;
            document.querySelector("#pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
            GetUserInfo(list[i].poster, function (data, uid) {
                // console.log("aaaaaaaa");
                console.log(list[i].poster);
                var iconElement = document.querySelector("[data-page='help'] #" + uid + "-icon");
                var nameElement = document.querySelector("[data-page='help'] #" + uid + "-name");
                // console.log(iconElement);
                if (iconElement != null) {
                    console.log(data.icon);
                    iconElement.src = data.icon;
                    iconElement.id = "";
                }
                if (nameElement != null) {
                    nameElement.innerText = data.name;
                    nameElement.id = "";
                }
            });
        }
        console.log("finish first show");
    }
    app.ptr.done($helpPtrContent);
    isLoadingHelp = false;
}

function showMyHelpList(list) {
    console.log("show help");
    if (list == undefined || list == null) {
        app.ptr.done($myHelpPtrContent);
        isLoadingMyHelp = false;
        return;
    }
    console.log('show help list');

    var nowTimestamp = getNowTimeStamp();
    if (helpItemStr == "") {
        $.get("pages/elements/help-item.html", function (data) {
            helpItemStr = data;
            var str = "";
            console.log("start initial list");
            console.log(list);
            for (i in list) {
                var container = new DOMParser().parseFromString(helpItemStr, 'text/html');
                container.querySelector(".poster-name").innerText = userInfo.name;
                container.querySelector(".help-content-text").innerText = list[i].content;
                var position = list[i]['position'];
                container.querySelector('.map-link').setAttribute('onclick', 'OpenGoogleMapApp(' + position["lat"] + ',' + position["lng"] + ')');
                // container.querySelector(".pic-container").src = list[i].img;

                var likes = 0;
                var comments = 0;

                if (list[i].likes != undefined) {
                    likes = Object.getOwnPropertyNames(list[i].likes).length;
                    if (list[i].likes[userInfo.uid] != null) {
                        container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnHelpCancelLikePressed(this, '" + i + "')");
                    }
                    else {
                        container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                        container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
                    }
                }
                else {
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
                }
                if (list[i].comments != undefined)
                    comments = Object.getOwnPropertyNames(list[i].comments).length;

                var emergency_rate_el = container.querySelectorAll(".emergency-rate");
                for (var index = 0; index <= list[i].emergency; index++) {
                    emergency_rate_el[index].src = "img/syringe_fill.png";
                }

                container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
                container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
                container.querySelector(".pic-container").style.backgroundImage = "url(" + list[i].img + ")";
                container.querySelector(".pic-container").dataset.background = list[i].img;
                container.querySelector(".pic-container").id = "pic-share-img-" + i;
                container.querySelector(".help-post-time").innerText = timedifference(list[i].time, nowTimestamp);
                container.querySelector(".location-name").innerText = list[i].position_name;
                if (list[i].isSaved != undefined)
                    container.querySelector('.chip-label.classify').innerText = "已救援完成";
                container.querySelector('.user-icon').src = userInfo.icon;

                container.querySelector(".content-link").href = "/help-content/?index=" + i;
                str = container.querySelector(".help-item").outerHTML + str;
            }
            $("[data-page='my-post'] .my-help-list").html(str);

            app.lazy.create($$('[data-page="my-post"] .pic-container lazy'));
            $$('[data-page="my-post"] .pic-container lazy').trigger('lazy');
            isLoadingMyHelp = false;

            for (i in list) {
                var myPhotoBrowserDark = app.photoBrowser.create({
                    photos: [
                        list[i].img,
                    ],
                    theme: 'dark'
                });
                photoBrowsers[i] = myPhotoBrowserDark;
                document.querySelector("#pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
            }
        });
    }
    else {
        var str = "";
        console.log("start initial list");
        for (i in list) {
            var container = new DOMParser().parseFromString(helpItemStr, 'text/html');
            container.querySelector(".poster-name").innerText = userInfo.name;
            container.querySelector(".help-content-text").innerText = list[i].content;
            var position = list[i]['position'];
            container.querySelector('.map-link').setAttribute('onclick', 'OpenGoogleMapApp(' + position["lat"] + ',' + position["lng"] + ')');
            // container.querySelector(".pic-container").src = list[i].img;

            var likes = 0;
            var comments = 0;

            if (list[i].likes != undefined) {
                likes = Object.getOwnPropertyNames(list[i].likes).length;
                if (list[i].likes[userInfo.uid] != null) {
                    container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnHelpCancelLikePressed(this, '" + i + "')");
                }
                else {
                    container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                    container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
                }
            }
            else {
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + i + "')");
            }
            if (list[i].comments != undefined)
                comments = Object.getOwnPropertyNames(list[i].comments).length;

            var emergency_rate_el = container.querySelectorAll(".emergency-rate");
            for (var index = 0; index <= list[i].emergency; index++) {
                emergency_rate_el[index].src = "img/syringe_fill.png";
            }

            container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
            container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
            container.querySelector(".pic-container").style.backgroundImage = "url(" + list[i].img + ")";
            container.querySelector(".pic-container").dataset.background = list[i].img;
            container.querySelector(".pic-container").id = "pic-share-img-" + i;
            container.querySelector(".help-post-time").innerText = timedifference(list[i].time, nowTimestamp);
            container.querySelector(".location-name").innerText = list[i].position_name;
            if (list[i].isSaved != undefined)
                container.querySelector('.chip-label.classify').innerText = "已救援完成";
            container.querySelector('.user-icon').src = userInfo.icon;

            container.querySelector(".content-link").href = "/help-content/?index=" + i;
            str = container.querySelector(".help-item").outerHTML + str;
        }
        $("[data-page='my-post'] .my-help-list").html(str);

        app.lazy.create($$('[data-page="my-post"] .pic-container lazy'));
        $$('[data-page="my-post"] .pic-container lazy').trigger('lazy');
        isLoadingMyHelp = false;

        for (i in list) {
            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    list[i].img,
                ],
                theme: 'dark'
            });
            photoBrowsers[i] = myPhotoBrowserDark;
            document.querySelector("#pic-share-img-" + i).setAttribute('onclick', 'OpenPhotoBrowser("' + i + '")');
        }
    }
    app.ptr.done($myHelpPtrContent);
}

function LoadHelpContent(index) {
    var articleIndex = index;
    GetHelpArticle(index, function (article) {
        var nowTimestamp = getNowTimeStamp();
        var container = new DOMParser().parseFromString(helpItemStr, 'text/html');
        container.querySelector(".poster-name").id = article.poster + "-name";
        container.querySelector(".help-content-text").innerText = article.content;
        var position = article.position;
        container.querySelector('.map-link').setAttribute('onclick', 'OpenGoogleMapApp(' + position["lat"] + ',' + position["lng"] + ')');
        container.querySelector(".location-name").innerText = article.position_name;
        console.log('finish get article');
        var likes = 0;
        var comments = 0;
        console.log(JSON.stringify(article));
        if (article.likes != undefined) {
            likes = Object.getOwnPropertyNames(article.likes).length;
            if (article.likes[userInfo.uid] != null) {
                container.querySelector("#like-icon").setAttribute("src", "img/liked.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnHelpCancelLikePressed(this, '" + index + "')");
            }
            else {
                container.querySelector("#like-icon").setAttribute("src", "img/like.png");
                container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + index + "')");
            }
        }
        else {
            console.log("add like listener");
            container.querySelector("#like-icon").setAttribute("src", "img/like.png");
            container.querySelector("#like-link").setAttribute("onclick", "OnHelpLikePressed(this, '" + index + "')");
            container.querySelector(".location-name").innerText = article.position_name;
        }
        if (article.comments != undefined)
            comments = Object.getOwnPropertyNames(article.comments).length;

        var commentList = article.comments;
        if (commentList != undefined)
            ShowHelpComments(commentList);

        var emergency_rate_el = container.querySelectorAll(".emergency-rate");
        for (var i = 0; i <= article.emergency; i++) {
            emergency_rate_el[i].src = "img/syringe_fill.png";
        }

        container.querySelector(".help-post-time").innerText = timedifference(article.time, nowTimestamp);
        container.querySelectorAll(".article-footer-count-text")[0].innerText = likes;
        container.querySelectorAll(".article-footer-count-text")[1].innerText = comments;
        container.querySelector(".pic-container").style.backgroundImage = "url(" + article.img + ")";
        if (article.isSaved != undefined)
        {
            container.querySelector('.chip-label.classify').innerText = "已救援完成";
        }
        container.querySelector('.user-icon').id = article.poster + "-icon";

        GetUserInfo(article.poster, function (data) {
            // console.log("aaaaaaaa");
            $(".page[data-page='help-content'] .help-item").html(container.querySelector(".help-item").innerHTML);
            document.querySelector('[data-page = "help-content"] .new-comment-item .user-icon').src = userInfo.icon;
            document.querySelector('[data-page="help-content"] .report-help-button').setAttribute("onclick", "ReportHelp('" + articleIndex + "')");
            if(article.isSaved != undefined)
                document.querySelector('[data-page="help-content"] .report-help-button').style.display = "none";
            var iconElement = document.querySelector(".page[data-page='help-content'] #" + article.poster + "-icon");
            var nameElement = document.querySelector(".page[data-page='help-content'] #" + article.poster + "-name");

            var myPhotoBrowserDark = app.photoBrowser.create({
                photos: [
                    article.img,
                ],
                theme: 'dark'
            });
            document.querySelector("[data-page='help-content'] .pic-container").onclick = function(){
                myPhotoBrowserDark.openPopup();
            }
            console.log("icon: " + data.icon);
            if (iconElement != null) {
                iconElement.src = data.icon;
                iconElement.id = "";
            }
            if (nameElement != null) {
                nameElement.innerText = data.name;
                nameElement.id = "";
            }
        });
    });
}

function ShowHelpComments(commentList) {
    // commentList.sort();
    var nowTimestamp = getNowTimeStamp();
    $(".page[data-page='help-content'] .help-comments").html("");
    if (commentItemStr == "") {
        $.get("pages/elements/comment-item.html", function (data) {
            commentItemStr = data;
            for (i in commentList) {
                var comment_poster = commentList[i].poster;
                var comment_content = commentList[i].content;
                var commentContainer = new DOMParser().parseFromString(commentItemStr, 'text/html');
                commentContainer.querySelector(".poster-name").id = comment_poster + "-name";
                commentContainer.querySelector(".comment-content").innerText = comment_content;
                commentContainer.querySelector('.user-icon').id = comment_poster + "-icon";
                commentContainer.querySelector(".post-time").innerText = timedifference(commentList[i].time, nowTimestamp);
                $(".page[data-page='help-content'] .help-comments").append(commentContainer.querySelector(".comment-item").outerHTML);
                GetUserInfo(comment_poster, function (data, uid) {
                    var iconElement = document.querySelector("[data-page='help-content'] #" + uid + "-icon");
                    var nameElement = document.querySelector("[data-page='help-content'] #" + uid + "-name");
                    if (iconElement != null) {
                        iconElement.src = data.icon;
                        iconElement.id = "";
                    }
                    if (nameElement != null) {
                        nameElement.innerText = data.name;
                        nameElement.id = "";
                    }
                });
            }
        });
    }
    else {
        for (i in commentList) {
            var comment_poster = commentList[i].poster;
            var comment_content = commentList[i].content;
            var commentContainer = new DOMParser().parseFromString(commentItemStr, 'text/html');
            commentContainer.querySelector(".poster-name").id = comment_poster + "-name";
            commentContainer.querySelector(".comment-content").innerText = comment_content;
            commentContainer.querySelector('.user-icon').id = comment_poster + "-icon";
            commentContainer.querySelector(".post-time").innerText = timedifference(commentList[i].time, nowTimestamp);
            $(".page[data-page='help-content'] .help-comments").append(commentContainer.querySelector(".comment-item").outerHTML);
            GetUserInfo(comment_poster, function (data, uid) {
                var iconElement = document.querySelector("[data-page='help-content'] #" + uid + "-icon");
                var nameElement = document.querySelector("[data-page='help-content'] #" + uid + "-name");
                if (iconElement != null) {
                    iconElement.src = data.icon;
                    iconElement.id = "";
                }
                if (nameElement != null) {
                    nameElement.innerText = data.name;
                    nameElement.id = "";
                }
            });
        }
    }
}

var emergencyRate = 4;
function SetEmergencyRate(rate) {
    emergencyRate = rate;
    var emergency_rate_el = document.querySelectorAll('[data-page="new-help"] .emergency-rate');
    for (var i = 0; i < emergency_rate_el.length; i++) {
        emergency_rate_el[i].src = 'img/syringe_empty.png';
    }
    for (var i = 0; i <= rate; i++) {
        emergency_rate_el[i].src = 'img/syringe_fill.png';
    }
}

var nowFundraisingIndex = -1;
var fundraisingListItem = ""
function showFundraisingList(list, isReload) {
    if (list == undefined || list == null) {
        isLoadingFundraising = false;
        return;
    }
    if (list.length < 10)
    {
        console.log(list.length);
        console.log("沒有更多文章");
        app.infiniteScroll.destroy('[data-page="fundraising"] .infinite-scroll-content');
        document.querySelector("[data-page='fundraising'] .infinite-scroll-preloader").style.display = "none";
        app.ptr.done($fundraisingPtrContent);
    }
    console.log('show help list');
    nowFundraisingIndex = list[Object.getOwnPropertyNames(list)[0]].time - 1;

    var nowTimestamp = getNowTimeStamp();
    if (fundraisingListItem == "") {
        $.get("pages/elements/fundraising-list-item.html", function (data) {
            fundraisingListItem = data;
            var str = "";
            console.log("start initial list");
            for (i in list) {
                var container = new DOMParser().parseFromString(fundraisingListItem, 'text/html');
                container.querySelector(".fundraising-list-item-title").innerText = list[i].title;
                container.querySelector(".donate-target").innerText = list[i].target;
                container.querySelector(".donate-now").innerText = list[i].now;
                container.querySelector(".donate-count").innerText = list[i].nowPeople;
                var nowDonateRate = (parseInt(list[i].now)/parseInt(list[i].target))*100;
                container.querySelector(".donate-bar-inner").style.width = nowDonateRate + "%";
                // container.querySelector(".pic-container").src = list[i].img;

                container.querySelector(".post-time").innerText = timedifference(list[i].time, nowTimestamp);

                container.querySelector(".content-link").href = "/fundraising-content/?index=" + i;
                str = container.querySelector(".content-link").outerHTML + str;
            }
            if (isReload)
                $(".fundraising-list").html(str);
            else
                $(".fundraising-list").append(str);
            isLoadingFundraising = false;
        });
    }
    else {
        var str = "";
        console.log("start initial list");
        for (i in list) {
            var container = new DOMParser().parseFromString(fundraisingListItem, 'text/html');
            container.querySelector(".fundraising-list-item-title").innerText = list[i].title;
            container.querySelector(".donate-target").innerText = list[i].target;
            container.querySelector(".donate-now").innerText = list[i].now;
            container.querySelector(".donate-count").innerText = list[i].nowPeople;
            var nowDonateRate = (parseInt(list[i].now) / parseInt(list[i].target)) * 100;
            container.querySelector(".donate-bar-inner").style.width = nowDonateRate + "%";
            // container.querySelector(".pic-container").src = list[i].img;

            container.querySelector(".post-time").innerText = timedifference(list[i].time, nowTimestamp);

            container.querySelector(".content-link").href = "/fundraising-content/?index=" + i;
            str = container.querySelector(".content-link").outerHTML + str;
        }
        if (isReload)
            $(".fundraising-list").html(str);
        else
            $(".fundraising-list").append(str);
        isLoadingFundraising = false;
    }
    app.ptr.done($fundraisingPtrContent);
    isLoadingFundraising = false;
}

function LoadFundraisingContent(index) {
    GetFundraisingArticle(index, function (article) {
        var nowTimestamp = getNowTimeStamp();
        document.querySelector('[data-page="fundraising-content"] .fundraising-poster-name').id = article.poster + "-name";
        document.querySelector('[data-page="fundraising-content"] .fundraising-user-icon').id = article.poster + "-icon";
        document.querySelector('[data-page="fundraising-content"] .navbar .title').innerText = article.title;
        document.querySelector('[data-page="fundraising-content"] .fundraising-content-top .title').innerText = article.title;
        document.querySelector('[data-page="fundraising-content"] .content').innerText = article.content;
        document.querySelector('[data-page="fundraising-content"] .fundraising-post-time').innerText = timedifference(article.time, nowTimestamp);

        document.querySelector("#donate-target").innerText = "目標金額：$" + article.target;
        document.querySelector("#donate-now").innerText = "目前累積金額：$" + article.now;
        document.querySelector("#donate-count").innerText = "捐款人數：" + article.nowPeople + "人";
        document.querySelector("#fundraising-state .donate-now").innerText = article.now;
        document.querySelector("#fundraising-state .donate-target").innerText = article.target;
        var nowDonateRate = (parseInt(article.now) / parseInt(article.target)) * 100;
        document.querySelector("#fundraising-state .donate-bar-inner").style.width = nowDonateRate + "%";
        document.querySelector('#fundraising-state .donate-link').href = "/select-payment/?index="+index+"&name="+article.title;
        document.querySelector('#fundraising-info .donate-link').href = "/select-payment/?index=" + index + "&name=" + article.title;

        if (article.updates != undefined) {
            for(i in article.updates)
            {
                var container = new DOMParser().parseFromString(fundraisingUpdateListItem, 'text/html');
                container.querySelector(".update-link").href = "/fundraising-update-content/?index="+index+"&updateIndex="+i;
                container.querySelector(".post-time").innerText = timedifference(article.updates[i].time, nowTimestamp);
                container.querySelector(".title").innerText = article.updates[i].title;
                container.querySelector(".content").innerHTML = article.updates[i].content;

                $("[data-page='fundraising-content'] #fundraising-update").append(container.querySelector('.update-link').outerHTML);
            }
        }

        GetMidWayInfo(article.poster, function (data) {
            var iconElement = document.querySelector(".page[data-page='fundraising-content'] #" + article.poster + "-icon");
            var nameElement = document.querySelector(".page[data-page='fundraising-content'] #" + article.poster + "-name");

            if (iconElement != null)
                iconElement.src = data.icon;
            if (nameElement != null)
                nameElement.innerText = data.principle_name;


            document.querySelector("#midway-name").innerText = "中途之家名稱：" + data.midway_name;
            document.querySelector("#principle-name").innerText = "負責人姓名：" + data.principle_name;
            document.querySelector("#address").innerText = "地址：" + data.address;
            document.querySelector("#telphone").innerText = "連絡電話：" + data.telephone;
            document.querySelector("#email").innerText = "電子郵件：" + data.email;
            document.querySelector("#visit-time").innerText = "可參觀時間：" + data.visit_time;
            
        });
    });
}

function LoadFundraisingUpdateContent(index, updateIndex) {
    GetFundraisingUpdate(index, updateIndex,function (article) {
        var nowTimestamp = getNowTimeStamp();
        document.querySelector('[data-page="fundraising-update-content"] .poster-name').id = article.poster + "-name";
        document.querySelector('[data-page="fundraising-update-content"] .user-icon').id = article.poster + "-icon";
        document.querySelector('[data-page="fundraising-update-content"] .navbar .title').innerText = article.title;
        document.querySelector('[data-page="fundraising-update-content"] .article-title').innerText = article.title;
        document.querySelector('[data-page="fundraising-update-content"] .fundraising-update-content-text').innerHTML = article.content;
        document.querySelector('[data-page="fundraising-update-content"] .fundraising-update-post-time').innerText = timedifference(article.time, nowTimestamp);

        GetMidWayInfo(article.poster, function (data) {
            var iconElement = document.querySelector(".page[data-page='fundraising-update-content'] #" + article.poster + "-icon");
            var nameElement = document.querySelector(".page[data-page='fundraising-update-content'] #" + article.poster + "-name");

            if (iconElement != null)
                iconElement.src = data.icon;
            if (nameElement != null)
                nameElement.innerText = data.principle_name;
        });
    });
}

function LoadDonatePaymentContent(index){
    GetDonatePaymentContent(index, function(value){
        $('[data-page="donate-payment-content"] .content-block').attr('style', 'display:block;');
        if(value.paymentMethod == "CVS")
        {
            $('.atm_tr').css('display', 'none');
            document.querySelector('[data-page="donate-payment-content"] #itemName').innerText = value.itemName;
            document.querySelector('[data-page="donate-payment-content"] #tradeNo').innerText = value.tradeNo;
            document.querySelector('[data-page="donate-payment-content"] #expireDate').innerText = value.expireDate;
            document.querySelector('[data-page="donate-payment-content"] #totalAmount').innerText = value.totalAmount;
            document.querySelector('[data-page="donate-payment-content"] #paymentNoCVS').innerText = value.paymentNo;
            var cvstype;
            if(value.CVS_Type == "IBON")
                cvstype = "7-Eleven";
            else if(value.CVS_Type == "FAMILY")
                cvstype = "全家";
            else if(value.CVS_Type == "HILIFE")
                cvstype = "萊爾富";
            else if(value.CVS_Type == "OK")
                cvstype = "OK超商";

            document.querySelector('[data-page="donate-payment-content"] #CVS_Type').innerText = cvstype;
            if(value.qr != undefined)
                document.querySelector('[data-page="donate-payment-content"] #qr').src = value.qr;
            else
                document.querySelector('[data-page="donate-payment-content"] .qr-container').style.display = "none";
        }
        else
        {
            $('.cvs_tr').css('display', 'none');
            document.querySelector('[data-page="donate-payment-content"] #itemName').innerText = value.itemName;
            document.querySelector('[data-page="donate-payment-content"] #tradeNo').innerText = value.tradeNo;
            document.querySelector('[data-page="donate-payment-content"] #expireDate').innerText = value.expireDate;
            document.querySelector('[data-page="donate-payment-content"] #totalAmount').innerText = value.totalAmount;
            document.querySelector('[data-page="donate-payment-content"] #paymentNoATM').innerText = value.paymentNo;
            document.querySelector('[data-page="donate-payment-content"] #bank').innerText = value.bank;
        }

    })
}

var chatroomListItem = "";
function showChatroomList(list){
    if (list == undefined || list == null) {
        isLoadingChatroom = false;
        return;
    }
    if (list.length <= 0) {
        console.log("沒有更多文章");
        // app.ptr.done($fundraisingPtrContent);
    }
    console.log('show chatroom list');

    var nowTimestamp = getNowTimeStamp();
    if (chatroomListItem == "") {
        $.get("pages/elements/chatroom-list-item.html", function (data) {
            chatroomListItem = data;
            var str = "";
            console.log("start initial list");
            for (i in list) {
                var container = new DOMParser().parseFromString(chatroomListItem, 'text/html');
                container.querySelector(".chatroom-list-name").id = i + "-name";
                container.querySelector(".chatroom-list-user-icon").id = i + "-icon"
                

                container.querySelector(".chatroom-link").href = "/chatroom-content/?index=" + i;
                str = container.querySelector(".chatroom-link").outerHTML + str;                
            }
            
            $(".chatroom-list").html(str);
            
            for(i in list){
                GetUserInfo(i, function (data, uid) {
                    console.log('load user icon');
                    console.log("uid: " + uid);
                    console.log("icon: " + data.icon);
                    console.log("name: " + data.name);
                    var iconElement = document.querySelector(".page[data-page='chatroom'] #" + uid + "-icon");
                    var nameElement = document.querySelector(".page[data-page='chatroom'] #" + uid + "-name");

                    if (iconElement != null) {
                        iconElement.src = data.icon;
                        iconElement.id = "";
                    }
                    if (nameElement != null) {
                        nameElement.innerText = data.name;
                        nameElement.id = "";
                    }
                });
            }
            app.ptr.done($chatroomPtrContent);
            isLoadingChatroom = false;
        });
    }
    else {
        var str = "";
        console.log("start initial list");
        for (i in list) {
            var container = new DOMParser().parseFromString(chatroomListItem, 'text/html');
            container.querySelector(".chatroom-list-name").id = i + "-name";
            container.querySelector(".chatroom-list-user-icon").id = i + "-icon"


            container.querySelector(".chatroom-link").href = "/chatroom-content/?index=" + i;
            str = container.querySelector(".chatroom-link").outerHTML + str;
        }

        $(".chatroom-list").html(str);

        for (i in list) {
            GetUserInfo(i, function (data, uid) {
                var iconElement = document.querySelector(".page[data-page='chatroom'] #" + uid + "-icon");
                var nameElement = document.querySelector(".page[data-page='chatroom'] #" + uid + "-name");
                userIconCache[uid] = data.icon;
                userNameCache[uid] = data.name;
                if (iconElement != null) {
                    iconElement.src = data.icon;
                    iconElement.id = "";
                }
                if (nameElement != null) {
                    nameElement.innerText = data.name;
                    nameElement.id = "";
                }
            });
        }

        app.ptr.done($chatroomPtrContent);
        isLoadingChatroom = false;
    }
}


function LoadChatroomContent(targetUser) {
    GetChatroomMessage(targetUser, function (list) {
        var nowTimestamp = getNowTimeStamp();

        $.get("pages/elements/chatroom-message-item.html", function (data) {
            var str = "";
            for (i in list) {
                var container = new DOMParser().parseFromString(data, 'text/html');
                var align = "left";
                if(list[i].poster == userInfo.uid)
                    align = "right";
                
                container.querySelector('.chatroom-message-item').className = "chatroom-message-item "+ align;
                if (userIconCache[list[i].poster] == undefined)
                    container.querySelector('.chatroom-user-icon').dataset.name = list[i].poster;
                else
                    container.querySelector('.chatroom-user-icon').src = userIconCache[list[i].poster];
                container.querySelector('.chatroom-message-content').innerText = list[i].content;
                str += container.querySelector('.chatroom-message-item').outerHTML;
            }
            document.querySelector('[data-page="chatroom-content"] .message-area').innerHTML = str;
            $('[data-page="chatroom-content"] .page-content').scrollTop($('[data-page="chatroom-content"] .page-content')[0].scrollHeight);
            if(userIconCache[targetUser] == undefined)
            {
                GetUserInfo(targetUser, function (data) {
                    userIconCache[targetUser] = data.icon;
                    document.querySelector('[data-page="chatroom-content"] .title').innerText = "與" + data.name + "的對話";
                    var list = document.querySelectorAll('img[data-name = "' + targetUser + '"]');
                    for (var i = 0; i < list.length; i++) {
                        list[i].src = data.icon;
                    }
                });
            }
            if(userIconCache[userInfo.uid] == undefined)
            {
                GetUserInfo(userInfo.uid, function (data) {
                    userIconCache[userInfo.uid] = data.icon;
                    var list = document.querySelectorAll('img[data-name = "' + userInfo.uid + '"]')
                    for (var i = 0; i < list.length; i++) {
                        list[i].src = data.icon;
                    }
                })
            }
            if(userNameCache[targetUser] == undefined)
            {
                GetUserInfo(targetUser, function (data) {
                    document.querySelector('[data-page="chatroom-content"] .title').innerText = "與" + data.name + "的對話";
                });
            }
            else
            {
                document.querySelector('[data-page="chatroom-content"] .title').innerText = "與" + userNameCache[targetUser] + "的對話";
            }
        });
    });
    document.querySelector('[data-page="chatroom-content"] .send-button').setAttribute('onclick', "SendChatroomMessage('" + targetUser + "')");
}


function LoadTutorialContent(index){
    var article = tutorialArticle[index];
    document.querySelector('[data-page="noob-tutorial-content"] .title').innerText = article.title;
    document.querySelector('[data-page="noob-tutorial-content"] .article-title').innerText = article.title;
    document.querySelector('[data-page="noob-tutorial-content"] .article-main').innerHTML = article.content;
}

var nowHospitalIndex = 0;
var isLoadingHospital = false;
function LoadHospitalPage(params, index, isNight, isReload)
{   
    if(isLoadingHospital)
    {
        app.ptr.done($hospitalPtrContent);
        return;        
    }
    isLoadingHospital = true;
    if(isReload)
        nowHospitalIndex = 0;
    if(isReload)
    {
        if(isNight)
        {
            GetNightHospitalList(params, index, function (data) {
                ShowHospitalList(data, isReload);
            })
        }
        else
        {
            GetHospitalList(params, index, function (data) {
                ShowHospitalList(data, isReload);
            });
        }
    }
    else
    {
        var newList = hospitalCache.slice(index, index + 20);

        ShowHospitalList(newList, isReload);
    }
}

var hospitalListItem = "";
var positionCache = {};
function ShowHospitalList(list, isReload){
    if(isReload)
    {
        document.querySelector("[data-page='noob'] #tab-hospital .infinite-scroll-preloader").style.display = "block";
        document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML = "";
    }
    if(list.length < 20)
        document.querySelector("[data-page='noob'] #tab-hospital .infinite-scroll-preloader").style.display = "none";
    var str = ""
    var sortList = list;

    if(positionCache.lat == undefined)
    {
        navigator.geolocation.getCurrentPosition(function (position) {
            positionCache.lat = position.coords.latitude;
            positionCache.lng = position.coords.longitude;
            sortList.sort(compare);
            for (var i = 0; i < sortList.length; i++) {
                var container = new DOMParser().parseFromString(hospitalListItem, 'text/html');
                container.querySelector('.hospital-name').innerText = sortList[i]['機構名稱'];
                container.querySelector('.hospital-distance').innerText = "距離 " + calcCrow(positionCache.lat, positionCache.lng, sortList[i].lat, sortList[i].lng).toFixed(1) + "公里";
                container.querySelector('.hospital-address').innerText = "地址：" + sortList[i]['機構地址'];
                container.querySelector('.hospital-phone-link').setAttribute('onclick', 'OpenLink("tel:' + sortList[i]["機構電話"] + '")');
                container.querySelector('.hospital-locate-link').setAttribute('onclick', 'OpenLink("geo:' + sortList[i].lat + ',' + sortList[i].lng + '?q=' + sortList[i].lat + ',' + sortList[i].lng + '(' + sortList[i]['機構名稱'] + ')")');
                str += container.querySelector('.hospital-list-item').outerHTML;
            }
            if (isReload)
                document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML = str;
            else
                document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML = document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML + str;
            nowHospitalIndex += sortList.length;
            isLoadingHospital = false;
        },function(e){
            console.log(e);
        },{ 
            enableHighAccuracy: true
        })
    }
    else
    {
        sortList.sort(compare);
        for (var i = 0; i < sortList.length; i++) {
            var container = new DOMParser().parseFromString(hospitalListItem, 'text/html');
            container.querySelector('.hospital-name').innerText = sortList[i]['機構名稱'];
            container.querySelector('.hospital-distance').innerText = "距離 " + calcCrow(positionCache.lat, positionCache.lng, sortList[i].lat, sortList[i].lng).toFixed(1) + "公里";
            container.querySelector('.hospital-address').innerText = "地址：" + sortList[i]['機構地址'];
            container.querySelector('.hospital-phone-link').setAttribute('onclick', 'OpenLink("tel:' + sortList[i]["機構電話"] + '")');
            container.querySelector('.hospital-locate-link').setAttribute('onclick', 'OpenLink("geo:' + sortList[i].lat + ',' + sortList[i].lng + '?q=' + sortList[i].lat + ',' + sortList[i].lng + '(' + sortList[i]['機構名稱'] + ')")');
            str += container.querySelector('.hospital-list-item').outerHTML;
        }
        if (isReload)
            document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML = str;
        else
            document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML = document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML + str;
        nowHospitalIndex += sortList.length;
        isLoadingHospital = false;
    }
    app.ptr.done($hospitalPtrContent);
    function compare(a, b) {
        if (calcCrow(positionCache.lat, positionCache.lng, a.lat, a.lng) < calcCrow(positionCache.lat, positionCache.lng, b.lat, b.lng))
            return -1;
        if (calcCrow(positionCache.lat, positionCache.lng, a.lat, a.lng) > calcCrow(positionCache.lat, positionCache.lng, b.lat, b.lng))
            return 1;
        return 0;
    }
}

var taiwanDistrictJson;
//動物醫院縣市
function initialHospitalFilter(){
    $.get("./TaiwanDistrict.json", function(data){
        taiwanDistrictJson = data;
        var str=""
        str += "<option>全部縣市</option>"
        for(var i = 0; i < taiwanDistrictJson.length; i++){
            str += "<option>" + taiwanDistrictJson[i].city + "</option>";
        }
        document.querySelector('select#city').innerHTML = str;
        OnCiyFilterChanged();
    }, "json")
}

function OnCiyFilterChanged(){
    var city = document.querySelector('select#city').value;
    if(city == "全部縣市")
    {
        document.querySelector(".district-container").innerHTML = "";
        return;
    }
    var cityInfo = $.grep(taiwanDistrictJson, function (e) { return e.city == city; })[0];
    document.querySelector(".district-container").innerHTML = "";
    for (var i = 0; i < cityInfo.area.length; i++){
        document.querySelector(".district-container").innerHTML += '<p> <input type="checkbox" name="district" id="' + cityInfo.area[i]['#text'] + '" data-name="' + cityInfo.area[i]['#text'] + '"/> <label for="' + cityInfo.area[i]['#text'] + '">' + cityInfo.area[i]['#text'] + '</label> </p>';
    }
}

//過濾動物醫院
function ApplyHospitalFilter(){
    var city = document.querySelector('select#city').value;
    var district_input = document.getElementsByName('district');
    var params = "";
    if(city != "全部縣市")
        params = "?縣市_like="+city;
    for(var i = 0; i < district_input.length; i++){
        if(district_input[i].checked)
            params += "&機構地址_like=" + district_input[i].id;
    }
    var isNight = document.querySelector('.night-filter #isNight').checked;
    document.querySelector("[data-page='noob'] #tab-hospital .infinite-scroll-preloader").style.display = "block";
    document.querySelector('[data-page = "noob"] .noob-hospital-list').innerHTML = "";
    LoadHospitalPage(params, 0, isNight, true);
}

function UpdateUserProfile(){
    document.querySelector('[data-page="user-info"] #user-icon').src = userInfo.icon;
    document.querySelector('[data-page="user-info"] #user-email').innerText = "Email：" + userInfo.email;
    document.querySelector('[data-page="user-info"] #user-name').innerText = "會員名稱：" + userInfo.name;
}

function OpenLink(link){
    window.open(link, '_system');
}

function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

//取得樣板

$.get("pages/elements/forum-article-item.html", function (data) {
    forumArticleItemStr = data;
})

var fundraisingUpdateListItem = "";
$.get("pages/elements/fundraising-update-list-item.html", function (data) {
    fundraisingUpdateListItem = data;
})

var tutorialListItem = "";
$.get("pages/elements/noob-tutorial-list-item.html", function (data) {
    tutorialListItem = data;
})

var hospitalListItem = "";
$.get("pages/elements/hospital-list-item.html", function (data) {
    hospitalListItem = data;
})

var donateRecordListItem = "";
$.get("pages/elements/donate-record-list-item.html", function (data) {
    donateRecordListItem = data;
})

function GetForumClassifyName(id){
    if(id == 0)
        return "情報";
    else if(id == 1)
        return "提問";
    else if(id == 2)
        return "送養";
    else
        return "失蹤";
}

function getNowTimeStamp(){
    var date = new Date();
    var timestamp = date.getTime();
    return timestamp;
}

function timedifference(date1, date2) {
    var date3 = Math.abs(date1-date2);   //时间差的毫秒数      

    //------------------------------

    //计算出相差天数
    var days = Math.floor(date3 / (24 * 3600 * 1000))

    //计算出小时数

    var leave1 = date3 % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000))
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000))
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000)

    if(days > 0)
        return days + "天前";
    else if(hours > 0)
        return hours + "小時前";
    else if(minutes > 0)
        return minutes + "分鐘前";
    else
        return seconds + "秒前";
}

function removePage(pageName) {
    pageHistory.pop();
    $$('.page[data-page = "'+pageName+'"]').remove();
}

updatePosition();
var nowPositionDistrict;
function updatePosition() {
    navigator.geolocation.getCurrentPosition(function (position) {
        positionCache.lat = position.coords.latitude;
        positionCache.lng = position.coords.longitude;

        $.get('https://api.opencagedata.com/geocode/v1/json?q=' + position.coords.latitude + '+' + position.coords.longitude + '&key=fec7294f81724e4eb96707e395b4ef03', function (data) {
            // console.log(data.results[0].formatted);
            var newDistrict = "";
            if (data.results[0].components.state_district != undefined)
                newDistrict = data.results[0].components.state_district;
            else if (data.results[0].components.suburb != undefined)
                newDistrict = data.results[0].components.suburb;
            else if (data.results[0].components.town != undefined)
                newDistrict = data.results[0].components.town;
            else if (data.results[0].components.hamlet != undefined)
                newDistrict = data.results[0].components.hamlet;
            else if (data.results[0].components.city != undefined)
                newDistrict = data.results[0].components.city;

            console.log("now position = " + newDistrict);
            if (FCMPlugin != undefined && newDistrict != "") {
                if (nowPositionDistrict == undefined) {
                    nowPositionDistrict = newDistrict;
                    FCMPlugin.subscribeToTopic(nowPositionDistrict);
                    console.log('subscribe for ' + nowPositionDistrict);
                }
                else if(nowPositionDistrict != newDistrict)
                {
                    FCMPlugin.unsubscribeFromTopic(nowPositionDistrict);
                    nowPositionDistrict = newDistrict;
                    FCMPlugin.subscribeToTopic(nowPositionDistrict);
                    console.log('subscribe for ' + nowPositionDistrict);
                }                
            }
        });
    }, function (e) {
        console.log(e);
    }, {
        enableHighAccuracy: true
    })
}
setInterval("updatePosition()", 10000);

function OpenMidWayApplication(){
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSd2rOIGhgNrQRa_QFv-mrudGuSKC0n65MNPREE677Mj0Pa2_w/viewform?fbclid=IwAR1g9vDJFgTu6n5i-8w710upCEScrgjAobxZeIq653yj59yths-qCrGdmQA', "_system");
}

var mainView = app.views.create('.view-main',{stackPages: true});
var forumView = app.views.create('#forum-tab', { stackPages: true });
var helpView = app.views.create('#help-tab', { stackPages: true });
var fundraisingView = app.views.create('#fundraising-tab', { stackPages: true });
var chatroomView = app.views.create('#chatroom-tab', { stackPages: true });
var noobView = app.views.create('#noob-tab', { stackPages: true });
var myPostView = app.views.create('#my-post-tab', { stackPages: true });
var userInfoView = app.views.create('#user-info-tab', { stackPages: true });
app.init();
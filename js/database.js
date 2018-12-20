// Initialize Firebase
var config = {
    apiKey: "AIzaSyBRaj6larr7ZIGY2HjOKr3JSJQyzJvM6U4",
    authDomain: "meowmeow-31087.firebaseapp.com",
    databaseURL: "https://meowmeow-31087.firebaseio.com",
    projectId: "meowmeow-31087",
    storageBucket: "meowmeow-31087.appspot.com",
    messagingSenderId: "673098408642"
};
firebase.initializeApp(config);


var database = firebase.database();

function GetPicShareList(timestamp, callback){
    if(timestamp == -1)
    {
        var date = new Date();
        timestamp = date.getTime();
    } 
    // console.log(timestamp);
    database.ref('Pic-Share').orderByChild('time').endAt(timestamp).limitToLast(10).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(snapshot.val());
    })
}

function GetUserIcon(username, callback){
    database.ref('Users').orderByChild('Name').equalTo(username).once('value', function(snapshot){
        var list = snapshot.val();
        for(i in list)
        {
            // console.log(list[i].Icon);
            callback(username, list[i].Icon);
            break;
        }
    })
}

function GetPicShareArticle(index, callback){
    database.ref('Pic-Share/'+index).once('value', function(snapshot){
        callback(snapshot.val());
    });
}

function NewPicShareArticle(uid, content, img, callback){
    var date = new Date();
    var time = date.getTime();
    var article = {
        poster: uid,
        content: content,
        img: img,
        time: time
    }
    // console.log(JSON.parse(article));

    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/Pic-Share/' + newPostKey] = article;
    updates['/Users/' + uid + '/Pic-Share-Posts/' + newPostKey] = article;

    database.ref().update(updates,function(error){
        if(error)
        {
            console.log(error);
        }
        else
        {
            callback(newPostKey);
        }
    });
}

function NewPicShareCommentPost(uid, key, content, callback){
    var date = new Date();
    var time = date.getTime();
    var article = {
        poster: uid,
        content: content,
        time: time
    }
    console.log(uid);
    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/Pic-Share/' + key + "/comments/" + newPostKey] = article;
    updates['/Users/' + uid + '/Pic-Share-Comments/' + key + '/' + newPostKey] = article;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback(key);
        }
    });
}

function GetUserInfo(uid, callback) {
    database.ref('Users/'+ uid).once('value', function(snapshot){
        // console.log(snapshot.val());
        callback(snapshot.val(), uid);
    });
}

function GetMidWayInfo(uid, callback) {
    database.ref('Midway/' + uid).once('value', function (snapshot) {
        // console.log(snapshot.val());
        callback(snapshot.val());
    });
}

function LikePicShare(key, callback){
    if(!isLogin())
        return;

    var uid = userInfo.uid;
    var updates = {};
    updates['/Pic-Share/' + key + "/likes/" + uid] = true;
    updates['/Users/' + uid + '/Pic-Share-Likes/' + key] = true;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

function CancelLikePicShare(key, callback){
    if (!isLogin())
        return;

    var uid = userInfo.uid;
    var updates = {};
    updates['/Pic-Share/' + key + "/likes/" + uid] = null;
    updates['/Users/' + uid + '/Pic-Share-Likes/' + key] = null;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

function LikeForum(key, callback) {
    if (!isLogin())
        return;

    var uid = userInfo.uid;
    var updates = {};
    updates['/Forum/' + key + "/likes/" + uid] = true;
    updates['/Users/' + uid + '/Forum-Likes/' + key] = true;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

function CancelLikeForum(key, callback) {
    if (!isLogin())
        return;

    var uid = userInfo.uid;
    var updates = {};
    updates['/Forum/' + key + "/likes/" + uid] = null;
    updates['/Users/' + uid + '/Forum-Likes/' + key] = null;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

function LikeHelp(key, callback) {
    if (!isLogin())
        return;

    var uid = userInfo.uid;
    var updates = {};
    updates['/Help/' + key + "/likes/" + uid] = true;
    updates['/Users/' + uid + '/Help-Likes/' + key] = true;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

function CancelLikeHelp(key, callback) {
    if (!isLogin())
        return;

    var uid = userInfo.uid;
    var updates = {};
    updates['/Help/' + key + "/likes/" + uid] = null;
    updates['/Users/' + uid + '/Help-Likes/' + key] = null;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

function GetForumArticleList(classify, callback) {
    database.ref('Forum').orderByChild('classify').equalTo(classify.toString()).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(list);
    })
}

function GetForumArticle(index, callback) {
    database.ref('Forum/' + index).once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function NewForumArticle(uid, title, content, classify, img, callback) {
    var date = new Date();
    var time = date.getTime();
    var article = {
        poster: uid,
        title: title,
        content: content,
        time: time,
        img: img,
        classify: classify.toString()
    }
    // console.log(JSON.parse(article));

    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/Forum/' + newPostKey] = article;
    updates['/Users/' + uid + '/Forum-Posts/' + newPostKey] = article;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback(newPostKey);
        }
    });
}

function NewForumCommentPost(uid, key, content, callback) {
    var date = new Date();
    var time = date.getTime();
    var article = {
        poster: uid,
        content: content,
        time: time
    }
    console.log(uid);
    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/Forum/' + key + "/comments/" + newPostKey] = article;
    updates['/Users/' + uid + '/Forum-Comments/' + key + '/' + newPostKey] = article;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback(key);
        }
    });
}

function GetForumListOfUser(uid, callback){
    database.ref('Forum').orderByChild('poster').equalTo(uid).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(list);
    });
}

function GetPicShareListOfUser(uid, callback) {
    database.ref('Pic-Share').orderByChild('poster').equalTo(uid).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(list);
    });
}

function GetHelpListOfUser(uid, callback) {
    database.ref('Help').orderByChild('poster').equalTo(uid).once('value', function (snapshot) {
        var list = snapshot.val();
        console.log(list);
        callback(list);
    });
}

function OrderByTime(list){
    var sortList = Object.values(list);
    function compare(a, b) {
        if (a.time < b.time)
            return -1;
        if (a.time > b.time)
            return 1;
        return 0;
    }
    sortList = sortList.sort(compare);
    return sortList;
}

function GetHelpList(timestamp, callback) {
    if (timestamp == -1) {
        var date = new Date();
        timestamp = date.getTime();
    }
    // console.log(timestamp);
    database.ref('Help').orderByChild('time').endAt(timestamp).limitToLast(10).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(snapshot.val());
    })
}

function GetHelpArticle(index, callback) {
    database.ref('Help/' + index).once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function NewHelpArticle(uid, content, img, emergency, position_name, position, callback) {
    var date = new Date();
    var time = date.getTime();
    var article = {
        poster: uid,
        content: content,
        emergency: emergency,
        position_name: position_name,
        position: position,
        district: nowClickedPositionDistrict,
        img: img,
        time: time
    }
    // console.log(JSON.parse(article));

    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/Help/' + newPostKey] = article;
    updates['/Users/' + uid + '/Help-Posts/' + newPostKey] = article;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback(newPostKey);
        }
    });
}

function NewHelpCommentPost(uid, key, content, callback) {
    var date = new Date();
    var time = date.getTime();
    var article = {
        poster: uid,
        content: content,
        time: time
    }
    console.log(uid);
    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/Help/' + key + "/comments/" + newPostKey] = article;
    updates['/Users/' + uid + '/Help-Comments/' + key + '/' + newPostKey] = article;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback(key);
        }
    });
}

function GetFundraisingList(timestamp, callback) {
    if (timestamp == -1) {
        var date = new Date();
        timestamp = date.getTime();
    }
    // console.log(timestamp);
    database.ref('Fundraising').orderByChild('time').endAt(timestamp).limitToLast(10).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(snapshot.val());
    })
}

function GetFundraisingArticle(index, callback) {
    database.ref('Fundraising/' + index).once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function GetFundraisingUpdate(index, updateIndex,callback) {
    database.ref('Fundraising/' + index + "/updates/" + updateIndex).once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function SaveDonateRequest(info, callback){
    var data = info;
    data['finishPay'] = false;
    var updates = {};
    updates['/Users/' + userInfo.uid + '/donates/' + data.tradeNo] = data;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback(data.tradeNo);
        }
    });
}

function GetDonatePaymentContent(index, callback){
    database.ref('Users/' + userInfo.uid + "/donates/" + index).once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function GetChatroomList(callback) {
    database.ref('Chatroom/' + userInfo.uid).once('value', function (snapshot) {
        var list = snapshot.val();
        callback(snapshot.val());
    })
}

function GetDonateRecordsOfUser(uid, callback){
    database.ref('Users/' + userInfo.uid + "/donates").once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function GetChatroomMessage(targetUser, callback) {
    database.ref('Chatroom/' + userInfo.uid + "/" + targetUser).once('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function ReportHelp(forumIndex){
    app.dialog.confirm("確定要回報救援完成嗎？", function(){
        app.dialog.preloader('回報中');
        var updates = {};

        updates['/Help/' + forumIndex + "/isSaved"] = true;

        database.ref().update(updates, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                app.dialog.close();
                LoadHelpContent(forumIndex);
                app.dialog.alert("回報完成，感謝您的幫助！");
            }
        });
    })
}

function SendMessage(targetUser, content, callback)
{
    var time = getNowTimeStamp();

    var messageData = {
        poster: userInfo.uid,
        content: content,
        time: time
    }

    var updates = {};

    var newPostKey = firebase.database().ref().child('Chatroom/' + userInfo.uid + '/' + targetUser).push().key;
    updates['/Chatroom/' + userInfo.uid + '/' + targetUser + "/" + newPostKey] = messageData;
    updates['/Chatroom/' + targetUser + '/' + userInfo.uid + "/" + newPostKey] = messageData;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}


var jsonServer = "http://140.127.220.111:3001/hospital";
var hospitalCache;
function GetHospitalList(params, index, callback){
    console.log(jsonServer + params);
    console.log('get hospital');
    // var data = null;

    // var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;
    // xhr.responseType = "json";
    // xhr.addEventListener("readystatechange", function () {
    //     if (this.readyState === 4) {
    //         var data = this.response;
    //         console.log(data.length);
    //         navigator.geolocation.getCurrentPosition(function (position) {
    //             var lat = position.coords.latitude;
    //             var lng = position.coords.longitude;
    //             var sortList = data;
    //             function compare(a, b) {
    //                 if (calcCrow(lat, lng, a.lat, a.lng) < calcCrow(lat, lng, b.lat, b.lng))
    //                     return -1;
    //                 if (calcCrow(lat, lng, a.lat, a.lng) > calcCrow(lat, lng, b.lat, b.lng))
    //                     return 1;
    //                 return 0;
    //             }
    //             sortList.sort(compare);
    //             hospitalCache = sortList;
    //             sortList = sortList.slice(index, index + 20);
    //             callback(sortList);
    //         })
    //     }
    // });

    // xhr.open("GET", jsonServer + params);
    // xhr.setRequestHeader("cache-control", "no-cache");
    // xhr.setRequestHeader("postman-token", "d76e5f48-395e-c8b1-0a3b-b127c1003ee3");

    // xhr.send(data);
    $.get(encodeURI(jsonServer + params), function(data){
        console.log(data.length);
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var sortList = data;
            function compare(a, b) {
                if (calcCrow(lat, lng, a.lat, a.lng) < calcCrow(lat, lng, b.lat, b.lng))
                    return -1;
                if (calcCrow(lat, lng, a.lat, a.lng) > calcCrow(lat, lng, b.lat, b.lng))
                    return 1;
                return 0;
            }
            sortList.sort(compare);
            hospitalCache = sortList;
            sortList = sortList.slice(index, index + 20);
            callback(sortList);
        })
    }, "json")
}

var jsonServerNight = "http://140.127.220.111:3001/nighthospital";
function GetNightHospitalList(params, index, callback) {
    console.log(jsonServerNight + params);

    $.get(encodeURI(jsonServerNight + params), function (data) {
        console.log(data.length);
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var sortList = data;
            function compare(a, b) {
                if (calcCrow(lat, lng, a.lat, a.lng) < calcCrow(lat, lng, b.lat, b.lng))
                    return -1;
                if (calcCrow(lat, lng, a.lat, a.lng) > calcCrow(lat, lng, b.lat, b.lng))
                    return 1;
                return 0;
            }
            sortList.sort(compare);
            hospitalCache = sortList;
            sortList = sortList.slice(index, index + 20);
            callback(sortList);
        })
    }, "json")
}

function listenChatroom(targetUser){
    database.ref('Chatroom/' + userInfo.uid + "/" + targetUser).on('value', function(snapshot){
        LoadChatroomContent(targetUser);
    });
}
function stopListenChatroom(targetUser){
    database.ref('Chatroom/' + userInfo.uid + "/" + targetUser).off('value');
}

function SetUserIcon(uid, newIconLink, callback) {
    var updates = {};
    updates['/Users/' + uid + '/icon'] = newIconLink;

    database.ref().update(updates, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            callback();
        }
    });
}

var isFirstInitialHelpListener = true;
var helpArticleNameCache = [];
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
                if(positionCache.lat != undefined)
                {
                    if(list[i].poster == userInfo.uid)
                        continue;
                    var lat = list[i].position.lat;
                    var lng = list[i].position.lng;
                    var distance = calcCrow(lat, lng, positionCache.lat, positionCache.lng);
                    if(distance <= 0.5)
                    {
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
var auth = firebase.auth();
var userInfo = {};
var default_user_icon = "img/user-icon.png";
var waitForLoginScreen = false;


function LoginWithLocalStorage(){
    var email = window.localStorage.getItem("userEmail");
    var password = window.localStorage.getItem("userPassword");
    if(email != null && password != null)
        loginWithEmail(email, password);
}

function OpenSignUpScreen(){
    signUpScreen.open(true);
}

function OnLoginButtonClicked(){
    var email = document.querySelector("#login-email").value;
    var password = document.querySelector("#login-password").value;
    loginWithEmail(email, password);
}

function OnSignUpButtonClicked(){
    var email = document.querySelector("#signup-email").value;
    var name = document.querySelector("#signup-name").value;
    var password = document.querySelector("#signup-password").value;
    var password_check = document.querySelector("#signup-password-check").value;
    console.log(email);
    signUpWithEmail(email, name, password, password_check);
}

function signUpWithEmail(email, name, password, password_check)
{
    if(password != password_check)
    {
        app.toast.create({
            text: "兩次密碼輸入不相同",
            closeTimeout: 2000,
        }).open();
    }
    else
    {
        app.dialog.preloader('註冊中...');
        var isSuccess = true;
        auth.createUserWithEmailAndPassword(email, password)
        .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            isSuccess = false;
        })
        .then(function (data) {
            console.log(data);
            var user = data.user;
            if(!isSuccess)
            {
                app.toast.create({
                    text: '註冊失敗，我也不知道為啥 ',
                    closeTimeout: 2000,
                }).open();
            }
            else
            {
                var newUserInfo = {
                    email: email,
                    name: name,
                    icon: default_user_icon
                }
                var updates = {};
                updates['/Users/' + user.uid] = newUserInfo;
                database.ref().update(updates, function (error) {
                    app.toast.create({
                        text: '註冊成功 ' + newUserInfo.name + " 以此帳號登入",
                        closeTimeout: 2000,
                    }).open();
                    app.dialog.close();
                    window.localStorage.setItem("userEmail", email);
                    window.localStorage.setItem("userPassword", password);
                })
            }
            
        })
    }
}

function loginWithEmail(email, password){
    app.dialog.preloader("登入中...");

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function () {
            return firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function (data) {
                    var user = data.user;
                    var uid = user.uid;
                    console.log("登入成功 " + user.email);
                    loginScreen.close();
                    window.localStorage.setItem("userEmail", email);
                    window.localStorage.setItem("userPassword", password);
                })
                .catch(function (error) {
                    app.dialog.close();
                    console.log(error)
                    app.toast.create({
                        text: "登入失敗",
                        closeTimeout: 2000
                    }).open();
                });
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
        });
}

function isLogin() {
    var user = firebase.auth().currentUser;
    if (user != null) {
        return true;
    } else {
        return false;
    }
}

firebase.auth().onAuthStateChanged(function (user) {
    console.log("changeState");
    if (user) {
        if(loginScreen != undefined)
            loginScreen.close();
        if(signUpScreen != undefined)
            signUpScreen.close();

        initialHospitalFilter();
        LoadHospitalPage("", 0, false, true);
        userInfo.uid = user.uid;
        GetUserInfo(userInfo.uid, function (data) {
            console.log(data);
            userInfo.name = data.name;
            userInfo.icon = data.icon;
            userInfo.email = data.email;
            app.toast.create({
                text: '歡迎回來 ' + userInfo.name,
                closeTimeout: 2000,
            }).open();
            console.log("登入成功 " + data.Name);
            app.dialog.close();
            loadPicSharePage(-1, true);
            document.querySelector(".panel-left .list li .side-panel-icon").src = data.icon;
            document.querySelector("#side-panel-user-name").innerText = data.name;
            document.querySelector('[data-page="user-info"] .user-info-mid #user-name').innerText = "會員名稱：" + data.name;
            document.querySelector('[data-page="user-info"] .user-info-mid #user-email').innerText = "Email" + data.email;
            // initialFCM(userInfo.uid);
            UpdateUserProfile();
        });

    } else {
        if(loginScreen != undefined)
        {
            if (window.localStorage.getItem("userEmail") == null)
                loginScreen.open(true);
        }
        else
            waitForLoginScreen = true;
    }
});

function signOut(){
    app.dialog.preloader('登出中');
    window.localStorage.removeItem("userEmail");
    window.localStorage.removeItem("userPassword");
    var uid = userInfo.uid;
    FCMPlugin.subscribeToTopic(uid);
    auth.signOut().then(function () {
        app.dialog.close();
    })
    .catch(function (error) {
        // An error happened
    });
}

function initialFCM(uid){

    if(FCMPlugin == undefined)
    {
        setTimeout("initialFCM("+uid+")", 1000);
        return;
    }
    FCMPlugin.subscribeToTopic('all');
    FCMPlugin.subscribeToTopic(uid);
    FCMPlugin.onNotification(function (data) {
        console.log('receive data');
        app.dialog.alert('receive data');
        if (data.wasTapped) {
            //Notification was received on device tray and tapped by the user.
            alert(JSON.stringify(data));
        } else {
            //Notification was received in foreground. Maybe the user needs to be notified.
            alert(JSON.stringify(data));
        }
    });
}
var nowChooseFundraising;
var nowChooseFundraisingName;

//捐款
function donate(){
    app.dialog.preloader('產生繳費代碼中...');

    var targetFundraising = nowChooseFundraising;
    var targetFundraisingName = nowChooseFundraisingName;
    var totalAmount = document.querySelector('[data-page="select-payment"] #totalAmount').value;
    var address = document.querySelector('[data-page="select-payment"] #address').value;
    var paymentMethod = document.querySelector('[data-page="select-payment"] #payment_method').value;

    var url;
    var CVS_Type;

    var targetURL = ""
    var code = "";
    //確認付款類型
    if(paymentMethod == "CVS")
    {   //超商付款
        CVS_Type = document.querySelector('[data-page="select-payment"] #CVS_Type').value;
        url = "http://140.127.220.111/donatecvs?targetFundraisingKey=" + targetFundraising + "&targetFundraisingName=" + targetFundraisingName + "&totalAmount=" + totalAmount + "&sponsor=" + userInfo.uid + "&cvs_type=" + CVS_Type + "&address=" + address;
        targetURL = "https://payment.ecpay.com.tw/PaymentRule/CVSPaymentInfo";
        if(CVS_Type == "ibon")
            code = "(function(){var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > b').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var qr = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > div > div:nth-child(2) > div:nth-child(3) > img').src;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, qr: qr, totalAmount: totalAmount };return data;})()";
        else
            code = "(function(){var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > b').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, totalAmount: totalAmount };return data;})()";
    }
    else
    {   //ATM繳費
        url = "http://140.127.220.111/donateatm?targetFundraisingKey=" + targetFundraising + "&targetFundraisingName=" + targetFundraisingName + "&totalAmount=" + totalAmount + "&sponsor=" + userInfo.uid + "&address=" + address;
        targetURL = "https://payment.ecpay.com.tw/PaymentRule/ATMPaymentInfo";
        code = "(function(){var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var itemName = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText;var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var bank = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var obj={tradeNo: tradeNo, itemName: itemName, totalAmount: totalAmount, bank: bank, paymentNo: paymentNo, expireDate: expireDate};return obj;})()";
    }

    //以Inappbrowser進入Server端提供的網頁接口，並等待綠界重新導向
    var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,hidden=yes');


    ref.addEventListener('loadstop', function (event) {
        console.log(event.url);
        if (event.url == targetURL) {
            //綠界重新導向完成後，抓取網頁回傳資料並儲存進資料庫
            console.log('finish redirect');
            ref.executeScript({ code: code }, function (data) {
                // app.dialog.close();
                var obj = data[0];
                obj['targetFundraising'] = targetFundraising;
                obj['itemName'] = targetFundraisingName;
                obj['paymentMethod'] = paymentMethod;
                obj['finishPay'] = false;
                if (paymentMethod == "CVS")
                    obj['CVS_Type'] = CVS_Type;
                console.log(JSON.stringify(obj));
                ref.close();
                SaveDonateRequest(obj, function (tradeNo) {
                    console.log('finish save data');
                    app.dialog.close();
                    pageHistory.pop();
                    $$('.page[data-page = "select-payment"]').remove();
                    fundraisingView.router.navigate('/donate-payment-content/?index=' + tradeNo);
                })
            });
        }
    });
}

function OnPaymentMethodChange(){
    var method =this.value;
    if(method == "CVS")
        document.querySelector('[data-page="select-payment"] #CVS_Type_Container').style.display = "block";
    else
        document.querySelector('[data-page="select-payment"] #CVS_Type_Container').style.display = "none";
}
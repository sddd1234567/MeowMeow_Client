var nowChooseFundraising;
var nowChooseFundraisingName;

function donateTest(targetFundraising, targetFundraisingName, totalAmount, sponsor) {
    app.dialog.preloader('產生繳費代碼中...');
    var url = "http://140.127.220.111/donate?targetFundraisingKey="+targetFundraising+"&targetFundraisingName="+targetFundraisingName+"&totalAmount="+totalAmount+"&sponsor="+userInfo.uid;
    var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,hidden=yes');

    ref.addEventListener('loadstop', function(event){
        console.log(event.url);
        if (event.url == "https://payment-stage.ecpay.com.tw/PaymentRule/CVSPaymentInfo")
        {
            console.log('finish redirect');
            var code = "(function(){var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > b').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var qr = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > div > div:nth-child(2) > div:nth-child(3) > img').src;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, qr: qr, totalAmount: totalAmount };return data;})()";
            ref.executeScript({ code: code }, function (data) {
                app.dialog.close();
                var obj = data[0]
                obj['targetFundraising'] = targetFundraising;
                obj['itemName'] = targetFundraisingName;
                console.log(JSON.stringify(obj));
                ref.close();
                SaveDonateRequest(obj,function(tradeNo){
                    console.log('finish save data');
                    fundraisingView.router.navigate('/donate-payment-content/?index=' + tradeNo);
                })
            });
        }
    });
}

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
    if(paymentMethod == "CVS")
    {
        CVS_Type = document.querySelector('[data-page="select-payment"] #CVS_Type').value;
        url = "http://140.127.220.111/donatecvs?targetFundraisingKey=" + targetFundraising + "&targetFundraisingName=" + targetFundraisingName + "&totalAmount=" + totalAmount + "&sponsor=" + userInfo.uid + "&cvs_type=" + CVS_Type + "&address=" + address;
        targetURL = "https://payment.ecpay.com.tw/PaymentRule/CVSPaymentInfo";
        if(CVS_Type == "ibon")
            code = "(function(){var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > b').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var qr = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > div > div:nth-child(2) > div:nth-child(3) > img').src;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, qr: qr, totalAmount: totalAmount };return data;})()";
        else
            code = "(function(){var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > b').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, totalAmount: totalAmount };return data;})()";
    }
    else
    {
        url = "http://140.127.220.111/donateatm?targetFundraisingKey=" + targetFundraising + "&targetFundraisingName=" + targetFundraisingName + "&totalAmount=" + totalAmount + "&sponsor=" + userInfo.uid + "&address=" + address;
        targetURL = "https://payment.ecpay.com.tw/PaymentRule/ATMPaymentInfo";
        code = "(function(){var tradeNo = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var itemName = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText;var totalAmount = document.querySelector('body > div.wrapper > div > div:nth-child(1) > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var bank = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText;var paymentNo = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText;var expireDate = document.querySelector('body > div.wrapper > div > div.Box.Box_2 > section > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;var obj={tradeNo: tradeNo, itemName: itemName, totalAmount: totalAmount, bank: bank, paymentNo: paymentNo, expireDate: expireDate};return obj;})()";
    }
    var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,hidden=yes');


    ref.addEventListener('loadstop', function (event) {
        console.log(event.url);
        if (event.url == targetURL) {
            console.log('finish redirect');
            ref.executeScript({ code: code }, function (data) {
                // app.dialog.close();
                var obj = data[0]
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
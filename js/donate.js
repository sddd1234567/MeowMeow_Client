var nowChooseFundraising;
var nowChooseFundraisingName;

//捐款
function donate() {
  app.dialog.preloader("產生繳費代碼中...");

  var targetFundraising = nowChooseFundraising;
  var targetFundraisingName = nowChooseFundraisingName;
  var totalAmount = document.querySelector(
    '[data-page="select-payment"] #totalAmount'
  ).value;
  var address = document.querySelector('[data-page="select-payment"] #address')
    .value;
  var paymentMethod = document.querySelector(
    '[data-page="select-payment"] #payment_method'
  ).value;

  var url;
  var CVS_Type;

  var targetURL = "";
  var code = "";

  if (totalAmount < 50) {
    app.dialog.close();
    app.dialog.alert("捐款金額不得小於50");
    return;
  }

  //確認付款類型
  if (paymentMethod == "CVS") {
    //超商付款
    CVS_Type = document.querySelector('[data-page="select-payment"] #CVS_Type')
      .value;
    url =
      "http://3.17.5.241/donatecvs?targetFundraisingKey=" +
      targetFundraising +
      "&targetFundraisingName=" +
      targetFundraisingName +
      "&totalAmount=" +
      totalAmount +
      "&sponsor=" +
      userInfo.uid +
      "&cvs_type=" +
      CVS_Type +
      "&address=" +
      address;
    targetURL = "https://payment.ecpay.com.tw/PaymentRule/CVSPaymentInfo";
    if (CVS_Type == "ibon")
      code =
        "(function(){var totalAmount = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div.o-info-2 > div:nth-child(2) > dl:nth-child(2) > dd.o-pd-total').innerText;var tradeNo = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div:nth-child(4) > dl:nth-child(1) > dd').innerText;var paymentNo = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div:nth-child(6) > dl:nth-child(1) > dd > span').innerText;var expireDate = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div:nth-child(6) > dl:nth-child(2) > dd').innerText;var qr = document.querySelector('body > div.site-body > div.site-content-wrapper.scw-gray.member-pay-wrap > div > form > div > div.pay-tab-wrapper.ptw-no-op > div.pay-tab-content > div.pay-tab1.printContainer > div > div > img').src;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, qr: qr, totalAmount: totalAmount };return data;})()";
    else
      code =
        "(function(){var totalAmount = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div.o-info-2 > div:nth-child(2) > dl:nth-child(2) > dd.o-pd-total').innerText;var tradeNo = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div:nth-child(4) > dl:nth-child(1) > dd').innerText;var paymentNo = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div:nth-child(6) > dl:nth-child(1) > dd > span').innerText;var expireDate = document.querySelector('body > div.site-body > div.site-content-wrapper.printContainer > div > div:nth-child(6) > dl:nth-child(2) > dd').innerText;var data = { tradeNo: tradeNo, paymentNo: paymentNo, expireDate: expireDate, totalAmount: totalAmount };return data;})()";
  } else {
    //ATM繳費
    url =
      "http://3.17.5.241/donateatm?targetFundraisingKey=" +
      targetFundraising +
      "&targetFundraisingName=" +
      targetFundraisingName +
      "&totalAmount=" +
      totalAmount +
      "&sponsor=" +
      userInfo.uid +
      "&address=" +
      address;
    targetURL = "https://payment.ecpay.com.tw/PaymentRule/ATMPaymentInfo";
    code =
      "(function(){var paymentNo = document.querySelector('body > div.site-body.printContainer > div.site-content-wrapper > div > div:nth-child(6) > dl:nth-child(1) > dd > p:nth-child(2)').innerText;var itemName = document.querySelector('body > div.site-body.printContainer > div.site-content-wrapper > div > div.o-info-2 > div:nth-child(2) > dl:nth-child(2) > dd.o-pd-name').innerText;var totalAmount = document.querySelector('body > div.site-body.printContainer > div.site-content-wrapper > div > div.o-info-2 > div:nth-child(2) > dl:nth-child(2) > dd.o-pd-total').innerText;var bank = document.querySelector('body > div.site-body.printContainer > div.site-content-wrapper > div > div:nth-child(6) > dl:nth-child(1) > dd > p:nth-child(1)').innerText;var tradeNo = document.querySelector('body > div.site-body.printContainer > div.site-content-wrapper > div > div:nth-child(4) > dl:nth-child(1) > dd').innerText;var expireDate = document.querySelector('body > div.site-body.printContainer > div.site-content-wrapper > div > div:nth-child(6) > dl:nth-child(2) > dd').innerText;var obj={tradeNo: tradeNo, itemName: itemName, totalAmount: totalAmount, bank: bank, paymentNo: paymentNo.substr(3), expireDate: expireDate};return obj;})()";
  }

  //以Inappbrowser進入Server端提供的網頁接口，並等待綠界重新導向
  console.log(url);
  var ref = cordova.InAppBrowser.open(url, "_blank", "location=yes,hidden=yes");

  ref.addEventListener("loadstop", function(event) {
    console.log(event.url, targetURL);
    if (event.url == targetURL) {
      //綠界重新導向完成後，抓取網頁回傳資料並儲存進資料庫
      console.log("finish redirect");
      ref.executeScript({ code: code }, function(data) {
        // app.dialog.close();
        console.log("finish execute script", data);
        var obj = data[0];
        obj["targetFundraising"] = targetFundraising;
        obj["itemName"] = targetFundraisingName;
        obj["paymentMethod"] = paymentMethod;
        obj["finishPay"] = false;
        obj["expireDate"] = obj["expireDate"].split("\n")[0];
        if (paymentMethod == "CVS") obj["CVS_Type"] = CVS_Type;
        console.log(JSON.stringify(obj));
        ref.close();
        SaveDonateRequest(obj, function(tradeNo) {
          console.log("finish save data");
          app.dialog.close();
          pageHistory.pop();
          $$('.page[data-page = "select-payment"]').remove();
          fundraisingView.router.navigate(
            "/donate-payment-content/?index=" + tradeNo
          );
        });
      });
    }
  });
}

function OnPaymentMethodChange(target) {
  var method = target.value;
  console.log(method);
  if (method == "CVS")
    document.querySelector(
      '[data-page="select-payment"] #CVS_Type_Container'
    ).style.display = "block";
  else
    document.querySelector(
      '[data-page="select-payment"] #CVS_Type_Container'
    ).style.display = "none";
}

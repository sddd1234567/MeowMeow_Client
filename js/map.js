var nowClickedPosition;
var nowClickedPositionName;
var nowClickedPositionDistrict;
function initNewHelpMap() {
  console.log("start init map");
  app.dialog.preloader("載入地圖...");
  if (positionCache.lat == undefined) {
    console.log("positioncache undefined");
    cordova.plugins.diagnostic.isGpsLocationEnabled(enabled => {
      console.log(enabled);
      if (!enabled) {
        onError();
        return;
      }
      console.log("location enabled");
      navigator.geolocation.getCurrentPosition(
        function(position) {
          console.log("success");
          console.log(position.coords);
          nowClickedPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var map;
          map = L.map("map").setView(
            [position.coords.latitude, position.coords.longitude],
            18
          );
          // $.get('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, function (data) {
          //     nowClickedPositionName = data.display_name;
          //     document.querySelector("[data-page='new-help'] #position").value = data.display_name;
          // });
          console.log(
            "https://api.opencagedata.com/geocode/v1/json?q=" +
              position.coords.latitude +
              "+" +
              position.coords.longitude +
              "&key=fec7294f81724e4eb96707e395b4ef03"
          );
          $.get(
            "https://api.opencagedata.com/geocode/v1/json?q=" +
              position.coords.latitude +
              "+" +
              position.coords.longitude +
              "&key=fec7294f81724e4eb96707e395b4ef03",
            function(data) {
              nowClickedPositionName = data.results[0].formatted;
              console.log(data.results[0].formatted);
              if (data.results[0].components.state_district != undefined)
                nowClickedPositionDistrict =
                  data.results[0].components.state_district;
              else if (data.results[0].components.suburb != undefined)
                nowClickedPositionDistrict = data.results[0].components.suburb;
              else if (data.results[0].components.town != undefined)
                nowClickedPositionDistrict = data.results[0].components.town;
              else if (data.results[0].components.hamlet != undefined)
                nowClickedPositionDistrict = data.results[0].components.hamlet;
              else if (data.results[0].components.city != undefined)
                nowClickedPositionDistrict = data.results[0].components.city;

              console.log(nowClickedPositionDistrict);
              document.querySelector(
                "[data-page='new-help'] #position"
              ).value = nowClickedPositionName;
            }
          );
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18
          }).addTo(map);

          var marker = L.marker([
            position.coords.latitude,
            position.coords.longitude
          ]);
          marker.addTo(map);

          function onMapClick(e) {
            nowClickedPosition = e.latlng;
            marker.setLatLng(e.latlng);
            // 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + e.latlng.lat + '&lon=' + e.latlng.lng,
            $.get(
              "https://api.opencagedata.com/geocode/v1/json?q=" +
                e.latlng.lat +
                "+" +
                e.latlng.lng +
                "&key=fec7294f81724e4eb96707e395b4ef03",
              function(data) {
                nowClickedPositionName = data.results[0].formatted;
                console.log(data.results[0].formatted);
                if (data.results[0].components.state_district != undefined)
                  nowClickedPositionDistrict =
                    data.results[0].components.state_district;
                else if (data.results[0].components.suburb != undefined)
                  nowClickedPositionDistrict =
                    data.results[0].components.suburb;
                else if (data.results[0].components.town != undefined)
                  nowClickedPositionDistrict = data.results[0].components.town;
                else if (data.results[0].components.hamlet != undefined)
                  nowClickedPositionDistrict =
                    data.results[0].components.hamlet;
                else if (data.results[0].components.city != undefined)
                  nowClickedPositionDistrict = data.results[0].components.city;

                console.log(nowClickedPositionDistrict);
                document.querySelector(
                  "[data-page='new-help'] #position"
                ).value = nowClickedPositionName;
              }
            );
          }
          map.on("click", onMapClick);
          app.dialog.close();
        },
        onError,
        () => {
          console.log("position error");
          onError();
        },
        {
          // enableHighAccuracy: true,
          // timeout: 2000
        }
      );
    });
  } else {
    console.log("position cache = ", positionCache.lat);
    nowClickedPosition = { lat: positionCache.lat, lng: positionCache.lng };
    var map;
    map = L.map("map").setView([positionCache.lat, positionCache.lng], 18);
    // $.get('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, function (data) {
    //     nowClickedPositionName = data.display_name;
    //     document.querySelector("[data-page='new-help'] #position").value = data.display_name;
    // });
    console.log(
      "https://api.opencagedata.com/geocode/v1/json?q=" +
        positionCache.lat +
        "+" +
        positionCache.lng +
        "&key=fec7294f81724e4eb96707e395b4ef03"
    );
    $.get(
      "https://api.opencagedata.com/geocode/v1/json?q=" +
        positionCache.lat +
        "+" +
        positionCache.lng +
        "&key=fec7294f81724e4eb96707e395b4ef03",
      function(data) {
        nowClickedPositionName = data.results[0].formatted;
        console.log(data.results[0].formatted);
        if (data.results[0].components.state_district != undefined)
          nowClickedPositionDistrict =
            data.results[0].components.state_district;
        else if (data.results[0].components.suburb != undefined)
          nowClickedPositionDistrict = data.results[0].components.suburb;
        else if (data.results[0].components.town != undefined)
          nowClickedPositionDistrict = data.results[0].components.town;
        else if (data.results[0].components.hamlet != undefined)
          nowClickedPositionDistrict = data.results[0].components.hamlet;
        else if (data.results[0].components.city != undefined)
          nowClickedPositionDistrict = data.results[0].components.city;

        console.log(nowClickedPositionDistrict);
        document.querySelector(
          "[data-page='new-help'] #position"
        ).value = nowClickedPositionName;
      }
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18
    }).addTo(map);

    var marker = L.marker([positionCache.lat, positionCache.lng]);
    marker.addTo(map);

    function onMapClick(e) {
      nowClickedPosition = e.latlng;
      marker.setLatLng(e.latlng);
      // 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + e.latlng.lat + '&lon=' + e.latlng.lng,
      $.get(
        "https://api.opencagedata.com/geocode/v1/json?q=" +
          e.latlng.lat +
          "+" +
          e.latlng.lng +
          "&key=fec7294f81724e4eb96707e395b4ef03",
        function(data) {
          nowClickedPositionName = data.results[0].formatted;
          console.log(data.results[0].formatted);
          if (data.results[0].components.state_district != undefined)
            nowClickedPositionDistrict =
              data.results[0].components.state_district;
          else if (data.results[0].components.suburb != undefined)
            nowClickedPositionDistrict = data.results[0].components.suburb;
          else if (data.results[0].components.town != undefined)
            nowClickedPositionDistrict = data.results[0].components.town;
          else if (data.results[0].components.hamlet != undefined)
            nowClickedPositionDistrict = data.results[0].components.hamlet;
          else if (data.results[0].components.city != undefined)
            nowClickedPositionDistrict = data.results[0].components.city;

          console.log(nowClickedPositionDistrict);
          document.querySelector(
            "[data-page='new-help'] #position"
          ).value = nowClickedPositionName;
        }
      );
    }
    map.on("click", onMapClick);
    app.dialog.close();
  }
}

var onError = function(e) {
  console.log("on error", e);
  app.dialog.close();
  app.dialog.confirm(
    "請開啟GPS以取得當前定位",
    () => {
      window.cordova.plugins.settings.open("location", () => {}, () => {});
      handle_back();
    },
    () => handle_back()
  );
};

function OpenGoogleMapApp(lat, lng) {
  window.open(
    "geo:" + lat + "," + lng + "?q=" + lat + "," + lng + "(受傷地點)",
    "_system"
  );
}

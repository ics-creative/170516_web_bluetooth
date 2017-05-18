/**
 * サービスのUUIDです。
 * @type {string}
 */
const SERVICE_UUID = "8a61d7f7-888e-4e72-93be-0df87152fc6d";

/**
 * キャラクタリスティックのUUIDです。
 * @type {string}
 */
const HUMIDITY_CHARACTERISTIC_UUID = "fae2e24f-aea2-48cb-b449-55ec20518e93";
const TEMPERATURE_CHARACTERISTIC_UUID = "0fdb1d95-c786-4635-a910-f294d7911be1";

/**
 * 湿度のキャラクタリスティックです。
 */
let humidityCharacteristic;

/**
 * 温度のキャラクタリスティックです。
 */
let temperatureCharacteristic;

/**
 * BLEに接続するボタンです。
 */
let connectButton;

/**
 * 湿度・温度を表示するDOMです。
 */
let mainView;

/**
 * 湿度を表示するDOMです。
 */
let humidityText;

/**
 * 温度を表示するDOMです。
 */
let temperatureText;

/**
 * ローディングボタンです。
 */
let loading;

/**
 * 初期化処理です。
 */
function init() {
  connectButton = document.querySelector("#ble-connect-button");
  connectButton.addEventListener("click", connectBLE);

  mainView = document.querySelector("#main-view");
  humidityText = document.querySelector("#humidity-text");
  temperatureText = document.querySelector("#temperature-text");

  loading = document.querySelector("#loading");
}

/**
 * Web Bluetooth APIでBLEデバイスに接続します。
 */
function connectBLE() {
  // loading表示
  loading.className = "show";

  navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [
          SERVICE_UUID
        ]
      }
    ]
  })
    .then(device => {
      console.log("デバイスを選択しました。接続します。");
      console.log("デバイス名 : " + device.name);
      console.log("ID : " + device.id);

      // 選択したデバイスに接続
      return device.gatt.connect();
    })
    .then(server => {
      console.log("デバイスへの接続に成功しました。サービスを取得します。");

      // UUIDに合致するサービス(機能)を取得
      return server.getPrimaryService(SERVICE_UUID);
    })
    .then(service => {
      console.log("サービスの取得に成功しました。キャラクタリスティックを取得します。");

      // UUIDに合致するキャラクタリスティック(サービスが扱うデータ)を取得
      return Promise.all([
        service.getCharacteristic(HUMIDITY_CHARACTERISTIC_UUID),
        service.getCharacteristic(TEMPERATURE_CHARACTERISTIC_UUID)
      ]);
    })
    .then(characteristic => {
      humidityCharacteristic = characteristic[0];
      temperatureCharacteristic = characteristic[1];

      console.log("BLE接続が完了しました。");

      // センサーの値を読み込みます。
      loadSensorValue();

    })
    .catch(error => {
      console.log("Error : " + error);

      // loading非表示
      loading.className = "hide";
    });
}

/**
 * センサーの値を読み込みます。
 */
function loadSensorValue() {
  // 1秒ごとにセンサーの値を取得
  setInterval(function () {
    let humidity;
    let temperature;

    // 湿度の値を読み込む
    humidityCharacteristic.readValue()
      .then(value => {
        // 湿度を取得
        humidity = value.getUint8(0);

        // 温度の値を読み込む
        return temperatureCharacteristic.readValue();
      })
      .then(value => {
        // 温度を取得
        temperature = value.getUint8(0);

        // 湿度・温度の表示を更新
        humidityText.innerHTML = humidity;
        temperatureText.innerHTML = temperature;

        console.log("湿度 : " + humidity + "% | 温度 : " + temperature + "度");

        // 温度・湿度を表示
        showMainView();
      })
      .catch(error => {
        console.log("Error : " + error);
      });

  }, 1000);
}

/**
 * 温度・湿度を表示します。
 */
function showMainView() {
  // 接続ボタン
  connectButton.className = "hide";

  // loading非表示
  loading.className = "hide";

  // 湿度・温度表示
  mainView.className = "show";
}

window.addEventListener("load", init);
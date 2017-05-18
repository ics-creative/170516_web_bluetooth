/**
 * サービスのUUIDです。
 * @type {string}
 */
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";

/**
 * キャラクタリスティックのUUIDです。
 * @type {string}
 */
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214";

/**
 * BLE接続で取得したキャラクタリスティックです。
 */
let ledCharacteristic;

/**
 * BLEに接続するボタンです。
 */
let connectButton;

/**
 * LEDを点灯するボタンです。
 */
let onButton;

/**
 * LEDを消灯するボタンです。
 */
let offButton;

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
      return service.getCharacteristic(CHARACTERISTIC_UUID);
    })
    .then(characteristic => {
      console.log("キャラクタリスティックの取得に成功しました。");

      ledCharacteristic = characteristic;

      console.log("BLE接続が完了しました。");

      // LEDを切り替えるボタンを表示
      showLEDButton();

      // LEDの初期設定
      initLED();
    })
    .catch(error => {
      console.log("Error : " + error);

      // loading非表示
      loading.className = "hide";
    });
}

/**
 * LEDを切り替えるボタンを表示します。
 */
function showLEDButton() {
  // 接続ボタン
  connectButton.className = "hide";

  // LED ONボタン
  onButton = document.querySelector("#on-button");
  // LED ONボタンクリック時はLEDを消灯
  onButton.addEventListener("click", offLED);

  // LED OFFボタン
  offButton = document.querySelector("#off-button");
  // LED OFFボタンクリック時はLEDを消灯
  offButton.addEventListener("click", onLED);

  // loading非表示
  loading.className = "hide";
}

/**
 * LEDの初期設定を行います。
 */
function initLED() {
  // キャラクタリスティックから値を読み込む
  ledCharacteristic.readValue()
    .then((value) => {
      console.log("LEDの点灯状態を読み込みました。");

      // 0番目のデータを取得
      let state = value.getUint8(0);

      if (state === 0) {
        // LEDが消灯状態
        offLED();
      }
      else {
        // LEDが点灯状態
        onLED();
      }
    });
}

/**
 * LEDボタンをON状態に切り替えます。
 */
function onLED() {
  console.log("LED点灯！");

  // ON画面へ切り替え
  onButton.className = "show";
  offButton.className = "hide";

  // キャラクタリスティックの値を更新
  ledCharacteristic.writeValue(new Uint8Array([1]));
}

/**
 * LEDボタンをOFF状態に切り替えます。
 */
function offLED() {
  console.log("LED消灯！");

  // OFF画面へ切り替え
  onButton.className = "hide";
  offButton.className = "show";

  // キャラクタリスティックの値を更新
  ledCharacteristic.writeValue(new Uint8Array([0]));
}

window.addEventListener("load", init);
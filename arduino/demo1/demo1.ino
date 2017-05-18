#include <CurieBLE.h>

#define SERVICE_UUID "19B10000-E8F2-537E-4F6C-D104768A1214"
#define CHARACTERISTIC_UUID "19B10001-E8F2-537E-4F6C-D104768A1214"

// サービス : LEDを扱う機能
BLEService ledService(SERVICE_UUID);

// キャラクタリスティック : LEDスイッチ
// スマートフォンから読み書き許可
BLEUnsignedCharCharacteristic switchCharacteristic(CHARACTERISTIC_UUID, BLERead | BLEWrite);

// LEDを接続しているデジタルピン
const int ledPin = 13;

/**
   初期化処理
*/
void setup() {
  Serial.begin(9600);

  // LEDを接続しているデジタルピンを出力として設定
  pinMode(ledPin, OUTPUT);

  // BLE初期化
  BLE.begin();

  // デバイス名とサービスのUUIDを設定
  // デバイス名を設定
  BLE.setLocalName("LED");
  BLE.setAdvertisedService(ledService);

  // LEDを操作する機能をサービスへ追加
  ledService.addCharacteristic(switchCharacteristic);

  // LEDを扱う機能をサービスとして設定
  BLE.addService(ledService);

  // set the initial value for the characeristic:
  // LEDの状態を初期値として設定
  switchCharacteristic.setValue(0);

  // BLE動作開始
  BLE.advertise();

  Serial.println("BLE LED Peripheral");
}

/**
   繰り返し処理
*/
void loop() {
  // 接続しているデバイスを取得
  BLEDevice central = BLE.central();

  // 接続しているデバイスが存在するかどうか判定
  if (central) {
    Serial.print("Connected to central: ");
    // 接続しているデバイスのMacアドレスを表示
    Serial.println(central.address());

    // デバイスと接続している間は処理を繰り返す
    while (central.connected()) {
      // デバイス側からデータが書き込まれたかどうか判定
      if (switchCharacteristic.written()) {
        // データを取得して処理を振り分ける
        // 受信したデータが0以外のときの処理
        if (switchCharacteristic.value()) {
          Serial.println("LED on");
          // LED点灯
          digitalWrite(ledPin, HIGH);
        }
        // 受信したデータが0のときの処理
        else {
          Serial.println(F("LED off"));
          // LED消灯
          digitalWrite(ledPin, LOW);
        }
      }
    }

    // デバイスとの接続が切れたら実行
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}

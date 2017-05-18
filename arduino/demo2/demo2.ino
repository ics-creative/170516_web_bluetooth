/*
  BLE
*/
#include <CurieBLE.h>

#define SERVICE_UUID "8a61d7f7-888e-4e72-93be-0df87152fc6d"
// 湿度用キャラクタリスティックのUUID
#define HUMIDITY_CHARACTERISTIC_UUID "fae2e24f-aea2-48cb-b449-55ec20518e93"
// 温度用キャラクタリスティックのUUID
#define TEMPERATURE_CHARACTERISTIC_UUID "0fdb1d95-c786-4635-a910-f294d7911be1"

// サービス
BLEService sensorService(SERVICE_UUID);

// キャラクタリスティック
// 湿度 書き込み禁止
BLEUnsignedCharCharacteristic humidityCharacteristic(HUMIDITY_CHARACTERISTIC_UUID, BLERead | BLENotify);
// 温度 書き込み禁止
BLEUnsignedCharCharacteristic temperatureCharacteristic(TEMPERATURE_CHARACTERISTIC_UUID, BLERead | BLENotify);

/*
  温湿度センサー
*/
#include "DHT.h"

// 温湿度センサーのデータを取得するポート
#define DHTPIN 2
// 温湿度センサーの型を指定
#define DHTTYPE DHT11

// 温湿度センサー
DHT dht(DHTPIN, DHTTYPE);

/**
   初期化処理
*/
void setup() {
  Serial.begin(9600);

  // BLE初期化
  BLE.begin();

  // デバイス名とサービスのUUIDを設定
  BLE.setLocalName("SENSOR");
  BLE.setAdvertisedService(sensorService);

  // 湿度を扱うキャラクタリスティックをサービスへ追加
  sensorService.addCharacteristic(humidityCharacteristic);

  // 温度を扱うキャラクタリスティックをサービスへ追加
  sensorService.addCharacteristic(temperatureCharacteristic);

  // センサーを扱う機能をサービスとして設定
  BLE.addService(sensorService);

  // BLE動作開始
  BLE.advertise();

  // 温湿度センサー動作開始
  dht.begin();

  Serial.println("BLE Sensor Peripheral");
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
      // 温湿度センサーから300ミリ秒間隔でデータを取得
      delay(300);

      // 湿度
      float h = dht.readHumidity();
      // 温度(摂氏)
      float t = dht.readTemperature();

      Serial.print("湿度 : ");
      Serial.print(h);
      Serial.println("%");

      Serial.print("温度 : ");
      Serial.print(t);
      Serial.println("*C");

      // センサー値を設定
      humidityCharacteristic.setValue(h);
      temperatureCharacteristic.setValue(t);
    }

    // デバイスとの接続が切れたら実行
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}

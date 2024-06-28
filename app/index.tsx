import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { BleManager, State } from 'react-native-ble-plx'

export const manager = new BleManager()

interface Peripheral {
  name: any;
  id: any;
  key: any;
}

function scan() {
  manager.startDeviceScan(null, null, (error, device) => {
    if (error || device == null) {
      // Handle error (scanning will be stopped automatically) 
      return
    }
    console.log("device.name: ", device.name)
    // Check if it is a device, you are looking for based on advertisement data 
    // or other criteria. 
    if (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag') {
      // Stop scanning as it's not necessary if you are scanning for one device. 
      connect(device.id)
      manager.stopDeviceScan()
      // Proceed with connection. 
    }
  })
}

const connect = async (deviceId: string) => {
  try {
    await manager.connectToDevice(deviceId).then(device => {
      console.log('Connected to device:', device.name);
      // Add your logic for handling the connected device 
      return device.discoverAllServicesAndCharacteristics();
    }).catch(error => {
      // Handle errors 
    })
  } catch (error) {
    console.error('Error connecting to device:', error);
  }
};

const PeripheralRow = ({ name, id }: Peripheral) => (
  <View >
    <Text >{name}</Text>
    <Text >{id}</Text>
  </View>
);

export default function Index() {
  const [peripherals, setPeripherals] = useState<Peripheral[]>([])
  useEffect(() => {
    const stateChangeListener = manager.onStateChange(state => {
      console.log('onStateChange: ', state);
      if (state === State.PoweredOn) {
        scan()
      }
    });

    return () => {
      stateChangeListener?.remove();
    };
  }, [manager]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FlatList
        data={peripherals}
        renderItem={({ item }) => <PeripheralRow name={item.name} id={item.id} key={item.key} />}
        keyExtractor={peripheral => peripheral.id}
      />
    </View>
  );
}

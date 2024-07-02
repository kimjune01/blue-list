import { useEffect, useState, useMemo, useRef } from "react";
import { Button, FlatList, Text, View, StyleSheet } from "react-native";
import { BleError, BleManager, Device, State } from 'react-native-ble-plx'
import TimeAgo from 'react-timeago';

const style = StyleSheet.create({
  container: {
    backgroundColor: 'gainsboro',
    height: 40,
    padding: 8,
    borderRadius: 5,
    shadowColor: 'gray',
    shadowRadius: 14,
    shadowOpacity: 0.1,
    flex: 1,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: 'green'
  },
  timeAgo: {
    fontFamily: 'Helvetica',
    padding: 8,
    fontSize: 16
  }
})

const DeviceDiscoveryRow = ({ device }: { device: Device }) => {
  const opacity = Math.pow(((100 - (Math.abs(device.rssi ?? 100))) / 100), 0.5) ?? 0
  return (
    <View style={[style.container, style.row]} >
      <Text style={{
        fontFamily: 'Helvetica',
        fontWeight: 500,
      }} >{device.name}</Text>
      <View style={[style.row, { gap: 12 }]}>
        <Text> RSSI {device.rssi}</Text>
        <View style={[style.indicator, { opacity: opacity }]}></View>
      </View>
    </View >)
};

export default function Index() {
  const manager = useMemo(() => new BleManager(), [])
  const [scanning, setScanning] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [lastScanned, setLastScanned] = useState(Date.now())
  const [err, setErr] = useState<BleError | null>(null)

  const registerDevice = (device: Device) => {
    if (!device.name) { return }

    setDevices(od => {
      const discoveryIndex = od.findIndex(dev => dev.id === device.id)
      let nd: Device[]
      if (discoveryIndex > -1) {
        nd = od.map(
          dev => dev.id === device.id ? device : dev
        )
      } else {
        nd = [...od, device]
      }

      return nd.sort(function (a, b) {
        const ar = a.rssi || -100
        const br = b.rssi || -100
        return ar > br ? -1 : 1;
      })
    })
  }

  useEffect(() => {
    const stateChangeListener = manager.onStateChange(state => {
      if (state === State.PoweredOn) {
        setScanning(true)
      }
    });
    return () => {
      stateChangeListener?.remove();
    };
  }, [manager]);

  useEffect(() => {
    if (scanning) {
      setLastScanned(Date.now())
      console.log('setLastScanned')
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          setErr(error)
          // TODO: Handle error (scanning will be stopped automatically) 
          return
        }
        if (device == null) {
          return
        }
        // setLastDevice(device)
        registerDevice(device)
      })
    } else {
      manager.stopDeviceScan()
    }
  }, [scanning])
  if (err) {
    // TODO: make this look better later
    return < View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Text>Oops! Bluetooth error occurred. Please try again. Maybe it's a permissions issue?</Text>
      <Text>{err.message} | error code: {err.errorCode}</Text>
    </View>
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={[style.row, {
        width: '100%',
        padding: 12
      }]}>
        <View style={style.row}>
          <Text style={style.timeAgo}>Scanned:</Text>
          {Math.abs(lastScanned - Date.now()) >= 1000 ?
            <TimeAgo
              date={lastScanned}
              component={Text}
              minPeriod={5}
              style={style.timeAgo}
            /> : <Text style={style.timeAgo}>Just now</Text>
          }
        </View>
        <Button title={scanning ? "Stop" : "Scan"} onPress={() => setScanning(!scanning)} />
      </View>
      <FlatList
        style={{ width: "90%" }}
        data={devices}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => <DeviceDiscoveryRow device={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

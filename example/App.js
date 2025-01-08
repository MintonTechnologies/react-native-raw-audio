import React, { useRef } from 'react';
import { View, Text, Button } from 'react-native';
import MediaRecorder from 'react-native-raw-audio/src/MediaRecorder';

export default function App() {
  const recorderRef = useRef(null);

  function onStart() {
    recorderRef.current = new MediaRecorder();
    recorderRef.current.onstart = () => console.log('Recording started...');
    recorderRef.current.onstop = () => console.log('Recording stopped.');
    recorderRef.current.start();
  }

  function onStop() {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
  }

  return (
    <View style={{ marginTop: 60 }}>
      <Text>Raw Audio Demo</Text>
      <Button title="Start Recording" onPress={onStart} />
      <Button title="Stop Recording" onPress={onStop} />
    </View>
  );
}
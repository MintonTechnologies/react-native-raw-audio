import React, { useRef } from 'react';
import { View, Button, Text } from 'react-native';
import MediaRecorder from '../src/MediaRecorder'; // Ensure this path points to your library

export default function App() {
  const recorderRef = useRef(null);

  function onStartPress() {
    // Create the recorder with options (e.g., sample rate)
    recorderRef.current = new MediaRecorder({ sampleRate: 44100 });

    // Event: When recording starts
    recorderRef.current.onstart = () => {
      console.log('Recording started...');
    };

    // Event: When data is available
    recorderRef.current.ondataavailable = (chunkBase64) => {
      console.log('Got chunk of size:', chunkBase64.length);
      // Example: Decode the base64 chunk, send to server, etc.
    };

    // Event: When recording stops
    recorderRef.current.onstop = () => {
      console.log('Recording stopped.');
    };

    // Start recording
    recorderRef.current.start();
  }

  function onStopPress() {
    // Stop recording
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
  }

  return (
    <View style={{ marginTop: 80, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Raw Audio Streaming Example
      </Text>
      <Button title="Start Recording" onPress={onStartPress} />
      <Button title="Stop Recording" onPress={onStopPress} style={{ marginTop: 20 }} />
    </View>
  );
}

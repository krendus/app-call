import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {
ClientRoleType,
createAgoraRtcEngine,
IRtcEngine,
ChannelProfileType,
} from 'react-native-agora';

const appId = 'ced518c059d14295ab9c0a98e8eddfb1';
const channelName = 'test';
const token = '007eJxTYDD/GNURvVpLqerw8ViJ12dOpvXuf3OircLjwKRJe9RuGTgoMCSnppgaWiQbmFqmGJoYWZomJlkmGyRaWqRapKakpCUZ/lQzSmsIZGTYUnmehZEBAkF8FoaS1OISBgYA3oYhzQ==';
const uid = 20;

const App = () => {
    const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
    const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
    const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
    const [message, setMessage] = useState(''); // Message to the user

    const getPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);
        }
    };
    function showMessage(msg: string) {
        setMessage(msg);
    }

    useEffect(() => {
      // Initialize Agora engine when the app starts
      setupVoiceSDKEngine();
   });
   
   const setupVoiceSDKEngine = async () => {
      try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') { await getPermission()};
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
          onJoinChannelSuccess: () => {
              showMessage('Successfully joined the channel ' + channelName);
              setIsJoined(true);
          },
          onUserJoined: (_connection, Uid) => {
              showMessage('Remote user joined with uid ' + Uid);
              setRemoteUid(Uid);
          },
          onUserOffline: (_connection, Uid) => {
              showMessage('Remote user left the channel. uid: ' + Uid);
              setRemoteUid(0);
          },
      });
      agoraEngine.initialize({
          appId: appId,
      });
      } catch (e) {
          console.log(e);
      }
   };
   const join = async () => {
      if (isJoined) {
          return;
      }
      try {
          agoraEngineRef.current?.setChannelProfile(
              ChannelProfileType.ChannelProfileCommunication,
          );
          agoraEngineRef.current?.joinChannel(token, channelName, uid, {
              clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          });
      } catch (e) {
          console.log(e);
      }
    };
    const leave = () => {
      try {
          agoraEngineRef.current?.leaveChannel();
          setRemoteUid(0);
          setIsJoined(false);
          showMessage('You left the channel');
      } catch (e) {
          console.log(e);
      }
  };
    return (
      <SafeAreaView style={styles.main}>
        <Text style={styles.head}>Agora Video Calling Quickstart</Text>
        <View style={styles.btnContainer}>
          <Text onPress={join} style={styles.button}>
            Join
          </Text>
          <Text onPress={leave} style={styles.button}>
            Leave
          </Text>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContainer}>
          {isJoined ? (
            <Text>Local user uid: {uid}</Text>
          ) : (
            <Text>Join a channel</Text>
          )}
          {isJoined && remoteUid !== 0 ? (
            <Text>Remote user uid: {remoteUid}</Text>
          ) : (
            <Text>Waiting for a remote user to join</Text>
          )}
          <Text>{message}</Text>
        </ScrollView>
      </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 25,
        paddingVertical: 4,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0055cc',
        margin: 5,
    },
    main: {flex: 1, alignItems: 'center'},
    scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
    scrollContainer: {alignItems: 'center'},
    videoView: {width: '90%', height: 200},
    btnContainer: {flexDirection: 'row', justifyContent: 'center'},
    head: {fontSize: 20},
});

export default App;

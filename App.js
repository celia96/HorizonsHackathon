import { Constants, Camera, FileSystem, Permissions } from 'expo';
import React from 'react';
import { createStackNavigator } from 'react-navigation'
import axios from 'axios'
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Slider,
  Platform,
  Image,
  TextInput,
  AsyncStorage,
  ListView,
  Button,
} from 'react-native';
import GalleryScreen from './GalleryScreen';
import isIPhoneX from 'react-native-is-iphonex';
import heart from './assets/Hearts.png'
import SocketIOClient from 'socket.io-client';

import {
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons,
  Entypo
} from '@expo/vector-icons';

const landmarkSize = 2;
var url = 'http://293be24b.ngrok.io'

const user = {};
const game = {};
const myObj = {};

const socket = SocketIOClient(url);

class HomePage extends React.Component {
  static navigationOptions = {
    title: 'HomePage'
  };

  render () {
    return (
      <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>
        <View>
          <Text style={{color: 'white', fontSize: 40, fontWeight: 'bold'}}>Catch Me</Text>
          <Text style={{color: 'white', fontSize: 40, fontWeight: 'bold'}}>If You Can</Text>
          <TouchableOpacity
            style={{
              marginRight:10,
              marginLeft:10,
              marginTop:10,
              paddingTop:20,
              paddingBottom:20,
              backgroundColor:'black',
              borderRadius:10,
              borderWidth: 1,
              borderColor: '#fff'
            }}
            onPress={ () => (this.props.navigation.navigate('Register'))}>
            <Text style={{
              color:'#fff',
              textAlign:'center',
              fontWeight:'bold'
            }}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginRight:10,
              marginLeft:10,
              marginTop:10,
              paddingTop:20,
              paddingBottom:20,
              backgroundColor:'black',
              borderRadius:10,
              borderWidth: 1,
              borderColor: '#fff'
            }}
            onPress={ () => (this.props.navigation.navigate('Instructions'))}>
            <Text style={{
              color:'#fff',
              textAlign:'center',
              fontWeight:'bold'
            }}>Instructions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginRight:10,
              marginLeft:10,
              marginTop:10,
              paddingTop:20,
              paddingBottom:20,
              backgroundColor:'black',
              borderRadius:10,
              borderWidth: 1,
              borderColor: '#fff'
            }}>
            <Text style={{
              color:'#fff',
              textAlign:'center',
              fontWeight:'bold'
            }}>Quit</Text>
          </TouchableOpacity>


        </View>
      </View>
    )
  }
}

class Register extends React.Component {
  static navigationOptions = {
    title: 'Register'
  };

  constructor(props) {
    super(props)
    this.state = {
      username: ''
    }
  }

  register() {
    var thisEnv = this;
    console.log("Register");
    socket.emit('userJoined', thisEnv.state.username);
    socket.on('userCreated', (id) => {
      user.id = id;
      user.name = thisEnv.state.username;
      this.props.navigation.navigate('Players')

    })

  }

  render() {
    return (
      <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>

        <TextInput
          style={{
            alignSelf: 'stretch',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 10,
            marginLeft: 5,
            marginRight: 5,
            borderRadius: 5,
            textAlign: 'center',
            fontSize: 20,
            color: 'white',
            borderColor: 'white',
            borderWidth: 1,
          }}
          placeholder="Username"
          onChangeText={(text) => this.setState({username: text})}
        />

        <TouchableOpacity
          style = {{
          alignSelf: 'stretch',
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 10,
          marginLeft: 5,
          marginRight: 5,
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 1,
        }}
          onPress={ () => {this.register()}}>

          <Text style = {{
            textAlign: 'center',
            fontSize: 20,
            color: 'white'
        }}>Enter</Text>
        </TouchableOpacity>

      </View>
    )
  }
}

class Instructions extends React.Component {
  static navigationOptions = {
    title: 'Instructions'
  };

  render() {
    return (
      <View style = {styles.homeContainer}>
        <View>
          <Text style={{color: 'white', fontSize: 16, padding: 20}}>
            Use the camera button to detect and shoot at opponent's face.
            Each accurate shot will decrease opponent's lives by one.
            Players start with 5 lives; game ends when a player has no lives left.
          </Text>
        </View>
      </View>
    )
  }
}

class Players extends React.Component {
  static navigationOptions = {
    title: 'Players'
  };

  constructor(props) {
    super(props);
    this.state = {
      arr: [],
      myID:'',
      myName:'',
      runInterval: true
    }
  }

  gameplay(me, myid, opp, oppid) {
    var obj = {
      me: me,
      myid: myid,
      opp: opp,
      oppid: oppid
    }
    socket.emit('game', obj);
  }

  componentDidMount() {
    var thisEnv = this;
    socket.emit('playerList')
    socket.on('invited', (obj) => {
      Alert.alert(
        'Game Invitation',
        `${obj.name} wants to play a game with you!`,
        [
         {text: 'Accept', onPress: () => thisEnv.gameplay(thisEnv.state.myName,thisEnv.state.myID,obj.name,obj.id)},
        ],
        { cancelable: false }
      )
    })
    socket.on('players', (arr) => {
      thisEnv.setState({
        myID: user.id,
        myName: user.name
      })
      thisEnv.setState({
        arr: arr
      })


    })
    socket.on('gameplay', (g) => {
      game.id = g._id;
      game.player1 = g.player1;
      game.player2 = g.player2;
      console.log("GAME: ", game);
      this.props.navigation.navigate('GameScreen')

    })
  }

  sendInvitation(rowData) {
    var obj = {
      id: this.state.myID,
      name: this.state.myName,
      opp: rowData._id,
    }
    socket.emit('invite', obj);
  }

  render() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return (
      <View style={styles.homeContainer}>
        <ListView
          dataSource={ds.cloneWithRows(this.state.arr)}
          renderRow={(rowData) =>
            <TouchableOpacity
              style={{
              height: 30,
              paddingLeft: 10,
              paddingRight: 10,
              width:300,
              borderColor: 'gray',
              borderWidth: 1,
              margin:5
            }}
              onPress={() => this.sendInvitation(rowData)}
              >
              <Text>{rowData.name}</Text>
            </TouchableOpacity>
          }
        />
      </View>
    )
  }
}

class CameraScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      zoom: 0,
      type: 'back',
      ratio: '16:9',
      ratios: [],
      faceDetecting: true,
      faces: [],
      newPhotos: false,
      permissionsGranted: false,
      pictureSize: undefined,
      pictureSizes: [],
      pictureSizeId: 0,
      showGallery: false,
      gameover: false,
      player1: {},
      player2: {},
      gameid: '',
      myID: '',
      winner: ''
    };

  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });

    console.log("game", game);
    console.log("user", user);

    this.setState({
      gameid: game.id,
      player1: game.player1,
      player2: game.player2,
      myID: user.id
    })

  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  toggleView = () => this.setState({ showGallery: !this.state.showGallery, newPhotos: false });

  setRatio = ratio => this.setState({ ratio });

  zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

  zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

  setFocusDepth = depth => this.setState({ depth });

  takePicture = () => {
    if (this.camera) {
      console.log("Shoot!")
      // If the picture contains the face
      if (this.state.faces.length !== 0) {
        // fetch post
        // decreasing the heart of the other player
        console.log("There is a face!");

        var obj = {
          game: this.state.gameid,
          myId: this.state.myID
        }
        Alert.alert(
          'Shot',
          `You just shot the opponent!`,
          [
           {text: 'Ok', onPress: () => this.setState({winner: user.name, gameover: true})},
          ],
          { cancelable: false }
          )

      } else {
        console.log("No faces");
      }
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  };

  onPictureSaved = async photo => {
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
    });
    this.setState({ newPhotos: true });
  }

  onFacesDetected = ({ faces }) => {
    this.setState({ faces })
  }

  onFaceDetectionError = state => console.warn('Faces detection error:', state);

  collectPictureSizes = async () => {
    if (this.camera) {
      const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
      let pictureSizeId = 0;
      if (Platform.OS === 'ios') {
        pictureSizeId = pictureSizes.indexOf('High');
      } else {
        // returned array is sorted in ascending order - default size is the largest one
        pictureSizeId = pictureSizes.length-1;
      }
      this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
    }
  };

  previousPictureSize = () => this.changePictureSize(1);
  nextPictureSize = () => this.changePictureSize(-1);

  changePictureSize = direction => {
    let newId = this.state.pictureSizeId + direction;
    const length = this.state.pictureSizes.length;
    if (newId >= length) {
      newId = 0;
    } else if (newId < 0) {
      newId = length -1;
    }
    this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
  }

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />;
  }

  renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>Face Detected</Text>
      </View>
    );
  }

  renderFaces = () =>
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>


  renderNoPermissions = () =>
    <View style={styles.noPermissions}>
      <Text style={{ color: 'white' }}>
        Camera permissions not granted - cannot open camera preview.
      </Text>
    </View>

  renderTopBar = () => {

    return (<View
              style={styles.topBar}>
              <Entypo name="heart" size={50} color="white" />
            </View>)
  }

  renderBottomBar = () =>
    <View
      style={styles.bottomBar}>
      <View style={styles.bottomButton}>
      </View>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity
          onPress={this.takePicture.bind(this)}
          style={{ alignSelf: 'center' }}
        >
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
        <View>
          <Foundation name="thumbnails" size={30} color="white" />
          {this.state.newPhotos && <View style={styles.newPhotosDot}/>}
        </View>
      </TouchableOpacity>
    </View>

  renderCamera = () =>
    (
      this.state.winner ? <GameOver winner={this.state.winner} /> :

      <View style={{ flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.camera}
          onCameraReady={this.collectPictureSizes}
          type={this.state.type}
          zoom={this.state.zoom}
          ratio={this.state.ratio}
          pictureSize={this.state.pictureSize}
          onFacesDetected={this.state.faceDetecting ? this.onFacesDetected : undefined}
          onFaceDetectionError={this.onFaceDetectionError}
          >
          {this.renderTopBar()}
          {this.renderBottomBar()}
        </Camera>
        {this.state.faceDetecting && this.renderFaces()}
      </View>

    );

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return <View style={styles.container}>{content}</View>;

  }
}

class GameOver extends React.Component {

  render() {
    return (
      <View style={{backgroundColor: 'black', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{
          color: 'white', fontSize: 40, fontWeight: 'bold'
        }}>Game over!</Text>
        <Text style={{
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: 'white'
        }}>Winner: {this.props.winner}</Text>
      </View>
    )
  }
}

const Navigator = createStackNavigator({
  HomePage: {screen: HomePage},
  Register: {screen: Register},
  Instructions: {screen: Instructions},
  Players: {screen: Players},
  GameScreen: {screen: CameraScreen},
})


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  homeContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomBar: {
    paddingBottom: isIPhoneX ? 25 : 5,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.12,
    flexDirection: 'row',
  },
  noPermissions: {
    flex: 1,
    alignItems:'center',
    justifyContent: 'center',
    padding: 10,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  bottomButton: {
    flex: 0.3,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPhotosDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4630EB'
  },
  options: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: '#000000BA',
    borderRadius: 4,
    padding: 10,
  },
  detectors: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pictureQualityLabel: {
    fontSize: 10,
    marginVertical: 3,
    color: 'white'
  },
  pictureSizeContainer: {
    flex: 0.5,
    alignItems: 'center',
    paddingTop: 10,
  },
  pictureSizeChooser: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  pictureSizeLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
  }
});

export default Navigator;

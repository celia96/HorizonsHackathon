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


import {
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons,
  Entypo
} from '@expo/vector-icons';

const landmarkSize = 2;
var url = 'http://2a10aca2.ngrok.io'


class HomePage extends React.Component {
  static navigationOptions = {
    title: 'HomePage'
  };
  // homeContainer: {
  //   flex: 1,
  //   marginTop: 20,
  //   backgroundColor: 'white',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
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
    console.log("User: " + this.state.username);
    var thisEnv = this;

    fetch(url + '/nickname', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: this.state.username,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("responseJson: " + responseJson);
      if (responseJson.success) {
        console.log("Username: " + this.state.username);
        console.log("responseJson: " + responseJson.id);

        AsyncStorage.setItem('user', JSON.stringify({
          id: responseJson.id,
          name: this.state.username
        }))
          .then(() => this.props.navigation.navigate('Players'))
      } else {
        alert('Nickname register failed')
      }
    })
    .catch((err) => {
      console.error("Error is?: " + err);
    });

  }

  render() {
    return (
      <View style = {styles.homeContainer}>

        <TextInput
          style={{height: 40, color: 'black'}}
          placeholder="Username"
          onChangeText={(text) => this.setState({username: text})}
        />

        <TouchableOpacity style={[styles.button]} onPress={ () => {this.register()}}>
          <Text style={styles.buttonLabel}>Enter</Text>
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
          <Text>
            Use the camera button to detect and shoot at opponent's face.
            Each accurate shot will decrease opponent's lives by one.
            Game ends when a player has no lives left.
          </Text>

          <TouchableOpacity style={[styles.button]} onPress={ () => (this.props.navigation.navigate('HomePage'))}>
            <Text style={styles.buttonLabel}>Back</Text>
          </TouchableOpacity>

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
      myName:''
    }
  }

  deleteInvitation(id) {
    fetch(url+ '/deleteInvitation', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: {id:id}
    }).catch(err=>console.log(err))
  }

  gameplay(name1,id1,name2,id2) {
    fetch(url+ '/gamestart', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player1: {
          name: name1,
          id: id1
        },
        player2: {
          name: name2,
          id: id2
        }
      })
    }).catch(err=>{console.log(err)})
  }

  getInvitation() {
    console.log(this.state)
    fetch(url + '/getInvitation', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({id:this.state.myID})
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log('pass' + JSON.stringify(responseJson))
      if (responseJson.success) {
        console.log("My ID: " + this.state.myID);
        Alert.alert(
          'Game Invitation',
          `${responseJson.invitation.name} wants to play a game with you!`,
          [
           {text: 'Decline', onPress: () => this.deleteInvitation(this.state.myID)},
           {text: 'Accept', onPress: () => this.gameplay(this.state.myName,this.state.myID,responseJson.invitation.name,responseJson.invitation.id)},
          ],
          { cancelable: false }
          )
      }
    })
    .catch((err) => {
      console.error("Error is: " + err);
    });
  }

  checkInGame(id) {
    fetch(url+ '/checkingame', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: {id:this.state.myID}
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.game.inGame) {
         AsyncStorage.setItem('game', JSON.stringify(
           responseJson.game.gameId
         ))
         this.props.navigation.navigate('GameScreen')
       }
    })
    .catch(err=>console.log(err))
  }

  componentDidMount() {
    AsyncStorage.getItem('user')
    .then(result => {
      this.setState({
        myID:result.id,
        myName:result.id
      })
    })
    .then(
      fetch(url + '/users', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState ({
          arr: responseJson
        })
        setInterval(() => this.getInvitation(),10000)
        setInterval(() => this.checkInGame(this.state.myID),10000)
      })
      .catch((err) => {
        console.error(err);
      })
    )
    .catch((err) => {
      console.error(err)})
  }

  selectPlayer(rowData) {
    fetch(url+'/giveInvitation', {
      method:'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player1: {
           name: this.state.myName,
           id: this.state.myId
         },
         player2: {
           name: rowData.name,
           id: rowData._id
         }
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        alert('Invitation sent!')
      } else {
        alert('Invitation send fail')
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }

  render() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return (
      <View style={styles.homeContainer}>
        <ListView
          dataSource={ds.cloneWithRows(this.state.arr)}
          renderRow={(rowData) =>
            <TouchableOpacity onPress={() => this.selectPlayer(rowData)}>
              <Text>{rowData.name}</Text>
            </TouchableOpacity>
          }
        />
      </View>
    )
  }
}

class CameraScreen extends React.Component {
  state = {
    zoom: 0,
    type: 'back',
    ratio: '16:9',
    ratios: [],
    faceDetecting: true,
    faces: [],
    lives: 5,
    newPhotos: false,
    permissionsGranted: false,
    pictureSize: undefined,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
    gameover: false
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
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
      cnosole.log("Shoot!")
      // If the picture contains the face
      if (this.state.faces) {
        // fetch post
        // decreasing the heart of the other player
        console.log("There is a face!");
        AsyncStorage.getItem('game')
          .then(game => {
            AsyncStorage.getItem('user')
              .then(user => {
                fetch(url + '/decreaseLife', {
                  method: 'POST',
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    game: result,
                    myId: user.id
                  })
                })
                .then((response) => response.json())
                .then((responseJson) => {
                  if (responseJson.success) {
                    if (responseJson.gameover) {
                      this.setState({
                        gameover: true,
                        winner: responseJson.winner
                      })
                    }
                    Alert.alert(
                      'Alert Title',
                      'Alert Contents',
                      [{text: "Shot on target!"}]
                    )
                  } else {
                    Alert.alert(
                      'Alert Title',
                      'Alert Contents',
                      [{text: "Fail"}]
                    )
                  }
                })
                .catch((err) => {
                  /* do something if there was an error with fetching */
                  console.log("Error: " + err);
                });
              })
          })
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

  onFacesDetected = ({ faces }) => this.setState({ faces });
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
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
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

  renderTopBar = () =>
    //console.log("Heart!" + lives)
    <View
      style={styles.topBar}>
      <Entypo name="heart" size={50} color="white" />
      <Entypo name="heart" size={50} color="white" />
      <Entypo name="heart" size={50} color="white" />
      <Entypo name="heart" size={50} color="white" />
      <Entypo name="heart" size={50} color="white" />
    </View>

  renderBottomBar = () =>
    <View
      style={styles.bottomBar}>
      <View style={styles.bottomButton}>
      </View>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity
          onPress={this.takePicture}
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

  // renderGame = () => (
  //   const cameraScreenContent = this.state.permissionsGranted
  //     ? this.renderCamera()
  //     : this.renderNoPermissions();
  //   const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
  //   return <View style={styles.container}>{content}</View>;
  // );

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return <View style={styles.container}>{content}</View>;
    // return (
    //   {this.state.winner ? <GameOver winner={this.state.winner} /> : this.renderGame()}
    // )
  }
}

class GameOver extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Game over!</Text>
        <Text>Winner: {this.props.winner}</Text>
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
  },

  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: 'white'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    backgroundColor: 'white'
  }
});

export default Navigator;

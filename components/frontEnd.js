import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button
} from 'react-native';
import { StackNavigator } from 'react-navigation';

class HomePage extends React.Component {
  static navigationOptions = {
    title: 'HomePage'
  };

  render () {
    return (
      <View style = {styles.container}>
        <View style = {{fontSize: 40}}>
          <Text>Catch Me If You Can!</Text>

          <TouchableOpacity onPress={ () => (this.props.navigation.navigate('Register'))}>
            <Text>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={ () => (this.props.navigation.navigate('Instructions'))}>
            <Text>Instructions</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text>Quit</Text>
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
    fetch('https://c64c77ac.ngrok.io/nickname', {
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
      if (responseJson.success) {
        AsyncStorage.setItem('user', JSON.stringify({
          id: responseJson.id,
          name:this.state.username
        })
      } else {
        alert('Nickname register failed')
      }
    })
    .catch((err) => {
      console.error(err);
    });
    this.props.navigation.navigate('Players')
  }

  render() {
    return (
      <View style = {styles.container}>

        <TextInput
          style={{height: 40}}
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
      <View style = {styles.container}>
        <View style = {{fontSize: 25}}>
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
      arr: []
    }
  }

  componentDidMount() {
    fetch('https://c64c77ac.ngrok.io/users', {
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
    })
    .catch((err) => {
      console.error(err);
    });
  }

  selectPlayer(rowData) {
    AsyncStorage.getItem('user')
  .then(result => {
    fetch('https://c64c77ac.ngrok.io/gamestart', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      player1: {
        name: result.name,
        id: result.id
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
        AsyncStoage.setItem('game', JSON.stringify(
          responseJson.game
        ))
      } else {
        alert('failed to load game')
      }
    })
    .catch((err) => {
      console.error(err);
    });
  })
    .catch(err => {console.log(err)})
  }

  render() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return (
      <View style={styles.container}>
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

export default StackNavigator({
  HomePage: {screen: HomePage},
  Register: {screen: Register},
  Instructions: {screen: Instructions},
  Players: {screen: Players},
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  }

});

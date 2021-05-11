import React from 'react'

import './Login.css';

import { postData } from '../functions/postData';
import { config } from '../config';

const url = config.api_host;

const log = console.log

class Login extends React.Component {

  state = {
    userName: ''
  }

  componentDidMount() {
    // enter key tries to sign in
    window.onkeypress = e => { if (e.keyCode === 13) { this.handleLogin() } }
  }

  handleInputChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  handleLogin = () => {
    postData(`${url}/login`, { access_token: this.state.userName })
      .then(res => {
        if (res.is_successful) {
          sessionStorage.setItem('user', this.state.userName)
          window.location.reload()
        } else {
          alert('invalid access token')
        }
      })
  }

  render() {
    return (
      <div id='LoginPage'>
        <div id="LoginContainer">
          <div id="LoginCredentials">
            <p className='loginText'>Please enter your access key:</p>

            <input className="LoginField"
              value={this.state.userName}
              onChange={this.handleInputChange}
              type='text'
              name='userName'
              placeholder='Access key'
              autoFocus></input>

            <button className="LoginButton"
              type='submit'
              onClick={this.handleLogin}>Log In</button>
          </div>
        </div>
      </div>
    )
  }
}

export default Login;

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class LogInModal extends Component
{
  state = {}

  render()
  {
      return (
        <div>
        <div id="id01" className="modal">
        <span onClick={() => this.props.app_parent.deRenderLogInModal()} className="close" title="Close Modal">Close</span>
      
        <div className="modal-content animate">
          <div className="logincontainer">
            <label for="uname"><b>Username</b></label>
            <input type="text" placeholder="Enter Username" name="uname" id="uname" required/>
      
            <label for="psw"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="psw" id="psw" required/>
      
            <button onClick={() => this.attemptLogIn()} type="submit">Login</button>
            <label>
              <input type="checkbox" checked="checked" name="remember"/> Remember me
            </label>
          </div>
      
          <div className="logincontainer" style={{backgroundColor:"#f1f1f1"}}>
            <button onClick={() => this.props.app_parent.deRenderLogInModal()} className="button" class="cancelbtn">Exit</button>
            <span className="psw">Forgot <a href="#">password?</a></span>
          </div>
        </div>
      </div>
      </div>
      )
  }

  componentDidMount()
  {
    document.getElementById('id01').style.display="block";
  }

  async attemptLogIn()
  {
    var resp = await fetch("https://interact-server.herokuapp.com/user-verify",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: document.getElementById("uname").value,
                   password: document.getElementById("psw").value}),
        })
        .then(r => r.text());
    if(resp.includes("User verified!")){
        this.props.app_parent.setUser(document.getElementById("uname").value);
        this.props.app_parent.deRenderLogInModal();
    }
  }
}

export default LogInModal;
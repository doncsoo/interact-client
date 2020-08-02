import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class LogInModal extends Component
{
  state = {mode: "login"}

  render()
  {
      return (
        <div>
        <div id="id01" className="modal">
        <span onClick={() => this.props.app_parent.deRenderLogInModal()} className="close" title="Close Modal">Close</span>
         <div id="notifications"></div>
        <div className="modal-content animate">
          {this.getMainContent()}

          <div className="logincontainer" style={{backgroundColor:"#f1f1f1"}}>
            <button onClick={() => this.props.app_parent.deRenderLogInModal()} className="button" class="cancelbtn">Exit</button>
          </div>
        </div>
      </div>
      </div>
      )
  }

  getMainContent()
  {
    if(this.state.mode == "login")
    {
      return (<div id="login" className="logincontainer">
      <label for="uname"><b>Username</b></label>
      <input type="text" placeholder="Enter Username" name="uname" id="uname" required/>

      <label for="psw"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="psw" id="psw" required/>

      <button onClick={() => this.attemptLogIn()} type="submit">Login</button>
      <label>
        <input type="checkbox" checked="checked" name="remember"/> Remember me
      </label>
      <button onClick={() => this.setState({mode: "register"})} className="button" class="cancelbtn">Exit</button>
      <span className="psw">Forgot <a href="#">password?</a></span>
    </div>);
    }
    else if(this.state.mode == "register")
    {
      return (<div id="register" className="logincontainer">
      <label for="rname"><b>Username</b></label>
      <input type="text" placeholder="Enter Username" name="rname" id="rname" required/>

      <label for="rpsw"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="rpsw" id="rpsw" required/>

      <label for="fname"><b>Full Name</b></label>
      <input type="text" placeholder="Enter Password" name="fname" id="fname" required/>

      <button onClick={() => this.attemptRegister()} type="submit">Register</button>
    </div>);
    }
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

  async attemptRegister()
  {
    var resp = await fetch("https://interact-server.herokuapp.com/register",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: document.getElementById("rname").value,
                   password: document.getElementById("rpsw").value,
                   fullname: document.getElementById("fname").value})
        })
        .then(r => r.text());
    document.getElementById("notifications").innerHTML = "<h4>"+ resp +"</h4>"
    if(resp.includes("Registration successful")){
      this.setState({mode: "login"});
    }
  }
}

export default LogInModal;
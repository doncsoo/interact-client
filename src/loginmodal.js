import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class LogInModal extends Component
{
  state = {mode: "login"}

  componentDidUpdate()
  {
    ReactDOM.unmountComponentAtNode(document.getElementById("notifications"))
  }

  render()
  {
      return (
        <div>
          <div className="modal">
            <div className="modal-content animate">
              <button style={{margin: "5px", display: "inline"}} onClick={() => ReactDOM.unmountComponentAtNode(document.getElementById("login-modal-div"))} className="closeblack"/>
              <div id="notifications"></div>
              {this.getMainContent()}
            </div>
          </div>
        </div>
      )
  }

  getMainContent()
  {
    if(this.state.mode == "login")
    {
      return (
      <div>
        <div id="login" className="logincontainer">
          <label for="uname"><b>Username</b></label>
          <input type="text" placeholder="Enter Username" name="uname" id="uname" required/>

          <label for="psw"><b>Password</b></label>
          <input type="password" placeholder="Enter Password" name="psw" id="psw" required/>
          <br/>
          <button onClick={() => this.attemptLogIn()} type="submit" className="black">Login</button>
          <br/>
        </div>
        <div className="logincontainer" style={{backgroundColor:"#f1f1f1"}}>
          <button onClick={() => this.setState({mode: "register"})} className="black">Register</button>
        </div>
      </div>);
    }
    else if(this.state.mode == "register")
    {
      return (
      <div>
        <div id="register" className="logincontainer">
          <label for="rname"><b>Username</b></label>
          <input type="text" placeholder="Enter Username" name="rname" id="rname" required/>

          <label for="rpsw"><b>Password</b></label>
          <input type="password" placeholder="Enter Password" name="rpsw" id="rpsw" required/>

          <label for="fname"><b>Full Name</b></label>
          <input type="text" placeholder="Enter Fullname" name="fname" id="fname" required/>
          <br/>
          <button className="black" onClick={() => this.attemptRegister()} type="submit">Register</button>
        </div>
        <div className="logincontainer" style={{backgroundColor:"#f1f1f1"}}>
          <button onClick={() => this.setState({mode: "login"})} className="black">Login</button>
        </div>
      </div>);
    }
  }

  async attemptLogIn()
  {
    //validation
    if(document.getElementById("uname").value == "")
    {
      let notification = (<div className="notification error"><p>ERROR: Username cannot be blank</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
      return;
    }

    if(document.getElementById("psw").value == "")
    {
      let notification = (<div className="notification error"><p>ERROR: Password cannot be blank</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
      return;
    }
    let resp = await fetch("https://interact-server.herokuapp.com/user-verify",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: document.getElementById("uname").value,
                   password: document.getElementById("psw").value}),
        })
        .then(r => r.json());
    if(resp.verified == true){
      this.props.app_parent.setUser(document.getElementById("uname").value);
      document.cookie = "session_user=" + document.getElementById("uname").value;
      document.cookie = "session_token=" + resp.token;    
      ReactDOM.unmountComponentAtNode(document.getElementById("login-modal-div"));
    }
    else
    {
      let notification = (<div className="notification error"><p>{resp.error}</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
    }
  }

  async attemptRegister()
  {
    //validation
    if(document.getElementById("rname").value == "")
    {
      let notification = (<div className="notification error"><p>ERROR: Username cannot be blank</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
      return;
    }

    if(document.getElementById("rpsw").value == "")
    {
      let notification = (<div className="notification error"><p>ERROR: Password cannot be blank</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
      return;
    }
    let status = undefined;
    let resp = await fetch("https://interact-server.herokuapp.com/register",{
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: document.getElementById("rname").value,
                   password: document.getElementById("rpsw").value,
                   fullname: document.getElementById("fname").value})
        })
        .then(function(r) {
                status = r.status; 
                return r.text()
              });
    if(status == 201){
      this.setState({mode: "login"});
      ReactDOM.render(<div className="notification info"><p>You can now log in!</p></div>,document.getElementById("notifications"));
    }
    else
    {
      let notification = (<div className="notification error"><p>{status != 500 ? resp : "An unknown error occurred"}</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
    }
  }
}

export default LogInModal;
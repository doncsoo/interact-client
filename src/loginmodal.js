import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';

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
        <div id="id01" className="modal">
        <span onClick={() => this.props.app_parent.deRenderLogInModal()} className="close" title="Close Modal">Close</span>
        <div className="modal-content animate">
        <div id="notifications"></div>
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
      <br></br>
      <button onClick={() => this.attemptLogIn()} type="submit">Login</button>
      <label>
        <input type="checkbox" checked="checked" name="remember"/> Remember me
      </label>
      <button onClick={() => this.setState({mode: "register"})} className="button" class="cancelbtn">Register</button>
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
        this.props.app_parent.deRenderLogInModal();
    }
    else
    {
      let notification = (<div className="notification error"><p>{resp.error}</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
    }
  }

  async attemptRegister()
  {
    let resp = await fetch("https://interact-server.herokuapp.com/register",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: document.getElementById("rname").value,
                   password: document.getElementById("rpsw").value,
                   fullname: document.getElementById("fname").value})
        })
        .then(r => r.text());
    if(resp.includes("Registration successful")){
      let notification = (<div className="notification info"><p>You can now log in with registered credentials!</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
      this.setState({mode: "login"});
    }
    else
    {
      let notification = (<div className="notification error"><p>{resp}</p></div>);
      ReactDOM.render(notification,document.getElementById("notifications"))
    }
  }
}

export default LogInModal;
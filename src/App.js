import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import './App.css';
import Player from './player';
import LogInModal from './loginmodal';
import userimg from './user.svg';
import BrowserContent from './browsecontent';
import Cookie from 'cookie';

class App extends Component
{

  state = {mode: "browse_main", vid_id: null, tree_id: null, user: null}

  componentDidMount()
  {
    //try to pre authenticate
    let cookies = Cookie.parse(document.cookie)
    if(cookies.session_user) this.setState({ mode: this.state.mode, vid_id: this.state.vid_id, tree_id: this.state.tree_id, user: cookies.session_user})
  }

  render()
  {
    if (this.state.mode.includes("browse")) {
      return (<Router>
        <div className="App">
         <Switch>
          <Route path="/video_play">
          <Player/>
          </Route>
          <Route path="">
         <div className="black-header">
         <h2 onClick={() => this.setState({ mode: "browse_main", vid_id: null, tree_id: null, user: this.state.user })} style={{cursor: "pointer"}} className="logo">INTERACT</h2>
         {this.getUserComp()}
         </div>
         <div id="usermenu" className="usermenucontainer">
          <h3 style={{display: "block", color: "black"}}>Hello {this.state.user ? this.state.user : "User"}</h3>
          <h4 onClick={() => alert("This function is not available yet!")} style={{cursor: "pointer", display: "block"}}>Create a new content</h4>
          <h4 onClick={() => this.setState({ mode: "browse_uploads", vid_id: null, tree_id: null, user: this.state.user })} style={{cursor: "pointer", display: "block"}}>Your Uploads</h4>
          <h4 onClick={() => this.setState({ mode: "browse_favorites", vid_id: null, tree_id: null, user: this.state.user })} style={{cursor: "pointer", display: "block"}}>Favorites</h4>
          <h4 onClick={() => this.logOutFunction()} style={{cursor: "pointer", display: "block", color: "red"}}>Log out</h4>
         </div>
         <BrowserContent app_parent={this} mode={this.state.mode.replace("browse_","")}/>
         <div id="login-modal-div"/>
          </Route>
          </Switch>
          </div>
          </Router>);
    }
    else if(this.state.mode == "video_play")
    {
      return (<div><Player app_parent={this} vid_id={this.state.vid_id} tree_id={this.state.tree_id}/></div>)
    }
  }

  getUserComp()
  {
    if(!this.state.user)
    {
      return (<h3 style={{cursor: "pointer"}} onClick={() => this.openLogInModal()} className="log-in"><a>Log In</a></h3>);
    }
    else
    {
      return (<img style={{cursor: "pointer"}} onClick={() => this.toggleUserMenu()} title={"Logged in as " + this.state.user} src={userimg} className="log-in"/>);
    }
  }

  toggleUserMenu()
  {
    if(document.getElementById("usermenu").style.display == "none") document.getElementById("usermenu").style.display = "block"
    else document.getElementById("usermenu").style.display = "none"
  }

initPlayer(treeid,id)
{
  console.log("Launching video...")
  this.setState({ mode: "video_play", vid_id: id, tree_id: treeid, user: this.state.user });
}

openLogInModal()
{
  ReactDOM.render(<LogInModal app_parent={this}/>,document.getElementById("login-modal-div"));
}

setUser(set_user)
{
  this.setState({ mode: this.state.mode, vid_id: this.state.vid_id, tree_id: this.state.tree_id, user: set_user });
}

deRenderLogInModal()
{
  ReactDOM.unmountComponentAtNode(document.getElementById("login-modal-div"))
}

logOutFunction()
{
  document.cookie = "session_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  this.setState({ mode: "browse_main", vid_id: this.state.vid_id, tree_id: this.state.tree_id, user: null})
  this.toggleUserMenu()
}
}

export default App;

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Player from './player';
import LogInModal from './loginmodal';
import userimg from './user.svg';
import BrowserContent from './browsecontent';
import Cookie from 'cookie';
import Editor from './editor';
import Manager from './manager';
import loadinggif from './loading.gif';
import ErrorBoundary from './errorboundary';

class App extends Component
{
  state = {mode: "browse_main", vid_id: null, tree: null, user: null, isadmin: false}

  async componentDidMount()
  {
    //try to pre authenticate
    let cookies = Cookie.parse(document.cookie)
    if(cookies.session_user)
    {
      this.setState({ mode: this.state.mode, vid_id: this.state.vid_id, tree: this.state.tree, user: "VALIDATING", isadmin: false});

      let resp = await fetch("https://interact-server.herokuapp.com/verify-token/" + cookies.session_token).then(r => r.text());
      if(resp == "VALID")
        this.setState({ mode: this.state.mode, vid_id: this.state.vid_id, tree: this.state.tree, user: cookies.session_user, isadmin: cookies.session_isadmin == "true"});
      else this.deleteCookies();
    }
  }

  componentDidUpdate()
  {
    if (document.getElementById("usermenu")) 
      document.getElementById("usermenu").style.display = "none";
  }

  render()
  {
    if (this.state.mode.includes("browse") || this.state.mode == "editor" || this.state.mode == "manage") {
      return (
        <div className="App">
          <div className="black-header">
            <h2 onClick={() => window.location.reload()} style={{cursor: "pointer"}} className="logo">INTERACT</h2>
              {this.getUserComp()}
          </div>
          {this.getUserMenu()}
          {this.getMainContent()}
          <div id="login-modal-div"/>
        </div>);
    }
    else if(this.state.mode == "video_play") 
      return (<div><ErrorBoundary><Player app_parent={this} vid_id={this.state.vid_id} tree={this.state.tree}/></ErrorBoundary></div>);
    else if(this.state.mode == "updating")
    {
      return (<div/>);
    }
  }

  getUserMenu()
  {
    let moderation_button = <h4 onClick={() => this.setState({ mode: "manage", vid_id: null, tree: null, user: this.state.user, isadmin: this.state.isadmin })} style={{cursor: "pointer", display: "block"}}>Management</h4>;
    return (
      <div id="usermenu" className="usermenucontainer">
          <h2 className="greeter"> Hello {this.state.user ? this.state.user : "User"}</h2>
          <h4 onClick={() => this.setState({ mode: "editor", vid_id: null, tree: null, user: this.state.user, isadmin: this.state.isadmin })} style={{cursor: "pointer", display: "block"}}>Create a new content</h4>
          <h4 onClick={() => this.setState({ mode: "browse_uploads", vid_id: null, tree: null, user: this.state.user, isadmin: this.state.isadmin })} style={{cursor: "pointer", display: "block"}}>Your Uploads</h4>
          <h4 onClick={() => this.setState({ mode: "browse_favorites", vid_id: null, tree: null, user: this.state.user, isadmin: this.state.isadmin })} style={{cursor: "pointer", display: "block"}}>Favorites</h4>
          {this.state.isadmin == true ? moderation_button : null}
          <h4 onClick={() => this.logOutFunction()} style={{cursor: "pointer", display: "block", color: "red"}}>Log out</h4>
      </div>
    );
  }

  async updateVideo(vidid)
  {
    let resp = await fetch("https://interact-server.herokuapp.com/get-tree/" + vidid)
                .then(r => r.json());
    this.setState({ mode: "updating", vid_id: null, tree: null, user: this.state.user, isadmin: this.state.isadmin }, 
    function() {
      setTimeout(() => { this.setState({ mode: "video_play", vid_id: vidid, tree: resp[0].tree, user: this.state.user, isadmin: this.state.isadmin }) },100)
      });
  }

  getMainContent()
  {
    if(this.state.mode.includes("browse"))
    {
      return(<BrowserContent app_parent={this} mode={this.state.mode.replace("browse_","")}/>);
    }
    else if(this.state.mode == "editor")
    {
      return(<Editor app_parent={this} vid_id={this.state.vid_id}/>);
    }
    else if(this.state.mode == "manage")
    {
      return(<Manager app_parent={this}/>);
    }
  }

  getUserComp()
  {
    if(!this.state.user)
    {
      return (<h3 style={{cursor: "pointer"}} onClick={() => ReactDOM.render(<LogInModal app_parent={this}/>,document.getElementById("login-modal-div"))} className="log-in"><a>Log In</a></h3>);
    }
    else if(this.state.user == "VALIDATING")
    {
      return (<img style={{cursor: "pointer"}} onClick={() => this.toggleUserMenu()} title={"Attempting to pre-authenticate"} width="32" height="32" src={loadinggif} className="log-in"/>);
    }
    else
    {
      return (<img style={{cursor: "pointer"}} onClick={() => this.toggleUserMenu()} title={"Logged in as " + this.state.user} src={userimg} className="log-in"/>);
    }
  }

  toggleUserMenu()
  {
    if(document.getElementById("usermenu").style.display == "block") document.getElementById("usermenu").style.display = "none"
    else document.getElementById("usermenu").style.display = "block"
  }

  initPlayer(tree,id)
  {
    this.setState({ mode: "video_play", vid_id: id, tree: tree, user: this.state.user, isadmin: this.state.isadmin });
  }

  setUser(set_user, set_admin)
  {
    this.setState({ mode: this.state.mode, vid_id: this.state.vid_id, tree: this.state.tree, user: set_user, isadmin: set_admin});
  }

  editVideo(id)
  {
    this.setState({ mode: "editor", vid_id: id, tree: this.state.tree, user: this.state.user, isadmin: this.state.isadmin });
  }

  deleteCookies()
  {
    document.cookie = "session_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "session_isadmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.setState({ mode: "browse_main", vid_id: this.state.vid_id, tree: this.state.tree, user: null, isadmin: false})
  }

  logOutFunction()
  {
    this.deleteCookies();
    this.toggleUserMenu();
  }
}

export default App;

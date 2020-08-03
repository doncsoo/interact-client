import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import './App.css';
import Player from './player';
import VideoButton from './video-button';
import LogInModal from './loginmodal';
import userimg from './user.svg';

class App extends Component
{

  state = {mode: "browse", vid_id: null, tree_id: null, user: null}

  componentDidMount()
  {
    if(this.state.mode == "browse") this.queryVideos();
  }

  componentDidUpdate()
  {
    if(this.state.mode == "browse") this.queryVideos();
  }

  render()
  {
    if (this.state.mode == "browse") {
      return (<Router>
        <div className="App">
         <Switch>
          <Route path="/video_play">
          <Player/>
          </Route>
          <Route path="">
         <div className="black-header">
         <h2 className="logo">INTERACT</h2>
         {this.getUserComp()}
         </div>
         <div className="content-body">
         <input className="search-bar" type="text" size="30" placeholder="Search for some content..."/>
          <br></br>
          <div id="all-videos"/>
         </div>
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
      return (<h3 onClick={() => this.openLogInModal()} className="log-in"><a>Log In</a></h3>);
    }
    else
    {
      return (<img title={"Logged in as " + this.state.user} src={userimg} className="log-in"/>);
    }
  }

async queryVideos()
{
  var resp = await fetch("https://interact-server.herokuapp.com/get-videos/all")
        .then(r => r.json());
  var entries = []
  for(var i = 0 ; i < resp.length; i++)
  {
    //entries.push(<div><h3>{resp[i].name}</h3><h5>{resp[i].upload_date}</h5><button id={resp[i].tree_id} onClick={e => this.initPlayer(e.target.id)}>Link a videóhoz</button><label>{resp[i].description}</label></div>)
    entries.push(<VideoButton tree_id={resp[i].tree_id} vid_id={resp[i].id} likes={resp[i].likes} initPlayer={(tree,id) => this.initPlayer(tree,id)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
  }
  ReactDOM.render(entries,document.getElementById("all-videos"))
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
}

export default App;

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import VideoButton from './video-button';

class BrowseContent extends Component
{

  componentDidMount()
  {
    if(this.props.mode == "main")
    {
        this.queryVideos("all");
    } 
    else if (this.props.mode == "uploads") this.queryVideos(this.props.app_parent.state.user)
    else if (this.props.mode == "favorites") this.queryFavorites();
  }

  componentDidUpdate()
  {
    if(this.props.mode == "main")
    {
        this.queryVideos("all");
    } 
    else if (this.props.mode == "uploads") this.queryVideos(this.props.app_parent.state.user);
    else if (this.props.mode == "favorites") this.queryFavorites();
  }

  render()
  {
      if(this.props.mode == "main")
      {
        return (<div className="content-body">
        <input className="search-bar" type="text" size="30" placeholder="Search for some content..."/>
        <br/>
        <h1>Recommended for you</h1>
        <div id="all-videos"/></div>);
      }
      else if (this.props.mode == "uploads")
      {
        return (<div className="content-body">
        <h1 style={{paddingLeft: "50px", paddingRight: "50px", textAlign: "center"}}>Your uploads</h1>
        <br/>
        <div id="all-videos"/></div>);
      }
      else if (this.props.mode == "favorites")
      {
        return (<div className="content-body">
        <h1 style={{paddingLeft: "50px", paddingRight: "50px", textAlign: "center"}}>Favorites</h1>
        <br/>
        <div id="all-videos"/></div>);
      }
  }

async queryVideos(user)
{
  let resp = await fetch("https://interact-server.herokuapp.com/get-videos/" + user, {cache: "no-store"})
        .then(r => r.json());
  let entries = []
  for(var i = 0 ; i < resp.length; i++)
  {
    entries.push(<VideoButton tree_id={resp[i].tree_id} vid_id={resp[i].id} likes={resp[i].likes} initPlayer={(tree,id) => this.props.app_parent.initPlayer(tree,id)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
  }
  if(this.props.mode == "uploads" && entries.length == 0)
  {
    ReactDOM.render(<p>No content was found.</p>,document.getElementById("all-videos"))
  }
  else ReactDOM.render(entries,document.getElementById("all-videos"))
}

async queryFavorites()
{
  let resp = await fetch("https://interact-server.herokuapp.com/get-fav-videos/" + this.props.app_parent.state.user)
        .then(r => r.json());
  resp = resp[0];
  let entries = []
  for(var i = 0 ; i < resp.length; i++)
  {
    entries.push(<VideoButton tree_id={resp[i].tree_id} vid_id={resp[i].id} likes={resp[i].likes} initPlayer={(tree,id) => this.props.app_parent.initPlayer(tree,id)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
  }
  if(entries.length == 0)
  {
    ReactDOM.render(<p>No content was found.</p>,document.getElementById("all-videos"))
  }
  else ReactDOM.render(entries,document.getElementById("all-videos"))
}

}

export default BrowseContent;

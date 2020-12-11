import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import VideoButton from './video-button';
import loadingblack from './loadingblack.gif';
import { backend } from './App';

class BrowseContent extends Component
{
  state = {search_term: undefined}

  componentDidMount()
  {
    this.queryFunction();
  }

  componentDidUpdate()
  {
    this.queryFunction();
  }

  queryFunction()
  {
    if(this.props.mode == "main")
    {
      if(!this.state.search_term || this.state.search_term == "") this.queryVideos("all");
      else this.querySearch();
    }
    else if (this.props.mode == "uploads") this.queryVideos(this.props.app_parent.state.user);
    else if (this.props.mode == "favorites") this.queryFavorites();
  }

  search(ev)
  {
    if(ev.key == 'Enter') this.setState({search_term: document.getElementById("search-bar").value});
  }

  render()
  {
      if(this.props.mode == "main")
      {
        if(!this.state.search_term || this.state.search_term == "")
        {
          return (
          <div className="content-body">
            <input type="search" id="search-bar" onKeyPress={(ev) => this.search(ev)} className="search-bar" type="text" size="30" placeholder="Search for some content..."/>
            <br/>
            <h1>Recommended for you</h1>
            <div id="all-videos">
              <img width="70" height="75"src={loadingblack}/>
            </div>
          </div>);
        }
        else
        {
          return (
          <div className="content-body">
            <input type="search" id="search-bar" onKeyPress={(ev) => this.search(ev)} className="search-bar" type="text" size="30" placeholder="Search for some content..."/>
            <br/>
            <h4>Search results to {this.state.search_term}</h4>
            <div id="all-videos">
              <img width="70" height="75"src={loadingblack}/>
            </div>
          </div>);
        }
      }
      else if (this.props.mode == "uploads")
      {
        return (
        <div className="content-body">
          <h1 style={{paddingLeft: "50px", paddingRight: "50px", textAlign: "center"}}>Your uploads</h1>
          <br/>
          <div id="all-videos">
            <img width="70" height="75"src={loadingblack}/>
          </div>
        </div>);
      }
      else if (this.props.mode == "favorites")
      {
        return (
        <div className="content-body">
          <h1 style={{paddingLeft: "50px", paddingRight: "50px", textAlign: "center"}}>Favorites</h1>
          <br/>
          <div id="all-videos">
            <img width="70" height="75"src={loadingblack}/>
          </div>
        </div>);
      }
  }

  async queryVideos(user)
  {
    let resp = await fetch(backend + "/get-videos/" + user, {cache: "no-store"})
          .then(r => r.json());
    let entries = []
    for(var i = 0 ; i < resp.length; i++)
    {
      let enableEditor = this.props.mode == "uploads";
      entries.push(<VideoButton enableEditorOptions={enableEditor} tree={resp[i].tree} vid_id={resp[i].id} likes={resp[i].likes} initPlayer={(tree,id) => this.props.app_parent.initPlayer(tree,id)} editVideo={(id) => this.props.app_parent.editVideo(id)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
    }
    if(this.props.mode == "uploads" && entries.length == 0)
    {
      ReactDOM.render(<p>No content was found.</p>,document.getElementById("all-videos"))
    }
    else ReactDOM.render(entries,document.getElementById("all-videos"))
  }

  async queryFavorites()
  {
    let fav = await fetch(backend + "/get-fav-videos/" + this.props.app_parent.state.user)
          .then(r => r.json());
    fav = fav[0].likes;
    let entries = []
    for(var i = 0 ; i < fav.length; i++)
    {
      let resp = await fetch(backend + "/get-video/" + fav[i])
                        .then(r => r.json());
      entries.push(<VideoButton tree={resp[0].tree} vid_id={resp[0].id} likes={resp[0].likes} initPlayer={(tree,id) => this.props.app_parent.initPlayer(tree,id)} title={resp[0].name} creator={resp[0].owner} upload_date={resp[0].upload_date} description={resp[0].description} preview_id={resp[0].preview_id}/>)
    }
    if(entries.length == 0)
    {
      ReactDOM.render(<p>No content was found.</p>,document.getElementById("all-videos"))
    }
    else ReactDOM.render(entries,document.getElementById("all-videos"))
  }

  async querySearch()
  {
    let resp = await fetch(backend + "/search-query/" + this.state.search_term, {cache: "no-store"})
          .then(r => r.json());
    let entries = []
    for(var i = 0 ; i < resp.length; i++)
    {
      entries.push(<VideoButton tree={resp[i].tree} vid_id={resp[i].id} likes={resp[i].likes} initPlayer={(tree,id) => this.props.app_parent.initPlayer(tree,id)} editVideo={(id) => this.props.app_parent.editVideo(id)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
    }
    if(entries.length == 0)
    {
      ReactDOM.render(<p>No content was found.</p>,document.getElementById("all-videos"))
    }
    else ReactDOM.render(entries,document.getElementById("all-videos"))
  }

}

export default BrowseContent;

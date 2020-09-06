import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import selector_default from './selector-default.png';

class EditorContent extends Component
{

  state = {tree_status: undefined, selected: null}

  constructor()
  {
      super();
      const base_json = {"video_title": "", "start_video": null, "videos": []};
      this.state = {tree_status: base_json, selected: null};
  }

  render()
  {
      return (
          <div className="editor">
          <div className="editor-content">
          {this.getEditorByJSON()}
          </div>
          <button style={{position: "absolute", top: "90%", left: "85%"}} onClick={() => alert(JSON.stringify(this.state.tree_status))} className="white">Show content JSON</button>
          <button style={{position: "absolute", top: "90%", left: "95%"}} className="white">Publish</button>
          <div className="editor-videos">{this.props.editor_parent.getVideoPreviews(true)}</div>
          {this.getEditorProps()}
          </div>
      )
  }

  //drag n drop events

  getEditorProps()
  {
    if(!this.state.selected) return <div className="editor-props hidden"/>;
    else
    {
      let vidobj = this.getVideoObjInJSON(this.state.selected);
      let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.id;
      return (<div className="editor-props shown">
      <h1 style={{margin: "5px"}}>Event Editor</h1>
      <img width='139' height='80' src={url}/>
      </div>);
    }
  }
  
  drop(ev) {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    console.log(id);
    this.generateJSON("start_video", {"title": "", "id": id, "event": null})
  }

  generateJSON(comp,data)
  {
    let json = this.state.tree_status;
    switch(comp)
    {
      case "start_video":
        json.start_video = data;
        break;
      case "start_video/title":
        json.start_video.title = data;
      case "start_video/event":
        json.start_video.event = data;
    }
    this.setState({tree_status: json, selected: this.state.selected});
  }

  getEditorByJSON()
  {
    let json = this.state.tree_status;

    if(!json.start_video)
    {
      return <div onDrop={(ev) => this.drop(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video"/>;
    }
    else
    {
      let url = "http://interact-server.herokuapp.com/get-preview/" + json.start_video.id;
      return <div onClick={(ev) => this.selectVideo(ev.target.parentNode,"start_video")} className="filled-video"><img width='139' height='80' src={url}/><img className="selector" src={selector_default} /></div>
    }
  }

  getVideoObjInJSON(id)
  {
    if(id == "start_video") return this.state.tree_status.start_video;
    else
    {
      for(let video of this.state.tree_status.videos)
      {
        if(video.id == id) return video;
      }
    }
  }

  selectVideo(div,id)
  {
    this.setState({tree_status: this.state.tree_status, selected: id});
    div.className = "filled-video selected";
  }
}

export default EditorContent;
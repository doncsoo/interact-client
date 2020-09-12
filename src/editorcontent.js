import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';

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
      <img width='230' height='120' src={url}/>
      <label for="title"><b>Title</b></label>
      <input type="text" onChange={(ev) => this.generateJSON(this.state.selected + "/title",ev.target.value)} value={vidobj.title ?? ""} name="title" id="title"/>
      <label for="event"><b>Event</b></label>
      <select onChange={(ev) => this.generateJSON(this.state.selected + "/event",ev.target.value)} value={vidobj.event ? (vidobj.event.type) : ""} name="event" id="event">
        <option value="none">Select one!</option>
        <option value="choice">Choice</option>
        <option value="butterfly">Butterfly</option>
        <option value="linear">Linear</option>
      </select>
      {this.getEventSpecificProps(vidobj)}
      </div>);
    }
  }

  getEventSpecificProps(vidobj)
  {
    if(vidobj.event)
    {
      if(vidobj.event.type == "choice")
      {
        return (
          <div>
          <label for="choiceone"><b>Choice #1</b></label>
          <input type="text" onChange={(ev) => this.generateJSON(this.state.selected + "/choiceone",ev.target.value)} value={vidobj.event.choices.one ?? ""} name="choiceone" id="choiceone"/>
          <label for="choicetwo"><b>Choice #2</b></label>
          <input type="text" onChange={(ev) => this.generateJSON(this.state.selected + "/choicetwo",ev.target.value)} value={vidobj.event.choices.two ?? ""} name="choicetwo" id="choicetwo"/>
          <label><b>Please drag and drop the correct videos in the editor!</b></label>
          </div>
        )
      }
      else if(vidobj.event.type == "linear")
      {
        return (
          <div>
          <label><b>Please drag and drop the correct video in the editor!</b></label>
          </div>
        )
      }
    }
    else return null;
  }
  
  dropSelected(ev) {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(!this.state.selected) this.generateJSON("start_video", {"title": "", "id": id, "event": null});
    else this.generateJSON(this.state.selected, {"title": "", "id": id, "event": null});
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
        break;
      case "start_video/event":
        if(data == "choice")
        {
          json.start_video.event = {type: "choice", duration: 10, choices: { one: null, two: null }, gateway: {
            one: null, two: null }};
        }
        else if(data == "butterfly")
        {
          json.start_video.event = {type: "butterfly", required_choices: [], gateway: []};
        }
        else if(data == "linear")
          json.start_video.event = {type: "linear", gateway: null};
        break;
      case "start_video/choiceone":
        json.start_video.event.choices.one = data;
        break;
      case "start_video/choicetwo":
        json.start_video.event.choices.two = data;
        break;
      case "start_video/lineargateway":
        json.start_video.event.gateway = data;
        break;
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
      return <div><div onClick={(ev) => this.selectVideo(ev.target.parentNode,"start_video")} className="filled-video"><img width='139' height='80' src={url}/></div>
      {this.getEventSpecificEditor(this.getVideoObjInJSON("start_video"))}
      </div>
    }
  }

  getEventSpecificEditor(vidobj)
  {
    if(vidobj.event)
    {
      if(vidobj.event.type == "choice")
      {
        return (<div><svg className="tree-branch" height="500" width="500">
        <line x1="250" y1="0" x2="250" y2="100" />
        <line x1="250" y1="100" x2="100" y2="100" />
        <line x1="100" y1="98.5" x2="100" y2="150" />
        <line x1="250" y1="100" x2="400" y2="100" />
        <line x1="400" y1="98.5" x2="400" y2="150" />
        </svg>
        <div onDrop={(ev) => this.drop(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-left"/>
        <div onDrop={(ev) => this.drop(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-right"/></div>);
      }
      else if(vidobj.event.type == "linear")
      {
        return (<div><svg className="tree-branch" height="500" width="500">
        <line x1="250" y1="0" x2="250" y2="200" />
        </svg>
        <div onDrop={(ev) => this.drop(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"/></div>);
      }
      else return null;
    }
    else return null;
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

  getAllChoices()
  {
    let choices = [];
    if(this.state.tree_status.start_video.event)
    {
      if(this.state.tree_status.start_video.event.type == "choice")
      {
        choices.push(this.state.tree_status.start_video.event.choices.one);
        choices.push(this.state.tree_status.start_video.event.choices.two);
      }
    }
    for(let video of this.state.tree_status.videos)
    {
      if(video.event.type == "choice")
      {
        choices.push(video.event.choices.one);
        choices.push(video.event.choices.two);
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
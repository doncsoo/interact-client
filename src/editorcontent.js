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
          <button onClick={() => this.setState({tree_status: this.state.tree_status, selected: this.getParent(this.state.selected)})} style={{position: "absolute", top: "1%", left: "1%"}} className="white">Go to parent</button>
          {this.getEditorByJSON()}
          </div>
          <button style={{position: "absolute", top: "90%", left: "85%"}} onClick={() => alert(JSON.stringify(this.state.tree_status))} className="white">Show content JSON</button>
          <button style={{position: "absolute", top: "90%", left: "95%"}} className="white">Publish</button>
          <div className="editor-videos">{this.props.editor_parent.getVideoPreviews(true)}</div>
          {this.getEditorProps()}
          </div>
      )
  }

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
      <input type="text" onChange={(ev) => this.generateJSON("title",this.state.selected, ev.target.value)} value={vidobj.title ?? ""} name="title" id="title"/>
      <label for="event"><b>Event</b></label>
      <select onChange={(ev) => this.generateJSON("event",this.state.selected,ev.target.value)} value={vidobj.event ? (vidobj.event.type) : ""} name="event" id="event">
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
          <input type="text" onChange={(ev) => this.generateJSON("choiceone",this.state.selected,ev.target.value)} value={vidobj.event.choices.one ?? ""} name="choiceone" id="choiceone"/>
          <label for="choicetwo"><b>Choice #2</b></label>
          <input type="text" onChange={(ev) => this.generateJSON("choicetwo",this.state.selected,ev.target.value)} value={vidobj.event.choices.two ?? ""} name="choicetwo" id="choicetwo"/>
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
    if(!this.state.selected) this.generateJSON("start_video", null, {"title": "", "id": id, "event": null});
  }

  generateJSON(comp,id,data)
  {
    let json = this.state.tree_status;
    let ptr = undefined;
    if(id == "start_video") ptr = json.start_video;
    else
    {
      for(let i = 0; i < json.videos.length; i++)
      {
        if(json.videos[i].id == id)
        {
          ptr = json.videos[i];
        }
      }
    }

    switch(comp)
    {
      case "start_video":
        json.start_video = data;
        break;
      case "title":
        ptr.title = data;
        break;
      case "event":
        if(data == "choice")
        {
          ptr.event = {type: "choice", duration: 10, choices: { one: null, two: null }, gateway: {
            one: null, two: null }};
        }
        else if(data == "butterfly")
        {
          ptr.event = {type: "butterfly", required_choices: [], gateway: []};
        }
        else if(data == "linear")
          ptr.event = {type: "linear", gateway: null};
        break;
      case "choiceone":
        ptr.event.choices.one = data;
        break;
      case "choicetwo":
        ptr.event.choices.two = data;
        break;
      case "gatewayone":
        ptr.event.gateway.one = data;
        break;
      case "gatewaytwo":
        ptr.event.gateway.two = data;
        break;
      case "lineargateway":
        ptr.event.gateway = data;
        break;
      case "new_video":
        json.videos.push({"title": "", "id": data, "event": null});
    }
    this.setState({tree_status: json, selected: this.state.selected});
  }

  getEditorByJSON()
  {
    if(!this.state.selected)
    {
      if(!this.state.tree_status.start_video)
      {
        return <div onDrop={(ev) => this.dropSelected(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video"/>;
      }
      else
      {
        let url = "http://interact-server.herokuapp.com/get-preview/" + this.state.tree_status.start_video.id;
        return <div><div onClick={(ev) => this.selectVideo("start_video")} className="filled-video"><img width='139' height='80' src={url}/></div>
        {this.getEventSpecificEditor(this.getVideoObjInJSON("start_video"))}
        </div>
      }
    }
    else
    {
      let vidobj = this.getVideoObjInJSON(this.state.selected);
      let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.id;
        return <div><div onClick={(ev) => this.selectVideo(this.state.selected)} className="filled-video"><img width='139' height='80' src={url}/></div>
        {this.getEventSpecificEditor(this.getVideoObjInJSON(this.state.selected))}
        </div>
    }
  }

  getEventSpecificEditor(vidobj)
  {
    if(vidobj.event)
    {
      if(vidobj.event.type == "choice")
      {
        let video_grids = [];
        if(vidobj.event.gateway.one)
        {
          let url1 = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway.one;
          video_grids.push(<div onClick={(ev) => this.selectVideo(vidobj.event.gateway.one)} className="filled-video-left"><img width='139' height='80' src={url1}/><h2>#1</h2></div>);
        }
        else video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"one")} onDragOver={(ev) => ev.preventDefault()} className="empty-video-left"><h2>#1</h2></div>);

        if(vidobj.event.gateway.two)
        {
          let url2 = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway.two;
          video_grids.push(<div onClick={(ev) => this.selectVideo(vidobj.event.gateway.two)} className="filled-video-right"><img width='139' height='80' src={url2}/><h2>#2</h2></div>);
        }
        else video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"two")} onDragOver={(ev) => ev.preventDefault()} className="empty-video-right"><h2>#2</h2></div>);

        return (<div><svg className="tree-branch" height="500" width="500">
        <line x1="250" y1="0" x2="250" y2="100" />
        <line x1="250" y1="100" x2="100" y2="100" />
        <line x1="100" y1="98.5" x2="100" y2="150" />
        <line x1="250" y1="100" x2="400" y2="100" />
        <line x1="400" y1="98.5" x2="400" y2="150" />
        </svg>
        {video_grids}</div>);
      }
      else if(vidobj.event.type == "linear")
      {
        let video_grid = null;

        if(vidobj.event.gateway)
        {
          let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway;
          video_grid = <div onClick={(ev) => this.selectVideo(vidobj.event.gateway.one)} className="filled-video-linear"><img width='139' height='80' src={url}/></div>;
        }
        else video_grid = <div onDrop={(ev) => this.dropLinear(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"/>;
        
        return (<div><svg className="tree-branch" height="500" width="500">
        <line x1="250" y1="0" x2="250" y2="200" />
        </svg>
        {video_grid}</div>);
      }
      else return null;
    }
    else return null;
  }

  dropChoice(ev,which)
  {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(this.state.selected)
    {
      this.generateJSON("gateway" + which,this.state.selected, id);
      this.generateJSON("new_video", null, id);
    } 
  }

  dropLinear(ev)
  {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(this.state.selected)
    {
      this.generateJSON("lineargateway",this.state.selected, id);
      this.generateJSON("new_video", null, id);
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

  vidObjEventContains(vidobj,id)
  {
    if(vidobj.event)
    {
      if(vidobj.event.type == "choice")
      {
        return vidobj.event.gateway.one == id || vidobj.event.gateway.two == id;
      }
      else if(vidobj.event.type == "linear")
      {
        return vidobj.event.gateway == id;
      }
      else return false;
    }
    else return false;

  }

  getParent(id)
  {
    let json = this.state.tree_status;
    if(this.vidObjEventContains(this.getVideoObjInJSON("start_video"),id) == true)
    {
      return "start_video";
    } 
    else 
    {
      for(let video of json.videos)
      {
        if(this.vidObjEventContains(video,id) == true) {
          console.log(video.id)
          return video.id;
        } 
      }
    }

  }

  selectVideo(id)
  {
    this.setState({tree_status: this.state.tree_status, selected: id});
  }
}

export default EditorContent;
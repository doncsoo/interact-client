import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import EditorFinalize from './editorfinalize';
import Cookie from 'cookie';

class EditorContent extends Component
{

  state = {tree_status: undefined, selected: null, butterfly_selected: null}

  constructor()
  {
      super();
      const base_json = {"video_title": "", "start_video": null, "videos": []};
      this.state = {tree_status: base_json, selected: null, butterfly_selected: null};
  }

  componentDidMount()
  {
    if(this.props.vid_id != null) this.getTree();
  }

  async getTree()
  {
    console.log("fetching tree of " + this.props.vid_id);
    let tree = await fetch("http://interact-server.herokuapp.com/get-tree/" + this.props.vid_id).then(r => r.json());
    console.log(tree);
    this.setState({tree_status: tree[0].tree, selected: null, butterfly_selected: null});
  }

  render()
  {
      let savebutton = null;
      if(this.props.vid_id != null)
      savebutton = <button style={{position: "absolute", top: "90%", left: "95%"}} onClick={() => ReactDOM.render(<EditorFinalize parent={this} editsave={true}/>,document.getElementById("popup"))} className="white">Save</button>;
      else
      savebutton = <button style={{position: "absolute", top: "90%", left: "95%"}} onClick={() => ReactDOM.render(<EditorFinalize parent={this} editsave={false}/>,document.getElementById("popup"))} className="white">Finalize</button>;
      return (
          <div>
          <div className="editor-content">
          <button onClick={() => this.toggleNavigation()} style={{position: "absolute", top: "1%", left: "1%"}} className="white">Navigate</button>
          <div style={{display: "none"}} id="editor-navigation" className="editor-navigation">
          {this.getNavigationContent()}
          </div>
          {this.getEditorByJSON()}
          </div>
          <button style={{position: "absolute", top: "90%", left: "85%"}} onClick={() => alert(JSON.stringify(this.state.tree_status))} className="white">Show content JSON</button>
          {savebutton}
          <div className="editor-videos">
          <button style={{display: "block"}} onClick={() => this.props.editor_parent.setState({mode: "upload", videos: this.props.editor_parent.state.videos})} className="white">Upload videos</button>
          {this.props.editor_parent.getVideoPreviews(true)}
          </div>
          {this.getEditorProps()}
          <div id="popup"></div>
          </div>
      )
  }

  toggleNavigation()
  {
    let state = document.getElementById("editor-navigation").style.display;
    console.log(state);
    if(state == "block") document.getElementById("editor-navigation").style.display = "none";
    else if(state == "none") document.getElementById("editor-navigation").style.display = "block";
  }

  deRenderFinModal()
  {
    ReactDOM.unmountComponentAtNode(document.getElementById("popup"));
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
      else if(vidobj.event.type == "butterfly")
      {
        let choices = this.getAllChoices();
        let alreadybound = vidobj.event.required_choices.map((c) => {return <li>{c}</li>});
        return (
          <div>
          <label><b>Select a previous choice and then drag and drop the desired video in the editor!</b></label>
          <select onChange={(ev) => this.setState({tree_status: this.state.tree_status, selected: this.state.selected, butterfly_selected: ev.target.value})} value={this.state.butterfly_selected ?? "none"} name="butterfly" id="butterfly">
            <option value="none">Select one!</option>
            {choices.map((c) => { return <option value={c}>{c}</option>})}
          </select>
          <label><b>Already bound choices:</b></label>
          <ul>
            {alreadybound}
          </ul>
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
      case "butterfly":
        this.processButterflyChanges(ptr,data);
        break;
      case "new_video":
        json.videos.push({"title": "", "id": data, "event": null});
    }
    this.setState({tree_status: json, selected: this.state.selected, butterfly_selected: this.state.butterfly_selected});
  }

  processButterflyChanges(tree_ptr,data)
  {
    let choice = data[0];
    let gateway = data[1];

    //checking and replacing if it already exists
    for(let i = 0; i < tree_ptr.event.required_choices.length; i++)
    {
      if(choice == tree_ptr.event.required_choices[i])
      {
        tree_ptr.event.required_choices.splice(i,1,choice);
        tree_ptr.event.gateway.splice(i,1,gateway);
        return;
      }
    }

    tree_ptr.event.required_choices.push(choice);
    tree_ptr.event.gateway.push(gateway);
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
        return <div><div onDrop={(ev) => this.dropSelected(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={() => this.selectVideo("start_video")} className="filled-video"><img width='139' height='80' src={url}/></div>
        {this.getEventSpecificEditor(this.getVideoObjInJSON("start_video"))}
        </div>
      }
    }
    else
    {
      let vidobj = this.getVideoObjInJSON(this.state.selected);
      let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.id;
        return <div><div onDrop={(ev) => this.dropSelected(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={() => this.selectVideo(this.state.selected)} className="filled-video"><img width='139' height='80' src={url}/></div>
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
          video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"one")} onDragOver={(ev) => ev.preventDefault()} onClick={() => this.selectVideo(vidobj.event.gateway.one)} className="filled-video-left"><img width='139' height='80' src={url1}/><h2>#1</h2></div>);
        }
        else video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"one")} onDragOver={(ev) => ev.preventDefault()} className="empty-video-left"><h2>#1</h2></div>);

        if(vidobj.event.gateway.two)
        {
          let url2 = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway.two;
          video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"two")} onDragOver={(ev) => ev.preventDefault()} onClick={(ev) => this.selectVideo(vidobj.event.gateway.two)} className="filled-video-right"><img width='139' height='80' src={url2}/><h2>#2</h2></div>);
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
          video_grid = <div onDrop={(ev) => this.dropLinear(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={(ev) => this.selectVideo(vidobj.event.gateway)} className="filled-video-linear"><img width='139' height='80' src={url}/></div>;
        }
        else video_grid = <div onDrop={(ev) => this.dropLinear(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"/>;
        
        return (<div><svg className="tree-branch" height="500" width="500">
        <line x1="250" y1="0" x2="250" y2="200" />
        </svg>
        {video_grid}</div>);
      }
      else if(vidobj.event.type == "butterfly" && this.state.butterfly_selected != null)
      {
        let video_grid = null;

        let index = null;
        console.log(vidobj.event.required_choices)
        for(let i = 0; i < vidobj.event.required_choices.length; i++)
        {
          console.log("Comparing " + this.state.butterfly_selected + " " + vidobj.event.required_choices[i])
          if(this.state.butterfly_selected == vidobj.event.required_choices[i])
          {
            index = i;
            break;
          }
        }

        console.log(index);
        console.log(vidobj.event.gateway[index]);
        if(index != null)
        {
          if(vidobj.event.gateway[index] != undefined)
          {
            let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway[index];
            video_grid = <div onDrop={(ev) => this.dropButterfly(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={(ev) => this.selectVideo(vidobj.event.gateway[index])} className="filled-video-linear"><img width='139' height='80' src={url}/></div>;
          }
          else video_grid = <div onDrop={(ev) => this.dropButterfly(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"/>;
        }
        else video_grid = <div onDrop={(ev) => this.dropButterfly(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"/>;
        
        return (<div><svg className="tree-branch" height="500" width="500">
        <line x1="250" y1="0" x2="250" y2="200" />
        </svg>
        {video_grid}</div>);
      }
      else return null;
    }
    else return null;
  }

  getNavigationContent()
  {
    let navigation_buttons = [];
    console.log(this.state.tree_status.start_video);
    if(this.state.tree_status.start_video != null)
    {
      let start_url = "http://interact-server.herokuapp.com/get-preview/" + this.state.tree_status.start_video.id;
      navigation_buttons.push(
        <button style={{border: "none", background: "none"}} onClick={(ev) => this.setState({tree_status: this.state.tree_status, selected: "start_video", butterfly_selected: null})}><div style={{display: "flex"}}><img width='139' height='80' src={start_url}/><h3 style={{color: "black", paddingLeft: "5px"}}>{this.state.tree_status.start_video.title ?? "<no title>"}</h3><label>START</label></div></button>);
      for(let video of this.state.tree_status.videos)
      {
        let url = "http://interact-server.herokuapp.com/get-preview/" + video.id;
        navigation_buttons.push(
          <button style={{border: "none", background: "none"}} onClick={(ev) => this.setState({tree_status: this.state.tree_status, selected: video.id, butterfly_selected: null})}><div style={{display: "flex"}}><img width='139' height='80' src={url}/><h3 style={{color: "black", paddingLeft: "5px"}}>{video.title ?? "<no title>"}</h3></div></button>);
      }
      return navigation_buttons;
    }
    else
    {
      return <label>No videos present yet.</label>;
    }
  }

  dropChoice(ev,which)
  {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(this.videoPresentInTree(id))
    {
      alert("This video is already present in the tree. Please remove it before using it elsewhere!");
      return;
    }
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
    if(this.videoPresentInTree(id))
    {
      alert("This video is already present in the tree. Please remove it before using it elsewhere!");
      return;
    }
    if(this.state.selected)
    {
      this.generateJSON("lineargateway",this.state.selected, id);
      this.generateJSON("new_video", null, id);
    }
  }

  dropButterfly(ev)
  {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(this.videoPresentInTree(id))
    {
      alert("This video is already present in the tree. Please remove it before using it elsewhere!");
      return;
    }
    if(this.state.selected)
    {
      this.generateJSON("butterfly",this.state.selected, [this.state.butterfly_selected,id]);
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
      if(video.event)
      {
        if(video.event.type == "choice")
        {
          choices.push(video.event.choices.one);
          choices.push(video.event.choices.two);
        }
      }
    }
    return choices;
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

  videoPresentInTree(id)
  {
    let json = this.state.tree_status;
    if(json.start_video.id == id) return true;
    else
    {
      for(let video of json.videos)
      {
        if(video.id == id) return true;
      }
      return false;
    }
  }

  selectVideo(id)
  {
    this.setState({tree_status: this.state.tree_status, selected: id, butterfly_selected: null});
  }

  async uploadContent(title,description,prev_id)
  {
    let json = this.state.tree_status;
    json.video_title = title;
    let cookies = Cookie.parse(document.cookie);
    let resp = await fetch("https://interact-server.herokuapp.com/insert-content",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: title,
                   desc: description,
                   token: cookies.session_token,
                   preview_id: prev_id,
                   tree: JSON.stringify(json)}),
        })
        .then(r => r.text());
    if(resp == "OK") return true;
    else return false;
  }

  async saveContent()
  {
    let cookies = Cookie.parse(document.cookie);
    let resp = await fetch("https://interact-server.herokuapp.com/edit-content",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: this.props.vid_id,
                   token: cookies.session_token,
                   tree: JSON.stringify(this.state.tree_status)})
        })
        .then(r => r.text());
    if(resp == "OK") return true;
    else return false;
  }
}

export default EditorContent;
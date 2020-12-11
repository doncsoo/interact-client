import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import EditorFinalize from './editorfinalize';
import Cookie from 'cookie';
import loadinggif from './loadingblack.gif';
import butterfly from './butterflywhite.png';
import { backend } from './App';

class EditorContent extends Component
{

  state = {tree_status: undefined, selected: null, butterfly_selected: null}

  constructor(props)
  {
      super(props);
      if(props.vid_id == null) this.state = {tree_status: props.editor_parent.state.tree_status, selected: null, butterfly_selected: null};
      else this.state = {tree_status: {"video_title": "", "start_video": null, "videos": []}, selected: null, butterfly_selected: null};
  }

  async componentDidMount()
  {
    if(this.props.vid_id != null)
    {
      await this.getTree();
      if(this.props.editor_parent.state.videos.length == 0) {
        console.log("fetching videos");
        this.props.editor_parent.getAlreadyPresentVideos();
      }
    } 
    if(this.state.tree_status.start_video != null) 
      this.setState({tree_status: this.state.tree_status, selected: "start_video", butterfly_selected: null})
  }

  async getTree()
  {
    console.log("fetching tree of " + this.props.vid_id);
    let tree = await fetch("http://interact-server.herokuapp.com/get-tree/" + this.props.vid_id).then(r => r.json());
    console.log(tree);
    this.setState({tree_status: tree[0].tree, selected: null, butterfly_selected: null});
    this.props.editor_parent.setState({mode: this.props.editor_parent.state.mode, tree_status: tree[0].tree, 
      videos: this.props.editor_parent.state.videos, imported: this.props.editor_parent.state.imported});
  }

  dragStart(ev)
  {
    ev.dataTransfer.setData("vidid", ev.target.getAttribute("vidid"));
  }

  render()
  {
      let savebutton = null;
      if(this.props.vid_id != null)
      savebutton = <button onClick={() => ReactDOM.render(<EditorFinalize parent={this} editsave={true}/>,document.getElementById("popup"))} className="white save-button"><h1 style={{color: "black", margin: "0px"}}>Save</h1></button>;
      else
      savebutton = <button onClick={() => this.treeValidation()} className="white save-button"><h1 style={{color: "black", margin: "0px"}}>Upload</h1></button>;
      return (
          <div>
            <button onClick={() => this.toggleNavigation()} style={{position: "absolute", top: "7%", left: "1%", zIndex: "1"}} className="white">Navigate</button>
            <div style={{display: "none"}} id="editor-navigation" className="editor-navigation">
              {this.getNavigationContent()}
            </div>
            <div className="editor-content">
              {this.getEditorByJSON()}
            </div>
            {/*<button style={{position: "absolute", top: "90%", left: "85%"}} onClick={() => alert(JSON.stringify(this.state.tree_status))} className="white">Show content JSON</button>*/}
            {savebutton}
            <div className="editor-videos">
              <button style={{display: "block"}} onClick={() => this.props.editor_parent.setState({mode: "upload", tree_status: this.state.tree_status, videos: this.props.editor_parent.state.videos, imported: this.props.editor_parent.state.imported})} className="white">Upload videos</button>
              {this.props.editor_parent.getVideoPreviews(true)}
            </div>
            {this.getEditorProps()}
            <div id="popup"/>
          </div>
      )
  }

  async prereqPopUp()
  {
    document.getElementById("prereq_loading").className = "shown";
    let list = [];
    list.push(<option value="none">None (default)</option>);
    let cookies = Cookie.parse(document.cookie)
    let resp = await fetch(backend + "/get-videos/" + cookies.session_user, {cache: "no-store"})
        .then(r => r.json());
    for(let vid of resp)
    {
      list.push(<option value={vid.id}>{vid.name}</option>);
    }

    ReactDOM.render(
      <div className="modal">
        <div className="modal-content3 animate">
          <button style={{margin: "5px", display: "inline"}} onClick={() => ReactDOM.unmountComponentAtNode(document.getElementById("popup"))} className="closeblack"/>
          <div id="logincontainer">
            <h2 style={{color: "black"}}>Select an existing content!</h2>
            <select id="prereq_list">{list}</select>
            <button onClick={() => { this.props.editor_parent.importChoices(document.getElementById("prereq_list").value) 
                                     ReactDOM.unmountComponentAtNode(document.getElementById("popup"))}} className="black">Import</button>
          </div>
        </div>
      </div>,document.getElementById("popup"),() => {document.getElementById("prereq_loading").className = "hidden"});
  }

  toggleNavigation()
  {
    let state = document.getElementById("editor-navigation").style.display;
    if(state == "block") document.getElementById("editor-navigation").style.display = "none";
    else if(state == "none") document.getElementById("editor-navigation").style.display = "block";
  }

  getEditorProps()
  {
    if(!this.state.selected) return <div className="editor-props hidden"/>;
    else
    {
      let vidobj = this.getVideoObjInJSON(this.state.selected);
      let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.id;
      return (
      <div className="editor-props shown">
        <h1 style={{margin: "5px"}}>Event Editor</h1>
        <div style={{display: "flex"}}>
          <img style={{borderRadius: "5px"}} width='230' height='120' src={url}/>
          <div><button onClick={() => window.open("https://interact-videos.s3.eu-central-1.amazonaws.com/" + vidobj.id)} className="black">Preview</button></div>
        </div>
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
            <label for="duration"><b>Choice Duration</b></label>
            <input type="number" onChange={(ev) => this.generateJSON("duration",this.state.selected,ev.target.value)} value={vidobj.event.duration ?? ""} name="duration" id="duration"/>
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
        return (
          <div>
            <label><b>Select a previous choice and then drag and drop the desired video in the editor!</b></label>
            <select onChange={(ev) => this.setState({tree_status: this.state.tree_status, selected: this.state.selected, butterfly_selected: ev.target.value})} value={this.state.butterfly_selected ?? "none"} name="butterfly" id="butterfly">
              <option value="none">Select one!</option>
              {choices.map((c) => { return <option value={c}>{c}</option>})}
            </select>
            <button onClick={() => this.prereqPopUp()} className="black">Import choices</button><img id="prereq_loading" className="hidden" src={loadinggif} width="32" height="32"/>
            <label><b>Already bound choices:</b></label>
            <ul>
              {vidobj.event.required_choices.map((c) => {return <li>{c}</li>})}
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
    if(!id)
    {
      alert("Invalid drag-drop. Please only use the videos in the lower left corner.");
      return;
    }
    if(this.state.selected == null && this.state.tree_status.start_video == null)
    {
      this.generateJSON("start_video", null, {"title": "", "id": id, "event": null});
    }
    else this.replaceSelected(this.state.selected != null ? this.state.selected : "start_video", id);
  }

  replaceSelected(old_vidid,new_vidid)
  {
    if(this.videoPresentInTree(new_vidid))
    {
      alert("This video is already present in the tree. Please remove it before using it elsewhere!");
      return;
    }
    if(old_vidid == "start_video") this.generateJSON("start_video", null, {"title": "", "id": new_vidid, "event": null});
    else
    {
      let tree = this.state.tree_status;
      if(tree.start_video.id == old_vidid) tree.start_video.id = new_vidid;
      if(tree.start_video.event != null)
      {
          if(tree.start_video.event.type == "choice")
          {
            if(tree.start_video.event.gateway.one == old_vidid) tree.start_video.event.gateway.one = new_vidid;
            if(tree.start_video.event.gateway.two == old_vidid) tree.start_video.event.gateway.two = new_vidid;
          }
          else if(tree.start_video.event.type == "linear")
          {
            if(tree.start_video.event.gateway == old_vidid) tree.start_video.event.gateway = new_vidid;
          }
          else if(tree.start_video.event.type == "butterfly")
          {
            let j = tree.start_video.event.gateway.indexOf(old_vidid);
            tree.start_video.event.gateway[j] = new_vidid;
          }
      }
      for(let i = 0; i < tree.videos.length; i++)
      {
        if(tree.videos[i].id == old_vidid) tree.videos[i].id = new_vidid;
        if(tree.videos[i].event != null)
        {
          if(tree.videos[i].event.type == "choice")
          {
            if(tree.videos[i].event.gateway.one == old_vidid) tree.videos[i].event.gateway.one = new_vidid;
            if(tree.videos[i].event.gateway.two == old_vidid) tree.videos[i].event.gateway.two = new_vidid;
          }
          else if(tree.videos[i].event.type == "linear")
          {
            if(tree.videos[i].event.gateway == old_vidid) tree.videos[i].event.gateway = new_vidid;
          }
          else if(tree.videos[i].event.type == "butterfly")
          {
            let j = tree.videos[i].event.gateway.indexOf(old_vidid);
            tree.videos[i].event.gateway[j] = new_vidid;
          }
        }
      }
      this.setState({tree_status: tree, selected: new_vidid, butterfly_selected: this.state.butterfly_selected});
    }
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
          ptr.event = {type: "choice", duration: 10, choices: { one: "#1", two: "#2" }, gateway: {
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
      case "duration":
        ptr.event.duration = Number(data);
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
        return <div><div onDrop={(ev) => this.dropSelected(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={() => this.selectVideo("start_video")} className="filled-video"><img className="inner-filled-video" width='139' height='80' src={url}/></div>
        {this.getEventSpecificEditor(this.getVideoObjInJSON("start_video"))}
        </div>
      }
    }
    else
    {
      let vidobj = this.getVideoObjInJSON(this.state.selected);
      let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.id;
        return <div><div onDrop={(ev) => this.dropSelected(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={() => this.selectVideo(this.state.selected)} className="filled-video"><img className="inner-filled-video" width='139' height='80' src={url}/></div>
        {this.getEventSpecificEditor(this.getVideoObjInJSON(this.state.selected))}
        </div>
    }
  }

  produceBranchSvg(branch)
  {
    if(branch == true)
    {
      return(
        <div>
          <svg className="tree-branch" height="500" width="500">
            <line x1="250" y1="0" x2="250" y2="100" />
            <line x1="250" y1="100" x2="100" y2="100" />
            <line x1="100" y1="98.5" x2="100" y2="150" />
            <line x1="250" y1="100" x2="400" y2="100" />
            <line x1="400" y1="98.5" x2="400" y2="150" />
          </svg>
        </div>
      );
    }
    else
    {
      return (
        <div>
          <svg className="tree-branch" height="500" width="500">
            <line x1="250" y1="0" x2="250" y2="200" />
          </svg>
        </div>
      )
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
          video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"one")} onDragOver={(ev) => ev.preventDefault()} onClick={() => this.selectVideo(vidobj.event.gateway.one)} className="filled-video-left"><img className="inner-filled-video" width='139' height='80' src={url1}/><h2>#1</h2></div>);
        }
        else video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"one")} onDragOver={(ev) => ev.preventDefault()} className="empty-video-left"><h2>#1</h2></div>);

        if(vidobj.event.gateway.two)
        {
          let url2 = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway.two;
          video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"two")} onDragOver={(ev) => ev.preventDefault()} onClick={(ev) => this.selectVideo(vidobj.event.gateway.two)} className="filled-video-right"><img className="inner-filled-video" width='139' height='80' src={url2}/><h2>#2</h2></div>);
        }
        else video_grids.push(<div onDrop={(ev) => this.dropChoice(ev,"two")} onDragOver={(ev) => ev.preventDefault()} className="empty-video-right"><h2>#2</h2></div>);

        return (
        <div>
        {this.produceBranchSvg(true)}
        {video_grids}</div>);
      }
      else if(vidobj.event.type == "linear")
      {
        let video_grid = null;

        if(vidobj.event.gateway)
        {
          let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway;
          video_grid = <div onDrop={(ev) => this.dropLinear(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={(ev) => this.selectVideo(vidobj.event.gateway)} className="filled-video-linear"><img className="inner-filled-video" width='139' height='80' src={url}/></div>;
        }
        else video_grid = <div onDrop={(ev) => this.dropLinear(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"/>;
        
        return (<div className="vidbranch-linear">
        {this.produceBranchSvg(false)}
        {video_grid}</div>);
      }
      else if(vidobj.event.type == "butterfly" && this.state.butterfly_selected != null && this.state.butterfly_selected != "none")
      {
        let video_grid = null;

        let index = null;
        for(let i = 0; i < vidobj.event.required_choices.length; i++)
        {
          if(this.state.butterfly_selected == vidobj.event.required_choices[i])
          {
            index = i;
            break;
          }
        }

        if(index != null)
        {
          if(vidobj.event.gateway[index] != undefined)
          {
            let url = "http://interact-server.herokuapp.com/get-preview/" + vidobj.event.gateway[index];
            video_grid = <div onDrop={(ev) => this.dropButterfly(ev)} onDragOver={(ev) => ev.preventDefault()} onClick={(ev) => this.selectVideo(vidobj.event.gateway[index])} className="filled-video-linear"><img className="inner-filled-video" width='139' height='80' src={url}/><br/><img src={butterfly}/></div>;
          }
          else video_grid = <div onDrop={(ev) => this.dropButterfly(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"><br/><img src={butterfly}/></div>;
        }
        else video_grid = <div onDrop={(ev) => this.dropButterfly(ev)} onDragOver={(ev) => ev.preventDefault()} className="empty-video-linear"><br/><img src={butterfly}/></div>;
        
        return (<div>
        {this.produceBranchSvg(false)}
        {video_grid}</div>);
      }
      else return null;
    }
    else return null;
  }

  getNavigationContent()
  {
    let navigation_buttons = [];
    if(this.state.tree_status.start_video != null)
    {
      let start_url = "http://interact-server.herokuapp.com/get-preview/" + this.state.tree_status.start_video.id;
      navigation_buttons.push(
        <button style={{border: "none", background: "none"}} onClick={(ev) => this.setState({tree_status: this.state.tree_status, selected: "start_video", butterfly_selected: null})}><div style={{display: "flex"}}><img style={{borderRadius: "5px"}} vidid={this.state.tree_status.start_video.id} onDragStart={(ev) => this.dragStart(ev)} draggable="true" width='139' height='80' src={start_url}/><h3 style={{color: "black", paddingLeft: "5px"}}>{this.state.tree_status.start_video.title ?? "<no title>"}</h3><label>START</label></div></button>);
      for(let video of this.state.tree_status.videos)
      {
        navigation_buttons.push(<br/>);
        let url = "http://interact-server.herokuapp.com/get-preview/" + video.id;
        navigation_buttons.push(
          <button style={{border: "none", background: "none"}} onClick={(ev) => this.setState({tree_status: this.state.tree_status, selected: video.id, butterfly_selected: null})}><div style={{display: "flex"}}><img style={{borderRadius: "5px"}} vidid={video.id} onDragStart={(ev) => this.dragStart(ev)} draggable="true" width='139' height='80' src={url}/><h3 style={{color: "black", paddingLeft: "5px"}}>{video.title ?? "<no title>"}</h3></div></button>);
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
    if(!id)
    {
      alert("Invalid drag-drop. Please only use the videos in the lower left corner.");
      return;
    }
    if(this.state.selected != null)
    {
      this.generateJSON("gateway" + which,this.state.selected, id);
      if(!this.videoPresentInTree(id)) this.generateJSON("new_video", null, id);
    }
  }

  dropLinear(ev)
  {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(!id)
    {
      alert("Invalid drag-drop. Please only use the videos in the lower left corner.");
      return;
    }
    if(this.state.selected != null)
    {
      this.generateJSON("lineargateway",this.state.selected, id);
      if(!this.videoPresentInTree(id)) this.generateJSON("new_video", null, id);
    }
  }

  dropButterfly(ev)
  {
    ev.preventDefault();
    let id = ev.dataTransfer.getData("vidid");
    if(!id)
    {
      alert("Invalid drag-drop. Please only use the videos in the lower left corner.");
      return;
    }
    if(this.state.selected)
    {
      this.generateJSON("butterfly",this.state.selected, [this.state.butterfly_selected,id]);
      if(!this.videoPresentInTree(id)) this.generateJSON("new_video", null, id);
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
    
    return choices.concat(this.props.editor_parent.state.imported);
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
    if(this.state.tree_status.start_video)
    {
      if(this.state.tree_status.start_video.id == id) return true;
      for(let video of this.state.tree_status.videos)
      {
        if(video.id == id) return true;
      }
      return false;
    }
    else return false;
  }

  selectVideo(id)
  {
    this.setState({tree_status: this.state.tree_status, selected: id, butterfly_selected: null});
  }

  validation_validGateways(event)
  {
    if(event)
    {
      if(event.type == "choice")
      {
        return event.gateway.one != null && event.gateway.two != null;
      }
      else if(event.type == "butterfly")
      {
        return event.gateway != [] && event.required_choices.length == event.gateway.length;
      }
      else if(event.type == "linear")
      {
        return event.gateway != null;
      }
    }
    else return true;
  }

  treeValidation()
  {
    let tree = this.state.tree_status;
    //the start_video must contain one event
    if(tree.start_video == null || tree.start_video.event == null || tree.videos.length == 0)
    {
      alert("ERROR: The start video must contain an event!");
      return;
    }
    else
    {
      //every event's gateway must be a not null value
      if(this.validation_validGateways(tree.start_video.event) == false)
      {
        alert("ERROR: Certain gateways haven't been assigned.");
        return;
      }
      for(let video of tree.videos)
      {
        if(this.validation_validGateways(video.event) == false)
        {
          alert("ERROR: Certain gateways haven't been assigned.");
          return;
        }
      }

    }

    //Go to finalize pop up, if validation passed
    ReactDOM.render(<EditorFinalize parent={this} editsave={false}/>,document.getElementById("popup"));
  }

  async uploadContent(title,description,prev_id,prerequisite)
  {
    let json = this.state.tree_status;
    json.video_title = title;
    let cookies = Cookie.parse(document.cookie);
    let resp = await fetch(backend + "/content",{
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: title,
                   desc: description,
                   token: cookies.session_token,
                   preview_id: prev_id,
                   tree: JSON.stringify(json),
                   prereq: prerequisite != "none" ? prerequisite : null}),
        })
        .then(r => r.text());
    if(resp == "OK") return true;
    else return false;
  }

  async saveContent()
  {
    let cookies = Cookie.parse(document.cookie);
    let resp = await fetch(backend + "/content",{
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
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import VideoUpload from './video-upload';
import EditorContent from './editorcontent';

class Editor extends Component
{

  state = {mode: "upload", tree_status: null, videos: [], imported: []}

  constructor(props)
  {
    super(props);
    const base_json = {"video_title": "", "start_video": null, "videos": []};
    this.state = {mode: "upload", tree_status: base_json, videos: [], imported: []}
    if(this.props.vid_id != null)
    {
      this.state = {mode: "edit", tree_status: null, videos: [], imported: []};
    }
  }

  render()
  {
      if(this.state.mode == "upload")
      {
        return (
          <div className="editor">
          <VideoUpload editor_parent={this}/>
          </div>
        )
      }
      else if(this.state.mode == "edit")
      {
        return (
          <div className="editor">
          <EditorContent editor_parent={this} vid_id={this.props.vid_id ?? undefined}/>
          </div>
        )
      }
      
  }

  getVideoPreviews(draggable = false)
  {
    let obj = [];
    for(let id of this.state.videos)
    {
      let objectURL = "http://interact-server.herokuapp.com/get-preview/" + id;
      if(draggable) obj.push(<div className="drag-vid"><img vidid={id} onDragStart={(ev) => this.dragStart(ev)} draggable="true" width='139' height='80' src={objectURL}/></div>);
      else obj.push(<div className="drag-vid"><img width='139' height='80' src={objectURL}/></div>);
    }
    return obj;
  }

  dragStart(ev)
  {
    ev.dataTransfer.setData("vidid", ev.target.getAttribute("vidid"));
  }

  async importChoices(vidid)
  {
    let impchoices = [];
    let resp = await fetch("http://interact-server.herokuapp.com/get-tree/" + vidid, {cache: "no-store"})
        .then(r => r.json());
    let tree = resp[0].tree;
    if (tree.start_video.event.type == "choice")
    {
      impchoices.push(tree.start_video.event.choices.one);
      impchoices.push(tree.start_video.event.choices.two);
    }

    for(let vid of tree.videos)
    {
      if(vid.event != null)
      {
        if(vid.event.type == "choice")
        {
          impchoices.push(vid.event.choices.one);
          impchoices.push(vid.event.choices.two);
        }
      }
    }

    this.setState({mode: this.state.mode, tree_status: this.state.tree_status, 
      videos: this.state.videos, imported: this.state.imported.concat(impchoices)});
    alert("Choices from the selected content successfully imported.");
  }
}

export default Editor;
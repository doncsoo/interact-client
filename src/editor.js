import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import VideoUpload from './video-upload';
import EditorContent from './editorcontent';

class Editor extends Component
{

  state = {mode: "upload", videos: []}

  render()
  {
      if(this.props.vid_id != null)
      {
        return (
          <div className="editor">
          <EditorContent editor_parent={this} vid_id={this.props.vid_id}/>
          </div>)
      }
      else if(this.state.mode == "upload")
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
          <EditorContent editor_parent={this}/>
          </div>
        )
      }
      
  }

  getVideoPreviews(draggable = false)
  {
    let obj = [];
    let arr = this.state.videos;
    arr.push("13ZhK1u5W2")
    for(let id of arr)
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
}

export default Editor;
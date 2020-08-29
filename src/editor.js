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
      if(this.state.mode == "upload")
      {
        return (
            <VideoUpload editor_parent={this}/>
        )
      }
      else if(this.state.mode == "edit")
      {
        return (
            <EditorContent editor_parent={this}/>
        )
      }
      
  }

  getVideoPreviews()
  {
    let obj = [];
    for(let id of this.state.videos)
    {
      let objectURL = "http://interact-server.herokuapp.com/get-preview/" + id;
      obj.push(<div className="drag-vid"><img width='139' height='80' src={objectURL}/></div>);
    }
    return obj;
  }
}

export default Editor;
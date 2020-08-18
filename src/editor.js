import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import VideoUpload from './video-upload';

class Editor extends Component
{

  state = {mode: "upload"}

  render()
  {
      if(this.state.mode == "upload")
      {
        return (
            <VideoUpload/>
        )
      }
      else if(this.state.mode == "edit")
      {
        return (
            <div>
            <p>Here comes editor stuff.</p>
            </div>
        )
      }
      
  }
}

export default Editor;
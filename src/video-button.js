import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import blankpreview from './blank-preview.png'

class VideoButton extends Component
{

  state = {}

  render()
  {
      let editor_buttons = null;
      if(this.props.enableEditorOptions) 
      editor_buttons = <button onClick={() => this.props.editVideo(this.props.vid_id)} className="black">Edit</button>;
      return (
          <div>
          <div style={{cursor: "pointer"}} onClick={() => this.props.initPlayer(this.props.tree,this.props.vid_id)} id="video-button">
          <img id={"preview" + this.props.vid_id} width="200px" height="120px"></img>
          <div>
          <label style={{cursor: "pointer"}} style={{paddingBottom: "5px", paddingLeft: "5px", fontSize: "20px"}}><b>{this.props.title}</b></label>
          <label style={{paddingBottom: "5px", paddingLeft: "5px"}}> <b>By:</b> {this.props.creator}</label>
          <label style={{paddingBottom: "5px", paddingLeft: "5px"}}> <b>Uploaded:</b> {this.props.upload_date.substring(0,10)}</label>
          <label style={{paddingBottom: "5px", paddingLeft: "5px", fontSize: "11px"}}>{this.props.description.substring(0,100)}</label>
          </div>
          </div>
          {editor_buttons}
          </div>
      )
  }

  componentDidMount()
  {
      this.fetchPreview(document.getElementById("preview" + this.props.vid_id))
  }

  async fetchPreview(img)
  {
      if(this.props.preview_id)
      {
        await fetch("https://interact-videos.s3.eu-central-1.amazonaws.com/previews/" + this.props.preview_id)
            .then(r => r.blob())
            .then(function(resp)
            {
                var objectURL = URL.createObjectURL(resp);
                img.src = objectURL;
            })
      }
      else img.src = blankpreview;
  }
}

export default VideoButton;
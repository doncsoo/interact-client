import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import blankpreview from './blank-preview.png'

class VideoButton extends Component
{

  state = {}

  render()
  {
      return (
          <div onClick={() => this.props.initPlayer(this.props.tree_id)} id="video-button">
          <img id="preview" width="200px" height="120px"></img>
          <label style={{paddingBottom: "5px", paddingLeft: "5px"}}><b>{this.props.title}</b></label>
          <label style={{display: "none"}}>By: {this.props.creator}</label>
          <label style={{display: "none"}}>By: {this.props.upload_date}</label>
          <label style={{display: "none"}}>{this.props.description}</label>
          </div>
      )
  }

  componentDidMount()
  {
      this.fetchPreview(document.getElementById("preview"))
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
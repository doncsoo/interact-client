import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import blankpreview from './blank-preview.png';
import Cookie from 'cookie';

class VideoButton extends Component
{

  state = {}

  render()
  {
      let editor_buttons = [];
      if(this.props.enableEditorOptions)
      {
        editor_buttons.push(<button onClick={() => this.props.editVideo(this.props.vid_id)} className="black">Edit</button>);
        editor_buttons.push(<button onClick={() => this.deleteVideo()} className="black">Delete</button>);
      }
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

  async deleteVideo()
  {
      let confirm_res = window.confirm("Are you want to delete this content?");
      if(confirm_res == true)
      {
        let cookies = Cookie.parse(document.cookie);
        let resp = await fetch("https://interact-server.herokuapp.com/delete-content",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                   token: cookies.session_token,
                   id: this.props.vid_id}),
        })
        .then(r => r.text());
        console.log(resp);
        if(resp == "OK")
        {
            alert("The content was deleted.");
            this.location.reload();
        }
      }
  }
}

export default VideoButton;
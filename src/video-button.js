import React, {Component} from 'react';
import blankpreview from './blank-preview.png';
import Cookie from 'cookie';
import { backend } from './App';

class VideoButton extends Component
{
  render()
  {
      return (
          <div>
            <div style={{cursor: "pointer"}} onClick={() => this.props.initPlayer(this.props.tree,this.props.vid_id)} id="video-button">
              <img id={"preview" + this.props.vid_id} src={this.fetchPreview()} width="200px" height="120px"></img>
              <div id="attributes">
                <label style={{cursor: "pointer"}} style={{paddingBottom: "5px", paddingLeft: "5px", fontSize: "20px"}}><b>{this.props.title}</b></label>
                <label style={{paddingBottom: "5px", paddingLeft: "5px"}}> <b>By:</b> {this.props.creator}</label>
                <label style={{paddingBottom: "5px", paddingLeft: "5px"}}> <b>Uploaded:</b> {this.props.upload_date.substring(0,10)}</label>
                <label style={{paddingBottom: "5px", paddingLeft: "5px", fontSize: "11px"}}>{!this.props.description ? "" : this.props.description.substring(0,100)}</label>
              </div>
            </div>
            {this.renderEditorExtras()}
          </div>
      );
  }

  renderEditorExtras()
  {
    if(this.props.enableEditorOptions)
    {
      return (
        <div>
          <label style={{display: "inline"}}> <b>Likes:</b> {this.props.likes}</label>
          <button onClick={() => this.props.editVideo(this.props.vid_id)} className="black">Edit</button>
          <button onClick={() => this.deleteVideo()} className="black">Delete</button>
        </div>
      );
    }
    else return null;
  }

  fetchPreview()
  {
      if(this.props.preview_id) return "https://interact-videos.s3.eu-central-1.amazonaws.com/previews/" + this.props.preview_id;
      else return blankpreview;
  }

  async deleteVideo()
  {
    let confirm_res = window.confirm("Are you want to delete this content?");
    if(confirm_res == true)
    {
      let status = undefined;
      let cookies = Cookie.parse(document.cookie);
      let resp = await fetch(backend + "/content",{
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
                  token: cookies.session_token,
                  id: this.props.vid_id}),
      })
      .then(function(r) {
        status = r.status; 
        return r.text()
      });

      if(status == 200)
      {
          alert("The content was deleted.");
          window.location.reload()
      }
    }
  }
}

export default VideoButton;
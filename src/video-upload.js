import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import loadinggif from './loading.gif';
import videoselect from './videoselect.png';

class VideoUpload extends Component
{
  render()
  {
      return (
        <div className="video-upload">
        <h2 style={{color: "white"}}>Upload your videos you wish to use during editing</h2>
        <label style={{color: "white"}}>The video format must be MP4</label>
        <br/>
        <label htmlFor="upload-file">
        <img className="video-select" src={videoselect} width="150" height="90"/>
        </label>
        <input type="file" accept=".mp4" id="upload-file" onInput={() => this.getRequest()}/>
        <div id="uploaded">
        {this.props.editor_parent.getVideoPreviews()}
        </div>
        <div id="upload_queue"/>
        <button onClick={() => this.props.editor_parent.setState({mode: "edit"})} className="white">Next</button>
        </div>
      )
  }

  makeid(length) {
    let result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  async getRequest()
  {
    ReactDOM.render(<div><img src={loadinggif} width="32" height="32"/><label style={{color: "white", display: "inline"}}>Uploading {document.getElementById("upload-file").files[0].name}</label></div>,document.getElementById("upload_queue"))
    var id = this.makeid(10);
    var filetype = document.getElementById("upload-file").files[0].type;
    var response = await fetch("https://interact-server.herokuapp.com/upload-verify?file-name=" + id + "&file-type=" + filetype).then(r => r.json());
    this.uploadFile(document.getElementById("upload-file").files[0],response,id)
  }

async uploadFile(file,requestData,id){
  if(requestData == null || requestData == "Upload failed")
  {
    console.log("Upload aborted, signed request query failed...")
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', requestData.signedRequest);
  xhr.setRequestHeader('x-amz-acl', 'public-read');
  xhr.onreadystatechange = async () => {
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        alert('File successfully uploaded');
        ReactDOM.unmountComponentAtNode(document.getElementById("upload_queue"));
        let temp_videos = this.props.editor_parent.state.videos;
        temp_videos.push(id);
        this.props.editor_parent.setState({mode: "upload", videos: temp_videos});
      }
      else{
        alert('Could not upload file.');
      }
    }
  };
  xhr.send(file);
}
}

export default VideoUpload;
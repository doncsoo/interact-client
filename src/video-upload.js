import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import loadinggif from './loading.gif';
import videoselect from './videoselect.png';

class VideoUpload extends Component
{

  state = {}

  render()
  {
      return (
        <div className="video-upload">
        <h2 style={{color: "white"}}>Upload your videos you wish to use during editing</h2>
        <label style={{color: "white"}}>The video format must be MP4</label>
        <br/>
        <label for="upload-file">
        <img className="video-select" src={videoselect} width="150" height="90"/>
        </label>
        <input type="file" accept=".mp4" id="upload-file" onInput={() => this.getRequest()}/>
        <div id="uploaded">
        </div>
        <div id="upload_queue"/>
        <button className="white">Next</button>
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
  
  async addVideoPreview(id)
  {
    let objectURL = "http://interact-server.herokuapp.com/get-preview/" + id;
    document.getElementById("uploaded").innerHTML += "<div><img width='139' height='80' src=" + objectURL + "/></div>"
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
        this.addVideoPreview(id);
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
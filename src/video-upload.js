import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class VideoUpload extends Component
{

  state = {}

  render()
  {
      return (
        <div>
        <h1>Upload your videos</h1>
        <br/>
        <input type="file" accept=".mp4" id="upload-file"/>
        <br/>
        <button onClick={() => this.getRequest()}>Send</button>
        <h1>Your uploaded content</h1>
        <div id="uploaded">
        </div>
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
    var id = this.makeid(10);
    console.log("uploading video as " + id);
    var filetype = document.getElementById("upload-file").files[0].type;
    //this.addVideoPreview(document.getElementById("upload-file").files[0].name)
    var response = await fetch("https://interact-server.herokuapp.com/upload-verify?file-name=" + id + "&file-type=" + filetype).then(r => r.json());
    this.uploadFile(document.getElementById("upload-file").files[0],response,id)
  }
  
  async addVideoPreview(file)
  {
    
    ReactDOM.render(<div><img width="320" height="480" src="preview-1.jpg"/>{file.name}</div>,document.getElementById("uploaded"))
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
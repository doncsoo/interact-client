import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import blankpreview from './blank-preview.png'
//NOT FUNCTIONAL, ONLY EXISTS CURRENTLY TO HOLD ALREADY WRITTEN UPLOAD CODE!
class ContentCreator extends Component
{

  state = {}

  render()
  {
      return (
          <div>
        <label><b>Upload test</b></label>
        <br></br>
        <input type="file" id="upload-file"/>
        <br></br>
        <label>Name</label>
        <input type="text" id="upload-name"/>
        <br></br>
        <label>Description</label>
        <textarea id="upload-desc" rows="4" cols="50"/>
         <button onClick={() => this.getRequest()}>Send</button>
       <label id="link"></label>
       </div>
      )
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

  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  async getRequest()
  {
    var id = this.makeid(5);
    console.log("uploading video as " + id);
    //var name = document.getElementById("upload-file").files[0].name;
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
  console.log(requestData)
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', requestData.signedRequest);
  xhr.setRequestHeader('x-amz-acl', 'public-read');
  xhr.onreadystatechange = async () => {
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        document.getElementById('link').innerHTML = requestData.url;
        var resp = await fetch("https://interact-server.herokuapp.com/insert-video",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: document.getElementById("upload-name").value,
                   desc: document.getElementById("upload-desc").value,
                   treeid: id }),
        })
        console.log(resp)
      }
      else{
        alert('Could not upload file.');
      }
    }
  };
  xhr.send(file);
}
}

export default ContentCreator;
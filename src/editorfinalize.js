import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import videoselect from './videoselect_grey.png';
import loadingblack from './loadingblack.gif';
import Cookies from 'cookie'

class EditorFinalize extends Component
{
  state = {mode: undefined, vid_id: null, preview: null}

  constructor(props)
  {
      super(props);
      if(props.editsave == true) this.processSave();
      else this.state = {mode: "overview", vid_id: null, preview: null};
  }

  async componentDidMount()
  {
    document.getElementById('id01').style.display="block";
    this.renderAllVideosList();
  }

  render()
  {
      return (
        <div id="id01" className="modal">
        <div className="modal-content2 animate">
        <button style={{margin: "5px", display: "inline"}} onClick={() => this.props.parent.deRenderFinModal()} className="closeblack"/>
        {this.getMainContent()}
        </div>
        </div>
      )
  }

  getMainContent()
  {
    if(this.state.mode == "overview")
    {
      return (<div className="logincontainer">
      <h2 style={{color: "black"}}>
      You're almost ready!
      </h2>
      <label for="conttitle"><b>Content Title</b></label>
      <input type="text" name="conttitle" id="conttitle" size="30"/>
      <label for="desc"><b>Content Description</b></label>
      <textarea name="desc" id="desc" rows="4" cols="40"/>
      {this.getPreviewImgHtml()}
      <label><b>Prerequisite (optional)</b></label>
      <select name="prereq" id="prereq"/>
      <br></br>
      <button onClick={() => this.processUpload()} className="black">Publish</button>
      </div>);
    }
    else if(this.state.mode == "loading")
    {
      return (<div className="logincontainer">
      <img width="142" height="150" src={loadingblack}/>
      </div>);
    }
    else if(this.state.mode == "save")
    {
        return(<div className="logincontainer">
      <h2 style={{color: "black"}}>Success! Your content is updated!</h2>
      <button onClick={() => this.props.parent.props.editor_parent.props.app_parent.backToMainPage()} className="black">Back to main menu</button>
      </div>);
    }
    else if(this.state.mode == "error")
    {
        return (<div className="logincontainer">
      <div className="notification error"><p>Something went wrong...</p></div>
      </div>);
    }
    else if(this.state.mode == "success")
    {
    return(<div className="logincontainer">
      <h2 style={{color: "black"}}>Success! Your content is now live!</h2>
      <button onClick={() => this.props.parent.props.editor_parent.props.app_parent.backToMainPage()} className="black">Back to main menu</button>
      </div>);
    }
  }

  async renderAllVideosList()
  {
    console.log("fetching all videos for prereq comp");
    let list = [];
    list.push(<option value="none">None (default)</option>);
    let cookies = Cookies.parse(document.cookie)
    let resp = await fetch("https://interact-server.herokuapp.com/get-videos/" + cookies.session_user, {cache: "no-store"})
        .then(r => r.json());
    console.log(resp);
    for(let vid of resp)
    {
      list.push(<option value={vid.id}>{vid.name}</option>);
    }

    ReactDOM.render(list,document.getElementById("prereq"));
  }

  getPreviewImgHtml()
  {
    if(this.state.preview == null)
    {
      return (
      <div>
      <label><b>(Optional) Upload a preview image</b></label>
      <label htmlFor="upload-file">
      <img className="video-select" src={videoselect} width="150" height="90"/>
      </label>
      <input type="file" accept="image/*" id="upload-file" onInput={() => this.getRequest()}/>
      </div>
      )
    }
    else if(this.state.preview == "PENDING")
    {
      return (
        <div>
        <label><b>(Optional) Upload a preview image</b></label>
        <img width="70" height="75" src={loadingblack}/>
        </div>
      )
    }
    else
    {
      let prev_url = "https://interact-videos.s3.eu-central-1.amazonaws.com/previews/" + this.state.preview;
      return (
        <div>
        <label><b>Selected preview image</b></label>
        <img src={prev_url} width="150" height="90"/>
        </div>
        )
    }
  }

  async processSave()
  {
      this.setState({mode : "loading", vid_id: null, preview: this.state.preview});
      let result = await this.props.parent.saveContent();
      if(result == true) this.setState({mode: "save", vid_id : null, preview: this.state.preview});
      else this.setState({mode : "error", vid_id: null, preview: this.state.preview});
  }

  async processUpload()
  {
      this.setState({mode : "loading", vid_id: null, preview: this.state.preview});
      let result = await this.props.parent.uploadContent(document.getElementById("conttitle").value,document.getElementById("desc").value, this.state.preview, document.getElementById("prereq").value);
      if(result == true) this.setState({mode: "success", vid_id : null, preview: this.state.preview});
      else this.setState({mode : "error", vid_id: null, preview: this.state.preview});
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
    let file = document.getElementById("upload-file").files[0];
    var filetype = document.getElementById("upload-file").files[0].type;
    if(!filetype.includes("image"))
    {
      alert("ERROR: The selected image is not in a correct format.");
      return;
    }
    this.setState({mode: this.state.mode, vid_id: this.state.vid_id, preview: "PENDING"});
    var id = this.makeid(10);
    var response = await fetch("https://interact-server.herokuapp.com/upload-verify-image?file-name=" + id + "&file-type=" + filetype).then(r => r.json());
    this.uploadFile(file,response,id);
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
          this.setState({mode : this.state.mode, vid_id: this.state.vid_id, preview: id})
        }
        else{
          alert('Could not upload file.');
          this.setState({mode: this.state.mode, vid_id: this.state.vid_id, preview: null});
        }
      }
    };
    xhr.send(file);
  }
}

export default EditorFinalize;
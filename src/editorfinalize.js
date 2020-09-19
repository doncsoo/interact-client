import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import videoselect from './videoselect_grey.png';
import loadingblack from './loadingblack.gif';

class EditorFinalize extends Component
{
  state = {mode: undefined, vid_id: null}

  constructor(props)
  {
      super(props);
      if(props.editsave == true) this.processSave();
      else this.state = {mode: "overview", vid_id: null};
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
      <label><b>(Optional) Upload a preview image</b></label>
      <label htmlFor="upload-file">
      <img className="video-select" src={videoselect} width="150" height="90"/>
      </label>
      <input type="file" accept="image/*" id="upload-file" onInput={() => this.getRequest()}/>
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

  async processSave()
  {
      this.setState({mode : "loading", vid_id: null});
      let result = await this.props.parent.saveContent();
      if(result == true) this.setState({mode: "save", vid_id : null});
      else this.setState({mode: "error", vid_id : null});
  }

  async processUpload()
  {
      this.setState({mode : "loading", vid_id: null});
      let result = await this.props.parent.uploadContent(document.getElementById("conttitle").value,document.getElementById("desc").value,null);
      if(result == true) this.setState({mode: "success", vid_id : null});
      else this.setState({mode: "error", vid_id : null});

  }

  componentDidMount()
  {
    document.getElementById('id01').style.display="block";
  }
}

export default EditorFinalize;
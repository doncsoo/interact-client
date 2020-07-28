import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import './App.css';
import Player from './player';
import VideoButton from './video-button'

class App extends Component
{

  state = {mode: "browse", tree_id: null}

  componentDidMount()
  {
    if(this.state.mode == "browse") this.queryVideos();
  }

  componentDidUpdate()
  {
    if(this.state.mode == "browse") this.queryVideos();
  }

  render()
  {
    if (this.state.mode == "browse") {
      return (<Router>
        <div className="App">
         <Switch>
          <Route path="/video_play">
          <Player/>
          </Route>
          <Route path="">
         <div className="black-header">
         <h2 className="logo">INTERACT</h2>
         <h3 className="log-in"><a>Log In</a></h3>
         </div>
         {/*<label><b>Upload test</b></label>
         <br></br>
         <input type="file" id="upload-file"/>
         <br></br>
         <label>Name</label>
         <input type="text" id="upload-name"/>
         <br></br>
         <label>Description</label>
         <textarea id="upload-desc" rows="4" cols="50"/>
          <button onClick={() => this.getRequest()}>Send</button>
        <label id="link"></label>*/}
         <div className="content-body">
         <input className="search-bar" type="text" size="30" placeholder="Search for some content..."/>
          <br></br>
          <div id="all-videos"/>
         </div>
          </Route>
          </Switch>
          </div>
          </Router>);
    }
    else if(this.state.mode == "video_play")
    {
      return (<div><Player app_parent={this} tree_id={this.state.tree_id}/></div>)
    }
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

async queryVideos()
{
  var resp = await fetch("https://interact-server.herokuapp.com/get-videos")
        .then(r => r.json());
  var entries = []
  for(var i = 0 ; i < resp.length; i++)
  {
    //entries.push(<div><h3>{resp[i].name}</h3><h5>{resp[i].upload_date}</h5><button id={resp[i].tree_id} onClick={e => this.initPlayer(e.target.id)}>Link a videóhoz</button><label>{resp[i].description}</label></div>)
    entries.push(<VideoButton tree_id={resp[i].tree_id} initPlayer={(tree) => this.initPlayer(tree)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
  }
  ReactDOM.render(entries,document.getElementById("all-videos"))
}

initPlayer(treeid)
{
  console.log("Launching video...")
  this.setState({ mode: "video_play", tree_id: treeid });
}
}

export default App;

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Cookie from 'cookie';
import VideoButton from './video-button';
import { backend } from './App';

class Manager extends Component
{
  render()
  {
      return (
          <div className="content-body">
              <h1 style={{paddingLeft: "50px", paddingRight: "50px", textAlign: "center"}}>Manage Activity</h1>
              <div>
                <h4>Manage content</h4>
                <p>Modify or delete selected content which is deemed inappropriate.</p>
                <label for="vidname"><b>Content title</b></label>
                <input type="text" placeholder="Enter content name" name="vidname" id="vidname" required/>
                <button className="black" onClick={() => this.search(document.getElementById("vidname").value)}>Search</button>
                <div id="found"/>
              </div>
              <div>
                <h4>Delete user</h4>
                <p>Delete selected user which activity is deemed inappropriate. Please note that all content created by this user will be deleted as well.</p>
                <label for="deluname"><b>Username</b></label>
                <input type="text" placeholder="Enter a user's name" name="deluname" id="deluname" required/>
                <button className="black" onClick={() => this.deleteUser()}>Delete user</button>
              </div>
          </div>
      );
  }

    async search(val)
    {
    let resp = await fetch(backend + "/search-query/" + val, {cache: "no-store"})
            .then(r => r.json());
    let entries = []
    for(var i = 0 ; i < resp.length; i++)
    {
        entries.push(<VideoButton enableEditorOptions={true} tree={resp[i].tree} vid_id={resp[i].id} likes={resp[i].likes} initPlayer={(tree,id) => this.props.app_parent.initPlayer(tree,id)} editVideo={(id) => this.props.app_parent.editVideo(id)} title={resp[i].name} creator={resp[i].owner} upload_date={resp[i].upload_date} description={resp[i].description} preview_id={resp[i].preview_id}/>)
    }
    if(entries.length == 0)
    {
        ReactDOM.render(<p>No content was found.</p>,document.getElementById("found"))
    }
    else ReactDOM.render(entries,document.getElementById("found"))
    }

    async deleteUser()
    {
        if(document.getElementById("deluname").value == "")
        {
            alert("Please supply a username.");
            return;
        }
        else if(document.getElementById("deluname").value == this.props.app_parent.state.user)
        {
            alert("You cannot delete yourself.");
            return;
        }
        let confirm_res = window.confirm("Are you sure you want to delete the following user?");
        if(confirm_res == true)
        {
            let cookies = Cookie.parse(document.cookie);
            let status = undefined;
            console.log(document.getElementById("deluname").value);
            console.log(cookies.session_token);
            let resp = await fetch(backend + "/user",{
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                        username: document.getElementById("deluname").value,
                        token: cookies.session_token}),
        })
        .then(function(r) {
            status = r.status; 
            return r.text()
          });

        alert(status == 200 ? "The user was deleted." : resp);
        }
    }
}

export default Manager;
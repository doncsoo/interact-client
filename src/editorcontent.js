import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class EditorContent extends Component
{

  state = {tree_status: undefined}

  initTree()
  {
      const base_json = {"video_title": "", "start_video": null, "videos": []};
      this.setState({tree_status: base_json});
  }

  render()
  {
      return (
          <div className="editor">
          <button className="white">Show content JSON</button>
          <div className="editor-videos">{this.props.editor_parent.getVideoPreviews()}</div>
          <div className="editor-props">
          <h1 style={{margin: "5px"}}>Event Editor</h1>
          </div>
          </div>
      )
  }
}

export default EditorContent;
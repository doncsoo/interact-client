import React, {Component} from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    componentDidCatch(error, info) {
      this.setState({ hasError: true });
      console.log(error);
      console.log(info);
    }
  
    render() {
      if (this.state.hasError) {
        return (<div className="container" id="video1">
                    <div id="error-screen">
                        <h2>An error occurred.</h2>
                        <h3>Please try again later.</h3>
                        <button className="white" onClick={() => window.location.reload()}>Return to main page</button>
                    </div>
                </div>);
      }
      return this.props.children;
    }
}

export default ErrorBoundary;
import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import ErrorBoundary from './errorboundary';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();

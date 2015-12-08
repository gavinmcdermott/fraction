// // Import modules
import React from 'react';
import ReactDOM from 'react-dom';

// // Import redux devtools components
// import { devTools, persistState } from 'redux-devtools';
// import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

// // Load components
import App from './components/App';

// // Import reducers
// import rootReducer from './reducers/index';

// // Compose the store function
// const finalCreateStore = compose(
//     // Provides support for DevTools:
//     devTools(),
//     // Lets you write ?debug_session=<name> in address bar to persist debug sessions
//     persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
// )(createStore);

// // Create the store
// let store = finalCreateStore(rootReducer);

ReactDOM.render(<App />, document.getElementById('app'));

console.log('this is clear');

// ReactDOM.render(<div>This is new</div>, document.getElementById('app'));

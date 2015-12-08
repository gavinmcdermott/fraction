// Import React/redux
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Import actions
import { addTodo } from '../actions';

// Import components
import TodoList from './TodoList';
import TodoAddForm from './TodoAddForm';

// Import stylesheets
import styles from '../styles/base.css';

/**
 * <App />
 */
class App extends Component {
    /**
     * Renders the component
     */
    render() {
        return (
            <div>This is the Client we care</div>
        );
    }
}

/**
 * Selector function to injector into the global state
 * @param object state
 * @return object
 */
function select(state) {
    return {
        data: state.data
    }
}

console.log('this is another log from within components');

export default App;

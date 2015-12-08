import React, { Component } from 'react';

// Import styles
// import styles from '../styles/todo.scss';

/**
 * <TodoItem />
 */
export default class TodoItem extends Component {
    render() {
        return (
            <li >
                {this.props.children}
            </li>
        );
    }
}

import * as React from 'react';
import { Component, PropTypes } from 'react';
// import {autobind} from 'core-decorators';
import * as classNames from 'classnames';
import './Screen.css';

interface ScreenProps {
	isOverlay?: boolean;
}
interface ScreenState {}

class Screen extends Component<ScreenProps, ScreenState> {
	static propTypes = {
		isOverlay: PropTypes.bool
	};

	render() {
		return (
			<div className={classNames({GameScreen: true, 'GameScreen--overlay': this.props.isOverlay})}>
				{this.props.children}
			</div>
		);
	}
}

export default Screen;

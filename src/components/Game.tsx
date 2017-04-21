import * as React from 'react';
import { Component } from 'react';
import { autobind } from 'core-decorators';
import Screen from './Screen';
// import Board from '../App';

// type Object = {[key: string]: any};

interface ScreenProps {
	switchScreen: (newScreen: JSX.Element) => void;
	addScreen: (newScreen: JSX.Element) => void;
	popScreen: () => void;
	backInHistory: (amount?: number) => void;
	isOverlay?: boolean;
}

class MainMenuScreen extends Component<ScreenProps, null> {
	render(): JSX.Element {
		const {switchScreen} = this.props;
		return (
			<Screen {...this.props}>
				<h1>Pipes Game</h1>
				<div>
					<button onClick={() => switchScreen(<DifficultySelectScreen {...this.props} />)}>New Game</button>
					<button onClick={() => switchScreen(<InstructionsScreen {...this.props} />)}>Instructions</button>
				</div>
			</Screen>
		);
	}
}

class DifficultySelectScreen extends Component<ScreenProps, null> {
	render(): JSX.Element {
		const {switchScreen} = this.props;
		const newGame = (difficulty: string) =>
			switchScreen(<GameScreen {...this.props} difficulty={difficulty} />);
		return (
			<Screen {...this.props}>
				<h3>Select Difficulty:</h3>
				<div>
					<button onClick={() => newGame('easy')}>Easy</button>
					<button onClick={() => newGame('medium')}>Medium</button>
					<button onClick={() => newGame('hard')}>Hard</button>
				</div>
			</Screen>
		);
	}
}

class InstructionsScreen extends Component<ScreenProps, null> {
	render(): JSX.Element {
		const {backInHistory} = this.props;
		return (
			<Screen {...this.props}>
				<h3>Instructions</h3>
				<p>Bla bla bla connect all the pipes bla bla</p>
				<button onClick={() => backInHistory()}>Back to the menu</button>
			</Screen>
		);
	}
}

interface GameScreenProps extends ScreenProps {
	difficulty: string;
}

class GameScreen extends Component<GameScreenProps, null> {
	render(): JSX.Element {
		const {backInHistory, addScreen} = this.props;
		const {difficulty, ...passProps} = this.props;
		return (
			<Screen {...this.props}>
				GAME GAME GAME GAME! (difficulty level: {difficulty})
				<button
					onClick={() => addScreen(
						<StatusScreen
							{...passProps}
							onNewGameClick={this.newGame}
							message="Yay!"
						/>
					)}
				>
					WIN! :)
				</button>
				<button
					onClick={() => addScreen(
						<StatusScreen
							{...passProps}
							onNewGameClick={this.newGame}
							message="Nay :'("
						/>
					)}
				>
					LOSE!!! :'(
				</button>
				<button
					onClick={() => backInHistory(2)}
				>
					Back to the menu
				</button>
			</Screen>
		);
	}

	@autobind
	newGame() {
		this.props.popScreen();
	}
}

interface StatusScreenProps extends ScreenProps {
	onNewGameClick: () => void;
	message: string;
}

class StatusScreen extends Component<StatusScreenProps, null> {
	render(): JSX.Element {
		const {switchScreen} = this.props;
		const {onNewGameClick, message, ...passProps} = this.props;
		return (
			<Screen {...this.props}>
				{message}
				<button onClick={onNewGameClick}>New Game</button>
				<button onClick={() => switchScreen(<MainMenuScreen {...passProps} />)}>
					Back to the menu
				</button>
			</Screen>
		);
	}
}

/*
class OverlayScreen extends Component<ScreenProps, null> {
	render() {
		return (
			<Screen {...this.props}>
				Overlay <button onClick={this.props.popScreen}>Remove overlay</button>
			</Screen>
		);
	}
}
*/

interface GameProps {}
interface GameState {
	currentScreens: JSX.Element[];
	history: JSX.Element[][];
}

class Game extends Component<GameProps, GameState> {
	screenActions = {
		switchScreen: this.switchScreen,
		addScreen: this.addScreen,
		popScreen: this.popScreen,
		backInHistory: this.backInHistory
	};

	constructor() {
		super();
		this.state = {
			currentScreens: [
				<MainMenuScreen
					{...this.screenActions}
				/>
			],
			history: []
		};
	}

	render() {
		return (
			<div>
				{this.state.currentScreens[0]}
				{this.state.currentScreens.slice(1).map((el, i) => ({
					...el,
					key: i,
					props: {
						...(el && el.props || {}),
						isOverlay: true
					}
				}))}
			</div>
		);
	}

	@autobind
	switchScreen(newScreen: JSX.Element) {
		this.setState({
			history: [...this.state.history, [...this.state.currentScreens]],
			currentScreens: [newScreen]
		});
	}

	@autobind
	addScreen(newScreen: JSX.Element) {
		this.setState({
			currentScreens: [...this.state.currentScreens, newScreen]
		});
	}

	@autobind
	popScreen() {
		this.setState({
			currentScreens: this.state.currentScreens.slice(0, this.state.currentScreens.length - 1)
		});
	}

	@autobind
	backInHistory(amount: number = 1) {
		const newHistory = this.state.history.slice(0, Math.max(0, this.state.history.length - amount));
		const newCurrentScreens = this.state.history[newHistory.length];
		this.setState({
			history: newHistory,
			currentScreens: newCurrentScreens
		});
	}
}

export default Game;

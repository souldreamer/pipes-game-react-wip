import * as React from 'react';
import './App.css';
import { autobind } from 'core-decorators';
import { checkLevelCompletion, generateLevel, randomizeLevel, rotateBoardPiece } from './shared/builder';
import { SyntheticEvent } from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

interface BoardElementProps {
	symbol: string;
	onClick: () => void;
}

class BoardElement extends React.Component<BoardElementProps, null> {
	static translationMap: {[key: string]: string} = {
		'|': 'sprite sprite-l',
		'-': 'sprite sprite--',
		'<': 'sprite sprite-u1',
		'^': 'sprite sprite-u2',
		'>': 'sprite sprite-u3',
		'_': 'sprite sprite-u4',
		'+': 'sprite sprite-plus',
		'T': 'sprite sprite-t1',
		'A': 'sprite sprite-t2',
		'I': 'sprite sprite-t3',
		'H': 'sprite sprite-t4',
		'0': 'sprite sprite-0'
	};

	@autobind
	onClick() {
		this.props.onClick();
	}

	@autobind
	onDoubleClick() {
		this.props.onClick();
		this.props.onClick();
	}

	render() {
		return (
			<ReactCSSTransitionGroup
				transitionName="rotate90cw"
				transitionEnterTimeout={100}
				transitionLeaveTimeout={100}
			>
				<div
					className={BoardElement.translationMap[this.props.symbol]}
					onClick={this.onClick}
					key={this.props.symbol}
				/>
			</ReactCSSTransitionGroup>
		);
	}
}

interface BoardProps {
	board: string[][];
	onBoardClick: (row: number, col: number) => void;
	isActive: boolean;
}

class Board extends React.Component<BoardProps, null> {
	static defaultProps = {
		isActive: true
	};

	render() {
		return (
			<div className="Board">
				{this.props.board.map((row, i) =>
					<div key={`row-${i}`} className="Board-row">
						{row.map((el, j) =>
							<BoardElement key={`cell-${i}-${j}`} symbol={el} onClick={this.props.onBoardClick.bind(null, i, j)} />
						)}
					</div>
				)}
			</div>
		);
	}
}

interface WinMessageProps {
	onNewGame: () => void;
}

class WinMessage extends React.Component<WinMessageProps, null> {
	render() {
		return (
			<ReactCSSTransitionGroup
				transitionName="fade"
				transitionAppear={true}
				transitionAppearTimeout={350}
				transitionLeave={true}
				transitionLeaveTimeout={250}
			>
				<div className="WinMessage" key="WinMessage">
					<span>Congrats!</span>
					<button onClick={this.props.onNewGame}>New Game</button>
				</div>
			</ReactCSSTransitionGroup>
		);
	}
}

interface AppState {
	board: string[][];
	won: boolean;
}

class App extends React.Component<null, AppState> {
	rowInputRef: HTMLInputElement;
	colInputRef: HTMLInputElement;
	formRef: HTMLFormElement;

	state: AppState = {
		board: [[]],
		won: false
	};

	@autobind
	onBoardClick(row: number, col: number) {
		if (this.state.won) { return; }

		const newBoard = rotateBoardPiece(this.state.board, row, col);
		this.setState({
			board: newBoard
		});

		if (checkLevelCompletion(newBoard)) {
			setTimeout(
				() => this.setState({ won: true }),
				500
			);
		}
	}

	@autobind
	onBoardSizeFormSubmit(event: SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		this.createBoard();
	}

	@autobind
	createBoard() {
		const rows = +this.rowInputRef.value;
		const cols = +this.colInputRef.value;
		this.setState({
			board: randomizeLevel(generateLevel(rows, cols)),
			won: false
		});
	}

	@autobind setFormRef(form: HTMLFormElement) { this.formRef = form; }
	@autobind setRowInputRef(input: HTMLInputElement) { this.rowInputRef = input; }
	@autobind setColInputRef(input: HTMLInputElement) { this.colInputRef = input; }

	componentDidMount() {
		this.createBoard();
	}

	render() {
		return (
			<div className="App">
				<div className="App-header">
					<form onSubmit={this.onBoardSizeFormSubmit} ref={this.setFormRef}>
						<input type="spinner" placeholder="rows" defaultValue="7" ref={this.setRowInputRef} />
						<input type="spinner" placeholder="columns" defaultValue="5" ref={this.setColInputRef} />
						<button type="submit">Create board</button>
					</form>
				</div>
				<div className="Board-container" style={{position: 'relative'}}>
					<Board board={this.state.board} onBoardClick={this.onBoardClick} isActive={this.state.won} />
					{this.state.won && <WinMessage onNewGame={this.createBoard} />}
				</div>
			</div>
		);
	}
}

export default App;

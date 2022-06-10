import React, { Component } from 'react'

export default class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pass: ''
		}
	}

	onPasswordChange(e) {
		this.setState({
			pass: e.target.value
		})
	}

	render() {
		const { pass } = this.state;
		const { login, logErr, lengthErr } = this.props;

		const renderLogError = logErr ? <span className='login-error'>Введен неправильный пароль!</span> : null;
		const renderLengthError = lengthErr && pass.length < 6 ? <span className='login-error'>Пароль должен быть длиннее 5 символов</span> : null;

		return (
			<div className='login-container'>
				<div className='login'>
					<h2 className="uk-modal-title uk-text-center">Авторизация</h2>
					<div className="uk-margin-top uk-text-lead">Пароль:</div>
					<form onSubmit={(e) => login(e, pass)}>
						<input
							type="password"
							name=''
							id=''
							className='uk-input uk-margin-top'
							placeholder='Пароль'
							value={pass}
							onChange={e => this.onPasswordChange(e)} />

						{renderLogError}
						{renderLengthError}

						<button className="uk-button uk-button-primary uk-margin-top" type='submit'>Вход</button>
					</form>
				</div>
			</div>
		)
	}
}

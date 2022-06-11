import React, { useEffect, useRef } from 'react';

const EditorModal = ({ modal, target, method, text }) => {
	const { title, placeholder, btn } = text;
	const formRef = useRef(null);

	useEffect(() => method(formRef.current), []);

	return (
		<div id={target} uk-modal={modal.toString()}>
			<div className="uk-modal-dialog uk-modal-body">
				<h2 className="uk-modal-title">{title}</h2>
				<form ref={formRef}>
					<div className="uk-margin">
						<input name='linkEditor' className="uk-input" type="text" placeholder={placeholder} />
					</div>
					<p className="uk-text-right">
						<button
							className="uk-button uk-button-default uk-modal-close uk-margin-small-right"
							type="button">Отменить</button>
						<button
							name='submitButton'
							className="uk-button uk-button-primary uk-modal-close"
							type="submit">{btn}</button>
					</p>
				</form>
			</div>
		</div>
	)
}

export default EditorModal;
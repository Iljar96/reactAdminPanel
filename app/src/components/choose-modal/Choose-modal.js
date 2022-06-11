import React from 'react';

const ChooseModal = ({ target, modal, data = [], redirect, currentPage }) => {
	const list = data.map(item => {
		const style = currentPage === item ? { pointerEvents: 'none', color: '#1e87f0' } : null;
		if (item.time) {
			return (
				<li key={item.file}>
					<a
						onClick={(e) => {
							redirect(e, item.file);
						}}
						className="uk-link-muted uk-modal-close"
						href="#">Резервная копия от {item.time}</a>
				</li>
			)
		} else {
			return (
				<li key={item}>
					<a
						style={style}
						onClick={(e) => {
							localStorage.setItem('currentPage', item);
							redirect(e, item);
						}}
						className="uk-link-muted uk-modal-close"
						href="#">{item}</a>
					{currentPage === item ? <span> - редактируемая страница</span> : null}
				</li>
			)
		}
	});

	let msg;
	if (data.length < 1) {
		msg = <div>Резервные копии не найдены</div>
	}

	return (
		<div id={target} uk-modal={modal.toString()}>
			<div className="uk-modal-dialog uk-modal-body">
				<h2 className="uk-modal-title">Открыть</h2>
				{msg}
				<ul className="uk-list uk-list-divider">
					{list}
				</ul>
				<p className="uk-text-right">
					<button className="uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
				</p>
			</div>
		</div>
	)
}

export default ChooseModal;
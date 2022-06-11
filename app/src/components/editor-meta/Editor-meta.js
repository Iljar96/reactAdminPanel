import React, { Component, useEffect, useRef, useState } from 'react';

const EditorMeta = ({
	virtualDom,
	target,
	modal
}) => {
	const [meta, setMeta] = useState({
		title: '',
		keywords: '',
		description: ''
	})

	const titleRef = useRef(null);
	const keywordsRef = useRef(null);
	const descriptionRef = useRef(null);

	useEffect(() => getMeta(virtualDom), [virtualDom]);

	const getMeta = (virtualDom) => {
		titleRef.current = virtualDom.head.querySelector('title') || virtualDom.head.appendChild(virtualDom.createElement('title'));

		keywordsRef.current = virtualDom.head.querySelector('meta[name="keywords"]');
		if (!keywordsRef.current) {
			keywordsRef.current = virtualDom.head.appendChild(virtualDom.createElement('meta'));
			keywordsRef.current.setAttribute('name', 'keywords');
			keywordsRef.current.setAttribute('content', '');
		}

		descriptionRef.current = virtualDom.head.querySelector('meta[name="description"]');
		if (!descriptionRef.current) {
			descriptionRef.current = virtualDom.head.appendChild(virtualDom.createElement('meta'));
			descriptionRef.current.setAttribute('name', 'description');
			descriptionRef.current.setAttribute('content', '');
		}

		setMeta({
			title: titleRef.current.innerHTML,
			keywords: keywordsRef.current.getAttribute('content'),
			description: descriptionRef.current.getAttribute('content')
		});
	}

	const applyMeta = () => {
		titleRef.current.innerHTML = meta.title;
		keywordsRef.current.setAttribute('content', meta.keywords);
		descriptionRef.current.setAttribute('content', meta.description);
	}

	const onValueChange = (e) => {
		if (e.target.getAttribute('data-title')) {
			e.persist(); //?
			setMeta({
				...meta,
				title: e.target.value
			});
		} else if (e.target.getAttribute('data-key')) {
			e.persist(); //?
			setMeta({
				...meta,
				keywords: e.target.value
			});
		} else {
			e.persist(); //?
			setMeta({
				...meta,
				description: e.target.value
			});
		}
	}

	const { title, keywords, description } = meta;

	return (
		<div id={target} uk-modal={modal.toString()}>
			<div className="uk-modal-dialog uk-modal-body">
				<h2 className="uk-modal-title">Редактирование Meta-тэгов</h2>

				<form>
					<div className="uk-margin">
						<input
							data-title
							className="uk-input"
							value={title}
							type="text"
							placeholder="Title"
							onChange={(e) => onValueChange(e)} />
					</div>

					<div className="uk-margin">
						<textarea
							data-key
							className="uk-textarea"
							value={keywords}
							rows="5"
							placeholder="Keywords"
							onChange={(e) => onValueChange(e)}></textarea>
					</div>

					<div className="uk-margin">
						<textarea
							data-descr
							className="uk-textarea"
							value={description}
							rows="5"
							placeholder="Description"
							onChange={(e) => onValueChange(e)}></textarea>
					</div>
				</form>

				<p className="uk-text-right">
					<button
						className="uk-button uk-button-default uk-modal-close uk-margin-small-right"
						type="button">Отменить</button>
					<button
						className="uk-button uk-button-primary uk-modal-close"
						onClick={() => applyMeta()}
						type="button">Применить</button>
				</p>
			</div>
		</div>
	)
}

export default EditorMeta;
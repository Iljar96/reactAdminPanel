import "../../helpers/iframeLoader";
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import UIkit from 'uikit';

import EditorText from "../editor-text";
import DOMHelper from "../../helpers/dom-helper";
import Spinner from "../spinner";
import ConfirmModal from "../confirm-modal/";
import ChooseModal from "../choose-modal";
import EditorModal from "../editor-modal";
import Panel from "../panel/Panel";
import EditorMeta from "../editor-meta";
import EditorImages from "../editor-images";
import Login from "../login";
import EditorLink from "../editor-link";

const Editor = (props) => {
	let currentPage = localStorage.getItem('currentPage') ? localStorage.getItem('currentPage') : 'index.html';
	const [pageList, setPageList] = useState([]);
	const [backupsList, setBackupsList] = useState([]);
	const [newPageName, setNewPageName] = useState('');
	const [loading, setLoading] = useState(true);
	const [auth, setAuth] = useState(false);
	const [loginError, setLoginError] = useState(false);
	const [loginLengthError, setLoginLengthError] = useState(false);
	const [editorForm, setEditorForm] = useState(null);
	let iframeRef = useRef(null);
	let virtualDom = useRef(null);

	useEffect(() => {
		checkAuth();
	}, [])

	useEffect(() => {
		if (currentPage && editorForm)
			init(null, currentPage);
	}, [auth, editorForm])

	const checkAuth = () => {
		axios
			.get('./api/checkAuth.php')
			.then(({ data }) => setAuth(data.auth))
	}

	const login = (e, pass) => {
		e && e.preventDefault();

		if (pass.length > 5) {
			axios
				.post('./api/login.php', { 'password': pass })
				.then(({ data }) => {
					setAuth(data.auth);
					setLoginError(!data.auth);
					setLoginLengthError(false);
				})

		} else {
			setLoginError(false);
			setLoginLengthError(true);
		}
	}

	const logout = () => {
		axios
			.get('./api/logout.php')
			.then(() => {
				window.location.replace('/');
			})
	}

	const init = (e, page) => {
		e && e.preventDefault();

		if (auth) {
			isLoading();
			open(page, isLoaded);
			loadPageList();
			loadBackupsList();
		}
	}

	const open = (page, cb) => {
		currentPage = page;

		axios
			.get(`../${page}?rnd=${Math.random()}`)
			.then(res => DOMHelper.parseStrToDOM(res.data))
			.then(DOMHelper.wrapTextNodes)
			.then(DOMHelper.wrapImages)
			.then(DOMHelper.wrapLinks)
			.then(dom => {
				virtualDom.current = dom;
				return dom;
			})
			.then(DOMHelper.serializeDOMToString)
			.then(html => axios.post("./api/saveTempPage.php", { html }))
			.then(() => iframeRef.current.load(`../dfsersre78945sda.html`))
			.then(() => deletePage('dfsersre78945sda.html'))
			.then(() => enableEditing())
			.then(() => injectStyles())
			.then(cb);

		loadBackupsList();
	}

	const save = async () => {
		isLoading();
		const newDom = virtualDom.current.cloneNode(virtualDom.current);
		DOMHelper.unwrapTextNodes(newDom);
		DOMHelper.unwrapImages(newDom);
		DOMHelper.unwrapLinks(newDom);
		const html = DOMHelper.serializeDOMToString(newDom);

		await axios
			.post('./api/savePage.php', {
				html,
				pageName: currentPage
			})
			.then(() => showNotifications('Успешно сохранено', 'success'))
			.catch(() => showNotifications('Ошибка сохранения', 'danger'))
			.finally(isLoaded);

		loadBackupsList();
	}

	const enableEditing = () => {
		iframeRef.current.contentDocument.body.querySelectorAll('text-editor')
			.forEach(el => {
				const id = el.getAttribute('nodeid');
				const virtualElement = virtualDom.current.body.querySelector(`[nodeid="${id}"]`);
				new EditorText(el, virtualElement);
			});
		iframeRef.current.contentDocument.body.querySelectorAll('[editableimgid]')
			.forEach(el => {
				const id = el.getAttribute('editableimgid');
				const virtualElement = virtualDom.current.body.querySelector(`[editableimgid="${id}"]`);
				new EditorImages(el, virtualElement, isLoading, isLoaded, showNotifications);
			});
		if (editorForm) {
			iframeRef.current.contentDocument.body.querySelectorAll('[editablelinkid]')
				.forEach(el => {
					const id = el.getAttribute('editablelinkid');
					const virtualElement = virtualDom.current.body.querySelector(`[editablelinkid="${id}"]`);
					new EditorLink(el, virtualElement, editorForm);
				});
		}
	}

	const injectStyles = () => {
		const style = iframeRef.current.contentDocument.createElement('style');
		style.innerHTML = `
			text-editor:hover {
				outline: 3px solid orange;
				outline-offset: 8px;
			}
			text-editor:focus {
				outline: 3px solid red;
				outline-offset: 8px;
			}
			[editableimgid]:hover {
				outline: 3px solid orange;
				outline-offset: 8px;
			}
			.editor-block {
				width: 1px;
				height: 1px;
				position: relative;
				opacity: 0;
				visibility: 0;
			}
			a:hover .editor-block {
				opacity: 1;
				visibility: visible;
			}
			.editor-icon {
				display: block; 
				width: 20px;
				height: 20px;
				position: absolute; 
				top: 0;
				left: 0;
				z-index: 1000;
			}
			.editor-icon svg {
				display: block;
			}
		`;
		iframeRef.current.contentDocument.head.appendChild(style);
	}

	const showNotifications = (message, status) => {
		UIkit.notification({ message, status });
	}

	const loadPageList = () => {
		axios
			.get('./api/pageList.php')
			.then(({ data }) => setPageList(data));
	}

	const loadBackupsList = () => {
		axios
			.get(`./backups/backups.json?rnd=${Math.random()}`)
			.then(({ data }) => setBackupsList(
				data.filter(backup => {
					return backup.page === currentPage;
				})
			))
			.catch(err => console.warn(err));
	}

	const deletePage = (page) => {
		axios
			.post('./api/deleteTempPage.php', { 'name': page })
			.then(() => loadPageList())
			.catch(() => showNotifications('Страницы не существует', 'warning'));
	}

	const restoreBackup = (e, backup) => {
		e && e.preventDefault();

		UIkit.modal.confirm('Вы действительно хотите восстановить страницу из этой резервной копии, Все несохраненные данные будут потеряны!', { labels: { ok: 'Восстановить', cancel: 'Отмена' } })
			.then(() => {
				isLoading();
				return axios
					.post('./api/restoreBackup.php', { page: currentPage, file: backup })
			})
			.then(() => open(currentPage, isLoaded));
	}

	const isLoading = () => setLoading(true);

	const isLoaded = () => setLoading(false);

	const setInputRef = ref => {
		setEditorForm(ref);
	};

	const modal = true;
	const spinner = loading ? <Spinner active /> : <Spinner />;

	if (!auth) return (
		<Login
			login={login}
			logErr={loginError}
			lengthErr={loginLengthError} />
	);

	return (
		<>
			<iframe ref={iframeRef} src="" frameBorder="0"></iframe>
			<input id="img-upload" type="file" accept="image/*" style={{ display: 'none' }} />

			{spinner}

			<Panel />

			<ConfirmModal
				target='modal-save'
				modal={modal}
				method={save}
				text={{
					title: 'Сохранение',
					descr: 'Вы действительно хотите сохранить изменения?',
					btn: 'Сохранить'
				}} />
			<ConfirmModal
				target='modal-logout'
				modal={modal}
				method={logout}
				text={{
					title: 'Выход',
					descr: 'Вы действительно хотите выйти?',
					btn: 'Выйти'
				}} />
			<ChooseModal
				target='modal-open'
				modal={modal}
				data={pageList}
				redirect={init}
				currentPage={currentPage} />
			<ChooseModal
				target='modal-backup'
				modal={modal}
				data={backupsList}
				redirect={restoreBackup} />
			<EditorModal
				target='modal-editor'
				modal={modal}
				method={setInputRef}
				text={{
					title: 'Редактировать ссылку',
					placeholder: 'Введите ссылку',
					btn: 'Заменить ссылку'
				}} />
			{
				virtualDom.current ? <EditorMeta
					target='modal-meta'
					modal={modal}
					virtualDom={virtualDom.current} /> : null
			}
		</>
	)
}

export default Editor;
import "../../helpers/iframeLoader";
import axios from 'axios';
import React, { Component } from 'react';
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

export default class Editor extends Component {
	constructor() {
		super();
		this.currentPage = localStorage.getItem('currentPage') ? localStorage.getItem('currentPage') : 'index.html';
		this.state = {
			pageList: [],
			backupsList: [],
			newPageName: '',
			loading: true,
			auth: false,
			loginError: false,
			loginLengthError: false
		}

		this.virtualDom;
		this.isLoading = this.isLoading.bind(this);
		this.isLoaded = this.isLoaded.bind(this);
		this.save = this.save.bind(this);
		this.init = this.init.bind(this);
		this.restoreBackup = this.restoreBackup.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
	}

	componentDidMount() {
		this.checkAuth();
	}

	componentDidUpdate(_, prevState) {
		if (this.state.auth !== prevState.auth) {
			this.init(null, this.currentPage);
		}
	}

	checkAuth() {
		axios
			.get('./api/checkAuth.php')
			.then(({ data }) => {
				this.setState({ auth: data.auth })
			})
	}

	login(e, pass) {
		e && e.preventDefault();

		if (pass.length > 5) {
			axios
				.post('./api/login.php', { 'password': pass })
				.then(({ data }) => {
					this.setState({
						auth: data.auth,
						loginError: !data.auth,
						loginLengthError: false
					})
				})

		} else {
			this.setState({
				loginError: false,
				loginLengthError: true
			})
		}
	}

	logout() {
		axios
			.get('./api/logout.php')
			.then(() => {
				window.location.replace('/');
			})
	}

	init(e, page) {
		e && e.preventDefault();

		if (this.state.auth) {
			this.isLoading();
			this.iframe = document.querySelector('iframe');
			this.open(page, this.isLoaded);
			this.loadPageList();
			this.loadBackupsList();
		}
	}

	open(page, cb) {
		this.currentPage = page;

		axios
			.get(`../${page}?rnd=${Math.random()}`)
			.then(res => DOMHelper.parseStrToDOM(res.data))
			.then(DOMHelper.wrapTextNodes)
			.then(DOMHelper.wrapImages)
			.then(DOMHelper.wrapLinks)
			.then(dom => {
				this.virtualDom = dom;
				return dom;
			})
			.then(DOMHelper.serializeDOMToString)
			.then(html => axios.post("./api/saveTempPage.php", { html }))
			.then(() => this.iframe.load(`../dfsersre78945sda.html`))
			.then(() => this.deletePage('dfsersre78945sda.html'))
			.then(() => this.enableEditing())
			.then(() => this.injectStyles())
			.then(cb);

		this.loadBackupsList();
	}

	async save() {
		this.isLoading();
		const newDom = this.virtualDom.cloneNode(this.virtualDom);
		DOMHelper.unwrapTextNodes(newDom);
		DOMHelper.unwrapImages(newDom);
		DOMHelper.unwrapLinks(newDom);
		const html = DOMHelper.serializeDOMToString(newDom);

		await axios
			.post('./api/savePage.php', {
				html,
				pageName: this.currentPage
			})
			.then(() => this.showNotifications('Успешно сохранено', 'success'))
			.catch(() => this.showNotifications('Ошибка сохранения', 'danger'))
			.finally(this.isLoaded);

		this.loadBackupsList();
	}

	enableEditing() {
		this.iframe.contentDocument.body.querySelectorAll('text-editor')
			.forEach(el => {
				const id = el.getAttribute('nodeid');
				const virtualElement = this.virtualDom.body.querySelector(`[nodeid="${id}"]`);
				new EditorText(el, virtualElement);
			});
		this.iframe.contentDocument.body.querySelectorAll('[editableimgid]')
			.forEach(el => {
				const id = el.getAttribute('editableimgid');
				const virtualElement = this.virtualDom.body.querySelector(`[editableimgid="${id}"]`);
				new EditorImages(el, virtualElement, this.isLoading, this.isLoaded, this.showNotifications);
			});
		this.iframe.contentDocument.body.querySelectorAll('[editablelinkid]')
			.forEach(el => {
				const id = el.getAttribute('editablelinkid');
				const virtualElement = this.virtualDom.body.querySelector(`[editablelinkid="${id}"]`);
				new EditorLink(el, virtualElement);
			});
	}

	injectStyles() {
		const style = this.iframe.contentDocument.createElement('style');
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
				z-index: 10;
			}
			.editor-icon svg {
				display: block;
			}
		`;
		this.iframe.contentDocument.head.appendChild(style);
	}

	showNotifications(message, status) {
		UIkit.notification({ message, status });
	}

	loadPageList() {
		axios
			.get('./api/pageList.php')
			.then(({ data }) => this.setState({ pageList: data }))
	}

	loadBackupsList() {
		axios
			.get(`./backups/backups.json?rnd=${Math.random()}`)
			.then(({ data }) => this.setState({
				backupsList: data.filter(backup => {
					return backup.page === this.currentPage;
				})
			}))
			.catch(err => console.warn(err));
	}

	deletePage(page) {
		axios
			.post('./api/deleteTempPage.php', { 'name': page })
			.then(() => this.loadPageList())
			.catch(() => this.showNotifications('Страницы не существует', 'warning'));
	}

	restoreBackup(e, backup) {
		e && e.preventDefault();

		UIkit.modal.confirm('Вы действительно хотите восстановить страницу из этой резервной копии, Все несохраненные данные будут потеряны!', { labels: { ok: 'Восстановить', cancel: 'Отмена' } })
			.then(() => {
				this.isLoading();
				return axios
					.post('./api/restoreBackup.php', { page: this.currentPage, file: backup })
			})
			.then(() => this.open(this.currentPage, this.isLoaded));
	}

	isLoading() {
		this.setState({
			loading: true
		})
	}

	isLoaded() {
		this.setState({
			loading: false
		})
	}

	render() {
		const { loading, pageList, backupsList, auth, loginError, loginLengthError } = this.state;
		const modal = true;
		let spinner;

		loading ? spinner = <Spinner active /> : <Spinner />;

		if (!auth) return (
			<Login
				login={this.login}
				logErr={loginError}
				lengthErr={loginLengthError} />
		);

		return (
			<>
				<iframe src="" frameBorder="0"></iframe>
				<input id="img-upload" type="file" accept="image/*" style={{ display: 'none' }} />

				{spinner}

				<Panel />

				<ConfirmModal
					target='modal-save'
					modal={modal}
					method={this.save}
					text={{
						title: 'Сохранение',
						descr: 'Вы действительно хотите сохранить изменения?',
						btn: 'Сохранить'
					}} />
				<ConfirmModal
					target='modal-logout'
					modal={modal}
					method={this.logout}
					text={{
						title: 'Выход',
						descr: 'Вы действительно хотите выйти?',
						btn: 'Выйти'
					}} />
				<ChooseModal
					target='modal-open'
					modal={modal}
					data={pageList}
					redirect={this.init}
					currentPage={this.currentPage} />
				<ChooseModal
					target='modal-backup'
					modal={modal}
					data={backupsList}
					redirect={this.restoreBackup} />
				<EditorModal
					target='modal-editor'
					modal={modal}
					method={() => { }}
					text={{
						title: 'Редактировать ссылку',
						placeholder: 'Введите ссылку',
						btn: 'Заменить ссылку'
					}} />
				{
					this.virtualDom ? <EditorMeta
						target='modal-meta'
						modal={modal}
						virtualDom={this.virtualDom} /> : null
				}
			</>
		)
	}
}
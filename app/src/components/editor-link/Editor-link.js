import UIkit from 'uikit';

export default class EditorLink {
	constructor(element, virtualElement) {
		this.element = element;
		this.virtualElement = virtualElement;
		this.editerIcon = this.element.querySelector('.editor-icon');
		this.link = this.editerIcon.closest('a');
		this.virtualLink = this.virtualElement.querySelector('.editor-icon').closest('a');
		this.link.addEventListener('click', (e) => this.onClick(e));
	}

	onClick(e) {
		if (e.target.closest('.editor-icon')) {
			e.preventDefault();

			UIkit.modal(document.querySelector('#modal-editor')).show();
			document.querySelector('#modal-editor input').value = this.link.getAttribute('href');
			document.querySelector('#modal-editor .uk-button-primary').addEventListener('click', e => {
				this.link.setAttribute('href', e.target.closest('form').querySelector('input').value);
				this.virtualLink.setAttribute('href', e.target.closest('form').querySelector('input').value);
			})
		}
	}

}
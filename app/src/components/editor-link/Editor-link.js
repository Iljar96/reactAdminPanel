import UIkit from 'uikit';

export default class EditorLink {
	constructor(element, virtualElement, editorForm) {
		this.element = element;
		this.virtualElement = virtualElement;
		this.form = editorForm;
		this.editerIcon = this.element.querySelector('.editor-icon');
		this.link = this.editerIcon.closest('a');
		this.virtualLink = this.virtualElement.querySelector('.editor-icon').closest('a');
		this.link.addEventListener('click', (e) => this.onClick(e));
	}

	onClick(e) {
		if (e.target.closest('.editor-icon')) {
			e.preventDefault();
			UIkit.modal(document.querySelector('#modal-editor')).show();
			this.form.linkEditor.value = this.link.getAttribute('href');
			this.form.submitButton.addEventListener('click', e => {
				e.preventDefault();
				this.link.setAttribute('href', this.form.linkEditor.value);
				this.virtualLink.setAttribute('href', this.form.linkEditor.value);
			})
		}
	}

}
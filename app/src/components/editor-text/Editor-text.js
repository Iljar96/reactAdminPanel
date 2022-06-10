export default class EditorText {
	constructor(element, virtualElement) {
		this.element = element;
		this.virtualElement = virtualElement;
		this.element.addEventListener('click', () => this.onClick());
		this.element.addEventListener('blur', () => this.onBlur());
		this.element.addEventListener('keypress', e => this.onKeypress(e));
		this.element.addEventListener('input', () => this.onTextEdit());
		if (this.element.closest('a') || this.element.closest('button')) {
			this.element.addEventListener('contextmenu', e => this.onCtxMenu(e));
		}
	}

	onCtxMenu(e) {
		e.preventDefault();
		this.onClick();
	}

	onClick() {
		this.element.contentEditable = 'true';
		this.element.focus();
	}

	onBlur() {
		this.element.contentEditable = 'false';
	}

	onKeypress(e) {
		if (e.keyCode === 13) this.onBlur();
	}

	onTextEdit() {
		this.virtualElement.innerHTML = this.element.innerHTML;
	}
}
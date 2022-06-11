import axios from "axios";

export default class EditorImages {
	constructor(element, virtualElement, ...[isLoading, isLoaded, showNotifications]) {
		this.element = element;
		this.virtualElement = virtualElement;

		this.element.addEventListener('click', () => this.onClick());
		this.imgUploader = document.querySelector('#img-upload');
		this.isLoading = isLoading;
		this.isLoaded = isLoaded;
		this.showNotifications = showNotifications;
		// document.body.addEventListener('click', (e) => {
		// 	console.log(e.target);
		// 	if (e.target.getAttribute('editableimgid')) {
		// 		console.log(e.target);
		// 	}
		// });
	}

	onClick() {
		this.imgUploader.click();
		this.imgUploader.addEventListener('change', () => {
			if (this.imgUploader.files && this.imgUploader.files[0]) {
				let formData = new FormData();
				formData.append('image', this.imgUploader.files[0]);
				this.isLoading();
				axios
					.post('./api/uploadImage.php', formData, {
						headers: {
							'Content-Type': 'multipart-data'
						}
					})
					.then(({ data }) => {
						this.virtualElement.src = this.element.src = `./img/${data.src}`;
						if (this.element.getAttribute('data-src')) {
							this.element.setAttribute('data-src', `./img/${data.src}`);
							this.virtualElement.setAttribute('data-src', `./img/${data.src}`);
						}
					})
					.catch(() => this.showNotifications('Ошибка сохранения', 'danger'))
					.finally(() => {
						this.imgUploader.value = '';
						this.isLoaded();
					});
			}
		}, { once: true })
	}
}
export default class DOMHelper {
	static parseStrToDOM(string) {
		const parser = new DOMParser;
		return parser.parseFromString(string, 'text/html');
	}

	static wrapTextNodes(dom) {
		const body = dom.body;
		let textNodes = [];

		function recursy(element) {
			element.childNodes.forEach(node => {
				if (node.nodeName === "#text" && !node.parentNode.closest('script') && node.nodeValue.replace(/\s+/g, '').length > 0) {
					textNodes.push(node);
				} else {
					recursy(node);
				}
			})
		}

		recursy(body);

		textNodes.forEach((node, i) => {
			const wrapper = dom.createElement('text-editor');
			node.parentNode.replaceChild(wrapper, node);
			wrapper.appendChild(node);
			wrapper.setAttribute('nodeid', i);
		});

		return dom;
	}

	static serializeDOMToString(dom) {
		const serializer = new XMLSerializer();
		return serializer.serializeToString(dom);
	}

	static unwrapTextNodes(dom) {
		dom.body.querySelectorAll('text-editor').forEach(el => {
			if (el.innerHTML.length > 0) {
				el.parentNode.replaceChild(el.firstChild, el);
			} else {
				el.parentNode.innerHTML = '';
			}
		})
	}

	static wrapImages(dom) {
		dom.body.querySelectorAll('img').forEach((img, i) => {
			img.setAttribute('editableimgid', i);
		})

		return dom;
	}

	static unwrapImages(dom) {
		dom.body.querySelectorAll('[editableimgid]').forEach(img => {
			img.removeAttribute('editableimgid');
		})
	}

	static wrapLinks(dom) {
		const svgIcon = '<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M490.3 40.4C512.2 62.27 512.2 97.73 490.3 119.6L460.3 149.7L362.3 51.72L392.4 21.66C414.3-.2135 449.7-.2135 471.6 21.66L490.3 40.4zM172.4 241.7L339.7 74.34L437.7 172.3L270.3 339.6C264.2 345.8 256.7 350.4 248.4 353.2L159.6 382.8C150.1 385.6 141.5 383.4 135 376.1C128.6 370.5 126.4 361 129.2 352.4L158.8 263.6C161.6 255.3 166.2 247.8 172.4 241.7V241.7zM192 63.1C209.7 63.1 224 78.33 224 95.1C224 113.7 209.7 127.1 192 127.1H96C78.33 127.1 64 142.3 64 159.1V416C64 433.7 78.33 448 96 448H352C369.7 448 384 433.7 384 416V319.1C384 302.3 398.3 287.1 416 287.1C433.7 287.1 448 302.3 448 319.1V416C448 469 405 512 352 512H96C42.98 512 0 469 0 416V159.1C0 106.1 42.98 63.1 96 63.1H192z"/></svg>';
		dom.body.querySelectorAll('a').forEach((link, i) => {
			link.insertAdjacentHTML('afterbegin', `<div class="editor-block" editablelinkid="${i}"><span class="editor-icon" uk-toggle="target: #modal-editor" title="Редактировать ссылку">${svgIcon}</span></div>`)
		})

		return dom;
	}

	static unwrapLinks(dom) {
		dom.body.querySelectorAll('[editablelinkid]').forEach(editLinkBlock => {
			editLinkBlock.remove();
		})
	}

	static wrapLists(dom) {
		const svgIcon = '<svg  width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM224 368C237.3 368 248 357.3 248 344V280H312C325.3 280 336 269.3 336 256C336 242.7 325.3 232 312 232H248V168C248 154.7 237.3 144 224 144C210.7 144 200 154.7 200 168V232H136C122.7 232 112 242.7 112 256C112 269.3 122.7 280 136 280H200V344C200 357.3 210.7 368 224 368z"/></svg>';
		dom.body.querySelectorAll('ul').forEach((list, i) => {
			list.insertAdjacentHTML('afterbegin', `<div class="editor-block" editablelistid="${i}"><span class="editor-icon" uk-toggle="target: #modal-editor" title="Добавить элемент (для редактирования новых элементов необходимо сохранить и перезагрузить страницу)">${svgIcon}</span></div>`)
		})

		return dom;
	}

	static unwrapLists(dom) {
		dom.body.querySelectorAll('[editablelistid]').forEach(editLinkBlock => {
			editLinkBlock.remove();
		})
	}
}
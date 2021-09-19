import { createTwoFilesPatch } from 'diff';
import { html as diffHtml } from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css'

// モーダル要素作成
function createDiffModal() {
    const modal = document.createElement('div');
    modal.id = 'diff-result-modal';
    modal.classList.add('modal');
    modal.tabIndex = '-1';
    modal.innerHTML = `
<div class="modal-dialog" role="document" style="width: 97%;">
  <div class="modal-content">
    <div class="modal-header" style="display: flex;"></div>
    <div class="modal-body"></div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    </div>
  </div>
</div>`;
    document.body.appendChild(modal);
}
createDiffModal();

// モーダル表示
function showDiffModal(submissionsCodes) {
    const keys = Object.keys(submissionsCodes).sort();
    const len = keys.map(k => submissionsCodes[k].split('\n').length).sort()[1];
    const diff = createTwoFilesPatch(keys[0], keys[1], submissionsCodes[keys[0]], submissionsCodes[keys[1]], undefined, undefined, { context: len });
    const config = {
        outputFormat: 'side-by-side',
        drawFileList: false,
    };
    const html = diffHtml(diff, config);
    const dom = new DOMParser().parseFromString(html, 'text/html');

    const modalHeader = document.querySelector('#diff-result-modal .modal-header');
    modalHeader.innerHTML = dom.querySelector('.d2h-file-header').innerHTML;

    const btn = document.createElement('button');
    btn.className = 'close';
    btn.dataset.dismiss = 'modal';
    btn.ariaLabel = 'Close';
    btn.innerHTML = '<span aria-hidden="true">&times;</span>';
    modalHeader.appendChild(btn);

    const modalBody = document.querySelector('#diff-result-modal .modal-body')
    modalBody.innerHTML = dom.querySelector('.d2h-files-diff').innerHTML;

    const syncHorizontalScroll = (elm1,elm2) => {
        elm1.addEventListener('scroll', (e) => elm2.scrollLeft = elm1.scrollLeft);
    };
    const sides = modalBody.querySelectorAll('.d2h-file-side-diff');
    syncHorizontalScroll(sides[0], sides[1]);
    syncHorizontalScroll(sides[1], sides[0]);
}

function diffBtnListener(e) {
    const submissionsUrls = [];
    document.querySelectorAll('.diff-checkbox').forEach(cb => {
        if (!cb.checked) return;
        const a = cb.parentNode.parentNode.lastElementChild.firstElementChild;
        submissionsUrls.push(a.href);
    });

    const promises = submissionsUrls.map(url => getSubmissionCode(url));
    Promise.all(promises).then(objs => {
        const obj = {};
        objs.forEach(e => {
            const key = Object.keys(e)[0];
            const m = key.match(/(?<=\/)\d+(?=$)/);
            if (!m) return;
            const submissionId = m.toString();
            obj['#' + submissionId] = e[key];
        });
        showDiffModal(obj);
    });
}

// 提出コードの取得
function getSubmissionHTML(url) {
    return fetch(url)
        .then(response => response.text())
        .then(text => new DOMParser().parseFromString(text, 'text/html'))
}

async function getSubmissionCode(url) {
    const dom = await getSubmissionHTML(url);
    const elm = dom.querySelector('#submission-code');
    return { [url]: elm.innerText };
}

// チェックボックスの追加
const checkboxes = [];
let checkedCnt = 0;

function checkboxListener(e) {
    checkedCnt += e.target.checked ? 1 : -1;
    const btn = document.getElementById('show-diff-result-btn');
    if (checkedCnt >= 2) {
        btn.disabled = false;
        checkboxes.forEach(cb => {
            cb.disabled = !cb.checked;
        });
    } else {
        btn.disabled = true;
        checkboxes.forEach(cb => {
            cb.disabled = false;
        });
    }
}

function checkboxParentListener(e) {
    const elm = e.target.firstElementChild;
    if (elm) elm.click();
}

function insertCheckBox() {
    const table = document.querySelector('table');

    const insertCb = (parent, newNode) => {
        parent.insertBefore(newNode, parent.firstElementChild);
    }

    const btn = document.createElement('input');
    btn.type = 'button';
    btn.value = '比較';
    btn.id = 'show-diff-result-btn';
    btn.disabled = true;
    btn.dataset.toggle = 'modal';
    btn.dataset.target = '#diff-result-modal';
    btn.addEventListener('click', diffBtnListener);
    const th = document.createElement('th');
    th.appendChild(btn);
    insertCb(table.querySelector('thead>tr'), th);

    table.querySelectorAll('tbody>tr').forEach(tr => {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.classList.add('diff-checkbox');
        cb.addEventListener('change', checkboxListener);
        checkboxes.push(cb);
        const td = document.createElement('td');
        td.appendChild(cb);
        td.style.textAlign = 'center';
        td.addEventListener('click', checkboxParentListener); // checkbox の当たりが判定小さいので……。
        insertCb(tr, td);
    });
}
insertCheckBox();

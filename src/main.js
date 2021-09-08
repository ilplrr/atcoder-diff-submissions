import { createTwoFilesPatch } from 'diff';
import { html as diffHtml } from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css'
import "./style.css";

// モーダル要素作成
function createModalPopup() {
    const topDiv = document.createElement('div');
    topDiv.id = 'diff-container';
    topDiv.classList.add('popup-modal');
    document.body.appendChild(topDiv);

    const closeBtn = document.createElement('input');
    closeBtn.id = 'popup-close-btn';
    closeBtn.type = 'button';
    closeBtn.value = '閉じる';
    closeBtn.addEventListener('click', (e) => {
        topDiv.classList.remove('popup-modal-show');
    });
    const popupHeader = document.createElement('div');
    popupHeader.classList.add('popup-header')
    popupHeader.appendChild(closeBtn);
    topDiv.appendChild(popupHeader);

    const div = document.createElement('div');
    div.id = 'diff-disp-div';
    topDiv.appendChild(div);
}

createModalPopup();

// モーダル表示
function popupDiff(submissionsCodes) {
    const topDiv = document.getElementById('diff-container');
    topDiv.classList.add('popup-modal-show');

    const keys = Object.keys(submissionsCodes).sort();
    const len = keys.map(k => submissionsCodes[k].split('\n').length).sort()[1];
    const diff = createTwoFilesPatch(keys[0], keys[1], submissionsCodes[keys[0]], submissionsCodes[keys[1]], undefined, undefined, { context: len });
    const config = {
        outputFormat: 'side-by-side',
        drawFileList: false,

    };
    const html = diffHtml(diff, config);
    document.querySelector('#diff-disp-div').innerHTML = html;
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
        popupDiff(obj);
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
let checked_cnt = 0;

function insertOnTrTop(parent, newNode) {
    parent.insertBefore(newNode, parent.firstElementChild);
}

function checkboxListener(e) {
    checked_cnt += e.target.checked ? 1 : -1;
    const btn = document.getElementById('diff-btn');
    if (checked_cnt >= 2) {
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

    const btn = document.createElement('input');
    btn.type = 'button';
    btn.value = '比較';
    btn.id = 'diff-btn';
    btn.disabled = true;
    btn.addEventListener('click', diffBtnListener);
    const th = document.createElement('th');
    th.appendChild(btn);
    insertOnTrTop(table.querySelector('thead>tr'), th);

    table.querySelectorAll('tbody>tr').forEach(tr => {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.classList.add('diff-checkbox');
        cb.addEventListener('change', checkboxListener); // checkbox の当たりが判定小さいので……。
        checkboxes.push(cb);
        const td = document.createElement('td');
        td.appendChild(cb);
        td.style.textAlign = 'center';
        td.addEventListener('click', checkboxParentListener);
        insertOnTrTop(tr, td);
    });
}

insertCheckBox();
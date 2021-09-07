import "./style.js"

// モーダル要素作成
function createModalPopup() {
    const topDiv = document.createElement('div');
    topDiv.id = 'diff-container';
    topDiv.classList.add('popup-modal');
    document.body.appendChild(topDiv);

    const closeBtn = document.createElement('input');
    closeBtn.type = 'button';
    closeBtn.value = '閉じる';
    closeBtn.addEventListener('click', (e) => {

        topDiv.classList.remove('popup-modal-show');
    });
    topDiv.appendChild(closeBtn);
}

createModalPopup();

// モーダル表示
function popupDiff(submissionsCodes) {
    const topDiv = document.getElementById('diff-container');
    topDiv.classList.add('popup-modal-show');
}

function diffBtnListener(e) {
    const submissionsUrls = [];
    document.querySelectorAll('.diff-checkbox').forEach(cb => {
        if (!cb.checked) return;
        const a = cb.parentNode.parentNode.lastElementChild.firstElementChild;
        submissionsUrls.push(a.href);
    });
    const submissionsCodes = submissionsUrls.map(url => getSubmissionCode(url));
    popupDiff(submissionsCodes);
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
        cb.addEventListener('change', checkboxListener);
        checkboxes.push(cb);
        const td = document.createElement('td');
        td.appendChild(cb);
        td.style.textAlign = 'center';
        insertOnTrTop(tr, td);
    });
}

insertCheckBox();

// 提出コードの取得
function getSubmissionHTML(url) {
    return fetch(url)
        .then(response => response.text())
        .then(text => new DOMParser().parseFromString(text, 'text/html'))
}

async function getSubmissionCode(url) {
    const dom = await getSubmissionHTML(url);
    const elm = dom.querySelector('#submission-code');
    return elm.innerText;
}


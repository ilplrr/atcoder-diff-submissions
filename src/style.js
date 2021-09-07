(function(){
    const style = document.createElement('style');
    style.textContent = `
        .popup-modal {
            position: fixed;
            z-index: 9982;
            left: 0;
            bottom: 0;
            height: 70%;
            width: 100%;
            background-color: gray;
            visibility: hidden;
        }
        .popup-modal-show {
            visibility: visible;
        }
    `;
    document.querySelector('head').appendChild(style);
})();
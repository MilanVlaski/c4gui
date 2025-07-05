const DEFAULT_STATE = {name: 'DEFAULT', click: function () {} };
let canvasState = DEFAULT_STATE
const canvas = document.getElementById('canvas');
const softwareSystemBtn = document.getElementById('placeSoftwareSystem')

softwareSystemBtn.addEventListener('click', function () {

    const softwareSystem = {
        name: 'Software System',
        description: '',
    };

    console.log(`Placing ${softwareSystem.name}`);

    canvasState = {
        name: 'PLACING',
        object: softwareSystem,
        click: function (e, canvas) {
            const objectDiv = softwareSystemHtml(e, softwareSystem);
            canvas.appendChild(objectDiv);
            canvasState = DEFAULT_STATE
        },
    }
});

function softwareSystemHtml(coords, softwareSystem) {
    let div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.left = coords.clientX + 'px'
    div.style.top = coords.clientY + 'px'
    div.classList.add('softwareSystem')

    const nameDiv = document.createElement('div')
    nameDiv.textContent = softwareSystem.name
    nameDiv.contentEditable = true

    div.appendChild(nameDiv)

    return div
}

canvas.addEventListener('click', (e) => {
    canvasState.click(e, canvas)
})

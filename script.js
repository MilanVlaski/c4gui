const DEFAULT_STATE = { name: 'DEFAULT', click: function () { } }
let canvasState = DEFAULT_STATE

const canvas = document.getElementById('canvas')
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
            const objectDiv = softwareSystemElement(e, softwareSystem);
            canvas.appendChild(objectDiv);
            canvasState = DEFAULT_STATE
        },
    }
});


function softwareSystemElement(coords, softwareSystem) {
    let element = document.createElement('div')
    element.style.position = 'absolute'
    element.style.left = coords.clientX + 'px'
    element.style.top = coords.clientY + 'px'
    element.classList.add('softwareSystem')

    const nameDiv = document.createElement('div')
    nameDiv.textContent = softwareSystem.name
    nameDiv.contentEditable = true

    element.appendChild(nameDiv)

    element.addEventListener('pointerdown', e => {
        canvasState = {
            name: 'CONNECTING',
            object: element,
            click: function () { },
            pointerup: function () {
                new LeaderLine(object, element)        
            }
        }

        let dragDiv = document.createElement('div')
        dragDiv.style.position = 'absolute'
        dragDiv.style.left = e.clientX + 'px'
        dragDiv.style.top = e.clientY + 'px'
        dragDiv.style.background = 'red'

        dragDiv.style.width = '100px'
        dragDiv.style.height = '100px'
    })

    element.addEventListener('pointerup', e => {
        canvasState.pointerup(e)
    })

    return element
}


canvas.addEventListener('click', (e) => {
    canvasState.click(e, canvas)
})



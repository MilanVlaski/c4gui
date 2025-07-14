const DEFAULT_STATE = { name: 'DEFAULT', click: function () { } }
let canvasState = DEFAULT_STATE

// Variables used to display a temporary "connecting" line
let previewLine = null
let tempAnchor = null
let pointerMoveHandler = null

function cleanupConnectingPreview() {
        previewLine.remove()
        previewLine = null
        tempAnchor.remove()
        tempAnchor = null
        document.removeEventListener('pointermove', pointerMoveHandler)
        pointerMoveHandler = null
}
const canvas = document.getElementById('canvas')
const softwareSystemBtn = document.getElementById('placeSoftwareSystem')

softwareSystemBtn.addEventListener('click', function () {

    const softwareSystem = {
        name: 'Software System',
        description: '',
        cssClass: ''
    };

    console.log(`Placing ${softwareSystem.name}`);

    canvasState = {
        name: 'PLACING',
        object: softwareSystem,
        click: function (e, canvas) {
            const objectDiv = createHtmlElementFromModel(e, softwareSystem);
            canvas.appendChild(objectDiv);
            canvasState = DEFAULT_STATE
        },
    }
});


function createHtmlElementFromModel(coords, model) {
    let element = document.createElement('div')
    element.style.position = 'absolute'
    element.style.left = coords.clientX + 'px'
    element.style.top = coords.clientY + 'px'
    element.classList.add('softwareSystem')

    const nameDiv = document.createElement('div')
    nameDiv.textContent = model.name
    nameDiv.contentEditable = true

    element.appendChild(nameDiv)

    element.addEventListener('pointerdown', e => {
        // Enter CONNECTING state – remember the source element
        canvasState = {
            name: 'CONNECTING',
            object: element,
            click: function () { },
        }

        // Create a tiny invisible element that will follow the pointer
        tempAnchor = document.createElement('div')
        tempAnchor.style.position = 'absolute'
        tempAnchor.style.left = e.clientX + 'px'
        tempAnchor.style.top = e.clientY + 'px'
        tempAnchor.style.width = '1px'
        tempAnchor.style.height = '1px'
        tempAnchor.style.pointerEvents = 'none'
        canvas.appendChild(tempAnchor)

        // Draw temporary dashed line from the source element to the pointer
        previewLine = new LeaderLine(element, tempAnchor, { dash: { animation: true } })

        pointerMoveHandler = moveEvent => {
            tempAnchor.style.left = moveEvent.clientX + 'px'
            tempAnchor.style.top = moveEvent.clientY + 'px'
            previewLine.position()
        }

        // Keep the anchor stuck to the pointer as it moves
        document.addEventListener('pointermove', pointerMoveHandler)
    })

    element.addEventListener('pointerup', e => {
        if (canvasState.name === 'CONNECTING' && canvasState.object !== element) {
            new LeaderLine(canvasState.object, element)
        }
        cleanupConnectingPreview()
        canvasState = DEFAULT_STATE
    })

    return element
}


canvas.addEventListener('click', (e) => {
    canvasState.click(e, canvas)
})

document.addEventListener('pointerup', () => {
    if (canvasState.name === 'CONNECTING') {
        cleanupConnectingPreview()
        canvasState = DEFAULT_STATE
    }
})

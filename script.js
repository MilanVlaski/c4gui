const DEFAULT_STATE = { name: 'DEFAULT', click: function () { } }
let canvasState = DEFAULT_STATE

// Variables used to display a temporary "connecting" line
let previewLine = null
let tempAnchor = null
let pointerMoveHandler = null

function cleanupConnectingPreview() {
    if (previewLine) {
        previewLine.remove()
        previewLine = null
    }
    if (tempAnchor) {
        tempAnchor.remove()
        tempAnchor = null
    }
    document.removeEventListener('pointermove', pointerMoveHandler)
    if (pointerMoveHandler) {
        pointerMoveHandler = null
    }
}
const canvas = document.getElementById('canvas')
const softwareSystemBtn = document.getElementById('placeSoftwareSystem')
const personBtn = document.getElementById('placePerson')

softwareSystemBtn.addEventListener('click', function () {

    const softwareSystem = {
        displayName: 'Software System',
        description: '',
        name: 'softwareSystem' // Name is the css class, by default.
    };

    console.log(`Placing ${softwareSystem.displayName}`);

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

personBtn.addEventListener('click', function () {

    const person = {
        displayName: 'Person',
        description: '',
        name: 'person'
    };

    console.log(`Placing ${person.displayName}`);

    canvasState = {
        name: 'PLACING',
        object: person,
        click: function (e, canvas) {
            const objectDiv = createHtmlElementFromModel(e, person);
            canvas.appendChild(objectDiv);
            canvasState = DEFAULT_STATE
        },
    }
});


function createHtmlElementFromModel(coords, model) {
    let element = document.createElement('div')
    element.style.position = 'absolute'
    element.style.left = coords.pageX + 'px'
    element.style.top = coords.pageY + 'px'
    element.classList.add(model.name)

    const nameDiv = document.createElement('div')
    nameDiv.textContent = model.displayName
    nameDiv.style.userSelect = 'none'
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
        tempAnchor.style.position = 'fixed'
        tempAnchor.style.left = e.pageX + 'px'
        tempAnchor.style.top = e.pageY + 'px'
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

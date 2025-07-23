import { DiagramElement, DiagramModel } from "./classes.js"

let diagramModel = new DiagramModel()
const DEFAULT_STATE = { name: 'DEFAULT', click: function () { } }
let canvasState = DEFAULT_STATE

// Variables used to display a temporary "connecting" line
let previewLine = null
let tempAnchor = null
let pointerMoveHandler = null

const canvas = document.getElementById('canvas')
const softwareSystemBtn = document.getElementById('placeSoftwareSystem')
const personBtn = document.getElementById('placePerson')

softwareSystemBtn.addEventListener('click', function () {
    const softwareSystem = new DiagramElement('Software System', '', 'softwareSystem')
    console.log(`Placing ${softwareSystem.displayName}`)
    canvasState = placingState(softwareSystem)
});

personBtn.addEventListener('click', function () {
    const person = new DiagramElement('Person', '', 'person')
    console.log(`Placing ${person.displayName}`)
    canvasState = placingState(person)
});

function placingState(model) {
    return {
        name: 'PLACING',
        click: function (e, canvas) {
            let addedElement = diagramModel.addElement(model)
            if(addedElement) {
                const objectDiv = createHtmlElementFromModel(e, model)
                canvas.appendChild(objectDiv)
                canvasState = DEFAULT_STATE
            }
        },
    }
}

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

function createHtmlElementFromModel(coords, model) {
    let element = document.createElement('div')
    element.style.position = 'absolute'
    element.style.left = coords.pageX + 'px'
    element.style.top = coords.pageY + 'px'
    element.classList.add(model.name)

    const nameSpan = document.createElement('span')
    nameSpan.textContent = model.displayName
    nameSpan.style.userSelect = 'none'

    element.appendChild(nameSpan)

    // Enable inline editing without using contentEditable
    function enableInlineEdit(labelEl) {

        labelEl.addEventListener('click', function startEditing(e) {
            e.stopPropagation()
            const currentText = this.textContent
            const input = document.createElement('input')
            input.position = 'absolute'
            input.value = currentText
            input.style.minWidth = '50px'
            this.replaceWith(input)
            input.focus()

            const finish = () => {
                // input.value.trim() can either be
                // null -> don't change model, just set the html element name back
                // same as before (trivial case?) -> don't change model, just set the html element name back
                // different
                // if its different, its either unique, or not
                // if unique -> set html element
                // else -> show an error or something, and set element to original
                // model.displayName is the old text, roll back to that
                const newText = input.value.trim() || model.displayName
                model.displayName = newText
                const span = document.createElement('span')
                span.textContent = newText
                span.style.userSelect = 'none'
                // Re-enable inline editing on the new span
                enableInlineEdit(span)
                input.replaceWith(span)
            }

            input.addEventListener('blur', finish)
            input.addEventListener('keydown', ev => {
                if (ev.key === 'Enter' || ev.key === 'Escape') {
                    input.blur()
                }
            })
        })
    }

    enableInlineEdit(nameSpan)

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
        previewLine = new LeaderLine(element, tempAnchor, { dash: { animation: true }, path: 'straight', endPlug: 'behind' })

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

import { DiagramElement, DiagramModel } from "./Model.js"

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

/**
 * Remove everything currently drawn on the canvas.  Used when the user
 * zooms into a Software System (double-click/double-tap) so the view
 * can be repopulated with containers.
 */
function clearCanvas() {
    // Drop all element DOM nodes
    while (canvas.firstChild) {
        canvas.firstChild.remove();
    }
    // Remove any LeaderLine SVGs that were injected into the document
    document.querySelectorAll('.leader-line').forEach(el => el.remove());
    // Clear any in-progress connection preview
    cleanupConnectingPreview();
    canvasState = DEFAULT_STATE;
}

/**
 * Adds a handler that fires on either a mouse double-click or a quick
 * successive touch (double-tap).  For mouse/pen we rely on the native
 * `dblclick` event; for touch we detect two taps that occur within the
 * given time threshold.
 *
 * @param {HTMLElement} target  Element to attach the listener to
 * @param {(e:Event)=>void} handler Callback invoked on double press
 * @param {number} [threshold=300] Max gap in ms between two taps
 */
function addDoublePressListener(target, handler, threshold = 300) {
    let lastPointerDown = 0;
    // Mouse / pen double-click
    target.addEventListener('dblclick', handler);
    // Touch double-tap
    target.addEventListener('pointerdown', (evt) => {
        if (evt.pointerType === 'touch') {
            const now = performance.now();
            if (now - lastPointerDown < threshold) {
                handler(evt);
            }
            lastPointerDown = now;
        }
    });
}

function createHtmlElementFromModel(coords, model) {
    let element = document.createElement('div')
    element.id = model.displayName
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
                const proposedText = input.value.trim()
                let finalText = model.displayName

                if (proposedText && proposedText !== model.displayName) {
                    if (diagramModel.renameElement(model.displayName, proposedText)) {
                        finalText = proposedText     // rename succeeded
                    } else {
                        alert(`An element named "${proposedText}" already exists.`)
                    }
                }

                const span = document.createElement('span')
                span.textContent = finalText
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
            sourceElement: element,
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
        if (canvasState.name === 'CONNECTING' && canvasState.sourceElement !== element) {
            if(diagramModel.addRelationshipBetween(canvasState.sourceElement.id, element.id)) {
                new LeaderLine(canvasState.sourceElement, element)
            }
        }
        cleanupConnectingPreview()
        canvasState = DEFAULT_STATE
    })

    // Double-click / Double-tap handler
    addDoublePressListener(element, (ev) => {
        if (model.name === 'softwareSystem') {
            clearCanvas();
        }
    });

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

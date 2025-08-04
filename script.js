import { DiagramElement, DiagramModel } from "./Model.js"

let diagramModel = new DiagramModel()
const DEFAULT_STATE = { name: 'DEFAULT', click: () => { }, pointerup: () => { } }
let canvasState = DEFAULT_STATE

// CSS class applied to every diagram element so we can remove them
// without touching other canvas children (e.g., UI overlays).
const DIAGRAM_ELEMENT_CLASS = 'diagram-element'


/* ---------- Dom functions ---------- */

/**
 * Translate global pointer coordinates to coordinates relative to the canvas.
 * @param {PointerEvent|MouseEvent} evt
 * @param {HTMLElement} canvasEl
 * @returns {{x:number, y:number}}
 */
function toCanvasCoords(evt, canvasEl) {
    const rect = canvasEl.getBoundingClientRect()
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    }
}

/**
 * Remove every button from the sidebar toolbar.
 */
function clearToolbarButtons() {
    while (toolbar.firstChild) {
        toolbar.firstChild.remove()
    }
}

/**
 * Convenience to add a button to the toolbar.
 * @param {string} id    DOM id for the new button
 * @param {string} label Text shown on the button
 * @param {()=>void} onClick Click handler
 */
function addToolbarButton(id, label, onClick) {
    const btn = document.createElement('button')
    btn.id = id
    btn.textContent = label
    btn.addEventListener('click', onClick)
    toolbar.appendChild(btn)
}

/* ---------- Dom functions ---------- */


/**
 * Toolbar composition for the *container view* entered after zooming
 * into a Software System.
 */
function setupContainerViewToolbar() {
    clearToolbarButtons();

    // These could be classes or helper functions
    addToolbarButton('placeContainer', 'Container', () => {
        startPlacingDiagramElement(new DiagramElement('Container', '', 'container'))
    })

    addToolbarButton('placeSoftwareSystem', 'Software System', () => {
        startPlacingDiagramElement(new DiagramElement('Software System', '', 'softwareSystem'))
    })

    addToolbarButton('placePerson', 'Person', () => {
        startPlacingDiagramElement(new DiagramElement('Person', '', 'person'))
    })
}

/**
 * Toolbar composition for the *system context* (root) view.
 */
function setupSystemContextToolbar() {
    clearToolbarButtons()
    addToolbarButton('placeSoftwareSystem', 'Software System', () => {
        startPlacingDiagramElement(new DiagramElement('Software System', '', 'softwareSystem'))
    })
    addToolbarButton('placePerson', 'Person', () => {
        startPlacingDiagramElement(new DiagramElement('Person', '', 'person'))
    })
}

function startPlacingDiagramElement(diagramElement) {
    console.log(`Placing ${diagramElement.displayName}`)
    canvasState = placingState(diagramElement)
}

// Variables used to display a temporary "connecting" line
let previewLine = null
let tempAnchor = null
let repositionPreviewLine = null

const canvas = document.getElementById('canvas')
const softwareSystemBtn = document.getElementById('placeSoftwareSystem')
const personBtn = document.getElementById('placePerson')
const toolbar = document.getElementById('toolbar')
const viewHeading = document.getElementById('view-heading')

// Move this crap to index.html and style.css
const backButton = document.createElement('button')
backButton.id = 'back-button'
backButton.textContent = '←'
backButton.disabled = true
backButton.style.position = 'absolute'
backButton.style.top = '10px'
backButton.style.left = '10px'
backButton.style.opacity = '0.5'
backButton.classList.add('back-button')

canvas.appendChild(backButton)
// Move this crap to index.html and style.css

/**
 * Enable / disable the back button based on the navigation stack.
 */
function updateBackButtonState() {
    backButton.disabled = diagramModel.isStackEmpty()
    backButton.style.opacity = backButton.disabled ? '0.5' : '1'
}

backButton.addEventListener('click', () => {
    if (diagramModel.isStackEmpty()) {
        return
    }

    const poppedElement = diagramModel.popFromStack()

    clearCanvas()
    // Toolbar depends on the type of the model
    setupSystemContextToolbar()
    // Redraw only the elements g
    redrawElements()
    viewHeading.textContent = 'System Context'
    updateBackButtonState()
})

softwareSystemBtn.addEventListener('click', function () {
    startPlacingDiagramElement(new DiagramElement('Software System', '', 'softwareSystem'))
})

personBtn.addEventListener('click', function () {
    startPlacingDiagramElement(new DiagramElement('Person', '', 'person'))
})

function placingState(model) {
    return {
        name: 'PLACING',
        click: function (e, canvas) {
            let addedElement = diagramModel.addElement(model)
            if (addedElement) {
                const objectDiv = createHtmlElementFromModel(e, model)
                canvas.appendChild(objectDiv)
                canvasState = DEFAULT_STATE
            }
        },
        pointerup: () => { },
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
    document.removeEventListener('pointermove', repositionPreviewLine)
    if (repositionPreviewLine) {
        repositionPreviewLine = null
    }
}

/**
 * Remove everything currently drawn on the canvas.  Used when the user
 * zooms into a Software System (double-click/double-tap) so the view
 * can be repopulated with containers.
 */
function clearCanvas() {
    canvas
        .querySelectorAll(`.${DIAGRAM_ELEMENT_CLASS}`)
        .forEach(el => el.remove());
    document.querySelectorAll('.leader-line').forEach(el => el.remove());
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
                handler(evt)
            }
            lastPointerDown = now
        }
    });
}

function createHtmlElementFromModel(clickEvent, model) {

    const { x, y } = toCanvasCoords(clickEvent, canvas)
    let element = document.createElement('div')
    element.id = model.displayName
    element.style.position = 'absolute'
    element.style.left = x + 'px'
    element.style.top = y + 'px'
    element.classList.add(model.name, DIAGRAM_ELEMENT_CLASS)
    // Persist coordinates in the diagram model for later use
    diagramModel.setElementCoordinates(element.id, { x, y })

    const nameSpan = document.createElement('span')
    nameSpan.textContent = model.displayName
    nameSpan.style.userSelect = 'none'

    element.appendChild(nameSpan)

    enableInlineEdit(nameSpan, model)

    const finishConnecting = (e) => {
        if (canvasState.sourceElement !== element
            && diagramModel.addRelationshipBetween(canvasState.sourceElement.id, element.id)) {
            new LeaderLine(canvasState.sourceElement, element)
        }
        cleanupConnectingPreview()
        canvasState = DEFAULT_STATE
    }

    element.addEventListener('pointerup', finishConnecting)
    // extract to function
    element.addEventListener('pointerdown', e => {
        canvasState = {
            name: 'CONNECTING',
            sourceElement: element,
            click: function () { },
            pointerup: finishConnecting,
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

        repositionPreviewLine = moveEvent => {
            tempAnchor.style.left = moveEvent.clientX + 'px'
            tempAnchor.style.top = moveEvent.clientY + 'px'
            previewLine.position()
        }

        // Keep the anchor stuck to the pointer as it moves
        document.addEventListener('pointermove', repositionPreviewLine)
    })


    addDoublePressListener(element, rebuildPage(model))

    return element
}

/**
 * Rebuild the page, based on the view that the current element belongs to - Context, Container or Component
 * @param {DiagramElement} model Optional DiagramElement which was "zoomed" into
 * @returns Function that will rebuild the html page 
 */
function rebuildPage(model) {
    return (ev) => {
        // Same behavior for containers or components
        if (model.name === 'softwareSystem') {
            clearCanvas()
            // Based on the element type, set up the tooblar differently
            setupContainerViewToolbar()
            viewHeading.textContent = model.displayName
            diagramModel.pushToStack(model)
            updateBackButtonState()
        }
    }
}


canvas.addEventListener('click', (e) => {
    canvasState.click(e, canvas)
})

document.addEventListener('pointerup', () => {
    canvasState.pointerup()
})

/**
 * Enable editing of diagram elements.
 * @param {*} labelEl 
 */
function enableInlineEdit(labelEl, model) {

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
            enableInlineEdit(span, model)
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

/**
 * Recreate all HTML elements and relationship lines from the in-memory
 * model.  Used when navigating back up the view hierarchy.
 */
function redrawElements() {
    // Rebuild elements
    diagramModel.elements.forEach((model, id) => {
        const coords = diagramModel.elementCoordinates.get(id)
        if (!coords) return

        const rect = canvas.getBoundingClientRect()
        const fakeEvt = {
            clientX: coords.x + rect.left,
            clientY: coords.y + rect.top,
            pageX: coords.x + rect.left,
            pageY: coords.y + rect.top
        }

        const el = createHtmlElementFromModel(fakeEvt, model)
        canvas.appendChild(el)
    })

    // Rebuild relationships
    diagramModel.relationships.forEach(rel => {
        const src = document.getElementById(rel.sourceElement.displayName)
        const tgt = document.getElementById(rel.targetElement.displayName)
        if (src && tgt) {
            new LeaderLine(src, tgt)
        }
    })
}

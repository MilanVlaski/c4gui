import { DiagramElement, DiagramModel } from "./Model.js"

let diagramModel = new DiagramModel()
const DEFAULT_STATE = { name: 'DEFAULT', click: () => { }, pointerup: () => { } }
let canvasState = DEFAULT_STATE

// CSS class applied to every diagram element so we can remove them
// without touching other canvas children (e.g., UI overlays).
const DIAGRAM_ELEMENT_CLASS = 'diagram-element'
const arrowColor = '#bbb'

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

let actionOverlay = null
// Global reference to the document-level handler that closes the action overlay
let handleOutsideClick = null
/**
 * Display inline action buttons ("Edit", "Zoom In") for the given element.
 * Any existing overlay is first removed so only one is visible at a time.
 * @param {HTMLElement} element
 * @param {DiagramElement} model
 */
function showActionButtons(element, model) {
    // Remove previous overlay if present
    if (actionOverlay) {
        actionOverlay.remove()
        actionOverlay = null
        document.removeEventListener('pointerdown', handleOutsideClick, true)
    }

    actionOverlay = document.createElement('div')
    actionOverlay.classList.add('element-actions')
    actionOverlay.style.position = 'absolute'
    actionOverlay.style.top = '-2.5rem'
    actionOverlay.style.left = '0'
    actionOverlay.style.display = 'flex'
    actionOverlay.style.gap = '0.25rem'
    // Make the overlay focusable so we can detect blur / outside clicks
    actionOverlay.tabIndex = -1

    // Edit button
    const editBtn = document.createElement('button')
    editBtn.textContent = 'Edit'
    editBtn.addEventListener('click', ev => {
        ev.stopPropagation()
        close()
        openEditDialog(model, element)
    })

    // Zoom In button
    const zoomBtn = document.createElement('button')
    zoomBtn.textContent = 'Zoom In'
    zoomBtn.addEventListener('click', ev => {
        ev.stopPropagation()
        close()
        zoomIntoModel(model)
    })

    actionOverlay.appendChild(editBtn)
    actionOverlay.appendChild(zoomBtn)
    element.appendChild(actionOverlay)

    // Utility to close the overlay and detach the outside-click listener
    const close = () => {
        if (actionOverlay) {
            actionOverlay.remove()
            actionOverlay = null
            document.removeEventListener('pointerdown', handleOutsideClick, true)
        }
    }

    // Give the overlay focus so we can later detect loss of focus
    actionOverlay.focus()

    // Close the overlay when the user clicks anywhere outside of it
    handleOutsideClick = (ev) => {
        if (actionOverlay && !actionOverlay.contains(ev.target)) {
            close()
        }
    }
    document.addEventListener('pointerdown', handleOutsideClick, true)
}

function openEditDialog(model, element) {
    const dialog = document.createElement('dialog')
    dialog.open = true
    dialog.dataset.modal = ''
    dialog.style.maxWidth = '420px'

    const article = document.createElement('article')

    const header = document.createElement('header')
    const h3 = document.createElement('h3')
    h3.textContent = 'Edit Element'
    header.appendChild(h3)
    article.appendChild(header)

    const form = document.createElement('form')
    form.method = 'dialog'

    const nameLabel = document.createElement('label')
    nameLabel.textContent = 'Name'
    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.required = true
    nameInput.value = model.displayName
    nameInput.name = 'name'
    nameLabel.appendChild(nameInput)
    form.appendChild(nameLabel)

    const descLabel = document.createElement('label')
    descLabel.textContent = 'Description'
    const descInput = document.createElement('textarea')
    descInput.rows = 2
    descInput.name = 'description'
    descInput.value = model.description || ''
    descLabel.appendChild(descInput)
    form.appendChild(descLabel)

    const footer = document.createElement('footer')
    const okBtn = document.createElement('button')
    okBtn.textContent = 'OK'
    okBtn.type = 'submit'
    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.type = 'button'
    cancelBtn.classList.add('secondary')
    footer.appendChild(cancelBtn)
    footer.appendChild(okBtn)
    footer.style = 'display: flex; gap: 1em;'
    form.appendChild(footer)

    article.appendChild(form)
    dialog.appendChild(article)
    document.body.appendChild(dialog)

    const closeDialog = () => {
        dialog.close()
        dialog.remove()
    }

    cancelBtn.addEventListener('click', closeDialog)
    dialog.addEventListener('cancel', closeDialog)
    dialog.addEventListener('click', ev => {
        if (ev.target === dialog) closeDialog()
    })

    form.addEventListener('submit', ev => {
        ev.preventDefault()
        const newName = nameInput.value.trim()
        const newDesc = descInput.value.trim()

        if (newName && newName !== model.displayName) {
            if (!diagramModel.renameElement(model.displayName, newName)) {
                alert(`An element named "${newName}" already exists.`)
                return
            } else {
                const label = element.querySelector('span')
                if (label) label.textContent = newName
                element.id = newName
            }
        }

        model.description = newDesc
        element.title = newDesc
        const descDiv = element.querySelector('.element-description')
        if (descDiv) descDiv.textContent = newDesc
        closeDialog()
    })

    nameInput.focus()
    nameInput.select()
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
}

/**
 * Toolbar composition for the *system context* (root) view.
 */
function setupSystemContextToolbar() {
    clearToolbarButtons()
    addToolbarButton('placeSoftwareSystem', 'Software System', () => {
        startPlacingDiagramElement(new DiagramElement('Software System', '', 'softwareSystem'))
    })
    addToolbarButton('place-person', 'Person', () => {
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
const softwareSystemBtn = document.getElementById('place-software-system')
const personBtn = document.getElementById('place-person')
const toolbar = document.getElementById('toolbar')
const viewHeading = document.getElementById('view-heading')

// Move this crap to index.html and style.css
const backButton = document.getElementById('back-button')
/**
 * Enable / disable the back button based on the navigation stack.
 */
function updateBackButtonState() {

    backButton.disabled = diagramModel.isNavigationStackEmpty()
    backButton.style.opacity = backButton.disabled ? '0.5' : '1'
}

backButton.addEventListener('click', zoomOutOfModel)


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

    // Description underneath the element name
    const descDiv = document.createElement('div')
    descDiv.classList.add('element-description')
    descDiv.style.fontSize = '0.8rem'
    descDiv.style.marginTop = '0.2rem'
    descDiv.textContent = model.description || ''
    element.appendChild(descDiv)

    // Show element description as a tooltip
    element.title = model.description || ''

    const finishConnecting = (e) => {
        if (canvasState.sourceElement !== element
            && diagramModel.addRelationshipBetween(canvasState.sourceElement.id, element.id)) {
            new LeaderLine(
                canvasState.sourceElement,
                element,
                { path: 'straight', dash: true, size: 4, color: '#bbb',
                    hoverStyle: {dropShadow: {color: 'blue', dx: 0, dy: 0}}
                },
            )
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
        previewLine = new LeaderLine(element, tempAnchor, { dash: { animation: true }, color: arrowColor, path: 'straight', endPlug: 'behind' })

        repositionPreviewLine = moveEvent => {
            tempAnchor.style.left = moveEvent.clientX + 'px'
            tempAnchor.style.top = moveEvent.clientY + 'px'
            previewLine.position()
        }

        // Keep the anchor stuck to the pointer as it moves
        document.addEventListener('pointermove', repositionPreviewLine)
    })


    // Show inline action buttons on single click
    element.addEventListener('click', (ev) => {
        ev.stopPropagation()
        showActionButtons(element, model)
    })

    addDoublePressListener(element, () => {zoomIntoModel(model)})

    return element
}


canvas.addEventListener('click', (e) => {
    canvasState.click(e, canvas)
})

document.addEventListener('pointerup', () => {
    canvasState.pointerup()
})


/**
 * @param {DiagramElement} model Optional DiagramElement which was "zoomed" into
 * @returns Function that will rebuild the html page 
 */
function zoomIntoModel(model) {
    diagramModel.pushToNavgationStack(model)
    clearCanvas()
    viewHeading.textContent = model.displayName
    updateBackButtonState()
    if (model.name === 'softwareSystem') {
        setupContainerViewToolbar()
    }
    redrawElements(model)
}

function zoomOutOfModel() {
    // Nothing to do if we are already at the root element
    if (diagramModel.isNavigationStackEmpty()) {
        return
    }

    const poppedElement = diagramModel.popFromNavigationStack()
    const targetElement = diagramModel.currentElement   // new view to display

    clearCanvas()
    viewHeading.textContent = targetElement.displayName

    // Update UI controls
    updateBackButtonState()
    if (targetElement.name === 'softwareSystem') {
        setupContainerViewToolbar()
    } else {
        setupSystemContextToolbar()
    }

    redrawElements(targetElement)
}

/**
 * Recreate all HTML elements and relationship lines from the in-memory
 * model.  Used when navigating back up the view hierarchy.
 */
function redrawElements(diagramModel) {
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
            new LeaderLine(
                src,
                tgt,
                { path: 'straight', dash: true, size: 4, color: arrowColor}
            )
        }
    })
}

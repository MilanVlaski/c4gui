/**
 * DiagramElement represents an entity that can be placed on the canvas.
 *
 *  displayName – The displayed name.
 *  description – Optional longer description.
 *  name        – Identifier also used as a CSS class.
 */
export class DiagramElement {
    constructor(displayName, description = '', name) {
        this.displayName = displayName
        this.description = description
        this.name = name
        /** Child elements keyed by their displayName */
        this.elements = new Map()
        /** Cached coordinates of child elements relative to this element */
        this.elementCoordinates = new Map()
        /** All relationships in the current diagram */
        this.relationships = new Map()
    }

    /**
     * Register a child element under this element.
     * @param {DiagramElement} element
     */
    addElement(element) {
        this.elements.set(element.displayName, element)
    }

    /**
     * Save or update the coordinates for a diagram element.
     * @param {string} elementId
     * @param {{x:number, y:number}} coords
     */
    setElementCoordinates(elementId, coords) {
        this.elementCoordinates.set(elementId, coords)
    }

    /**
     * Store a relationship that involves this element.
     * Duplicate ids will just overwrite the previous entry.
     * @param {Relationship} relationship
     */
    addRelationship(relationship) {
        this.relationships.set(relationship.id, relationship)
    }
}

export class Relationship {
    constructor(sourceElement, targetElement) {
        this.id = `${sourceElement.displayName}:${targetElement.displayName}`
        this.sourceElement = sourceElement
        this.targetElement = targetElement
        this.description = ''
    }
}

// SystemContextModel?
export class DiagramModel {

    constructor() {
        /** Global lookup of every element keyed by displayName */
        this.elements = new Map()
        this.relationships = new Map()
        /** Number of Software System elements created so far */
        this.softwareSystemCount = 0
        /** Number of Person elements created so far */
        this.personCount = 0
        /** Number of Container elements created so far */
        this.containerCount = 0
        /** Canvas coordinates for each element keyed by element id */
        this.elementCoordinates = new Map()
        /** History of drilled-down elements, last element is the current view */
        this.navigationStack = []
        this.rootElement = new DiagramElement('System Context', '', 'systemContext')
        this.currentElement = this.rootElement
    }

    /**
     * Elements that belong to the currently active view.
     * @returns {Map<string, DiagramElement>}
     */
    elementsInCurrentElement() {
        return this.currentElement.elements
    }

    /**
     * Adds an element ensuring unique display names.
     * 
     * Note: The method mutates the element’s displayName and returns the updated element.
     * For safety, always use the returned element rather than the original reference,
     * as it may be modified or replaced internally.
     * 
     * @param {DiagramElement} element - The element to add.
     * @returns {DiagramElement|undefined} The updated element if added; otherwise undefined.
     */
    addElement(element) {
        let updatedCount = this[`${element.name}Count`] + 1
        let newDisplayName = `${element.displayName} ${updatedCount}`

        if (!this.elements.has(element.displayName)) {
            element.displayName = newDisplayName
            this.elements.set(newDisplayName, element)
            this[`${element.name}Count`] = updatedCount
            this.currentElement.addElement(element)

            return element
        } else {
            console.log("DUPLICATE ELEMENT ERROR")
        }
    }

    /**
     * Adds a new relationship between two existing elements.
     *
     * The relationship id is composed as
     * `${sourceElementId}:${targetElementId}` and must be unique.
     *
     * @param {string} sourceElementId - Identifier of the source element.
     * @param {string} targetElementId - Identifier of the target element.
     * @returns {Map|undefined} The `relationships` map after insertion, or `undefined` on failure.
     */
    addRelationshipBetween(sourceElementId, targetElementId) {
        const sourceElement = this.elements.get(sourceElementId)
        const targetElement = this.elements.get(targetElementId)

        // Create a new relationship object every time to keep element-level history
        const newRelationship = new Relationship(sourceElement, targetElement)

        // Double write: store globally and within the involved elements
        this.relationships.set(newRelationship.id, newRelationship)
        this.currentElement.addRelationship(newRelationship)

        return this.relationships
    }

    /**
     * Renames an existing element ensuring the new display name is unique.
     *
     * @param {string} oldDisplayName - Current display name of the element.
     * @param {string} newDisplayName - Desired new, unique display name.
     * @returns {boolean} True if the rename succeeded, false otherwise.
     */
    renameElement(oldDisplayName, newDisplayName) {
        // Reject if the desired name is already taken
        if (this.elements.has(newDisplayName)) {
            return false
        }
        const element = this.elements.get(oldDisplayName)
        if (!element) {
            return false
        }
        this.elements.delete(oldDisplayName)
        element.displayName = newDisplayName
        this.elements.set(newDisplayName, element)
        return true
    }

    /**
     * Save or update the coordinates for a diagram element.
     * @param {string} elementId
     * @param {{x:number, y:number}} coords
     */
    setElementCoordinates(elementId, coords) {
        this.currentElement.setElementCoordinates(elementId, coords)
    }

    /**
     * Push the given element onto the navigation stack. If the element
     * is already present it is first removed so that it ends up on top.
     * @param {DiagramElement} element 
     */
    pushToNavgationStack(element) {
        const index = this.navigationStack.indexOf(element)
        if (index !== -1) {
            this.navigationStack.splice(index, 1)
        }
        this.navigationStack.push(element)
        this.currentElement = element
    }

    /**
     * Pop and return the most recently visited element from the navigation
     * stack. Returns undefined if the stack is empty.
     * @returns {DiagramElement|undefined}
     */
    popFromNavigationStack() {
        const poppedElement = this.navigationStack.pop()
        // After popping, point to the previous element in the stack
        this.currentElement =
            this.navigationStack.length > 0
                ? this.navigationStack[this.navigationStack.length - 1]
                : this.rootElement
        return poppedElement
    }

    /**
     * Check whether the navigation stack is empty.
     * @returns {boolean}
     */
    isNavigationStackEmpty() {
        return this.navigationStack.length === 0
    }

}


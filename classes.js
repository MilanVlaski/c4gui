/**
 * DiagramElement represents an entity that can be placed on the canvas.
 * It holds the data previously kept in plain anonymous objects.
 *
 *  displayName – Human-readable name shown next to the icon.
 *  description – Optional longer description.
 *  name        – Identifier also used as a CSS class.
 */
class DiagramElement {
    constructor(displayName, description = '', name = null) {
        this.displayName = displayName;
        this.description  = description;
        // Derive a css-class-friendly name when not supplied
        this.name = name || displayName.replace(/\s+/g, '');
        this.name = this.name.charAt(0).toLowerCase() + this.name.slice(1);
    }
}

/* Expose globally so that non-module scripts can use it. */
if (typeof window !== 'undefined') {
    window.DiagramElement = DiagramElement;
}

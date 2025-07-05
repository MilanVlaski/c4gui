let canvasState = { name: "DEFAULT"}
const canvas = document.getElementById("canvas");
const softwareSystemBtn = document.getElementById("placeSoftwareSystem")

softwareSystemBtn.addEventListener("click", function () {
    const softwareSystem = {
        name: "Software System",
        description: "",
    };

    console.log(`Placing ${softwareSystem.name}`);

    const placingEvent = new CustomEvent("placingEvent", {
        detail: {
            element: this,
            object: softwareSystem,
        },
        bubbles: true
    });

    this.dispatchEvent(placingEvent);
});

document.addEventListener("placingEvent", (e) => {
    const object = e.detail.object
    console.log("Selected object:", object.name);
    
    canvasState = {
        name: "PLACING",
        object: object,
        click: function(e, canvas) {
            const objectDiv = document.createElement('div')
            objectDiv.style.position = "absolute"
            objectDiv.style.left = e.clientX + 'px'
            objectDiv.style.top = e.clientY + 'px'
            objectDiv.classList.add('softwareSystem')

            const nameDiv = document.createElement('div')
            nameDiv.textContent = object.name

            objectDiv.appendChild(nameDiv)

            canvas.appendChild(objectDiv);

            canvasState = {name: "DEFAULT"}
        },
    }
});

canvas.addEventListener("click", (e) => {
    canvasState.click(e, canvas)
})
let canvasState = { name: 'DEFAULT' }
const canvas = document.getElementById('canvas');
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
            const objectDiv = document.createElement('div')
            objectDiv.style.position = 'absolute'
            objectDiv.style.left = e.clientX + 'px'
            objectDiv.style.top = e.clientY + 'px'
            objectDiv.classList.add('softwareSystem')

            const nameDiv = document.createElement('div')
            nameDiv.textContent = softwareSystem.name
            nameDiv.contentEditable = true

            objectDiv.appendChild(nameDiv)

            canvas.appendChild(objectDiv);
            canvasState = { name: 'DEFAULT' }
        },
    }
});


canvas.addEventListener('click', (e) => {
    canvasState.click(e, canvas)
})

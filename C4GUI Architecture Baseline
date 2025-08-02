### Technical Overview
- Single page web app
- In memory model of what is being drawn
- Uses simple html elements to capture user input, as events. LImited SVG use.
---
- Import/Export between formats will be done by providing the in memory model to a REST API
- For demoing, or sharing, a diagramming "session" should be shareable with a magic link
- This may be provided with a simple REST API as well, but security has to be given a lot of thought
### Tech Stack
- HTML, CSS, JS
- Leaderline https://anseki.github.io/leader-line/
- Draggable (simpler) or InteractJS, more complex https://shopify.github.io/draggable/
- Shapes are childs play with CSS, so no need for SVG
#### Tech Stack Justification
- VanillaJS on the frontend is the way to go for now, because it's the simplest, and can be hosted cheaply on the cloud as well.
- Javascript is likely the best backend language for us because
	- It is the same language as the frontend model
	- It's dynamic - diagramming apps should be dynamic, and the GUI is enough to restrict the possibilities of a certain type of diagram. No need to add heavy constraints.

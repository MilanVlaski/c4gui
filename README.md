<img width="142" height="138" alt="c4gui" src="https://github.com/user-attachments/assets/c150c6e6-7fa1-4097-8388-2bc8d43ca167" />

c4gui allows you to model your software architecture in the browser, with the elegant [C4 Model](https://c4model.com/introduction). The reason that GUI modeling, or drag and drop, is effective, is because it doesn't require remembering any code syntax.  

However, the issue with diagramming apps is that they often use a proprietary text format. The [Structurizr DSL](https://structurizr.com/) offers a language for describing C4 model diagrams, and allows saving the diagram as Structurizr DSL, PlantUML or Mermaid - which are both popular.

## How to use?

1. Clone the project: `git clone https://github.com/MilanVlaski/c4gui.git`
2. Enter the c4gui directory: `cd c4gui`
3. Open `index.html` in your browser.

The above may not work on Linux due to CORS. Instead, you have the follwing options:

### Option 1 – VS Code Live Server

1. Install the “Live Server” extension in VS Code.  
2. Right-click `index.html` → “Open with Live Server”.

It will open automatically at http://localhost:5500.

### Option 2 – Python’s built-in server

```bash
# Python 3
python3 -m http.server 8000
# Python 2
python -m SimpleHTTPServer 8000
```

Browse to: http://localhost:8000

### Option 3 – Node.js http-server

```bash
npm install -g http-server
http-server -p 8080
```

Browse to: http://localhost:8080

## Use cases

- If you forget the syntax in your diagram-as-code language of choice, just draw a C4 diagram with c4gui, and freely convert the text from one language to another!
- Drowning in the complexity of outdated software architecture tools? Switch to the C4 model, and simplify your life.

## Documentation

- [C4GUI Architecture Baseline](docs/C4GUI%20Architecture%20Baseline.md)
- [To do](TODO.md)

## Glossary
- [C4 Model](https://c4model.com/introduction) - represents software systems in 4 views: system Context, Container, Component, Code.
- [Structurizr](https://structurizr.com/) - a project that allows drawing C4 models with a DSL, as well as exporting between formats like the ones used by PlantUML or Mermaid.

## Status

The project is on hold.
- The graphical errors can best be fixed by looking deeper at the usage of [leader-line](https://github.com/anseki/leader-line) and [plain-draggable](https://github.com/anseki/plain-draggable)
	- Rectangular elements twitching when dragged
 	- Lines are not behind the element, when dragging stops.
  	- On smaller screens, elements show up above the canvas, indicating that they are not tied to the canvas, perhaps only relative to it.  
- The app can draw a few shapes on the screen, zoom in and out of elements and move elements around. However, some ugly behavior exists, and the Javascript for working with the elements is not very easy to follow.
- Also, there are currently no model semantics specifying what kind of element goes into what diagram.
- The above issues could be temporarily ignored, and an MVP that performs conversion to Structurizr could be created.

## High level plan

- [ ] C4 modelling webapp
	- [ ] Demo 1 - can draw some elements, but never export or share.
	- [ ] Demo 2 - can draw some diagrams as well as share with magic link. Demo 1 + backend with storage
	- [ ] Demo 3 - can draw diagrams, import export PlantUML, and share via magic link + Demo 2 + export logic, using Structurizr libraries.

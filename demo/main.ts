import { createHashRouter } from "../src/hash-router";

createHashRouter(document.querySelector("#app")!, [
    {
        path: "/",
        component: `<h1>Home</h1>`,
    },
    {
        path: "/user/:id", // path, except from special handler, should always starts with a slash
        component: `<h1>id</h1>`,
    },
    {
        path: "/node",
        // component can also be Node
        component: (() => {
            const a = document.createElement("a");
            a.innerText = `Node`;
            return a;
        })(),
    },
    {
        path: "/color/:color",
        // component can also be a function, which returns html string
        component({ params }) {
            return `<h1 style="color:${params.color}">Color!</h1>`;
        },
    },

    {
        path: "/div/:color?",
        // component can also be a function, which returns Node
        component({ params }) {
            const div = document.createElement("div");
            div.innerText = `<div>DIV</div>`;
            div.style.color = params.color || "";
            return div;
        },
    },
    {
        path: "404", // special handler
        component: `<h1>404</h1>`,
    },
]);

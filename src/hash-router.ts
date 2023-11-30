import "urlpattern-polyfill";

interface Route {
    // the path pattern
    path: string;
    // the component is simply html string which will set to innerHTML
    component: string | Node | ((result: Result) => string | Node);
    // component can also be a function
    // if is matched, the component function always receive object
    // so except from 404 route, it can never be false
}

function prefixSlash(hash: string) {
    if (!hash.startsWith("/")) return "/" + hash;
    return hash;
}

function createMatchRoute(routes: Array<Route>) {
    interface MatchRoute extends Route {
        urlPattern: URLPattern;
    }

    // append match fn
    const definedMatcher: MatchRoute[] = [];
    for (const route of routes)
        definedMatcher.push({
            ...route,
            urlPattern: new URLPattern({
                hash: prefixSlash(route.path),
            }),
        });

    return definedMatcher;
}

function renderToContainer(
    containerElement: Element,
    component: Route["component"],
    result: URLPatternComponentResult
) {
    switch (typeof component) {
        case "string": {
            containerElement.innerHTML = component;
            break;
        }
        case "function": {
            const html = component({ params: result.groups });
            if (typeof html === "string") {
                containerElement.innerHTML = html;
            } else if (html instanceof Node) {
                containerElement.innerHTML = "";
                containerElement.appendChild(html);
            } else {
                throw new Error("the component function should return html string or Node");
            }
            break;
        }
        default: {
            if (component instanceof Node) {
                containerElement.innerHTML = "";
                containerElement.appendChild(component);
            } else {
                throw new Error("component is not defined or invalid");
            }
        }
    }
}

interface Result {
    params: Record<string, string | undefined>;
}

interface CreateRouterFunction {
    (containerElement: Element, routes: Array<Route>): void;
    result: Result;
}
/**
 *
 * @param containerElement The container element where the component is rendered
 * @param routes Route Array
 */
export const createHashRouter: CreateRouterFunction = function (
    containerElement: Element,
    routes: Array<Route>,
    notFoundRoute: Route["component"]
) {
    if (!Array.isArray(routes)) throw new Error("routes should be an array");
    const matcher = createMatchRoute(routes);

    const matchOne = () => {
        let isMatched = false;
        for (const route of matcher) {
            let hash = location.hash;
            if (hash.startsWith("#")) hash = hash.slice(1);
            hash = "#" + prefixSlash(hash);
            const result = route.urlPattern.exec({ hash })?.hash;
            if (result) {
                createHashRouter.result = { params: result.groups }; // add result
                renderToContainer(containerElement, route.component, result);
                isMatched = true;
                break;
            }
        }
        if (!isMatched) {
            if (notFoundRoute) {
                renderToContainer(containerElement, notFoundRoute, { input: location.hash, groups: {} });
            } else {
                containerElement.innerHTML = `404 Not Found`;
            }
        }
    };

    window.addEventListener("hashchange", matchOne);
    matchOne();
} as CreateRouterFunction;

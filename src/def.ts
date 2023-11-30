import "urlpattern-polyfill";

export type MatcherResult = Record<string, string | undefined> | undefined;

export interface Matcher {
    (pattern: string, input: string): MatcherResult;
}

export type CtxConstraint<T extends object> = Exclude<T, "group"> & { group: MatcherResult };

export interface Renderer<Req, Ctx extends object, Res> {
    (input: Req, ctx: CtxConstraint<Ctx>): Res;
}

/**
 * allow return string to render innerHTML,
 * as it is hard to create Node just from string (using outerHTML will lose reference)
 */
export type HTMLRenderer<Ctx extends object> = Renderer<string, Ctx, Node | string>;

export type HTTPRenderer<Ctx extends object> = Renderer<Request, Ctx, Response>;

export interface Route<Req, Ctx extends object, Res> {
    pattern: string;
    renderer: Renderer<Req, Ctx, Res>;
}

/**
 * we route, the router call all defined routes with given input
 */
export interface Router<Req, Ctx extends object, Res> {
    routes: Route<Req, Ctx, Res>[];
    matcher: Matcher;
}

/*
const exampleMatcher: Matcher = (pattern, input) => {
    return new URLPattern({ pathname: pattern }).exec({ pathname: input })?.pathname.groups;
};
*/

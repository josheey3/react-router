import type { ReactNode } from "react";

import type {
  MetaDescriptor,
  MetaMatch as _MetaMatch,
} from "../dom/ssr/routeModules";
import type { LinkDescriptor } from "../dom/ssr/links";
import type { AppLoadContext } from "../server-runtime/data";
import type { Location } from "./history";
import type { UIMatch } from "./utils";

type MaybePromise<T> = T | Promise<T>;
type Pretty<T> = { [K in keyof T]: T[K] } & {};

type Serializable =
  | undefined
  | null
  | boolean
  | string
  | symbol
  | number
  | Array<Serializable>
  | { [key: PropertyKey]: Serializable }
  | bigint
  | Date
  | URL
  | RegExp
  | Error
  | Map<Serializable, Serializable>
  | Set<Serializable>
  | Promise<Serializable>;

type Data = MaybePromise<
  Exclude<Serializable, undefined | Promise<Serializable>>
>;

export type ResponseStub = {
  status: number | undefined;
  headers: Headers;
};

// loader
type LoaderArgs<Param extends string> = {
  context: AppLoadContext;
  request: Request;
  params: Params<Param>;
  response: ResponseStub;
};

// action
type ActionArgs<Param extends string> = {
  context: AppLoadContext;
  request: Request;
  params: Params<Param>;
  response: ResponseStub;
};

// prettier-ignore
type Params<Param extends string> = Pretty<
  & {[key: string]: string | undefined}
  & {[K in Param as K extends `${string}?` ? never : K]: string}
  & {[K in Param as K extends `${infer P}?` ? P : never]?: string}
>

type IsDefined<T> = Equal<T, undefined> extends true ? false : true;

// prettier-ignore
type _LoaderData<
  ServerLoaderData,
  ClientLoaderData,
  ClientLoaderHydrate extends boolean,
  HydrateFallback,
> = Awaited<
  [undefined extends HydrateFallback ? false : true, ClientLoaderHydrate]  extends [true, true] ?
    IsDefined<ClientLoaderData> extends true ? ClientLoaderData :
    undefined
  :
  [IsDefined<ClientLoaderData>, IsDefined<ServerLoaderData>] extends [true, true] ? ServerLoaderData | ClientLoaderData :
  IsDefined<ClientLoaderData> extends true ?
    ClientLoaderHydrate extends true ? ClientLoaderData :
    ClientLoaderData | undefined
  :
  IsDefined<ServerLoaderData> extends true ? ServerLoaderData :
  undefined
>

type LoaderData<
  ServerLoaderData,
  ClientLoaderData,
  ClientLoaderHydrate extends boolean,
  HydrateFallback
> = _LoaderData<
  Awaited<ServerLoaderData>,
  Awaited<ClientLoaderData>,
  ClientLoaderHydrate,
  HydrateFallback
>;

// prettier-ignore
type ActionData<ServerActionData, ClientActionData> = Awaited<
  [IsDefined<ServerActionData>, IsDefined<ClientActionData>] extends [true, true] ? ServerActionData | ClientActionData :
  IsDefined<ClientActionData> extends true ? ClientActionData :
  IsDefined<ServerActionData> extends true ? ServerActionData :
  undefined
>

type HydrateFallbackComponent<Param extends string> = (args: {
  params: Params<Param>;
}) => ReactNode;

type Route<
  Param extends string,
  ClientLoaderHydrate extends boolean,
  HydrateFallback extends HydrateFallbackComponent<Param> | undefined,
  ServerLoaderData extends Data | undefined,
  ClientLoaderData,
  ServerActionData extends Data | undefined,
  ClientActionData
> = {
  params?: Param[];
  links?: (args: { params: Params<Param> }) => LinkDescriptor[];
  HydrateFallback?: HydrateFallback;

  serverLoader?: (args: LoaderArgs<Param>) => ServerLoaderData;
  clientLoader?: (
    args: LoaderArgs<Param> & {
      serverLoader: IsDefined<ServerLoaderData> extends true
        ? () => Promise<Awaited<ServerLoaderData>>
        : undefined;
    }
  ) => ClientLoaderData;
  clientLoaderHydrate?: ClientLoaderHydrate;

  serverAction?: (args: ActionArgs<Param>) => ServerActionData;
  clientAction?: (
    args: ActionArgs<Param> & {
      serverAction: IsDefined<ServerActionData> extends true
        ? () => Promise<Awaited<ServerActionData>>
        : undefined;
    }
  ) => ClientActionData;

  meta?: (args: {
    params: Params<Param>;
    location: Location;
    error: unknown;
    loaderData?: LoaderData<
      ServerLoaderData,
      ClientLoaderData,
      ClientLoaderHydrate,
      HydrateFallback
    >;
    matches?: Array<_MetaMatch>;
  }) => MetaDescriptor[];

  Component?: (args: {
    params: Params<Param>;
    loaderData: LoaderData<
      ServerLoaderData,
      ClientLoaderData,
      ClientLoaderHydrate,
      HydrateFallback
    >;
    actionData?: ActionData<ServerActionData, ClientActionData>;
  }) => ReactNode;
  ErrorBoundary?: (args: {
    params: Params<Param>;
    error: unknown;
    loaderData?: LoaderData<
      ServerLoaderData,
      ClientLoaderData,
      ClientLoaderHydrate,
      HydrateFallback
    >;
    actionData?: ActionData<ServerActionData, ClientActionData>;
  }) => ReactNode;

  handle?: unknown;
};

export function defineRoute<
  T,
  const Param extends string,
  ClientLoaderHydrate extends boolean,
  HydrateFallback extends HydrateFallbackComponent<Param> | undefined,
  ServerLoaderData extends Data | undefined = undefined,
  ClientLoaderData = undefined,
  ServerActionData extends Data | undefined = undefined,
  ClientActionData = undefined
>(
  route: T &
    Route<
      Param,
      ClientLoaderHydrate,
      HydrateFallback,
      ServerLoaderData,
      ClientLoaderData,
      ServerActionData,
      ClientActionData
    >
): T {
  return route;
}

export function defineRootRoute<
  T,
  const Param extends string,
  ClientLoaderHydrate extends boolean,
  HydrateFallback extends HydrateFallbackComponent<Param> | undefined,
  ServerLoaderData extends Data | undefined = undefined,
  ClientLoaderData = undefined,
  ServerActionData extends Data | undefined = undefined,
  ClientActionData = undefined
>(
  route: T &
    Route<
      Param,
      ClientLoaderHydrate,
      HydrateFallback,
      ServerLoaderData,
      ClientLoaderData,
      ServerActionData,
      ClientActionData
    > & {
      Layout: (args: {
        params: Params<Param>;
        error: unknown;
        loaderData?: LoaderData<
          ServerLoaderData,
          ClientLoaderData,
          ClientLoaderHydrate,
          HydrateFallback
        >;
        actionData?: ActionData<ServerActionData, ClientActionData>;
      }) => ReactNode;
    }
): T {
  return route;
}

type LoaderDataFromRoute<R> = R extends Route<
  any,
  infer ClientLoaderHydrate,
  infer HydrateFallback,
  infer ServerLoaderData,
  infer ClientLoaderData,
  any,
  any
>
  ? LoaderData<
      ServerLoaderData,
      ClientLoaderData,
      ClientLoaderHydrate,
      HydrateFallback
    >
  : never;

export type MetaMatch<R extends Route<any, any, any, any, any, any, any>> =
  _MetaMatch<string, LoaderDataFromRoute<R>>;

export type Match<R extends Route<any, any, any, any, any, any, any>> = Pretty<
  UIMatch<LoaderDataFromRoute<R>>
>;

// === TESTS ===

// prettier-ignore
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
function expectEqual<T, U>(_: Equal<T, U>) {}

type ExpectedParams = {
  [key: string]: string | undefined;
  id: string;
  brand?: string;
};
defineRoute({
  params: ["id", "brand?"],
  links({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return [];
  },
  HydrateFallback({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
  serverLoader({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
  clientLoader({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
  serverAction({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
  clientAction({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
  meta({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return [];
  },
  Component({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
  ErrorBoundary({ params }) {
    expectEqual<typeof params, ExpectedParams>(true);
    return null;
  },
});

// Loader data: no loaders -> undefined
defineRoute({
  meta({ loaderData }) {
    expectEqual<typeof loaderData, undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, undefined>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, undefined>(true);
    return null;
  },
});

// Loader data: server -> server
defineRoute({
  serverLoader() {
    return 1 as const;
  },
  meta({ loaderData }) {
    expectEqual<typeof loaderData, 1 | undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, 1>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, 1 | undefined>(true);
    return null;
  },
});

// Loader data: server + client -> server | client
defineRoute({
  serverLoader() {
    return 1 as const;
  },
  async clientLoader({ serverLoader }) {
    let serverData = await serverLoader();
    expectEqual<typeof serverData, 1>(true);
    return 2 as const;
  },
  meta({ loaderData }) {
    expectEqual<typeof loaderData, 1 | 2 | undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, 1 | 2>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, 1 | 2 | undefined>(true);
    return null;
  },
});

// Loader data: server + client + hydrate -> server | client
defineRoute({
  serverLoader() {
    return 1 as const;
  },
  async clientLoader({ serverLoader }) {
    let serverData = await serverLoader();
    expectEqual<typeof serverData, 1>(true);
    return 2 as const;
  },
  clientLoaderHydrate: true,
  meta({ loaderData }) {
    expectEqual<typeof loaderData, 1 | 2 | undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, 1 | 2>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, 1 | 2 | undefined>(true);
    return null;
  },
});

// Loader data: server + client + hydrate + hydratefallback -> client
defineRoute({
  serverLoader() {
    return 1 as const;
  },
  async clientLoader({ serverLoader }) {
    let serverData = await serverLoader();
    expectEqual<typeof serverData, 1>(true);
    return 2 as const;
  },
  clientLoaderHydrate: true,
  HydrateFallback() {
    return null;
  },
  meta({ loaderData }) {
    expectEqual<typeof loaderData, 2 | undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, 2>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, 2 | undefined>(true);
    return null;
  },
});

// Loader data: client + hydrate + hydratefallback -> client
defineRoute({
  async clientLoader({ serverLoader }) {
    expectEqual<typeof serverLoader, undefined>(true);
    return 2 as const;
  },
  clientLoaderHydrate: true,
  HydrateFallback() {
    return null;
  },
  meta({ loaderData }) {
    expectEqual<typeof loaderData, 2 | undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, 2>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, 2 | undefined>(true);
    return null;
  },
});

// Loader data: client + hydrate + -> client
defineRoute({
  async clientLoader({ serverLoader }) {
    expectEqual<typeof serverLoader, undefined>(true);
    return 2 as const;
  },
  clientLoaderHydrate: true,
  meta({ loaderData }) {
    expectEqual<typeof loaderData, 2 | undefined>(true);
    return [];
  },
  Component({ loaderData }) {
    expectEqual<typeof loaderData, 2>(true);
    return null;
  },
  ErrorBoundary({ loaderData }) {
    expectEqual<typeof loaderData, 2 | undefined>(true);
    return null;
  },
});

// action: neither, server, client, both

// Action data: no actions -> undefined
defineRoute({
  Component({ actionData }) {
    expectEqual<typeof actionData, undefined>(true);
    return null;
  },
  ErrorBoundary({ actionData }) {
    expectEqual<typeof actionData, undefined>(true);
    return null;
  },
});

// Action data: server -> server
defineRoute({
  serverAction() {
    return 1 as const;
  },
  Component({ actionData }) {
    expectEqual<typeof actionData, 1 | undefined>(true);
    return null;
  },
  ErrorBoundary({ actionData }) {
    expectEqual<typeof actionData, 1 | undefined>(true);
    return null;
  },
});

// Action data: client -> client
defineRoute({
  clientAction({ serverAction }) {
    expectEqual<typeof serverAction, undefined>(true);
    return 2 as const;
  },
  Component({ actionData }) {
    expectEqual<typeof actionData, 2 | undefined>(true);
    return null;
  },
  ErrorBoundary({ actionData }) {
    expectEqual<typeof actionData, 2 | undefined>(true);
    return null;
  },
});

// Action data: server + client -> client
defineRoute({
  serverAction() {
    return 1 as const;
  },
  clientAction() {
    return 2 as const;
  },
  Component({ actionData }) {
    expectEqual<typeof actionData, 1 | 2 | undefined>(true);
    return null;
  },
  ErrorBoundary({ actionData }) {
    expectEqual<typeof actionData, 1 | 2 | undefined>(true);
    return null;
  },
});

// Allow `undefined` as a return value from loaders and actions
declare function maybe<const T>(t: T): T | undefined;
defineRoute({
  serverLoader() {
    return maybe(1);
  },
  clientLoader() {
    return maybe(2);
  },
  serverAction() {
    return maybe(3);
  },
  clientAction() {
    return maybe(4);
  },
  Component({ loaderData, actionData }) {
    expectEqual<typeof loaderData, 1 | 2 | undefined>(true);
    expectEqual<typeof actionData, 3 | 4 | undefined>(true);
    return null;
  },
});

// Do not allow server loader and action to return non-serializable data
declare const unserializable: { a: 1; b: () => 2 };
defineRoute({
  // @ts-expect-error
  serverLoader() {
    return unserializable;
  },
  // @ts-expect-error
  serverAction() {
    return unserializable;
  },
});

// Allow client loader and action to return non-serializable data
defineRoute({
  clientLoader() {
    return unserializable;
  },
  clientAction() {
    return unserializable;
  },
  Component({ loaderData, actionData }) {
    expectEqual<typeof loaderData, typeof unserializable | undefined>(true);
    expectEqual<typeof actionData, typeof unserializable | undefined>(true);
    return null;
  },
});

import { Router, RequestHandler } from "express";
import { container } from "tsyringe";

const routers = new Map<string, Router>();

export function Controller(prefix: string) {
  return function (target: any) {
    const router = Router();
    const routes: Array<{
      method: string;
      path: string;
      handler: string;
      middlewares: RequestHandler[];
    }> = Reflect.getMetadata("routes", target.prototype) || [];

    //  Явно вказуємо тип <any>, щоб уникнути помилки 'instance' is of type 'unknown'
    const instance = container.resolve<any>(target);

    routes.forEach(({ method, path, handler, middlewares }) => {
      const mws = middlewares || [];
      // Тепер TypeScript дозволяє звертатися до instance[handler]
      (router as any)[method](path, ...mws, instance[handler].bind(instance));
    });

    routers.set(prefix, router);
  };
}

export function Get(path: string) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    let route = routes.find((r: any) => r.handler === propertyKey);
    if (!route) {
      route = { handler: propertyKey, middlewares: [] };
      routes.push(route);
    }
    route.method = "get";
    route.path = path;
    Reflect.defineMetadata("routes", routes, target);
  };
}

export function Post(path: string) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    let route = routes.find((r: any) => r.handler === propertyKey);
    if (!route) {
      route = { handler: propertyKey, middlewares: [] };
      routes.push(route);
    }
    route.method = "post";
    route.path = path;
    Reflect.defineMetadata("routes", routes, target);
  };
}

export function Delete(path: string) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    let route = routes.find((r: any) => r.handler === propertyKey);
    if (!route) {
      route = { handler: propertyKey, middlewares: [] };
      routes.push(route);
    }
    route.method = "delete";
    route.path = path;
    Reflect.defineMetadata("routes", routes, target);
  };
}

// Додаємо декоратор Patch
export function Patch(path: string) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    let route = routes.find((r: any) => r.handler === propertyKey);
    if (!route) {
      route = { handler: propertyKey, middlewares: [] };
      routes.push(route);
    }
    route.method = "patch";
    route.path = path;
    Reflect.defineMetadata("routes", routes, target);
  };
}

// Додамо також Put для повноти REST API (часто буває потрібним)
export function Put(path: string) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    let route = routes.find((r: any) => r.handler === propertyKey);
    if (!route) {
      route = { handler: propertyKey, middlewares: [] };
      routes.push(route);
    }
    route.method = "put";
    route.path = path;
    Reflect.defineMetadata("routes", routes, target);
  };
}

export function UseMiddleware(middleware: RequestHandler) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    let route = routes.find((r: any) => r.handler === propertyKey);
    if (!route) {
      route = { handler: propertyKey, middlewares: [] };
      routes.push(route);
    }
    if (!route.middlewares) route.middlewares = [];
    route.middlewares.push(middleware);
    Reflect.defineMetadata("routes", routes, target);
  };
}

export function getRouters() {
  return routers;
}

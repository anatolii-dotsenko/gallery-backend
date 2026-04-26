import { Router } from "express";

const routers = new Map<string, Router>();

export function Controller(prefix: string) {
  return function (target: any) {
    const router = Router();
    const routes: Array<{ method: string; path: string; handler: string }> =
      Reflect.getMetadata("routes", target.prototype) || [];
    
    const instance = new target();
    
    routes.forEach(({ method, path, handler }) => {
      (router as any)[method](path, instance[handler].bind(instance));
    });
    
    routers.set(prefix, router);
  };
}

export function Get(path: string) {
  return function (target: any, propertyKey: string) {
    const routes = Reflect.getMetadata("routes", target) || [];
    routes.push({ method: "get", path, handler: propertyKey });
    Reflect.defineMetadata("routes", routes, target);
  };
}

export function getRouters() { 
  return routers; 
}